"use client";

import { Dice3 } from "lucide-react";

interface AppHeaderProps {
  title?: string;
}

export default function AppHeader({ title = "Mega Bingo" }: AppHeaderProps) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-gray-50/95 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-full bg-blue-500/10 text-primary shadow-sm">
          <span className="material-symbols-outlined text-[24px]">
            <Dice3 />
          </span>
        </div>
        <h2 className="text-gray-900 text-lg font-bold leading-tight tracking-tight">
          {title}
        </h2>
      </div>
    </div>
  );
}
