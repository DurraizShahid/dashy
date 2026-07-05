"use client"

import React from "react"

const baseClasses =
  "rounded-full px-3 py-1 text-xs font-medium inline-flex items-center"

interface IntentBadgeProps {
  level: string
}

export function IntentBadge({ level }: IntentBadgeProps) {
  const colorMap: Record<string, string> = {
    "Hot Lead": "bg-gradient-to-r from-[#F06890] to-[#E85888] text-white",
    "Warm Lead": "bg-[#FFF3E0] text-[#E65100]",
    "Pain Signal": "bg-[#EDE7F6] text-[#504098]",
    "Low Intent": "bg-[#F5F5F5] text-[#7B7592]",
    Unclear: "bg-[#E9E7F0] text-[#7B7592]",
  }

  const classes = colorMap[level] || "bg-[#F5F5F5] text-[#7B7592]"
  return <span className={`${baseClasses} ${classes}`}>{level}</span>
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorMap: Record<string, string> = {
    New: "bg-[#E3F2FD] text-[#1565C0]",
    "Needs Review": "bg-[#EDE7F6] text-[#7060B8]",
    Qualified: "bg-[#E8F5E9] text-[#2E7D32]",
    Contacted: "bg-[#FFF8E1] text-[#F57F17]",
    "Follow-up Scheduled": "bg-[#E0F7FA] text-[#00838F]",
    "Demo Booked": "bg-[#F3E5F5] text-[#7060B8]",
    Won: "bg-[#E8F5E9] text-[#1B5E20]",
    Lost: "bg-[#FFEBEE] text-[#C62828]",
    Rejected: "bg-[#F5F5F5] text-[#757575]",
    Duplicate: "bg-[#FFF3E0] text-[#E65100]",
  }

  const classes = colorMap[status] || "bg-[#F5F5F5] text-[#757575]"
  return <span className={`${baseClasses} ${classes}`}>{status}</span>
}

interface ProductBadgeProps {
  product: string
}

export function ProductBadge({ product }: ProductBadgeProps) {
  const colorMap: Record<string, string> = {
    Dilivygo: "bg-[#E8F5E9] text-[#2E7D32]",
    Marlin: "bg-[#E3F2FD] text-[#1565C0]",
    Terro: "bg-[#FFF3E0] text-[#E65100]",
    Haigo: "bg-[#F3E5F5] text-[#7060B8]",
    Review: "bg-[#F5F5F5] text-[#7B7592]",
  }

  const classes = colorMap[product] || "bg-[#F5F5F5] text-[#7B7592]"
  return <span className={`${baseClasses} ${classes}`}>{product}</span>
}

interface SourceBadgeProps {
  source: string
}

export function SourceBadge({ source }: SourceBadgeProps) {
  return (
    <span className={`${baseClasses} bg-[#EEEAF6] text-[#504098]`}>
      {source}
    </span>
  )
}

interface ScoreBadgeProps {
  score: number
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  let colorClasses: string
  if (score >= 80) {
    colorClasses = "bg-gradient-to-r from-[#F06890] to-[#E85888] text-white"
  } else if (score >= 60) {
    colorClasses = "bg-[#FFF3E0] text-[#E65100]"
  } else if (score >= 40) {
    colorClasses = "bg-[#EDE7F6] text-[#504098]"
  } else {
    colorClasses = "bg-[#F5F5F5] text-[#7B7592]"
  }

  return (
    <span
      className={`${baseClasses} ${colorClasses} min-w-[40px] justify-center`}
    >
      {score}
    </span>
  )
}
