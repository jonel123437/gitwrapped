"use client";

import { useRef, useState } from "react";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const STEP = 0.25;

export function SharePreview({
  src,
  alt,
  format,
  aspectClass,
}: {
  src: string;
  alt: string;
  format: string;
  aspectClass: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(1);

  function openModal() {
    setZoom(1);
    dialogRef.current?.showModal();
  }

  function closeModal() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="group block w-full cursor-pointer"
        aria-label="Open full-size share card"
      >
        <div className={aspectClass}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={format}
            src={src}
            alt={alt}
            className="block h-full w-full rounded-xl object-cover shadow-2xl shadow-black/40 transition-opacity group-hover:opacity-90"
            loading="lazy"
          />
        </div>
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeModal();
        }}
        onClose={() => setZoom(1)}
        className="m-auto bg-transparent p-0 backdrop:bg-black/85 backdrop:backdrop-blur-sm"
      >
        <div className="relative">
          <div className="overflow-auto rounded-xl bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              style={{ zoom }}
              className="block max-h-[82vh] max-w-[92vw]"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-zinc-900/85 p-1 text-white shadow-lg backdrop-blur">
            <ZoomButton
              onClick={() =>
                setZoom((z) => +Math.max(MIN_ZOOM, z - STEP).toFixed(2))
              }
              disabled={zoom <= MIN_ZOOM}
              label="Zoom out"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </ZoomButton>

            <button
              type="button"
              onClick={() => setZoom(1)}
              className="min-w-[3.5rem] rounded-full px-2 text-center text-xs font-medium tabular-nums hover:bg-white/10"
              aria-label="Reset zoom to 100%"
            >
              {Math.round(zoom * 100)}%
            </button>

            <ZoomButton
              onClick={() =>
                setZoom((z) => +Math.min(MAX_ZOOM, z + STEP).toFixed(2))
              }
              disabled={zoom >= MAX_ZOOM}
              label="Zoom in"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </ZoomButton>
          </div>

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900/85 text-white shadow-lg backdrop-blur transition-colors hover:bg-zinc-800"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </dialog>
    </>
  );
}

function ZoomButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
