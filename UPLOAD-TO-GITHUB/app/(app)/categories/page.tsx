"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Tags, ArrowRight } from "lucide-react";
import { useVault } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field, Input } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";

const SWATCHES = [
  "#111111",
  "#7c5cff",
  "#2f6bff",
  "#ff7a45",
  "#10b981",
  "#f43f5e",
  "#f59e0b",
  "#06b6d4",
];

export default function CategoriesPage() {
  const hydrated = useHydrated();
  const { categories, tutorials, addCategory, renameCategory, deleteCategory } =
    useVault();

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState(SWATCHES[0]);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);

  const countFor = (id: string) =>
    tutorials.filter((t) => t.categoryId === id).length;

  const openNew = () => {
    setEditing(null);
    setName("");
    setColor(SWATCHES[0]);
    setOpen(true);
  };

  const openEdit = (id: string) => {
    const c = categories.find((x) => x.id === id);
    if (!c) return;
    setEditing(id);
    setName(c.name);
    setColor(c.color);
    setOpen(true);
  };

  const save = () => {
    if (!name.trim()) return;
    if (editing) renameCategory(editing, name.trim());
    else addCategory(name.trim(), color);
    setOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Categories"
        subtitle="Organize your vault by software, technique, or workflow."
        actions={
          <Button onClick={openNew}>
            <Plus size={16} strokeWidth={2.4} />
            New Category
          </Button>
        }
      />

      {!hydrated ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<Tags size={20} />}
          title="No categories yet"
          description="Create categories like CapCut, Color Grading, or Sound Design to keep things tidy."
          action={
            <Button onClick={openNew}>
              <Plus size={16} />
              New Category
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="group card p-5 transition-shadow hover:shadow-card"
            >
              <div className="flex items-start justify-between">
                <span
                  className="grid h-9 w-9 place-items-center rounded-xl"
                  style={{ backgroundColor: `${c.color}14` }}
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                </span>
                <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(c.id)}
                    className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-surface hover:text-ink"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setConfirmDel(c.id)}
                    className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-rose-50 hover:text-rose-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <h3 className="mt-3 text-[15px] font-semibold tracking-tight text-ink">
                {c.name}
              </h3>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[12.5px] text-muted">
                  {countFor(c.id)} tutorial{countFor(c.id) === 1 ? "" : "s"}
                </span>
                <Link
                  href="/tutorials"
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-muted opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
                >
                  View <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Rename category" : "New category"}
      >
        <div className="space-y-5">
          <Field label="Name">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              placeholder="e.g. Motion Graphics"
            />
          </Field>
          {!editing && (
            <Field label="Color">
              <div className="flex flex-wrap gap-2">
                {SWATCHES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setColor(s)}
                    className={`h-8 w-8 rounded-full transition-all ${
                      color === s
                        ? "ring-2 ring-ink ring-offset-2"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: s }}
                  />
                ))}
              </div>
            </Field>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? "Save" : "Create"}</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="Delete category?"
        description="Tutorials in this category won't be deleted — they'll just become uncategorized."
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDel(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirmDel) deleteCategory(confirmDel);
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
