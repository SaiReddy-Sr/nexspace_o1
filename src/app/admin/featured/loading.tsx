export default function AdminFeaturedLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="h-10 w-64 bg-card/50 rounded animate-pulse mb-8"></div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="flex justify-between mb-4">
            <div className="h-8 w-40 bg-card/50 rounded animate-pulse"></div>
            <div className="h-10 w-28 bg-accent/20 rounded animate-pulse"></div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 min-h-[400px]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full bg-slate-800 rounded-lg mb-2 animate-pulse"></div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="h-8 w-40 bg-card/50 rounded animate-pulse mb-4"></div>
          <div className="h-10 w-full bg-slate-900 rounded-lg animate-pulse mb-4"></div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 min-h-[400px]">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 w-full bg-slate-800/50 rounded-lg mb-2 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
