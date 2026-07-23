import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
};

export function FormField({ label, name, className = "", ...props }: FormFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-800" htmlFor={name}>
      {label}
      <input
        id={name}
        name={name}
        className={`min-h-[52px] rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${className}`}
        {...props}
      />
    </label>
  );
}
