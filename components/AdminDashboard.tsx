"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  formatListingTitle,
  formatMoney,
  formatSealedType,
  slugify
} from "@/lib/format";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type {
  Listing,
  ListingCategory,
  ListingInput,
  ListingIntent,
  ListingSealedType,
  ListingStatus
} from "@/lib/types";

type FormState = {
  id?: string;
  slug: string;
  name: string;
  category: ListingCategory;
  intent: ListingIntent;
  status: ListingStatus;
  set_name: string;
  card_number: string;
  rarity: string;
  sealed_type: ListingSealedType | "";
  grade: string;
  price: string;
  quantity: string;
  description: string;
  notes: string;
  image_urls: string;
};

const emptyForm: FormState = {
  slug: "",
  name: "",
  category: "single",
  intent: "sell",
  status: "draft",
  set_name: "",
  card_number: "",
  rarity: "",
  sealed_type: "",
  grade: "",
  price: "",
  quantity: "1",
  description: "",
  notes: "",
  image_urls: ""
};

const gradeOptions = Array.from({ length: 10 }, (_, index) => String(index + 1));
const sealedTypeOptions: ListingSealedType[] = [
  "booster_pack",
  "booster_bundle",
  "elite_trainer_box"
];
const categoryLabels: Record<ListingCategory, string> = {
  single: "Single",
  graded: "Graded",
  sealed: "Sealed",
  collection: "Others"
};

function isValidGrade(grade: string) {
  return gradeOptions.includes(grade);
}

function isValidSealedType(sealedType: string) {
  return sealedTypeOptions.includes(sealedType as ListingSealedType);
}

function formFromListing(listing: Listing): FormState {
  return {
    id: listing.id,
    slug: listing.slug,
    name: listing.name,
    category: listing.category,
    intent: listing.intent,
    status: listing.status,
    set_name: listing.set_name ?? "",
    card_number: listing.card_number ?? "",
    rarity: listing.rarity ?? "",
    sealed_type: listing.sealed_type ?? "",
    grade: listing.grade ?? "",
    price:
      typeof listing.price_cents === "number"
        ? (listing.price_cents / 100).toFixed(2)
        : "",
    quantity: String(listing.quantity),
    description: listing.description ?? "",
    notes: listing.notes ?? "",
    image_urls: listing.image_urls.join("\n")
  };
}

function toNullable(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function formToListingInput(form: FormState): ListingInput {
  const price = form.price.trim();

  return {
    slug: form.slug.trim() || slugify(form.name),
    name: form.name.trim(),
    category: form.category,
    intent: form.intent,
    status: form.status,
    set_name: toNullable(form.set_name),
    card_number: toNullable(form.card_number),
    rarity: toNullable(form.rarity),
    sealed_type:
      form.category === "sealed"
        ? (toNullable(form.sealed_type) as ListingSealedType | null)
        : null,
    condition: null,
    grade: form.category === "graded" ? toNullable(form.grade) : null,
    price_cents: price ? Math.round(Number(price) * 100) : null,
    quantity: Number.parseInt(form.quantity, 10) || 0,
    description: toNullable(form.description),
    notes: toNullable(form.notes),
    image_urls: form.image_urls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean)
  };
}

async function parseJsonResponse<T>(response: Response, fallbackError: string) {
  try {
    return (await response.json()) as T;
  } catch {
    return { error: fallbackError } as T;
  }
}

export function AdminDashboard() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("Loading admin session...");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredListings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return listings;
    }

    return listings.filter((listing) => {
      const searchableValues = [
        formatListingTitle(listing),
        listing.name,
        listing.slug,
        categoryLabels[listing.category],
        listing.category,
        listing.intent,
        listing.status,
        listing.set_name,
        listing.card_number,
        listing.rarity,
        listing.sealed_type ? formatSealedType(listing.sealed_type) : null,
        listing.grade ? `grade ${listing.grade}` : null
      ];

      return searchableValues.some((value) =>
        value?.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [listings, searchQuery]);

  const apiFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      if (!session) {
        throw new Error("You must be signed in.");
      }

      return fetch(path, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          ...init?.headers
        }
      });
    },
    [session]
  );

  const loadListingsWithToken = useCallback(async (accessToken: string) => {
    setError(null);
    const response = await fetch("/api/admin/listings", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const payload = (await response.json()) as {
      listings?: Listing[];
      error?: string;
    };

    if (!response.ok) {
      setError(payload.error ?? "Unable to load listings.");
      return;
    }

    setListings(payload.listings ?? []);
  }, []);

  const loadListings = useCallback(async () => {
    if (!session) {
      return;
    }

    await loadListingsWithToken(session.access_token);
  }, [loadListingsWithToken, session]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setMessage(data.session ? "Signed in." : "Sign in to manage inventory.");
      if (data.session) {
        void loadListingsWithToken(data.session.access_token);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        void loadListingsWithToken(nextSession.access_token);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [loadListingsWithToken, supabase]);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setMessage("Signed in.");
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setSession(null);
    setListings([]);
    setListingToDelete(null);
    setForm(emptyForm);
    setImageFiles([]);
  }

  async function uploadImages(currentForm: FormState) {
    if (imageFiles.length === 0 || !supabase || !session) {
      return currentForm;
    }

    const uploadedUrls: string[] = [];

    for (const imageFile of imageFiles) {
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${session.user.id}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(path, imageFile, { upsert: false });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("listing-images")
        .getPublicUrl(path);
      uploadedUrls.push(data.publicUrl);
    }

    return {
      ...currentForm,
      image_urls: [currentForm.image_urls, ...uploadedUrls]
        .filter(Boolean)
        .join("\n")
    };
  }

  async function saveListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (form.category === "graded" && !isValidGrade(form.grade)) {
        throw new Error("Choose a grade from 1 to 10 for graded listings.");
      }

      if (form.category === "sealed" && !isValidSealedType(form.sealed_type)) {
        throw new Error("Choose a sealed type for sealed listings.");
      }

      const formWithImage = await uploadImages(form);
      const input = formToListingInput(formWithImage);
      const response = await apiFetch(
        form.id ? `/api/admin/listings/${form.id}` : "/api/admin/listings",
        {
          method: form.id ? "PATCH" : "POST",
          body: JSON.stringify(input)
        }
      );
      const payload = await parseJsonResponse<{
        listing?: Listing;
        error?: string;
      }>(response, "Unable to save listing. Check the server logs.");

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save listing.");
      }

      setForm(emptyForm);
      setImageFiles([]);
      setMessage(`Saved ${payload.listing?.name ?? "listing"}.`);
      await loadListings();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteListing() {
    if (!listingToDelete) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await apiFetch(`/api/admin/listings/${listingToDelete.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Unable to delete listing.");
        return;
      }

      await loadListings();
      setForm(emptyForm);
      setImageFiles([]);
      setListingToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };

      if (key === "name" && !current.id) {
        next.slug = slugify(String(value));
      }

      if (key === "category" && value !== "graded") {
        next.grade = "";
      }

      if (key === "category" && value !== "sealed") {
        next.sealed_type = "";
      }

      return next;
    });
  }

  function updateQuantity(delta: number) {
    const currentQuantity = Number.parseInt(form.quantity, 10) || 0;
    updateField("quantity", String(Math.max(0, currentQuantity + delta)));
  }

  if (!supabase) {
    return (
      <div className="panel">
        <h2>Admin Setup Required</h2>
        <p>
          Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to
          `.env.local`, then restart the dev server.
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="panel">
        <h2>Admin Sign In</h2>
        <p>{message}</p>
        <form className="form-grid" onSubmit={signIn}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <button className="btn primary" type="submit">
            Sign In
          </button>
          {error ? <p className="status-message error">{error}</p> : null}
        </form>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <section className="panel">
        <p className="admin-account">Signed in as {session.user.email}</p>
        <div className="actions">
          <button className="btn secondary" type="button" onClick={signOut}>
            Sign Out
          </button>
          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              setForm(emptyForm);
              setImageFiles([]);
            }}
          >
            New Listing
          </button>
        </div>
        <h2>Inventory</h2>
        <div className="field admin-listing-search">
          <label htmlFor="admin-listing-search">Search listings</label>
          <input
            id="admin-listing-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Find by name, set, card number, status..."
          />
        </div>
        {searchQuery.trim() ? (
          <p className="status-message">
            Showing {filteredListings.length} of {listings.length} listings.
          </p>
        ) : null}
        <div className="table-list">
          {filteredListings.map((listing) => {
            const listingTitle = formatListingTitle(listing);

            return (
              <article className="table-item" key={listing.id}>
                <header>
                  <strong>{listingTitle}</strong>
                  {listing.status !== "archived" ? (
                    <span className="badge">{listing.status}</span>
                  ) : null}
                </header>
                <p>
                  {categoryLabels[listing.category]} | {listing.intent} |{" "}
                  {formatMoney(listing.price_cents)}
                </p>
                <div className="actions">
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => setForm(formFromListing(listing))}
                  >
                    Edit
                  </button>
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => setListingToDelete(listing)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
          {filteredListings.length === 0 ? (
            <p className="status-message">No listings match your search.</p>
          ) : null}
        </div>
      </section>

      {listingToDelete ? (
        <div
          aria-labelledby="delete-listing-title"
          aria-modal="true"
          className="modal-backdrop"
          role="dialog"
        >
          <div className="modal-card">
            <h2 id="delete-listing-title">Delete this listing?</h2>
            <p>
              This will permanently remove{" "}
              <strong>{formatListingTitle(listingToDelete)}</strong> from your
              inventory.
            </p>
            <div className="actions">
              <button
                className="btn danger"
                disabled={isDeleting}
                type="button"
                onClick={() => void deleteListing()}
              >
                {isDeleting ? "Deleting..." : "Delete Listing"}
              </button>
              <button
                className="btn ghost"
                disabled={isDeleting}
                type="button"
                onClick={() => setListingToDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="panel">
        <h2>{form.id ? "Edit Listing" : "Create Listing"}</h2>
        <form className="form-grid" onSubmit={saveListing}>
          <div className="grid two">
            <div className="field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value as ListingCategory)
                }
              >
                <option value="single">{categoryLabels.single}</option>
                <option value="graded">{categoryLabels.graded}</option>
                <option value="sealed">{categoryLabels.sealed}</option>
                <option value="collection">{categoryLabels.collection}</option>
              </select>
            </div>
            {form.category === "graded" ? (
              <div className="field">
                <label htmlFor="grade">Grade</label>
                <select
                  id="grade"
                  value={form.grade}
                  onChange={(event) => updateField("grade", event.target.value)}
                  required
                >
                  <option value="">Select grade</option>
                  {gradeOptions.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
            ) : form.category === "sealed" ? (
              <div className="field">
                <label htmlFor="sealed_type">Sealed Type</label>
                <select
                  id="sealed_type"
                  value={form.sealed_type}
                  onChange={(event) =>
                    updateField(
                      "sealed_type",
                      event.target.value as ListingSealedType | ""
                    )
                  }
                  required
                >
                  <option value="">Select sealed type</option>
                  {sealedTypeOptions.map((sealedType) => (
                    <option key={sealedType} value={sealedType}>
                      {formatSealedType(sealedType)}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          <div className="grid two">
            <div className="field">
              <label htmlFor="set_name">Set</label>
              <input
                id="set_name"
                value={form.set_name}
                onChange={(event) => updateField("set_name", event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid two">
            <div className="field">
              <label htmlFor="card_number">Card Number</label>
              <input
                id="card_number"
                value={form.card_number}
                onChange={(event) =>
                  updateField("card_number", event.target.value)
                }
              />
            </div>
            <div className="field">
              <label htmlFor="rarity">Rarity</label>
              <input
                id="rarity"
                value={form.rarity}
                onChange={(event) => updateField("rarity", event.target.value)}
              />
            </div>
          </div>

          <div className="grid two">
            <div className="field">
              <label htmlFor="intent">Intent</label>
              <select
                id="intent"
                value={form.intent}
                onChange={(event) =>
                  updateField("intent", event.target.value as ListingIntent)
                }
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
                <option value="trade">Trade</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={form.status}
                onChange={(event) =>
                  updateField("status", event.target.value as ListingStatus)
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>

          <div className="grid two">
            <div className="field">
              <label htmlFor="quantity">Quantity</label>
              <span className="quantity-stepper admin-quantity-stepper">
                <button
                  aria-label="Decrease quantity"
                  disabled={(Number.parseInt(form.quantity, 10) || 0) <= 0}
                  type="button"
                  onClick={() => updateQuantity(-1)}
                >
                  -
                </button>
                <input
                  id="quantity"
                  min="0"
                  type="number"
                  value={form.quantity}
                  onChange={(event) => updateField("quantity", event.target.value)}
                  required
                />
                <button
                  aria-label="Increase quantity"
                  type="button"
                  onClick={() => updateQuantity(1)}
                >
                  +
                </button>
              </span>
            </div>
            <div className="field">
              <label htmlFor="price">Price in dollars</label>
              <input
                id="price"
                min="0"
                step="0.01"
                type="number"
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
                placeholder="64.99"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="image_urls">Image URLs, one per line</label>
            <textarea
              id="image_urls"
              value={form.image_urls}
              onChange={(event) => updateField("image_urls", event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="image_file">Upload image</label>
            <div className="file-upload">
              <input
                className="file-upload-input"
                id="image_file"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) =>
                  setImageFiles(Array.from(event.target.files ?? []))
                }
              />
              <label className="btn secondary file-upload-button" htmlFor="image_file">
                Browse Images
              </label>
            </div>
            {imageFiles.length > 0 ? (
              <p className="status-message">
                {imageFiles.length} image{imageFiles.length === 1 ? "" : "s"} selected.
              </p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="notes">Internal notes</label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
            />
          </div>

          <button className="btn primary" disabled={isSaving} type="submit">
            {isSaving ? "Saving..." : "Save Listing"}
          </button>
          {message ? <p className="status-message">{message}</p> : null}
          {error ? <p className="status-message error">{error}</p> : null}
        </form>
      </section>
    </div>
  );
}
