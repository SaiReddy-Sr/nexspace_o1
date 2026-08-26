export default function RequestsLoading() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background font-sans">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-10 border-b border-border pb-6">
          <div className="h-10 w-48 bg-card/50 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-accent/20 rounded animate-pulse"></div>
        </div>

        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card p-6 rounded-xl border border-border flex flex-col sm:flex-row gap-6 animate-pulse">
              <div className="flex-1 space-y-4">
                <div className="h-6 w-3/4 bg-border/50 rounded"></div>
                <div className="h-4 w-1/4 bg-border/30 rounded"></div>
                <div className="space-y-2 mt-4">
                  <div className="h-4 w-full bg-border/30 rounded"></div>
                  <div className="h-4 w-full bg-border/30 rounded"></div>
                  <div className="h-4 w-2/3 bg-border/30 rounded"></div>
                </div>
              </div>
              <div className="w-full sm:w-48 h-10 bg-border/50 rounded"></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
