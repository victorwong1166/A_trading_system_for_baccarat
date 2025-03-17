"use client"

import { Search } from "lucide-react"
import { SidebarGroup, SidebarGroupContent, SidebarInput } from "@/components/ui/sidebar"
import { Label } from "@/components/ui/label"

export function SidebarSearch() {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="sidebar-search" className="sr-only">
            Search
          </Label>
          <SidebarInput id="sidebar-search" placeholder="Search..." className="pl-8" />
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}

