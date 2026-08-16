import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PdfViewerProps = {
  /** PDF source — either a File/Blob or an object/remote URL. */
  source: Blob | string | null;
  /** Plain-text fallback shown when rendering isn't possible. */
  fallbackText?: string;
  className?: string;
};

/**
 * pdf.js v6 relies on the proposed Map.prototype.getOrInsert(Computed) methods,
 * which aren't shipping in browsers yet. Tiny spec-shaped polyfill.
 */
function ensureMapHelpers() {
  const proto = Map.prototype as unknown as Record<string, unknown>;
  if (typeof proto["getOrInsertComputed"] !== "function") {
    proto["getOrInsertComputed"] = function <K, V>(this: Map<K, V>, key: K, factory: (k: K) => V) {
      if (!this.has(key)) this.set(key, factory(key));
      return this.get(key) as V;
    };
  }
  if (typeof proto["getOrInsert"] !== "function") {
    proto["getOrInsert"] = function <K, V>(this: Map<K, V>, key: K, value: V) {
      if (!this.has(key)) this.set(key, value);
      return this.get(key) as V;
    };
  }
}

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.4;

/**
 * Clean, in-app PDF viewer built on pdf.js canvas rendering.
 * Deliberately avoids the browser's native PDF toolbar — only page
 * navigation, zoom and fullscreen are exposed.
 */
export function PdfViewer({ source, fallbackText, className }: PdfViewerProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [pages, setPages] = useState<Array<{ width: number; height: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [current, setCurrent] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  const total = pages.length;

  // Load + render the document whenever the source or zoom changes.
  useEffect(() => {
    if (!source) {
      setPages([]);
      setFailed(false);
      return;
    }
    let cancelled = false;
    const tasks: Array<{ cancel: () => void }> = [];

    const render = async () => {
      setLoading(true);
      setFailed(false);
      try {
        ensureMapHelpers();
        const pdfjs = await import("pdfjs-dist");
        const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

        const doc =
          typeof source === "string"
            ? await pdfjs.getDocument({ url: source }).promise
            : await pdfjs.getDocument({ data: new Uint8Array(await source.arrayBuffer()) }).promise;
        if (cancelled) return;

        const containerWidth = scrollRef.current?.clientWidth ?? 720;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const sizes: Array<{ width: number; height: number }> = [];

        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          if (cancelled) return;
          const base = page.getViewport({ scale: 1 });
          const fit = Math.max((containerWidth - 32) / base.width, 0.2);
          const viewport = page.getViewport({ scale: fit * zoom });
          sizes.push({ width: viewport.width, height: viewport.height });
          setPages([...sizes]);

          // Wait a tick so the canvas host for this page exists in the DOM.
          await new Promise((r) => requestAnimationFrame(() => r(null)));
          const host = pageRefs.current[i - 1];
          if (cancelled || !host) continue;

          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width * dpr);
          canvas.height = Math.floor(viewport.height * dpr);
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.display = "block";
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          ctx.scale(dpr, dpr);

          const task = page.render({ canvas, canvasContext: ctx, viewport });
          tasks.push(task);
          await task.promise;
          if (cancelled) return;
          host.replaceChildren(canvas);
        }
        if (!cancelled) setLoading(false);
      } catch (err) {
        console.error("[PdfViewer] render failed", err);
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      }
    };

    void render();
    return () => {
      cancelled = true;
      tasks.forEach((t) => {
        try {
          t.cancel();
        } catch {
          /* already finished */
        }
      });
    };
  }, [source, zoom]);

  // Track the page currently in view.
  const onScroll = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const mid = scroller.scrollTop + scroller.clientHeight / 2;
    let index = 1;
    for (let i = 0; i < pageRefs.current.length; i++) {
      const el = pageRefs.current[i];
      if (el && el.offsetTop <= mid) index = i + 1;
    }
    setCurrent(index);
  }, []);

  const goTo = (page: number) => {
    const clamped = Math.min(Math.max(page, 1), Math.max(total, 1));
    const el = pageRefs.current[clamped - 1];
    if (el && scrollRef.current) {
      scrollRef.current.scrollTo({ top: el.offsetTop - 12, behavior: "smooth" });
    }
    setCurrent(clamped);
  };

  useEffect(() => {
    const handler = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void shellRef.current?.requestFullscreen?.();
  };

  const ctrl =
    "grid size-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40 disabled:hover:bg-card";

  return (
    <div ref={shellRef} className={cn("flex min-h-0 flex-col bg-background", className)}>
      {/* Minimal, app-native toolbar */}
      <div className="flex items-center gap-2 border-b border-border bg-card/60 px-3 py-2">
        <button
          type="button"
          aria-label="Previous page"
          onClick={() => goTo(current - 1)}
          disabled={current <= 1}
          className={ctrl}
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="min-w-[4.5rem] text-center text-xs font-medium tabular-nums text-muted-foreground">
          {total ? `${current} / ${total}` : "—"}
        </span>
        <button
          type="button"
          aria-label="Next page"
          onClick={() => goTo(current + 1)}
          disabled={current >= total}
          className={ctrl}
        >
          <ChevronRight className="size-4" />
        </button>

        <span className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - 0.2) * 10) / 10))}
            disabled={zoom <= MIN_ZOOM}
            className={ctrl}
          >
            <ZoomOut className="size-4" />
          </button>
          <span className="w-11 text-center text-xs font-medium tabular-nums text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + 0.2) * 10) / 10))}
            disabled={zoom >= MAX_ZOOM}
            className={ctrl}
          >
            <ZoomIn className="size-4" />
          </button>
          <button
            type="button"
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            onClick={toggleFullscreen}
            className={ctrl}
          >
            {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </span>
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="relative min-h-0 flex-1 overflow-auto bg-secondary/30 px-4 py-4"
      >
        {loading && total === 0 && (
          <div className="flex h-full min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" /> Rendering your resume…
          </div>
        )}

        {failed ? (
          <div className="whitespace-pre-wrap p-2 text-xs leading-relaxed text-muted-foreground">
            {fallbackText || "We couldn't render this PDF."}
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4">
            {pages.map((size, i) => (
              <div
                key={i}
                ref={(el) => {
                  pageRefs.current[i] = el;
                }}
                style={{ aspectRatio: `${size.width} / ${size.height}` }}
                className="w-full overflow-hidden rounded-xl border border-border bg-white shadow-soft"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
