"use client";
import { useState } from "react";
import { mediaUrl } from "@/lib/media";

export default function Avatar({ src, name, size = 40 }: { src?: string | null; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const style = { width: size, height: size, fontSize: size * 0.4 };
  const url = mediaUrl(src);

  return url && !failed ? (
    <img src={url} alt={name} style={style} onError={() => setFailed(true)}
         className="rounded-full object-cover shrink-0" />
  ) : (
    <div style={style} className="rounded-full bg-primary text-white grid place-items-center font-medium shrink-0">
      {initial}
    </div>
  );
}
