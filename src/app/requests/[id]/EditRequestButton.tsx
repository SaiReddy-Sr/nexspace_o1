'use client'

import { useState } from 'react'
import EditRequestModal from '@/components/EditRequestModal'
import { updateProblem } from './actions'

export default function EditRequestButton({ problem }: { problem: any }) {
  const [isOpen, setIsOpen] = useState(false)

  async function handleSave(data: { title: string, description: string, tags: string, status: string }) {
    const result = await updateProblem(problem.id, data)
    if (result.error) {
      throw new Error(result.error)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-md hover:bg-white/10 transition-colors shadow-sm"
      >
        Edit Request
      </button>

      {isOpen && (
        <EditRequestModal 
          problem={problem} 
          onClose={() => setIsOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </>
  )
}
