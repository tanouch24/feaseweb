type IconProps = { size?: number };

function Icon({ children, size = 19 }: IconProps & { children: React.ReactNode }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}

export const BellIcon = (props: IconProps) => <Icon {...props}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></Icon>;
export const GlobeIcon = (props: IconProps) => <Icon {...props}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></Icon>;
export const CalendarIcon = (props: IconProps) => <Icon {...props}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 9h18" /></Icon>;
export const CreditCardIcon = (props: IconProps) => <Icon {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></Icon>;
export const ArrowUpRightIcon = (props: IconProps) => <Icon {...props}><path d="M7 17 17 7M8 7h9v9" /></Icon>;
export const MessageIcon = (props: IconProps) => <Icon {...props}><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.6 8.6 0 0 1-3.3-.7L4 20l1.6-3.8A7.4 7.4 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" /></Icon>;
export const ActivityIcon = (props: IconProps) => <Icon {...props}><path d="M3 12h4l2-6 4 12 2-6h6" /></Icon>;
