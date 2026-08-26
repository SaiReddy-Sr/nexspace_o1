'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { saveFeaturedOrder } from './actions'

type Project = {
  id: string
  title: string
  featured: boolean
  featured_position: number | null
}

function SortableProjectItem({
  project,
  onRemove,
}: {
  project: Project
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: project.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-4 mb-2 bg-slate-800 rounded-lg border border-slate-700"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab hover:text-white text-slate-400 font-bold px-1"
        >
          ⋮⋮
        </button>
        <span className="font-medium text-slate-100 truncate">{project.title}</span>
      </div>
      <button
        onClick={() => onRemove(project.id)}
        className="text-slate-400 hover:text-red-400 transition-colors font-bold text-xl px-2"
        title="Remove from featured"
      >
        −
      </button>
    </div>
  )
}

export default function FeaturedDashboard({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  const featuredList = projects
    .filter((p) => p.featured)
    .sort((a, b) => (a.featured_position ?? 0) - (b.featured_position ?? 0))

  const poolList = projects
    .filter((p) => !p.featured)
    .filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.title.localeCompare(b.title))

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setProjects((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        
        const currentFeatured = items
          .filter((p) => p.featured)
          .sort((a, b) => (a.featured_position ?? 0) - (b.featured_position ?? 0))
        
        const activeItemIndex = currentFeatured.findIndex((p) => p.id === active.id)
        const overItemIndex = currentFeatured.findIndex((p) => p.id === over.id)
        
        const newFeatured = arrayMove(currentFeatured, activeItemIndex, overItemIndex)
        
        return items.map((p) => {
          if (!p.featured) return p
          const newPos = newFeatured.findIndex((nf) => nf.id === p.id)
          return { ...p, featured_position: newPos }
        })
      })
    }
  }

  function handleAdd(id: string) {
    setProjects((items) => {
      const maxPos = Math.max(-1, ...items.filter(p => p.featured).map(p => p.featured_position ?? -1))
      return items.map((p) =>
        p.id === id ? { ...p, featured: true, featured_position: maxPos + 1 } : p
      )
    })
  }

  function handleRemove(id: string) {
    setProjects((items) =>
      items.map((p) => (p.id === id ? { ...p, featured: false, featured_position: null } : p))
    )
  }

  function handleSave() {
    setSaveStatus('saving')
    startTransition(async () => {
      try {
        const orderedIds = featuredList.map((p) => p.id)
        await saveFeaturedOrder(orderedIds)
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } catch (error) {
        console.error(error)
        setSaveStatus('error')
      }
    })
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* LEFT COLUMN: Featured Feed Stack */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            ⭐ Featured Stack
          </h2>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md font-medium transition-colors"
          >
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Order'}
          </button>
        </div>
        
        {saveStatus === 'error' && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-200 rounded-md">
            Failed to save changes. Please try again.
          </div>
        )}

        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 min-h-[400px]">
          {featuredList.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 italic">
              No featured projects. Add from the pool.
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={featuredList.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                {featuredList.map((project) => (
                  <SortableProjectItem key={project.id} project={project} onRemove={handleRemove} />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Pool */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-4 text-slate-200">All Projects Pool</h2>
        
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 min-h-[400px] max-h-[600px] overflow-y-auto">
          {poolList.length === 0 ? (
            <div className="text-center text-slate-500 italic mt-8">No matching projects found.</div>
          ) : (
            poolList.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 mb-2 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <span className="font-medium text-slate-200 truncate pr-4">{project.title}</span>
                <button
                  onClick={() => handleAdd(project.id)}
                  className="text-slate-400 hover:text-green-400 transition-colors flex-shrink-0 font-bold text-xl px-2"
                  title="Add to featured"
                >
                  +
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
