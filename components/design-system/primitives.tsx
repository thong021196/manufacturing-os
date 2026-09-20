import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "@/components/design-system/icons";

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const classes = cx("mx-btn", `mx-btn--${variant}`, `mx-btn--${size}`, className);
  if (href) {
    const linkProps = props as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export function MonoLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx("mx-mono-label", className)}>{children}</p>;
}

export function StatusTag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "evidence" | "caution" | "risk" }) {
  return <span className={`mx-tag mx-tag--${tone}`}>{children}</span>;
}

export function IndexMark({ value }: { value: string }) {
  return <span className="mx-index">{value}</span>;
}

/** The recurring corner-tick device that replaces card shadows / rounded corners. */
export function CornerTicks() {
  return (
    <>
      <i className="mx-tick mx-tick--tl" aria-hidden="true" />
      <i className="mx-tick mx-tick--tr" aria-hidden="true" />
      <i className="mx-tick mx-tick--bl" aria-hidden="true" />
      <i className="mx-tick mx-tick--br" aria-hidden="true" />
    </>
  );
}

export function Panel({ children, className, label, ticks }: { children: ReactNode; className?: string; label?: string; ticks?: boolean }) {
  return (
    <section className={cx("mx-panel", className)}>
      {ticks && <CornerTicks />}
      {label && <MonoLabel className="mx-panel__label">{label}</MonoLabel>}
      {children}
    </section>
  );
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav className="mx-breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          {index > 0 && <span className="mx-breadcrumbs__slash">/</span>}
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="mx-textlink">
      {children}
      <ArrowRight size={14} />
    </Link>
  );
}

/** A calm entrance effect driven purely by a CSS animation (see .mx-reveal
 *  in styles/site.css) — deliberately NOT gated on scroll position or an
 *  IntersectionObserver. Content must never depend on a scroll event to
 *  become visible: that is fragile for fast scrolling, programmatic/full-
 *  page capture, and some assistive tech. It also degrades correctly with
 *  no JS at all, and prefers-reduced-motion disables the animation outright. */
export function Reveal({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={cx("mx-reveal", className)}>
      {children}
    </div>
  );
}

export function Divider({ tone = "paper" }: { tone?: "paper" | "console" }) {
  return <hr className={cx("mx-divider", tone === "console" && "mx-divider--console")} />;
}
