"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { LucideIcon, User } from "lucide-react";

interface InputFieldProps {
  id: string;
  label: string;
  icon?: LucideIcon;
  errors?: Array<{ message?: string } | undefined>;
}

export function InputField({
  id,
  icon: Icon = User,
  errors,
  ...props
}: React.ComponentProps<"input"> & InputFieldProps) {
  return (
    <Field className="space-y-2">
      <FieldLabel
        className="block text-gray-700 text-sm font-bold ml-1"
        htmlFor={id}
      >
        {props.label}
      </FieldLabel>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-gray-400">
            <Icon />
          </span>
        </div>
        <input
          className="form-input flex w-full rounded-xl text-gray-900 border border-gray-200 bg-white h-14 pl-12 pr-4 placeholder:text-gray-400 text-base font-normal leading-normal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
          {...props}
        />
      </div>
      {errors && <FieldError errors={errors} />}
    </Field>
  );
}
