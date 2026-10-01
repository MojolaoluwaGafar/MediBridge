import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  // Usually a button. Sits on the right on wide screens and drops below the
  // title on phones, so it never covers the heading.
  action?: ReactNode;
};

export default function PageHeader({ title, description, action }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="fontOutfit font-semibold text-2xl">{title}</h1>
        <p className="text-[#707070] text-base font-light">{description}</p>
      </div>

      {action && <div className="w-full sm:w-auto sm:shrink-0">{action}</div>}
    </div>
  );
}
