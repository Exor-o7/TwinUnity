import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { getPublishedListings } from "@/lib/supabase";

export default async function Home() {
  const listings = await getPublishedListings();
  const featuredListings = listings.slice(0, 3);

  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="tag">Pokemon Card Specialists</p>
            <h1>
              Buy. Sell. Trade.
              <br />
              Built for Serious Collectors.
            </h1>
            <p className="lead">
              Twin Unity TCG helps collectors and players move cards
              confidently, whether you are chasing grails, cashing out
              duplicates, or trading up to your next chase card.
            </p>
            <div className="actions">
              <Link className="btn primary" href="/inventory">
                Shop Inventory
              </Link>
              <a className="btn secondary" href="#contact">
                Get a Quote
              </a>
            </div>
          </div>
          <aside className="panel hero-card">
            <p className="tag">Admin Powered</p>
            <h2>Fresh listings without code edits.</h2>
            <p>
              Add cards, slabs, sealed products, prices, status, and checkout
              availability from the private admin dashboard.
            </p>
          </aside>
        </div>
      </section>

      <section id="services" className="section container">
        <h2>What We Do</h2>
        <div className="grid three">
          <article className="card">
            <h3>Buy Pokemon Cards</h3>
            <p>
              Browse quality-vetted singles, graded cards, and sealed products.
              New stock can be published from the admin dashboard.
            </p>
          </article>
          <article className="card">
            <h3>Sell Your Collection</h3>
            <p>
              Send lists or photos for competitive offers on singles, binders,
              slabs, and entire collections.
            </p>
          </article>
          <article className="card">
            <h3>Trade with Confidence</h3>
            <p>
              Turn duplicates into value with fair market-based trade
              evaluations and clear communication.
            </p>
          </article>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <h2>Featured Inventory</h2>
          <div className="grid three">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <div className="actions">
            <Link className="btn secondary" href="/inventory">
              View All Inventory
            </Link>
          </div>
        </div>
      </section>

      <section id="process" className="section container">
        <h2>How Buy/Sell/Trade Works</h2>
        <ol className="steps">
          <li>
            <strong>1.</strong> Browse inventory or submit your wants list.
          </li>
          <li>
            <strong>2.</strong> Buy online, request a trade, or ask for a quote.
          </li>
          <li>
            <strong>3.</strong> Finalize securely with checkout, tracked
            shipping, or local meetup.
          </li>
        </ol>
      </section>

      <section className="section cta" id="contact">
        <div className="container cta-box">
          <h2>Let&apos;s Build Your Next Trade</h2>
          <p>
            Message Twin Unity directly on social or email to start a deal. We
            respond quickly and keep every transaction clear and professional.
          </p>
          <div className="actions">
            <a
              className="btn primary"
              href="https://www.instagram.com/twin_unity/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
            <a
              className="btn secondary"
              href="https://www.facebook.com/twinunityy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
            <a className="btn secondary" href="mailto:hello@twinunitytcg.com">
              Email Us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
