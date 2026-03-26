import BlankPlaceholder from "@/components/common/BlankPlaceholder";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard | ETIP",
  description: "ETIP workspace",
};

export default function HomePage() {
  return <BlankPlaceholder title="Dashboard" />;
}
