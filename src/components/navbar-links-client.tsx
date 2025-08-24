"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NavbarLinksClient() {
  const { t } = useLanguage();
  return (
    <div className="flex gap-6 items-center">
      <Link href="/" prefetch={true} className="text-sm text-gray-700 hover:text-gray-900">
        {t("nav.home")}
      </Link>
      <Link
        href="/majors"
        prefetch={true}
        className="text-sm text-gray-700 hover:text-gray-900"
      >
        {t("nav.majors")}
      </Link>
      <Link
        href="/assessment"
        prefetch={true}
        className="text-sm text-gray-700 hover:text-gray-900"
      >
        {t("nav.assessment")}
      </Link>
      <Link
        href="/progress"
        prefetch={true}
        className="text-sm text-gray-700 hover:text-gray-900"
      >
        {t("nav.progress")}
      </Link>
    </div>
  );
}
