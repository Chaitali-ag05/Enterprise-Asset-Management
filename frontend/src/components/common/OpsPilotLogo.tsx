import React from "react";

export const OpsPilotLogo: React.FC<{ size?: "sm" | "md" | "lg"; showText?: boolean; showSubtitle?: boolean }> = ({
  size = "md",
  showText = true,
  showSubtitle = true,
}) => {
  const iconDimensions = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  }[size];

  const titleSize = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }[size];

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Precision Geometric OpsPilot Logo Mark */}
      <div className={`${iconDimensions} shrink-0 relative flex items-center justify-center`}>
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Left Angle Fold */}
          <path
            d="M8 28L18 8L22 15L14 28H8Z"
            className="fill-[#2E8540] dark:fill-[#A3FF5F]"
          />
          {/* Right Upper Fold */}
          <path
            d="M18 8L28 28H22L18 20L22 12L18 8Z"
            className="fill-[#1A1D18] dark:fill-[#F3F7F4]"
          />
          {/* Central Translucent Overlap */}
          <path
            d="M18 12L22 20L18 28L14 20L18 12Z"
            className="fill-[#0D9488] dark:fill-[#55D6BE] fill-opacity-40 dark:fill-opacity-40"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-heading font-bold ${titleSize} tracking-wider text-[#1A1D18] dark:text-[#F3F7F4] leading-none`}>
            OPSPILOT
          </span>
          {showSubtitle && (
            <span className="text-[10px] font-sans tracking-tight text-[#526159] dark:text-[#8E9C94] mt-0.5">
              Enterprise Asset Management
            </span>
          )}
        </div>
      )}
    </div>
  );
};