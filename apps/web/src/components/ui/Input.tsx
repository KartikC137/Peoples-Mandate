"use client";

import type React from "react";
import { RefObject } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | null;
  labelStyle?: string | null;
  ref?: RefObject<HTMLInputElement | null>;
}

export default function Input({
  label,
  labelStyle,
  id,
  className,
  ref,
  ...props
}: InputProps) {
  const baseStyles =
    "w-full px-3 py-2 text-lg text-red-700 font-mono bg-orange-50 rounded border-2 border-orange-800 focus:outline-none focus:bg-white focus:ring-none focus:ring-orange-400 disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-100";
  const baseLabelStyle = "text-lg block font-mono pl-1";

  const combinedClassName = `${baseStyles} ${className || ""}`;
  const combinedLabelStyle = `${baseLabelStyle} ${labelStyle || "font-medium text-md text-orange-700"}`;

  return (
    <div className="w-full flex flex-col justify-center ">
      {label && (
        <label htmlFor={id} className={combinedLabelStyle}>
          {label}
        </label>
      )}
      <input id={id} className={combinedClassName} ref={ref} {...props} />
    </div>
  );
}
