"use client";

import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

export interface ReportItem {
  id: string;
  type: string;
  hazardCategory?: string;
  title: string;
  description: string;
  injuredCount: number;
  vehicleCount: number;
  latitude: number;
  longitude: number;
  locationName: string;
  photoUrl?: string;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string; phone?: string };
}

/* Photos come from user uploads, so a dead URL is normal. Show a labelled
   placeholder rather than a broken-image icon with alt text spilling out. */
export function ReportPhoto({
  src,
  alt,
  className,
  compact = false,
}: {
  src: string;
  alt: string;
  className: string;
  compact?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-ink-50 ${className}`}>
        <span className="flex items-center gap-2 text-caption text-ink-400">
          <ImageOff className="h-4 w-4" />
          {compact ? '' : 'Photo unavailable'}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

export function formatReportDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
