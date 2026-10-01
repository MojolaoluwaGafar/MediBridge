import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  // Optional action on the right (e.g. "Book New Appointment"). Stacks under
  // the title on small screens.
  action?: ReactNode;
};

export default function PageHeader({ title, description, action }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="fontOutfit text-xl font-semibold sm:text-2xl">{title}</h1>
        {description && (
          <p className="pt-1 text-sm font-light text-[#707070] sm:text-base">
            {description}
          </p>
        )}
      </div>

      {action && <div className="w-full shrink-0 sm:w-auto">{action}</div>}
    </div>
  );
}
