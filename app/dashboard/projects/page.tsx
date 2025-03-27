"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Globe, PlusCircle, Search, Calendar, Link2 } from "lucide-react"
import { API_BASE_URL } from "@/app/config"

interface Project {
  id: number
  project_name: string
  domain: string
  created_at: string
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const response = await fetch(`${API_BASE_URL}/get-projects`, {     
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch projects")
        }

        const data = await response.json()
        setProjects(data)
        setFilteredProjects(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProjects(projects)
    } else {
      const filtered = projects.filter(
        (project) =>
          project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.domain.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredProjects(filtered)
    }
  }, [searchQuery, projects])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Projekte</h1>
        <Link href="/dashboard/projects/new">
          <Button className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Neues Projekt
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Search className="h-10 w-10 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">{searchQuery ? "No matching projects found" : "No projects yet"}</CardTitle>
            <CardDescription className="mb-4 text-center">
              {searchQuery
                ? "Try a different search term or create a new project."
                : "Create your first project to start analyzing your website's SEO."}
            </CardDescription>
            <Link href="/dashboard/projects/new">
              <Button>Projekt erstellen</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle>{project.project_name}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      {project.domain}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Link2 className="h-4 w-4" />
                      Details anzeigen
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

