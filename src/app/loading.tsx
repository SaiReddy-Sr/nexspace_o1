export default function Loading() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background font-sans">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 text-center sm:text-left">
          <div className="h-16 w-3/4 max-w-2xl bg-card/50 rounded-md animate-pulse mb-6"></div>
          <div className="h-6 w-full max-w-xl bg-card/50 rounded-md animate-pulse"></div>
        </div>

        <div className="w-full relative">
          <div className="sticky top-16 z-40 -mx-4 px-4 sm:mx-0 sm:px-0 py-4 mb-8">
            <div className="h-10 w-full max-w-md bg-card/50 rounded-full animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col md:flex-row bg-[#151518] h-64 md:h-[400px] rounded-xl border border-white/5 animate-pulse"></div>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#151518] h-80 rounded-xl border border-white/5 animate-pulse"></div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
