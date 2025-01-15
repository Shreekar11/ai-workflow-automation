"use client";

import React from "react";

import { cn } from "@/lib/utils";
import { Button } from "./button";

interface PulsatingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pulseColor?: string;
  duration?: string;
}

export function PulsatingButton({
  className,
  children,
  pulseColor = "#F987BA",
  duration = "1.5s",
  ...props
}: PulsatingButtonProps) {
  return (
    <Button
      className={cn(
        `relative flex cursor-pointer items-center justify-center rounded-lg bg-[#DB2777] 
        hover:bg-[#DB2777]/60 text-center text-white dark:bg-[#DB2777] dark:text-black`,
        className
      )}
      style={
        {
          "--pulse-color": pulseColor,
          "--duration": duration,
        } as React.CSSProperties
      }
      {...props}
    >
      <div className="relative z-10">{children}</div>
      <div className="absolute left-1/2 top-1/2 size-full -translate-x-1/2 
      -translate-y-1/2 animate-pulse rounded-lg bg-inherit" />
    </Button>
  );
}
