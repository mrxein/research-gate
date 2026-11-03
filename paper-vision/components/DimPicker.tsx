"use client";
import { DIMS } from "@/lib/dimensions";
export default function DimPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <fieldset className="flex flex-wrap gap-2">
      <legend className="sr-only">Dimensions</legend>
      {DIMS.map((d) => (
        <label
          key={d.key}
          className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${value.includes(d.key) ? "border-tide bg-tide text-white" : "border-slate-300 dark:border-slate-600"}`}
        >
          <input
            type="checkbox"
            className="sr-only"
            checked={value.includes(d.key)}
            onChange={() =>
              onChange(
                value.includes(d.key)
                  ? value.filter((k) => k !== d.key)
                  : [...value, d.key],
              )
            }
          />
          {d.label}
        </label>
      ))}
    </fieldset>
  );
}
