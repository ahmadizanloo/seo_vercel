"use client"

import { useState } from "react"
import NextLink from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertCircle, CheckCircle, ChevronDown, ExternalLink, FileText, Lightbulb } from "lucide-react"

interface Link {
  id: number
  url: string
  title: string
  status_code: number
  meta_description_length: number
  total_h1_tags: number
  total_images_without_alt: number
}

interface LinksTableProps {
  links: Link[]
  projectId: number
}

export default function LinksTable({ links, projectId }: LinksTableProps) {
  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.ceil(links.length / pageSize)
  const paginatedLinks = links.slice((page - 1) * pageSize, page * pageSize)

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

  const getIssuesBadge = (link: Link) => {
    const issues = []

    if (link.status_code >= 400) {
      issues.push("Error")
    }
    if (link.total_h1_tags !== 1) {
      issues.push("H1")
    }
    if (link.total_images_without_alt > 0) {
      issues.push("Alt")
    }
    if (link.meta_description_length > 0 && (link.meta_description_length < 50 || link.meta_description_length > 160)) {
      issues.push("Meta")
    }

    if (issues.length === 0) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          No issues
        </Badge>
      )
    }

    return (
      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
        <AlertCircle className="h-3 w-3 mr-1" />
        {issues.length} {issues.length === 1 ? "issue" : "issues"}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Probleme</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLinks.map((link) => (
              <TableRow key={`${link.id}-${link.url}`}>
                <TableCell className="max-w-[300px]">
                  <div className="truncate font-medium">{link.title || link.url}</div>
                  <div className="truncate text-xs text-muted-foreground">{link.url}</div>
                </TableCell>
                <TableCell>{getStatusBadge(link.status_code)}</TableCell>
                <TableCell>{getIssuesBadge(link)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <span className="sr-only">Menü öffnen</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <NextLink href={`/dashboard/projects/${projectId}/${link.id}`}>
                          <FileText className="h-4 w-4 mr-2" />
                          Details anzeigen
                        </NextLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          URL öffnen
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <NextLink href={`/dashboard/projects/${projectId}/${link.id}?tab=lighthouse`}>
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Lighthouse-Bericht
                        </NextLink>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
           Zurück
          </Button>
          <div className="text-sm text-muted-foreground">
          Seite {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Weiter
          </Button>
        </div>
      )}
    </div>
  )
}

