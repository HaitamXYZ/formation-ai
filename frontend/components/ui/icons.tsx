import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20" {...props}>
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return <IconBase {...props}><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconBase>;
}

export function CatalogIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22V5.5Zm16 0A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22V5.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /></IconBase>;
}

export function TrainingIcon(props: IconProps) {
  return <IconBase {...props}><path d="m3 8 9-5 9 5-9 5-9-5Zm4 2.3V16c2.9 2.1 7.1 2.1 10 0v-5.7M21 8v7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconBase>;
}

export function UsersIcon(props: IconProps) {
  return <IconBase {...props}><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 2.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconBase>;
}

export function SparklesIcon(props: IconProps) {
  return <IconBase {...props}><path d="m12 3 1.25 3.75L17 8l-3.75 1.25L12 13l-1.25-3.75L7 8l3.75-1.25L12 3Zm6 10 .75 2.25L21 16l-2.25.75L18 19l-.75-2.25L15 16l2.25-.75L18 13ZM5 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" fill="currentColor" /></IconBase>;
}

export function MenuIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></IconBase>;
}

export function CloseIcon(props: IconProps) {
  return <IconBase {...props}><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></IconBase>;
}

export function MicrophoneIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4Zm-7-4a7 7 0 0 0 14 0M12 18v4m-4 0h8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></IconBase>;
}

export function MicrophoneOffIcon(props: IconProps) {
  return <IconBase {...props}><path d="M9.5 4.6A4 4 0 0 1 16 7v4c0 .5-.1 1-.26 1.44M8 10V7m-3 4a7 7 0 0 0 11.2 5.6M19 11a7 7 0 0 1-.44 2.44M12 18v4m-4 0h8M3 3l18 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></IconBase>;
}

export function StopIcon(props: IconProps) {
  return <IconBase {...props}><rect height="14" rx="3" stroke="currentColor" strokeWidth="1.8" width="14" x="5" y="5" /></IconBase>;
}

export function InterruptIcon(props: IconProps) {
  return <IconBase {...props}><path d="M7 5v14m10-14v14" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" /></IconBase>;
}

export function ExpandIcon(props: IconProps) {
  return <IconBase {...props}><path d="M8 3H3v5m13-5h5v5M8 21H3v-5m13 5h5v-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconBase>;
}

export function MessageIcon(props: IconProps) {
  return <IconBase {...props}><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /></IconBase>;
}

export function HistoryIcon(props: IconProps) {
  return <IconBase {...props}><path d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5m4-1v5l3 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconBase>;
}

export function LayersIcon(props: IconProps) {
  return <IconBase {...props}><path d="m12 2 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconBase>;
}

export function MoreIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="5" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /><circle cx="19" cy="12" r="1.5" fill="currentColor" /></IconBase>;
}
