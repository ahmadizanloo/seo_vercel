"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft, ExternalLink, Globe, Search, Zap } from "lucide-react"
import Link from "next/link"
import LinksTable from "@/components/links-table"
import StartCrawlModal from "@/components/start-crawl-modal"
import { API_BASE_URL } from "@/app/config"

interface Project {
  id: number
  project_name: string
  domain: string
  created_at: string
}

interface LinkType {
  id: number
  url: string
  title: string
  status_code: number
  meta_description_length: number
  total_h1_tags: number
  total_images_without_alt: number
  created_at: string
}

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = React.use(params) // ✅ Proper unwrapping

  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [links, setLinks] = useState<LinkType[]>([])
  const [filteredLinks, setFilteredLinks] = useState<LinkType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCrawlModal, setShowCrawlModal] = useState(false)

  useEffect(() => {
    const fetchProjectAndLinks = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        const projectsResponse = await fetch(`${API_BASE_URL}/get-projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!projectsResponse.ok) throw new Error("Failed to fetch projects")

        const projectsData = await projectsResponse.json()
        const currentProject = projectsData.find((p: Project) => p.id === Number.parseInt(projectId))

        if (!currentProject) throw new Error("Project not found")

        setProject(currentProject)

        const linksResponse = await fetch(`${API_BASE_URL}/get-links/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!linksResponse.ok) throw new Error("Failed to fetch links")

        const linksData = await linksResponse.json()
        console.log("✅ Links fetched from backend:", linksData);
        setLinks(linksData)
        setFilteredLinks(linksData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchProjectAndLinks()
  }, [projectId, router])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLinks(links)
    } else {
      const filtered = links.filter(
        (link) =>
          link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (link.title && link.title.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredLinks(filtered)
    }
  }, [searchQuery, links])

  const handleStartCrawl = () => setShowCrawlModal(true)

  const handleCrawlComplete = async () => {
    setShowCrawlModal(false)
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      const response = await fetch(`${API_BASE_URL}/get-links/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch updated links")
      const data = await response.json()
      setLinks(data)
      setFilteredLinks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh links")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <ArrowLeft className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-full max-w-md mb-8" />
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!project) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Projekt nicht gefunden</AlertTitle>
        <AlertDescription>
         Das angeforderte Projekt konnte nicht gefunden werden.{" "}
          <Link href="/dashboard/projects" className="underline">
           Zu den Projekten zurückkehren
          </Link>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link
          href="/dashboard/projects"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zurück zu den Projekten
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.project_name}</h1>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <Globe className="h-4 w-4" />
            <a
              href={`https://${project.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:underline"
            >
              {project.domain}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
        <Button onClick={handleStartCrawl} className="gap-1">
          <Zap className="h-4 w-4" />
          Crawl starten
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Analysierte URLs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{links.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gefundene Probleme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                links.filter(
                  (link) =>
                    link.status_code >= 400 ||
                    link.total_h1_tags !== 1 ||
                    link.total_images_without_alt > 0 ||
                    (link.meta_description_length > 0 &&
                      (link.meta_description_length < 50 || link.meta_description_length > 160)),
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Zuletzt gecrawlt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {links.length > 0 && links[0]?.created_at ? new Date(links[0].created_at).toLocaleDateString() : "Never"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">Alle URLs ({links.length})</TabsTrigger>
            <TabsTrigger value="issues">
              Issues (
              {
                links.filter(
                  (link) =>
                    link.status_code >= 400 ||
                    link.total_h1_tags !== 1 ||
                    link.total_images_without_alt > 0 ||
                    (link.meta_description_length > 0 &&
                      (link.meta_description_length < 50 || link.meta_description_length > 160)),
                ).length
              }
              )
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search URLs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          {filteredLinks.length === 0 ? (
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Search className="h-10 w-10 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">
                  {links.length === 0 ? "No URLs analyzed yet" : "No matching URLs found"}
                </CardTitle>
                <CardDescription className="mb-4 text-center">
                  {links.length === 0 ? "Start a crawl to analyze your website's SEO." : "Try a different search term."}
                </CardDescription>
                {links.length === 0 && <Button onClick={handleStartCrawl}>Crawl starten</Button>}
              </CardContent>
            </Card>
          ) : (
            <LinksTable links={filteredLinks} projectId={project.id} />
          )}
        </TabsContent>

        <TabsContent value="issues" className="mt-0">
          {filteredLinks.filter(
            (link) =>
              link.status_code >= 400 ||
              link.total_h1_tags !== 1 ||
              link.total_images_without_alt > 0 ||
              (link.meta_description_length > 0 &&
                (link.meta_description_length < 50 || link.meta_description_length > 160)),
          ).length === 0 ? (
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Search className="h-10 w-10 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">
                  {links.length === 0 ? "No URLs analyzed yet" : "No issues found"}
                </CardTitle>
                <CardDescription className="mb-4 text-center">
                  {links.length === 0
                    ? "Start a crawl to analyze your website's SEO."
                    : "Great job! Your website has no SEO issues."}
                </CardDescription>
                {links.length === 0 && <Button onClick={handleStartCrawl}>Crawl starten</Button>}
              </CardContent>
            </Card>
          ) : (
            <LinksTable
              links={filteredLinks.filter(
                (link) =>
                  link.status_code >= 400 ||
                  link.total_h1_tags !== 1 ||
                  link.total_images_without_alt > 0 ||
                  (link.meta_description_length > 0 &&
                    (link.meta_description_length < 50 || link.meta_description_length > 160)),
              )}
              projectId={project.id}
            />
          )}
        </TabsContent>
      </Tabs>

      {showCrawlModal && (
        <StartCrawlModal
          project={project}
          onClose={() => setShowCrawlModal(false)}
          onCrawlComplete={handleCrawlComplete}
        />
      )}
    </div>
  )
}

