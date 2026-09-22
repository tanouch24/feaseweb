import type { ReactNode } from "react";

const cornerBase = "absolute h-3 w-3 border-brand/40";

export function MockupFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className={`${cornerBase} -left-2 -top-2 border-l-2 border-t-2`}
      />
      <span
        aria-hidden="true"
        className={`${cornerBase} -right-2 -top-2 border-r-2 border-t-2`}
      />
      <span
        aria-hidden="true"
        className={`${cornerBase} -bottom-2 -left-2 border-b-2 border-l-2`}
      />
      <span
        aria-hidden="true"
        className={`${cornerBase} -bottom-2 -right-2 border-b-2 border-r-2`}
      />
      {children}
    </div>
  );
}
