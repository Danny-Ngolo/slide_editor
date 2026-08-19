"use client";

import dynamic from "next/dynamic";

const PresentationApp = dynamic(
  () => import("./components/PresentationApp"),
  { ssr: false },
);

export default function PresentationPage() {
  return <PresentationApp />;
}