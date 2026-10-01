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
      <span className="flex h-14 w-14 items-center justify-center rounded-md bg-[#EBEAEA] text-[#141313]">
        {icon}
      </span>
      <h2 className="fontOutfit text-lg font-medium">{title}</h2>
      <p className="max-w-md text-sm text-[#666666]">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
