import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Scroll an input element into view when focused on mobile.
 * This ensures the keyboard doesn't cover the input field.
 * Uses a small delay to wait for the keyboard to appear.
 */
export function scrollInputIntoView(el: HTMLElement | null) {
  if (!el) return;
  const run = () => {
    el.scrollIntoView({ block: "center", behavior: "smooth", inline: "nearest" });
  };
  requestAnimationFrame(() => {
    requestAnimationFrame(() => setTimeout(run, 150));
  });
}
