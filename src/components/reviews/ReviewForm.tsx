"use client";

import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { useState } from "react";

export function ReviewForm({
  name,
  onSubmit,
}: {
  name: string;
  onSubmit: (rating: number, comment: string) => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  return (
    <form
      className="rounded-[24px] border border-line bg-cream p-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(rating, comment);
      }}
    >
      <p className="font-semibold">How was {name}?</p>
      <p className="mt-1 text-sm text-ink-soft">
        Ratings only count after a delivered job.
      </p>
      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`h-10 w-10 rounded-xl text-lg ${
              n <= rating ? "bg-tape text-ink" : "bg-canvas-2 text-ink-soft"
            }`}
            aria-label={`${n} stars`}
          >
            ★
          </button>
        ))}
      </div>
      <div className="mt-3">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Careful on stairs, on time, wrapped well…"
        />
      </div>
      <Button type="submit" className="mt-4">
        Publish review
      </Button>
    </form>
  );
}
