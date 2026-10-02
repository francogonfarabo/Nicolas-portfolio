import { useSyncExternalStore } from "react";

/** Below Tailwind's `sm`: the skills chart turns sideways and only the section chips stay pinned. */
export const PHONE_QUERY = "(max-width: 639.98px)";

const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

export const usePhone = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false,
  );
