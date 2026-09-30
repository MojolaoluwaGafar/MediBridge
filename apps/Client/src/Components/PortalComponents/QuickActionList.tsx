import React from "react";

export type QuickAction = {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
};

// The "Quick Actions" card from the patient dashboard, with the actions passed in.
export default function QuickActionList({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="w-full lg:max-w-[391px] border border-[#D7D7D7] rounded-xl p-4 sm:p-5 md:p-6">
      <p className="pb-4 text-xl sm:text-2xl font-medium">
        Quick Actions
      </p>

      <div className="flex flex-col gap-4 sm:gap-5">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            type="button"
            className="w-full min-h-[60px] border border-[#E7E4E4] rounded-lg flex items-center gap-3 px-4 bg-white transition hover:bg-gray-50"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#E3FDF7] flex-shrink-0 text-[#28574E]">
              {action.icon}
            </span>

            <span className="text-sm sm:text-base font-medium text-left">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
