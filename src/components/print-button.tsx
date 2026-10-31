"use client";

import { buttonClass } from "./ui/button";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className={buttonClass("primary")}>
      Print / Save as PDF
    </button>
  );
}
