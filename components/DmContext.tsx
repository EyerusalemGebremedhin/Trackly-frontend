"use client";
import { createContext, useContext } from "react";

export const DmUI = createContext<{ listOpen: boolean; toggleList: () => void }>({
  listOpen: true,
  toggleList: () => {},
});
export const useDmUI = () => useContext(DmUI);

export const displayName = (u: any) => {
  if (!u) return "Unknown";
  const full =
    u.name ||
    u.full_name ||
    `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
  return full || u.email || "Unknown";
};
