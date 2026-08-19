"use client";

import { demoSlides } from "../demoData";
import PresentationShell from "./PresentationShell";

const PresentationApp = () => {
  return <PresentationShell slides={demoSlides} />;
};

export default PresentationApp;