"use client";

import clsx from "clsx";
import { useState } from "react";
import { PASSWORD_RULES } from "@/lib/validation";

/** Password field with a live checklist of the policy from the brief. */
export function PasswordInput({ name = "password", label = "Password" }: { name?: string; label?: string }) {
  const [value, setValue] = useState("");
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} type="password" className="input" autoComplete="new-password" required value={value} onChange={(e) => setValue(e.target.value)} />
      <ul className="mt-2 grid grid-cols-2 gap-1 text-xs">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(value);
          return (
            <li key={rule.id} className={clsx("flex items-center gap-1", ok ? "text-[#18794e]" : "text-ink-3")}>
              <span aria-hidden>{ok ? "✓" : "•"}</span>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
