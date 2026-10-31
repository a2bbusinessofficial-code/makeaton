import clsx from "clsx";

export type ChipColor = "gray" | "blue" | "green" | "orange" | "red" | "purple" | "yellow";

const colors: Record<ChipColor, string> = {
  gray: "bg-[#f1f1f1] text-[#666]",
  blue: "bg-[#e8efff] text-[#1961ed]",
  green: "bg-[#e3f5ea] text-[#18794e]",
  orange: "bg-[#fff0e3] text-[#c4520b]",
  red: "bg-[#ffe9e9] text-[#c4161c]",
  purple: "bg-[#f1eaff] text-[#6e3ff3]",
  yellow: "bg-[#fff7d6] text-[#946800]",
};

export function Chip({ color = "gray", children, className }: { color?: ChipColor; children: React.ReactNode; className?: string }) {
  return (
    <span className={clsx("inline-flex h-5 items-center rounded px-1.5 text-xs font-medium whitespace-nowrap", colors[color], className)}>
      {children}
    </span>
  );
}
