import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ children, size = 18, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export const ArrowUpRight = (props: IconProps) => <Icon {...props}><path d="M7 17 17 7M8 7h9v9" /></Icon>;
export const ArrowRight = (props: IconProps) => <Icon {...props}><path d="M4 12h15M13 6l6 6-6 6" /></Icon>;
export const Check = (props: IconProps) => <Icon {...props}><path d="m5 12 4 4L19 6" /></Icon>;
export const ChevronDown = (props: IconProps) => <Icon {...props}><path d="m6 9 6 6 6-6" /></Icon>;
export const Menu = (props: IconProps) => <Icon {...props}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>;
export const X = (props: IconProps) => <Icon {...props}><path d="m6 6 12 12M18 6 6 18" /></Icon>;
export const Upload = (props: IconProps) => <Icon {...props}><path d="M12 16V4m0 0L7 9m5-5 5 5M5 14v5h14v-5" /></Icon>;
export const Shield = (props: IconProps) => <Icon {...props}><path d="M12 3 5 6v5c0 4.7 2.9 8.1 7 10 4.1-1.9 7-5.3 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></Icon>;
export const Ruler = (props: IconProps) => <Icon {...props}><path d="m4 16 12-12 4 4L8 20H4v-4Z" /><path d="m13 7 4 4M10 10l2 2M7 13l2 2" /></Icon>;
export const Layers = (props: IconProps) => <Icon {...props}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></Icon>;
export const Activity = (props: IconProps) => <Icon {...props}><path d="M3 12h4l2-7 4 14 2-7h6" /></Icon>;
export const FileText = (props: IconProps) => <Icon {...props}><path d="M6 3h9l3 3v15H6V3Z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></Icon>;
