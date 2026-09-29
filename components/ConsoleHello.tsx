"use client";

import { useEffect } from "react";

/** Easter egg for whoever opens devtools. */
export default function ConsoleHello({ name }: { name: string }) {
  useEffect(() => {
    const w = window as Window & { __nicoSaidHi?: boolean };
    if (w.__nicoSaidHi) return;
    w.__nicoSaidHi = true;
    console.log(
      `%c${name.toLowerCase()}@cv%c:~$ whoami\n%cthe person who would also have opened devtools.\nsay hi → scroll to the bottom.`,
      "color:#ff4f00;font-family:monospace;font-weight:600",
      "color:#737373;font-family:monospace",
      "color:#0a0a0a;font-family:monospace",
    );
  }, [name]);
  return null;
}
