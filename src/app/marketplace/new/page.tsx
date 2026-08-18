"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { PageLoader } from "@/components/ui/Media";
import { PhotoDropzone } from "@/components/ui/PhotoDropzone";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { formatVolume, volumeM3 } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function NewListingPage() {
  const { currentUser, hydrated, createListing } = useStore();
  const router = useRouter();
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "sofa",
    lengthCm: "120",
    widthCm: "80",
    heightCm: "80",
    weightKg: "30",
    price: "",
    city: "",
    pickupAddress: "",
  });

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) {
      router.replace(
        `/login?next=${encodeURIComponent("/marketplace/new")}`,
      );
    }
  }, [hydrated, currentUser, router]);

  const vol = useMemo(
    () =>
      volumeM3(
        Number(form.lengthCm) || 0,
        Number(form.widthCm) || 0,
        Number(form.heightCm) || 0,
      ),
    [form.lengthCm, form.widthCm, form.heightCm],
  );

  if (!hydrated || !currentUser) return <PageLoader />;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.price || !form.pickupAddress.trim()) {
      setError("Add a title, price and pickup address.");
      return;
    }
    const listing = createListing({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category as never,
      photos,
      lengthCm: Number(form.lengthCm),
      widthCm: Number(form.widthCm),
      heightCm: Number(form.heightCm),
      weightKg: Number(form.weightKg),
      price: Number(form.price),
      city: form.city || currentUser?.city || "Toronto",
      pickupAddress: form.pickupAddress.trim(),
    });
    router.push(`/marketplace/${listing.id}`);
  }

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
        Sell
      </p>
      <h1 className="font-display mt-2 text-4xl tracking-tight">
        List something bulky
      </h1>
      <p className="mt-2 text-ink-soft">
        Measure it. The dimensions decide which movers can take the job.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <Field label="Title">
          <Input
            value={form.title}
            onChange={set("title")}
            placeholder="Velvet 3-seater sofa"
            required
          />
        </Field>
        <Field
          label="Photos"
          hint="Drop files or click to choose. Up to three JPEG, PNG or WebP images. First photo is the cover."
        >
          <PhotoDropzone photos={photos} onChange={setPhotos} />
        </Field>
        <Field label="Description">
          <Textarea
            value={form.description}
            onChange={set("description")}
            placeholder="Condition, stairs, parking, whether it dismantles…"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            <Select value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Price (CAD)">
            <Input
              type="number"
              min={1}
              value={form.price}
              onChange={set("price")}
              required
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Length cm">
            <Input
              type="number"
              min={1}
              value={form.lengthCm}
              onChange={set("lengthCm")}
            />
          </Field>
          <Field label="Width cm">
            <Input
              type="number"
              min={1}
              value={form.widthCm}
              onChange={set("widthCm")}
            />
          </Field>
          <Field label="Height cm">
            <Input
              type="number"
              min={1}
              value={form.heightCm}
              onChange={set("heightCm")}
            />
          </Field>
          <Field label="Weight kg">
            <Input
              type="number"
              min={1}
              value={form.weightKg}
              onChange={set("weightKg")}
            />
          </Field>
        </div>
        <p className="rounded-2xl bg-sage px-4 py-3 text-sm text-forest">
          Packed volume about <strong>{formatVolume(vol)}</strong>. Movers with
          smaller vehicles will not see this job.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City">
            <Select value={form.city || currentUser?.city || "Toronto"} onChange={set("city")}>
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Pickup address">
            <Input
              value={form.pickupAddress}
              onChange={set("pickupAddress")}
              placeholder="Street and postal code"
              required
            />
          </Field>
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" size="lg" className="w-full">
          Publish listing
        </Button>
      </form>
    </div>
  );
}
