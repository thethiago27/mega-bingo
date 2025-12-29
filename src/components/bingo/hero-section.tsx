"use client";

import { LayoutGrid } from "lucide-react";

interface HeroSectionProps {
  title: string;
  description: string;
  imageUrl?: string;
}

export default function HeroSection({
  title,
  description,
  imageUrl,
}: HeroSectionProps) {
  return (
    <div className="relative w-full flex flex-col items-center justify-center py-8">
      {/* Decorative Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10"></div>

      {/* Main Illustration */}
      {imageUrl && (
        <div className="relative w-40 h-40 mb-6 group">
          <img
            alt="Bingo"
            className="w-full h-full object-cover rounded-3xl shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 ease-out ring-4 ring-white"
            src={imageUrl}
          />
          <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-gray-100 flex items-center justify-center">
            <span className="text-primary text-2xl">
              <LayoutGrid />
            </span>
          </div>
        </div>
      )}

      {/* Headlines */}
      <div className="text-center space-y-2 max-w-[320px]">
        <h1 className="text-gray-900 text-[32px] font-bold leading-tight tracking-tight">
          {title}
        </h1>
        <p className="text-gray-500 text-base font-normal leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
