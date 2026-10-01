import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function SettingsCard({ title, description, children }: Props) {
  return (
    <section className="rounded-xl border border-[#E6E3E3] bg-white p-4 sm:p-6">
      <h2 className="fontOutfit text-lg font-medium">{title}</h2>
      {description && <p className="pt-1 text-sm text-[#707070]">{description}</p>}
      <div className="pt-5">{children}</div>
    </section>
  );
}
