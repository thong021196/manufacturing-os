import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
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
  variant?: "primary" | "secondary" | "quiet" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  const classes = cx("ds-button", `ds-button--${variant}`, `ds-button--${size}`, className);
  if (href) return <Link href={href} className={classes}>{children}</Link>;
  return <button className={classes} {...props}>{children}</button>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="ds-eyebrow">{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusTag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "blue" | "green" | "amber" | "red" }) {
  return <span className={`status-tag status-tag--${tone}`}>{children}</span>;
}

export function TechnicalPanel({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return <section className={cx("technical-panel", className)}>{label && <div className="panel-label">{label}</div>}{children}</section>;
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb">{items.map((item, index) => <span key={`${item.label}-${index}`}>{index > 0 && <span className="breadcrumbs__slash">/</span>}{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav>;
}

export function FeatureLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="feature-link">{children}<ArrowRight size={16} /></Link>;
}

export function Annotation({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return <div className="annotation"><span className="annotation__index">{index}</span><div><strong>{title}</strong><p>{children}</p></div></div>;
}

export function Divider() { return <hr className="ds-divider" />; }
