import Link from "next/link";

import { SectionHeader } from "@/components/SectionHeader";
import { getDictionary } from "@/lib/i18n";
import { route } from "@/lib/routes";

/* Halaman ini bisa dirender tanpa segmen bahasa yang sah, jadi teksnya memakai
   bahasa bawaan dan tautannya menunjuk galeri berbahasa Indonesia. */
export default function NotFound() {
  const dict = getDictionary("id");
  return (
    <div className="mx-auto flex min-h-[70svh] w-full max-w-[1440px] items-center px-5 pt-(--header-h) sm:px-8 lg:px-12">
      <SectionHeader
        as="h1"
        size="lg"
        sectionTitle={dict.notFound.sectionTitle}
        headline={dict.notFound.headline}
        description={dict.notFound.description}
        align="start"
        cta={
          <Link
            href={route("id", "gallery")}
            className="min-h-12 bg-accent px-6 py-3.5 text-[0.94rem] text-on-accent"
          >
            {dict.notFound.cta}
          </Link>
        }
      />
    </div>
  );
}
