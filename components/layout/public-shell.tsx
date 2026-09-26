"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Menu, X } from "@/components/design-system/icons";
import { Button, cx } from "@/components/design-system/primitives";

const primaryLinks = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Capabilities", href: "/capabilities/5-axis-machining" },
  { label: "Parts", href: "/parts/robot-joint-housing" },
  { label: "Applications", href: "/applications/humanoid-robots" },
  { label: "Quality", href: "/quality" },
  { label: "Company", href: "/company" },
];

const footerGroups = [
  {
    heading: "System",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Parts", href: "/parts/robot-joint-housing" },
      { label: "Capabilities", href: "/capabilities/5-axis-machining" },
      { label: "Applications", href: "/applications/humanoid-robots" },
      { label: "Engineering", href: "/engineering" },
    ],
  },
  {
    heading: "Trust",
    links: [
      { label: "Quality", href: "/quality" },
      { label: "Manufacturing network", href: "/company/manufacturing-network" },
      { label: "Resources", href: "/resources" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/company" },
      { label: "Manufacturing network", href: "/company/manufacturing-network" },
      { label: "Request a quote", href: "/rfq" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/company/legal/privacy" },
      { label: "Terms", href: "/company/legal/terms" },
    ],
  },
];

function BrandMark({ inverted }: { inverted?: boolean }) {
  return (
    <Link href="/" className={cx("mx-brand", inverted && "mx-brand--inverted")}>
      <span className="mx-brand__mark">
        <i />
        <i />
      </span>
      <span className="mx-brand__text">
        <strong>Manufacturing OS</strong>
        <small>Manufacturing intelligence &amp; execution</small>
      </span>
    </Link>
  );
}

/** `hiddenPaths`: registry pages that are not public right now (draft,
 * future-scheduled, unpublished or paused -- see lib/content/live.ts). Nav
 * and footer links to them are not rendered. */
export function PublicShell({ children, hiddenPaths = [] }: { children: ReactNode; hiddenPaths?: string[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const hidden = new Set(hiddenPaths);
  const visible = <T extends { href: string }>(links: T[]) => links.filter((link) => !hidden.has(link.href));
  const navLinks = visible(primaryLinks);
  const groups = footerGroups.map((group) => ({ ...group, links: visible(group.links) })).filter((group) => group.links.length > 0);

  return (
    <div className="mx-shell">
      <header className="mx-header">
        <div className="mx-header__inner">
          <BrandMark />
          <nav className="mx-header__nav" aria-label="Primary">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={pathname?.startsWith(link.href.split("/").slice(0, 2).join("/")) ? "mx-header__nav-link mx-header__nav-link--active" : "mx-header__nav-link"}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mx-header__actions">
            {!hidden.has("/resources") && (
              <Link href="/resources" className="mx-header__resource">
                Resources
              </Link>
            )}
            <Button href="/rfq" size="sm">
              Start an RFQ
            </Button>
          </div>
          <button type="button" className="mx-header__menu-btn" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((value) => !value)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="mx-mobile-nav">
            {visible(primaryLinks.concat({ label: "Resources", href: "/resources" })).map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Button href="/rfq" onClick={() => setOpen(false)}>
              Start an RFQ
            </Button>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="mx-footer">
        <div className="mx-footer__inner">
          <div className="mx-footer__top">
            <div className="mx-footer__brand">
              <BrandMark inverted />
              <p>
                One accountable interface for custom hardware — from CAD and drawing to a routed,
                inspected, revisioned delivery.
              </p>
            </div>
            <div className="mx-footer__groups">
              {groups.map((group) => (
                <div key={group.heading}>
                  <span>{group.heading}</span>
                  {group.links.map((link) => (
                    <Link key={link.href} href={link.href}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mx-footer__bottom">
            <span>© 2026 Manufacturing OS</span>
            <span>Private by default · Drawing-specific acceptance · CAD never publicly indexed</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
