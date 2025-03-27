"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { API_BASE_URL } from "@/app/config"
import { Progress } from "@/components/ui/progress"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe,
  Image,
  Info,
  Lightbulb,
  XCircle,
} from "lucide-react"

interface LinkDetails {
  id: number
  url: string
  title: string
  title_length: number
  status_code: number
  total_h1_tags: number
  h1_tags: string[]
  total_images_without_alt: number
  images_without_alt: string[]
  meta_description: string
  meta_description_length: number
  total_images_on_page: number
  created_at: string
  project_id: number
  redirect_from: string | null
  redirect_chain: string[] | null
  error_type: string | null
}

interface LighthouseReport {
  id: number
  link_id: number
  performance_score: number
  accessibility_score: number
  best_practices_score: number
  seo_score: number
  created_at: string
}

interface AIReport {
  id: number
  link_id: number
  ai_response: string
  created_at: string
}

export default function LinkDetail({
  params,
}: {
  params: Promise<{ id: string; linkId: string }>
}) {
  const { id: projectId, linkId } = React.use(params)


  const router = useRouter()
  const [linkDetails, setLinkDetails] = useState<LinkDetails | null>(null)
  const [lighthouseReport, setLighthouseReport] = useState<LighthouseReport | null>(null)
  const [aiReport, setAIReport] = useState<AIReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [generatingLighthouse, setGeneratingLighthouse] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)

  useEffect(() => {
    const fetchLinkDetails = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        // Fetch links for this project
        const linksResponse = await fetch(`${API_BASE_URL}/get-links/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!linksResponse.ok) {
          throw new Error("Failed to fetch links")
        }

        const linksData = await linksResponse.json()
        const currentLink = linksData.find((link: LinkDetails) => link.id === Number.parseInt(linkId))

        if (!currentLink) {
          throw new Error("Link not found")
        }

        // Parse JSON fields
        currentLink.h1_tags = currentLink.h1_tags ? JSON.parse(currentLink.h1_tags) : []
        currentLink.images_without_alt = currentLink.images_without_alt
          ? JSON.parse(currentLink.images_without_alt)
          : []
        currentLink.redirect_chain = currentLink.redirect_chain ? JSON.parse(currentLink.redirect_chain) : []

        setLinkDetails(currentLink)

        // TODO: Fetch lighthouse and AI reports when API endpoints are available
        // For now, we'll simulate empty data
        setLighthouseReport(null)
        setAIReport(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchLinkDetails()
  }, [projectId, linkId, router])

  const generateLighthouseReport = async () => {
    setGeneratingLighthouse(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/generate-lighthouse/${linkId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to generate Lighthouse report")
      }

      const data = await response.json()
      setLighthouseReport({
        id: 0, // This will be updated when we fetch the actual report
        link_id: Number.parseInt(linkId),
        performance_score: data.scores.performance,
        accessibility_score: data.scores.accessibility,
        best_practices_score: data.scores["best-practices"],
        seo_score: data.scores.seo,
        created_at: new Date().toISOString(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate Lighthouse report")
    } finally {
      setGeneratingLighthouse(false)
    }
  }

  const generateAIReport = async () => {
    setGeneratingAI(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/generate-ai-report/${linkId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to generate AI report")
      }

      const data = await response.json()
      setAIReport({
        id: 0, // This will be updated when we fetch the actual report
        link_id: Number.parseInt(linkId),
        ai_response: data.ai_response,
        created_at: new Date().toISOString(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate AI report")
    } finally {
      setGeneratingAI(false)
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
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          {[...Array(4)].map((_, i) => (
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
        <AlertTitle>Fehler</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!linkDetails) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Link nicht gefunden</AlertTitle>
        <AlertDescription>
         Der angeforderte Link konnte nicht gefunden werden.{" "}
          <Link href={`/dashboard/projects/${projectId}`} className="underline">
          Zum Projekt zurückkehren
          </Link>
        </AlertDescription>
      </Alert>
    )
  }

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{statusCode}</Badge>
    } else if (statusCode >= 300 && statusCode < 400) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{statusCode}</Badge>
    } else if (statusCode >= 400) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{statusCode}</Badge>
    }
    return <Badge>{statusCode}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zurück zum Projekt
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{linkDetails.title || "URL Analysis"}</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Globe className="h-4 w-4" />
          <a
            href={linkDetails.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:underline"
          >
            {linkDetails.url}
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Statuscode</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            {getStatusBadge(linkDetails.status_code)}
            <span className="text-muted-foreground text-sm">
              {linkDetails.error_type || (linkDetails.status_code >= 200 && linkDetails.status_code < 300 ? "OK" : "")}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">H1 Tags</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            {linkDetails.total_h1_tags === 1 ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{linkDetails.total_h1_tags}</Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">{linkDetails.total_h1_tags}</Badge>
            )}
            <span className="text-muted-foreground text-sm">
              {linkDetails.total_h1_tags === 1
                ? "Good"
                : linkDetails.total_h1_tags === 0
                  ? "Missing H1"
                  : "Multiple H1s"}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Meta-Beschreibung</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            {!linkDetails.meta_description ? (
              <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Fehlend</Badge>
            ) : linkDetails.meta_description_length < 50 ? (
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Zu kurz</Badge>
            ) : linkDetails.meta_description_length > 160 ? (
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Zu lang</Badge>
            ) : (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Gut</Badge>
            )}
            <span className="text-muted-foreground text-sm">{linkDetails.meta_description_length} Zeichen</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bilder ohne Alt-Text</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            {linkDetails.total_images_without_alt === 0 ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">0</Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                {linkDetails.total_images_without_alt}
              </Badge>
            )}
            <span className="text-muted-foreground text-sm">
              {linkDetails.total_images_without_alt === 0
                ? "All images have alt text"
                : `${linkDetails.total_images_without_alt} of ${linkDetails.total_images_on_page} missing alt text`}
            </span>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="seo" className="w-full">
        <TabsList>
          <TabsTrigger value="seo">SEO-Analyse</TabsTrigger>
          <TabsTrigger value="lighthouse">Lighthouse</TabsTrigger>
          <TabsTrigger value="ai">KI-Empfehlungen</TabsTrigger>
        </TabsList>

        <TabsContent value="seo" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Titel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-md">{linkDetails.title || "No title found"}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{linkDetails.title_length} Zeichen</span>
                  {linkDetails.title_length < 30 ? (
                    <Badge className="bg-amber-100 text-amber-800">Zu kurz</Badge>
                  ) : linkDetails.title_length > 60 ? (
                    <Badge className="bg-amber-100 text-amber-800">Zu lang</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800">Gut</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <Info className="h-4 w-4 inline mr-1" />
                  Empfohlene Länge: 30–60 Zeichen
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Meta-Beschreibung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  {linkDetails.meta_description || "No meta description found"}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {linkDetails.meta_description_length} Zeichen
                  </span>
                  {!linkDetails.meta_description ? (
                    <Badge className="bg-red-100 text-red-800">Fehlend</Badge>
                  ) : linkDetails.meta_description_length < 50 ? (
                    <Badge className="bg-amber-100 text-amber-800">Zu kurz</Badge>
                  ) : linkDetails.meta_description_length > 160 ? (
                    <Badge className="bg-amber-100 text-amber-800">Zu lang</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800">Gut</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <Info className="h-4 w-4 inline mr-1" />
                  Empfohlene Länge: 50–160 Zeichen
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">H1 Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {linkDetails.total_h1_tags === 0 ? (
                  <div className="p-4 bg-muted rounded-md flex items-center text-muted-foreground">
                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                    Keine H1-Tags gefunden
                  </div>
                ) : (
                  <div className="space-y-2">
                    {linkDetails.h1_tags.map((tag, index) => (
                      <div key={index} className="p-4 bg-muted rounded-md">
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{linkDetails.total_h1_tags} H1-Tags</span>
                  {linkDetails.total_h1_tags === 0 ? (
                    <Badge className="bg-red-100 text-red-800">Fehlend</Badge>
                  ) : linkDetails.total_h1_tags > 1 ? (
                    <Badge className="bg-amber-100 text-amber-800">zu viele</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800">Gut</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <Info className="h-4 w-4 inline mr-1" />
                  Empfohlen: 1 H1-Tag pro Seite
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bilder ohne Alt-Text</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {linkDetails.total_images_without_alt === 0 ? (
                  <div className="p-4 bg-muted rounded-md flex items-center text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Alle Bilder haben Alt-Text
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {linkDetails.images_without_alt.map((src, index) => (
                      <div
                        key={index}
                        className="p-4 bg-muted rounded-md flex items-center gap-2 text-xs overflow-hidden"
                      >
                        <Image className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{src}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {linkDetails.total_images_without_alt} of {linkDetails.total_images_on_page} Bilder ohne Alt-Text
                  </span>
                  {linkDetails.total_images_without_alt === 0 ? (
                    <Badge className="bg-green-100 text-green-800">Gut</Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800">Verbesserungswürdig</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <Info className="h-4 w-4 inline mr-1" />
                  Alle Bilder sollten beschreibende Alt-Texte für Barrierefreiheit und SEO enthalten
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lighthouse" className="mt-6">
          {lighthouseReport ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{lighthouseReport.performance_score}</span>
                      {lighthouseReport.performance_score >= 90 ? (
                        <Badge className="bg-green-100 text-green-800">Gut</Badge>
                      ) : lighthouseReport.performance_score >= 50 ? (
                        <Badge className="bg-amber-100 text-amber-800">Verbesserungswürdig</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Schwach</Badge>
                      )}
                    </div>
                    <Progress
                      value={lighthouseReport.performance_score}
                      className={`h-2 ${
                        lighthouseReport.performance_score >= 90
                          ? "bg-green-100"
                          : lighthouseReport.performance_score >= 50
                            ? "bg-amber-100"
                            : "bg-red-100"
                      }`}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Accessibility</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{lighthouseReport.accessibility_score}</span>
                      {lighthouseReport.accessibility_score >= 90 ? (
                        <Badge className="bg-green-100 text-green-800">Gut</Badge>
                      ) : lighthouseReport.accessibility_score >= 50 ? (
                        <Badge className="bg-amber-100 text-amber-800">Verbesserungswürdig</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Schwach</Badge>
                      )}
                    </div>
                    <Progress
                      value={lighthouseReport.accessibility_score}
                      className={`h-2 ${
                        lighthouseReport.accessibility_score >= 90
                          ? "bg-green-100"
                          : lighthouseReport.accessibility_score >= 50
                            ? "bg-amber-100"
                            : "bg-red-100"
                      }`}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Best Practices</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{lighthouseReport.best_practices_score}</span>
                      {lighthouseReport.best_practices_score >= 90 ? (
                        <Badge className="bg-green-100 text-green-800">Gut</Badge>
                      ) : lighthouseReport.best_practices_score >= 50 ? (
                        <Badge className="bg-amber-100 text-amber-800">Verbesserungswürdig</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Schwach</Badge>
                      )}
                    </div>
                    <Progress
                      value={lighthouseReport.best_practices_score}
                      className={`h-2 ${
                        lighthouseReport.best_practices_score >= 90
                          ? "bg-green-100"
                          : lighthouseReport.best_practices_score >= 50
                            ? "bg-amber-100"
                            : "bg-red-100"
                      }`}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">SEO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{lighthouseReport.seo_score}</span>
                      {lighthouseReport.seo_score >= 90 ? (
                        <Badge className="bg-green-100 text-green-800">Gut</Badge>
                      ) : lighthouseReport.seo_score >= 50 ? (
                        <Badge className="bg-amber-100 text-amber-800">Verbesserungswürdig</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Schwach</Badge>
                      )}
                    </div>
                    <Progress
                      value={lighthouseReport.seo_score}
                      className={`h-2 ${
                        lighthouseReport.seo_score >= 90
                          ? "bg-green-100"
                          : lighthouseReport.seo_score >= 50
                            ? "bg-amber-100"
                            : "bg-red-100"
                      }`}
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="text-sm text-muted-foreground">
                <Info className="h-4 w-4 inline mr-1" />
                Lighthouse-Bericht erstellt am {new Date(lighthouseReport.created_at).toLocaleString()}
              </div>
            </div>
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Lightbulb className="h-10 w-10 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">Noch kein Lighthouse-Bericht</CardTitle>
                <CardDescription className="mb-4 text-center">
                Generiere einen Lighthouse-Bericht, um Leistungs-, Barrierefreiheits-, Best-Practice- und SEO-Werte zu sehen.
                </CardDescription>
                <Button onClick={generateLighthouseReport} disabled={generatingLighthouse}>
                  {generatingLighthouse ? "Generating..." : "Generate Lighthouse Report"}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          {aiReport ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">KI-Empfehlungen</CardTitle>
                <CardDescription>Erstellt am {new Date(aiReport.created_at).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none dark:prose-invert">
                  {aiReport.ai_response.split("\n\n").map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">Noch keine KI-Empfehlungen</CardTitle>
                <CardDescription className="mb-4 text-center">
                 Generiere KI-gestützte Empfehlungen zur Verbesserung der SEO deiner Website.
                </CardDescription>
                <Button onClick={generateAIReport} disabled={generatingAI}>
                  {generatingAI ? "Generating..." : "Generate AI Recommendations"}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

