import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Techy grid/starry background effect */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(123, 83, 217, 1) 1.5px, transparent 1.5px)',
          backgroundSize: '48px 48px'
        }}
      />

      {/* Glowing orb behind text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/30 rounded-full blur-[100px] z-0 animate-pulse" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-8">
        <h1 className="text-8xl md:text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/10 drop-shadow-[0_0_40px_rgba(139,92,246,0.3)] tracking-tighter leading-none">
          404
        </h1>

        <div className="space-y-4 max-w-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Uncharted Territory
          </h2>
          <p className="text-foreground/60 text-lg leading-relaxed">
            You've ventured into the unknown void. The coordinates you're looking for don't exist in the NexSpace database.
          </p>
        </div>

        <Link
          href="/"
          className="group relative mt-8 inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-300 bg-accent rounded-full hover:bg-accent-hover hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Base
          </span>
        </Link>
      </div>

      {/* Decorative floating elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-accent rounded-full animate-ping opacity-50" />
      <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-white rounded-full animate-pulse opacity-40 delay-300" />
      <div className="absolute top-1/3 right-1/3 w-2.5 h-2.5 bg-accent rounded-full animate-pulse opacity-60 delay-700" />
    </div>
  )
}
