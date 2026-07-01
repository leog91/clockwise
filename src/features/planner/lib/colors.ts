import type { ActivityColor } from "../types";

export const ACTIVITY_COLORS: ActivityColor[] = [
  "slate",
  "red",
  "orange",
  "amber",
  "green",
  "emerald",
  "teal",
  "blue",
  "indigo",
  "purple",
  "pink",
  "rose",
];

export function getActivityColorClasses(color: ActivityColor | undefined) {
  switch (color) {
    case "slate":
      return { bg: "bg-slate-500", border: "border-slate-500", text: "text-slate-500", soft: "bg-slate-500/10" };
    case "red":
      return { bg: "bg-red-500", border: "border-red-500", text: "text-red-500", soft: "bg-red-500/10" };
    case "orange":
      return { bg: "bg-orange-500", border: "border-orange-500", text: "text-orange-500", soft: "bg-orange-500/10" };
    case "amber":
      return { bg: "bg-amber-500", border: "border-amber-500", text: "text-amber-500", soft: "bg-amber-500/10" };
    case "green":
      return { bg: "bg-green-500", border: "border-green-500", text: "text-green-500", soft: "bg-green-500/10" };
    case "emerald":
      return { bg: "bg-emerald-500", border: "border-emerald-500", text: "text-emerald-500", soft: "bg-emerald-500/10" };
    case "teal":
      return { bg: "bg-teal-500", border: "border-teal-500", text: "text-teal-500", soft: "bg-teal-500/10" };
    case "blue":
      return { bg: "bg-blue-500", border: "border-blue-500", text: "text-blue-500", soft: "bg-blue-500/10" };
    case "indigo":
      return { bg: "bg-indigo-500", border: "border-indigo-500", text: "text-indigo-500", soft: "bg-indigo-500/10" };
    case "purple":
      return { bg: "bg-purple-500", border: "border-purple-500", text: "text-purple-500", soft: "bg-purple-500/10" };
    case "pink":
      return { bg: "bg-pink-500", border: "border-pink-500", text: "text-pink-500", soft: "bg-pink-500/10" };
    case "rose":
      return { bg: "bg-rose-500", border: "border-rose-500", text: "text-rose-500", soft: "bg-rose-500/10" };
    default:
      return { bg: "bg-primary", border: "border-primary", text: "text-primary", soft: "bg-primary/10" };
  }
}
