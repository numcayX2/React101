export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-green-300/60 border-b bg-green-300/60">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-white font-bold">HR</span>
        <h1 className="text-lg font-semibold">ระบบจัดการสมาชิกสภาผู้แทนราษฎร</h1>
      </div>
    </header>
  );
}
