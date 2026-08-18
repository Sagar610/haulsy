"use client";

import { SmartImage } from "@/components/ui/Media";
import { fileToDataUrl } from "@/lib/format";
import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 6 * 1024 * 1024;

export function PhotoDropzone({
  photos,
  onChange,
  max = 3,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const remaining = max - photos.length;

  async function addFiles(list: FileList | File[] | null) {
    if (!list || remaining <= 0) return;
    setError("");
    const files = Array.from(list).slice(0, remaining);
    const accepted: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/") || !ACCEPT.includes(file.type)) {
        setError("Use a JPEG, PNG or WebP photo.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError("Each photo needs to be under 6 MB.");
        continue;
      }
      accepted.push(file);
    }
    if (!accepted.length) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const file of accepted) {
        urls.push(await fileToDataUrl(file));
      }
      onChange([...photos, ...urls].slice(0, max));
    } catch {
      setError("Could not read that photo. Try another file.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="sr-only"
        onChange={(e) => addFiles(e.target.files)}
      />

      {photos.length > 0 ? (
        <div className="mb-3 grid grid-cols-3 gap-3">
          {photos.map((src, i) => (
            <div
              key={`${i}-${src.slice(-24)}`}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-sage"
            >
              <SmartImage src={src} alt={`Photo ${i + 1}`} />
              {i === 0 ? (
                <span className="absolute bottom-2 left-2 rounded-full bg-cream/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink">
                  Cover
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-cream text-ink shadow-sm"
                aria-label={`Remove photo ${i + 1}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {remaining > 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`flex w-full flex-col items-center justify-center rounded-[24px] border-2 border-dashed px-4 py-10 text-center transition-colors ${
            dragOver
              ? "border-forest bg-sage"
              : "border-line bg-cream hover:border-forest/40 hover:bg-sage/50"
          }`}
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sage text-forest">
            <ImagePlus size={22} />
          </span>
          <p className="mt-3 text-sm font-medium text-ink">
            {busy ? "Adding photos…" : "Drop photos here, or choose files"}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            JPEG, PNG or WebP · up to {remaining} more · first photo is the cover
          </p>
        </button>
      ) : (
        <p className="text-xs text-ink-soft">Three photos added. Remove one to swap.</p>
      )}

      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
