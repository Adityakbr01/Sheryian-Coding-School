import { useEffect } from "react";
import { useWebHaptics } from "web-haptics/react";

export default function HapticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { trigger, isSupported } = useWebHaptics();

  useEffect(() => {
    if (!isSupported) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive = target.closest(
        'button, a, [role="button"], [role="tab"], [role="menuitem"], [role="switch"]',
      );

      if (isInteractive && trigger) {
        // Trigger a light haptic feedback for click events
        const res = trigger("light");
        if (res && typeof res.catch === "function") {
          res.catch(() => {
            // Ignore errors if haptics are not allowed by browser policy yet
          });
        }
      }
    };

    // Use capture phase to ensure it runs even if propagation is stopped
    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, [trigger, isSupported]);

  return <>{children}</>;
}
