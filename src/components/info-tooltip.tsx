// Small hover-over "?" with a popup. Pure CSS — no JS state needed.
// Mouse hover and keyboard focus both show the tooltip.
export default function InfoTooltip({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="group relative ml-1 inline-flex align-middle">
      <span
        tabIndex={0}
        role="button"
        aria-label="More information"
        className="inline-flex h-4 w-4 cursor-help select-none items-center justify-center rounded-full bg-pack-tan/50 text-[10px] font-bold leading-none text-pack-brown ring-1 ring-pack-tan/40 hover:bg-pack-tan focus:bg-pack-tan focus:outline-none"
      >
        ?
      </span>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-10 mb-1.5 w-64 -translate-x-1/2 rounded-md bg-pack-mask px-3 py-2 text-left text-xs leading-relaxed font-normal text-pack-cream opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        {children}
      </span>
    </span>
  );
}
