// Shown while a page's code is downloading (usually a fraction of a second).
// Plain markup, no imports, so it costs nothing in the main bundle.
export default function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white" role="status" aria-live="polite">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-[#E0F8F3] border-t-[#28574E]" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
