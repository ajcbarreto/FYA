"use client";

import { useParams } from "next/navigation";
import { DashboardPageSkeleton } from "@/components/skeletons/dashboard-page-skeleton";

export default function DashboardLoading() {
  const { locale } = useParams();
  return <DashboardPageSkeleton locale={locale === "en" ? "en" : "pt"} />;
}
