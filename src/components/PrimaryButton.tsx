"use client";

import { ArrowLeft, LucideIcon } from "lucide-react";

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
  type?: "button" | "submit";
}

export default function PrimaryButton({
  children,
  onClick,
  icon: Icon = ArrowLeft,
  disabled = false,
  type = "button",
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 bg-primary text-white text-base font-bold leading-normal tracking-wide shadow-lg shadow-primary/25 hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200"
    >
      <span className="mr-2">{children}</span>
      {Icon && (
        <span className="text-[20px] transition-transform group-hover:translate-x-1">
          <Icon />
        </span>
      )}
    </button>
  );
}
