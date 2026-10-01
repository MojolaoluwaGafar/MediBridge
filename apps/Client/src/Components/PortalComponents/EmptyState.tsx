import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({ icon, title, description, action, className = "" }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 px-6 py-16 text-center ${className}`}>
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EBEAEA] text-[#141313]">
        {icon}
      </span>
      <h2 className="fontOutfit pt-2 text-base font-medium sm:text-lg">{title}</h2>
      <p className="max-w-md text-sm text-[#666666]">{description}</p>
      {action}
    </div>
  );
}
