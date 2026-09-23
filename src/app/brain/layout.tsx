import { Metadata } from 'next'
import BrainSidebar from '@/components/BrainSidebar'

export const metadata: Metadata = {
  title: 'Saved Workspace | NexSpace',
  description: 'Your personal knowledge management system.',
}

export default function BrainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col md:flex-row h-full min-h-[calc(100vh-64px)] bg-[#0B0B12]">
      <BrainSidebar />
      <div className="flex-1 w-full relative overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto pb-24">
          {children}
        </div>
      </div>
    </div>
  )
}
