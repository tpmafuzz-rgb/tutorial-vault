"use client";

import * as React from "react";
import {
  Upload,
  Trash2,
  FolderOpen,
  Search,
  Type,
  Palette,
  Sliders,
  Image as ImageIcon,
  Layers,
  Music,
  AudioLines,
  Link2,
} from "lucide-react";
import { useVault } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import type { AssetType } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Field";
import { TagInput } from "@/components/form/TagInput";
import { EmptyState } from "@/components/ui/EmptyState";

const ASSET_TYPES: AssetType[] = [
  "Font",
  "LUT",
  "Preset",
  "PNG",
  "Overlay",
  "Music",
  "Sound Effect",
];

const TYPE_ICON: Record<AssetType, React.ReactNode> = {
  Font: <Type size={16} />,
  LUT: <Palette size={16} />,
  Preset: <Sliders size={16} />,
  PNG: <ImageIcon size={16} />,
  Overlay: <Layers size={16} />,
  Music: <Music size={16} />,
  "Sound Effect": <AudioLines size={16} />,
};

function humanSize(bytes: number): string {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function AssetsPage() {
  const hydrated = useHydrated();
  const { assets, tutorials, addAsset, deleteAsset } = useVault();

  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);

  // upload form
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<AssetType>("LUT");
  const [tags, setTags] = React.useState<string[]>([]);
  const [file, setFile] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const onFile = (f?: File) => {
    if (!f) return;
    setFile(f);
    setName(f.name);
  };

  const resetForm = () => {
    setName("");
    setType("LUT");
    setTags([]);
    setFile(null);
    setUploadError(null);
  };

  const submit = async () => {
    if (!name.trim()) return;
    setBusy(true);
    setUploadError(null);
    try {
      await addAsset({
        name: name.trim(),
        type,
        tags,
        sizeBytes: file?.size ?? 0,
        file: file ?? undefined,
      });
      resetForm();
      setOpen(false);
    } catch (e) {
      setUploadError(
        e instanceof Error ? e.message : "Upload failed. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const filtered = assets.filter((a) => {
    const matchesQ =
      !q ||
      a.name.toLowerCase().includes(q.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()));
    const matchesType = typeFilter === "all" || a.type === typeFilter;
    return matchesQ && matchesType;
  });

  const linkCount = (a: { linkedTutorialIds: string[] }) =>
    a.linkedTutorialIds.filter((id) => tutorials.some((t) => t.id === id)).length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Assets"
        subtitle="Your library of LUTs, fonts, presets, overlays, music, and SFX."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Upload size={16} strokeWidth={2.2} />
            Upload Asset
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter assets…"
            className="input-base pl-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input-base w-auto cursor-pointer"
        >
          <option value="all">All types</option>
          {ASSET_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {!hydrated ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={20} />}
          title={assets.length === 0 ? "No assets yet" : "No matches"}
          description={
            assets.length === 0
              ? "Upload your first LUT, font, or sound pack and link it to tutorials."
              : "Try a different search or type filter."
          }
          action={
            assets.length === 0 ? (
              <Button onClick={() => setOpen(true)}>
                <Upload size={16} />
                Upload Asset
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <div key={a.id} className="group card p-4 transition-shadow hover:shadow-card">
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-muted">
                  {TYPE_ICON[a.type]}
                </span>
                <button
                  onClick={() => setConfirmDel(a.id)}
                  className="grid h-7 w-7 place-items-center rounded-lg text-muted opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="mt-3 truncate text-[14px] font-semibold text-ink" title={a.name}>
                {a.name}
              </h3>
              <p className="text-[12px] text-muted">
                {a.type} · {a.size ?? "—"}
              </p>
              {a.tags.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {a.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-surface px-1.5 py-0.5 text-[11px] text-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-[11.5px] text-muted">
                <span className="inline-flex items-center gap-1">
                  <Link2 size={12} />
                  {linkCount(a)} linked
                </span>
                <span>{formatDate(a.uploadedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Upload asset"
        description="Your file is stored privately in your Supabase storage."
      >
        <div className="space-y-5">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-surface/50 px-4 py-7 text-center transition-colors hover:border-ink/30">
            <Upload size={20} className="text-muted" />
            <span className="text-[13px] font-medium text-ink">
              {file ? file.name : "Click to choose a file"}
            </span>
            <span className="text-[12px] text-muted">
              {file ? humanSize(file.size) : "Stored privately in your account"}
            </span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>

          <Field label="Name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Teal & Orange Cinematic.cube"
            />
          </Field>
          <Field label="Type">
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as AssetType)}
            >
              {ASSET_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tags" optional>
            <TagInput value={tags} onChange={setTags} placeholder="Add tags…" />
          </Field>

          {uploadError && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12.5px] text-rose-700">
              {uploadError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={busy || !name.trim()}>
              {busy ? "Uploading…" : "Add to Library"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="Delete asset?"
        description="It will be removed from your library and unlinked from any tutorials."
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDel(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirmDel) deleteAsset(confirmDel);
              setConfirmDel(null);
            }}
          >
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
