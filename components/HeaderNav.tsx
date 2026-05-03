"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CART_UPDATED_EVENT, getCartItemCount } from "@/lib/cart";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/new-arrivals", label: "New Arrivals" }
];

const navGroups = [
  {
    id: "cards",
    label: "Cards",
    links: [
      { href: "/single-cards", label: "Single Cards" },
      { href: "/graded-cards", label: "Graded Cards" }
    ]
  },
  {
    id: "sealed",
    label: "Sealed",
    links: [
      { href: "/booster-packs", label: "Booster Packs" },
      { href: "/booster-bundles", label: "Booster Bundles" },
      { href: "/elite-trainer-boxes", label: "Elite Trainer Boxes" }
    ]
  }
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const closeDropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    function syncCartCount() {
      setCartCount(getCartItemCount());
    }

    syncCartCount();
    window.addEventListener(CART_UPDATED_EVENT, syncCartCount);
    window.addEventListener("storage", syncCartCount);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCartCount);
      window.removeEventListener("storage", syncCartCount);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (closeDropdownTimeout.current) {
        clearTimeout(closeDropdownTimeout.current);
      }
    };
  }, []);

  function openDropdownMenu(id: string) {
    if (closeDropdownTimeout.current) {
      clearTimeout(closeDropdownTimeout.current);
    }

    setOpenDropdown(id);
  }

  function scheduleDropdownClose() {
    if (closeDropdownTimeout.current) {
      clearTimeout(closeDropdownTimeout.current);
    }

    closeDropdownTimeout.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 250);
  }

  function closeMenu() {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  }

  return (
    <nav
      className={isMenuOpen ? "nav container nav-open" : "nav container"}
      aria-label="Main navigation"
    >
      <Link className="brand" href="/" onClick={closeMenu}>
        <span className="brand-logo" aria-hidden="true" />
        <span className="sr-only">Twin Unity</span>
      </Link>

      <button
        className="menu-toggle"
        type="button"
        aria-controls="site-menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        <span className="sr-only">Toggle menu</span>
        <span className="menu-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="menu-label" aria-hidden="true">
          Menu
        </span>
      </button>

      <div className="nav-panel" id="site-menu">
        <ul>
          {navLinks.map((link) => {
            const active = isActivePath(pathname, link.href);

            return (
              <li key={link.href}>
                <Link
                  aria-current={active ? "page" : undefined}
                  className={active ? "active" : ""}
                  href={link.href}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          {navGroups.map((group) => {
            const active = group.links.some((link) =>
              isActivePath(pathname, link.href)
            );
            const isOpen = openDropdown === group.id;

            return (
              <li
                className={
                  active || isOpen ? "nav-dropdown active" : "nav-dropdown"
                }
                key={group.id}
                onMouseEnter={() => openDropdownMenu(group.id)}
                onMouseLeave={scheduleDropdownClose}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpenDropdown((current) =>
                      current === group.id ? null : group.id
                    )
                  }
                >
                  {group.label}
                  <span aria-hidden="true">v</span>
                </button>
                <div className={isOpen ? "dropdown-menu open" : "dropdown-menu"}>
                  {group.links.map((link) => {
                    const linkActive = isActivePath(pathname, link.href);

                    return (
                      <Link
                        aria-current={linkActive ? "page" : undefined}
                        className={linkActive ? "active" : ""}
                        href={link.href}
                        key={link.href}
                        onClick={closeMenu}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </li>
            );
          })}
          <li>
            <Link
              aria-current={isActivePath(pathname, "/others") ? "page" : undefined}
              className={isActivePath(pathname, "/others") ? "active" : ""}
              href="/others"
              onClick={closeMenu}
            >
              Others
            </Link>
          </li>
        </ul>

        <div className="nav-actions">
          <form className="site-search" action="/search" role="search">
            <label className="sr-only" htmlFor="site-search">
              Search products
            </label>
            <input
              id="site-search"
              name="q"
              placeholder="Search products"
              type="search"
            />
            <button type="submit">Search</button>
          </form>

          <Link
            aria-current={isActivePath(pathname, "/cart") ? "page" : undefined}
            className={
              isActivePath(pathname, "/cart") ? "cart-link active" : "cart-link"
            }
            href="/cart"
            onClick={closeMenu}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
            >
              <path
                d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L20 8H7"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M10 20h.01M17 20h.01"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
            </svg>
            Cart
            {cartCount > 0 ? (
              <span className="cart-count" aria-label={`${cartCount} cart items`}>
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </nav>
  );
}
