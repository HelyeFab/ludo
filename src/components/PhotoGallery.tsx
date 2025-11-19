"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { Photo } from "@/lib/albums";
import { getSecurePhotoUrl } from "@/lib/photo-url";

type Props = {
  photos: Photo[];
  albumTitle: string;
};

export default function PhotoGallery({ photos, albumTitle }: Props) {
  const [index, setIndex] = useState(-1);

  // Transform photos for lightbox with secure URLs
  const lightboxSlides = photos.map((photo) => ({
    src: getSecurePhotoUrl(photo.url),
    alt: albumTitle,
  }));

  // Varying heights for masonry effect
  const getRandomHeight = (i: number) => {
    const heights = ["h-48", "h-64", "h-56", "h-72", "h-52", "h-60", "h-68"];
    return heights[i % heights.length];
  };

  return (
    <>
      {/* CSS Columns Masonry */}
      <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            onClick={() => setIndex(i)}
            className={`group relative mb-3 cursor-pointer overflow-hidden rounded-2xl border border-rose-100/80 bg-rose-50/60 shadow-sm shadow-rose-100/60 transition-all hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(244,114,182,0.4)] dark:border-rose-900/70 dark:bg-slate-900/80 dark:shadow-slate-900/80 dark:hover:shadow-[0_18px_45px_rgba(244,114,182,0.3)] ${getRandomHeight(i)}`}
            style={{ breakInside: "avoid" }}
          >
            <Image
              src={getSecurePhotoUrl(photo.url)}
              alt={albumTitle}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <Lightbox
        slides={lightboxSlides}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, 0.95)" },
        }}
        carousel={{
          finite: true,
        }}
      />
    </>
  );
}
