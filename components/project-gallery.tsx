"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AppHeader } from "@/components/app-header"
import { ProjectCard } from "@/components/project-card"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import type { Project } from "@/lib/types"

interface ProjectGalleryProps {
  projects: Project[]
  isLoading?: boolean
  onCreateProject: (data: {
    title: string
    openDate: string
    description?: string
  }) => void
  onDeleteProject: (id: string) => void
  onSelectProject: (id: string) => void
  recalculateProgress: (project: Project) => number
}

export function ProjectGallery({
  projects,
  isLoading,
  onCreateProject,
  onDeleteProject,
  onSelectProject,
  recalculateProgress,
}: ProjectGalleryProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  )

  const totalProjects = projects.length
  const avgProgress =
    totalProjects > 0
      ? Math.round(
          projects.reduce((acc, p) => acc + recalculateProgress(p), 0) /
            totalProjects,
        )
      : 0

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />

      {/* Hero section */}
      <div className="relative bg-primary px-4 py-8 md:py-12">
        <div className="absolute right-4 top-4 opacity-20 md:right-8 md:top-6">
          <Image
            src="/icons/go-logo.png"
            alt=""
            width={80}
            height={80}
            className="md:w-[100px] md:h-[100px]"
          />
        </div>
        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl font-bold text-primary-foreground md:text-3xl text-balance">
            プロジェクト進捗
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/80 leading-relaxed">
            
          </p>
          <div className="mt-4 flex items-center gap-6 text-sm text-primary-foreground/90">
            <div>
              <span className="text-2xl font-bold text-primary-foreground">
                
              </span>{" "}
              
            </div>
            <div>
              <span className="text-2xl font-bold text-primary-foreground">
                
              </span>{" "}
              
            </div>
          </div>
        </div>
      </div>

      {/* Search + Create */}
      <div className="flex items-center gap-3 px-4 py-4 bg-background">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="プロジェクトを検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">新規作成</span>
        </Button>
      </div>

      {/* Project grid */}
      <div className="flex-1 px-4 pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">読み込み中...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                progress={recalculateProgress(project)}
                onClick={() => onSelectProject(project.id)}
                onDelete={() => onDeleteProject(project.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Image
              src="/icons/go-logo.png"
              alt="GO"
              width={64}
              height={64}
              className="mb-4 opacity-30"
            />
            <p className="text-lg font-medium text-muted-foreground">
              {search
                ? "該当するプロジェクトがありません"
                : "プロジェクトがまだありません"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search
                ? "別のキーワードで検索してください。"
                : "最初のOPEN準備プロジェクトを作成しましょう。"}
            </p>
            {!search && (
              <Button
                onClick={() => setShowCreate(true)}
                className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                プロジェクトを作成
              </Button>
            )}
          </div>
        )}
      </div>

      {/* FAB for mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          size="lg"
          onClick={() => setShowCreate(true)}
          className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
          aria-label="プロジェクトを作成"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <CreateProjectDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={onCreateProject}
      />
    </div>
  )
}
