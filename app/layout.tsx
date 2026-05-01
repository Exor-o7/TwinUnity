import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Twin Unity TCG | Buy, Sell, Trade Pokemon Cards",
  description:
    "Twin Unity TCG is your trusted Pokemon card marketplace for buying, selling, and trading singles, slabs, sealed products, and collections."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <header className="site-header">
          <nav className="nav container" aria-label="Main navigation">
            <Link className="brand" href="/">
              Twin Unity TCG
            </Link>
            <ul>
              <li>
                <Link href="/#services">Services</Link>
              </li>
              <li>
                <Link href="/inventory">Inventory</Link>
              </li>
              <li>
                <Link href="/#process">How It Works</Link>
              </li>
              <li>
                <Link href="/admin">Admin</Link>
              </li>
            </ul>
          </nav>
        </header>
        {children}
        <footer>
          <div className="container footer-row">
            <p>© {new Date().getFullYear()} Twin Unity TCG. All rights reserved.</p>
            <p>Pokemon is a trademark of Nintendo/Creatures Inc./GAME FREAK inc.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
