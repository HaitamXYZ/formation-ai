"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { MoreIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

export type DropdownMenuItem = {
  label: string;
  href?: string;
  onSelect?: () => void | Promise<void>;
  danger?: boolean;
  disabled?: boolean;
};

type MenuPosition = {
  left: number;
  top: number;
  width: number;
};

const MENU_WIDTH = 208;
const MENU_GAP = 8;
const VIEWPORT_MARGIN = 12;

export function DropdownMenu({ items, label = "Plus d'actions", align = "right" }: {
  items: DropdownMenuItem[];
  label?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const trigger = rootRef.current?.getBoundingClientRect();
      if (!trigger) return;

      const menuHeight = menuRef.current?.offsetHeight || Math.min(280, items.length * 45 + 12);
      const availableBelow = window.innerHeight - trigger.bottom - VIEWPORT_MARGIN;
      const shouldOpenUp = availableBelow < menuHeight && trigger.top > menuHeight;
      const rawLeft = align === "right" ? trigger.right - MENU_WIDTH : trigger.left;
      const left = Math.min(Math.max(rawLeft, VIEWPORT_MARGIN), window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN);
      const top = shouldOpenUp ? trigger.top - menuHeight - MENU_GAP : trigger.bottom + MENU_GAP;

      setPosition({ left, top: Math.max(VIEWPORT_MARGIN, top), width: MENU_WIDTH });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, items.length, open]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [open]);

  const menu = open ? (
    <div
      id={menuId}
      role="menu"
      ref={menuRef}
      className="fixed z-[90] min-w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/14"
      style={{ left: position?.left ?? -9999, top: position?.top ?? -9999, width: position?.width ?? MENU_WIDTH }}
    >
      {items.map((item) => {
        const itemClassName = cn(
          "flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50",
          item.danger ? "text-rose-700 hover:bg-rose-50" : "text-slate-700",
        );
        if (item.href && !item.disabled) {
          return <Link key={`${item.label}-${item.href}`} href={item.href} role="menuitem" className={itemClassName} onClick={() => setOpen(false)}>{item.label}</Link>;
        }
        return (
          <button key={item.label} type="button" role="menuitem" className={itemClassName} disabled={item.disabled} onClick={() => { setOpen(false); void item.onSelect?.(); }}>
            {item.label}
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <div className="relative inline-flex" ref={rootRef}>
      <Button type="button" variant="outline" size="icon" aria-label={label} aria-haspopup="menu" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((value) => !value)}>
        <MoreIcon className="size-5" />
      </Button>
      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
