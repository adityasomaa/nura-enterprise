import { SectionHeader } from "@/components/SectionHeader";
import { TransitionLink } from "@/components/TransitionLink";

type Props = {
  sectionTitle: string;
  headline: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  sections: readonly { title: string; body: string }[];
};

/** Tata letak yang dipakai halaman kebijakan privasi dan syarat ketentuan. */
export function LegalPage({
  sectionTitle,
  headline,
  description,
  ctaLabel,
  ctaHref,
  sections,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 pt-(--header-h) sm:px-8 lg:px-12">
      <section className="pt-14 sm:pt-20 lg:pt-24">
        <SectionHeader
          as="h1"
          size="lg"
          sectionTitle={sectionTitle}
          headline={headline}
          description={description}
          cta={
            <TransitionLink
              href={ctaHref}
              className="min-h-12 border border-line-strong px-6 py-3.5 text-[0.94rem] text-ink transition-colors duration-200 hover:border-ink"
            >
              {ctaLabel}
            </TransitionLink>
          }
        />

        <div className="mt-14 border-t border-line lg:mt-20">
          {sections.map((section, index) => (
            <section
              key={section.title}
              className="grid gap-3 border-b border-line py-9 md:grid-cols-12 md:items-start md:gap-10"
            >
              <p className="text-[0.78rem] uppercase tracking-[0.18em] text-ink-3 md:col-span-1">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="text-[1.14rem] font-medium text-ink md:col-span-4">{section.title}</h2>
              <p className="prose-measure text-[0.98rem] text-ink-2 md:col-span-7">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
