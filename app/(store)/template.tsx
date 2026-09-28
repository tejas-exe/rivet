/**
 * Fast directional page transition: a neon wipe crosses the screen while the
 * new page slides in. Pure CSS so it runs before hydration, and the content
 * animation uses `backwards` fill so no transform lingers afterwards (which
 * would break `position: fixed` descendants such as the mobile buy bar).
 */
export default function StoreTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
        <div className="page-wipe h-full bg-gradient-to-r from-volt via-violet to-cyan shadow-[0_0_14px_rgb(255_46_147/0.8)]" />
      </div>
      <div className="page-in">{children}</div>
    </>
  );
}
