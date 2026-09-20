"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Menu, X } from "@/components/design-system/icons";
import { Button } from "@/components/design-system/primitives";

const links = [
  { label: "Parts", href: "/parts/robot-joint-housing" },
  { label: "Capabilities", href: "/capabilities/5-axis-machining" },
  { label: "Applications", href: "/applications/humanoid-robots" },
  { label: "Quality", href: "/quality" },
  { label: "Network", href: "/network" },
];

export function PublicShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="public-app"><header className="public-header"><div className="public-header__inner"><Link href="/" className="brand-mark" onClick={() => setOpen(false)}><span className="brand-mark__symbol">M</span><span><strong>Manufacturing OS</strong><small>ENGINEERING / SOURCING / CONTROL</small></span></Link><nav className="public-nav" aria-label="Primary navigation">{links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav><div className="public-header__actions"><Link href="/resources" className="header-resource">Resources</Link><Button href="/rfq" size="sm">Request a quote</Button></div><button className="mobile-menu-button" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</button></div>{open && <div className="mobile-nav">{links.concat({ label: "Resources", href: "/resources" }).map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}<Button href="/rfq" onClick={() => setOpen(false)}>Request a quote</Button></div>}</header><main>{children}</main><footer className="public-footer"><div><Link href="/" className="brand-mark brand-mark--footer"><span className="brand-mark__symbol">M</span><span><strong>Manufacturing OS</strong><small>Technical manufacturing, coordinated.</small></span></Link><p>Precision parts and production coordination for hardware teams.</p></div><div className="footer-links"><div><span>Explore</span><Link href="/parts/robot-joint-housing">Parts</Link><Link href="/capabilities/5-axis-machining">Capabilities</Link><Link href="/applications/humanoid-robots">Applications</Link><Link href="/network">Network</Link></div><div><span>Trust</span><Link href="/quality">Quality</Link><Link href="/resources">Resources</Link><Link href="/rfq">RFQ intake</Link></div></div><div className="footer-bottom"><span>© 2026 Manufacturing OS</span><span>Private by default · Drawing-specific acceptance</span></div></footer></div>;
}
