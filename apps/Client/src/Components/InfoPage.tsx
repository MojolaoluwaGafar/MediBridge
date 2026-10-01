import type { ReactNode } from "react";
import AppLayout from "../Layout/AppLayout";

export type InfoSection = {
  heading: string;
  body: ReactNode;
};

type Props = {
  title: string;
  intro: string;
  updated?: string;
  sections: InfoSection[];
};

// Layout for plain information pages (Privacy, Terms, Contact): the site
// header and footer around readable, numbered sections.
export default function InfoPage({ title, intro, updated, sections }: Props) {
  return (
    <AppLayout headerProps={{ className: "supportBg", heading: title, subHeading: intro }}>
      <div className="bg-[#F5F5F5] px-5 py-12 md:py-20">
        <article className="mx-auto max-w-3xl rounded-xl border border-[#E6E3E3] bg-white p-6 sm:p-10">
          {updated && <p className="pb-6 text-sm text-[#757575]">Last updated {updated}</p>}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <section key={section.heading}>
                <h2 className="fontOutfit pb-2 text-xl font-medium text-[#28574E]">
                  {index + 1}. {section.heading}
                </h2>
                <div className="space-y-3 text-[#3E3B3B] leading-relaxed">{section.body}</div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </AppLayout>
  );
}
