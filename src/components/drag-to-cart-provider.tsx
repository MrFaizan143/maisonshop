import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Zap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useCartStore, type CartItem } from "@/stores/cart-store";
import { formatINR } from "@/lib/format";

const HOLD_MS = 600;
const MOVE_CANCEL_PX = 8;

export type DraggableProduct = Omit<CartItem, "quantity">;

interface DragCtx {
  /** Attach to any element that should be draggable. Returns event handlers. */
  bindHandle: (product: DraggableProduct) => {
    onPointerDown: (e: React.PointerEvent) => void;
    style: React.CSSProperties;
  };
}

const Ctx = createContext<DragCtx | null>(null);

export function useDragToCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDragToCart must be used inside DragToCartProvider");
  return ctx;
}

type Phase = "idle" | "holding" | "dragging";

interface DragState {
  phase: Phase;
  product: DraggableProduct | null;
  x: number;
  y: number;
  hover: "cart" | "buy" | null;
}

const INITIAL: DragState = { phase: "idle", product: null, x: 0, y: 0, hover: null };

export function DragToCartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DragState>(INITIAL);
  const stateRef = useRef(state);
  stateRef.current = state;

  const startPos = useRef({ x: 0, y: 0 });
  const holdTimer = useRef<number | null>(null);
  const pointerId = useRef<number | null>(null);
  const sourceEl = useRef<HTMLElement | null>(null);

  const cartZoneRef = useRef<HTMLDivElement | null>(null);
  const buyZoneRef = useRef<HTMLDivElement | null>(null);

  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();

  const cleanup = useCallback(() => {
    if (holdTimer.current) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (sourceEl.current && pointerId.current != null) {
      try {
        sourceEl.current.releasePointerCapture(pointerId.current);
      } catch {
        // ignore
      }
    }
    sourceEl.current = null;
    pointerId.current = null;
    document.body.style.userSelect = "";
    document.body.style.touchAction = "";
  }, []);

  const detectHover = useCallback((x: number, y: number): "cart" | "buy" | null => {
    const cart = cartZoneRef.current?.getBoundingClientRect();
    const buy = buyZoneRef.current?.getBoundingClientRect();
    if (cart && x >= cart.left && x <= cart.right && y >= cart.top && y <= cart.bottom)
      return "cart";
    if (buy && x >= buy.left && x <= buy.right && y >= buy.top && y <= buy.bottom) return "buy";
    return null;
  }, []);

  // Global pointer listeners while active
  useEffect(() => {
    if (state.phase === "idle") return;

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      // While only "holding", cancel if user moves too much (likely a scroll attempt)
      if (stateRef.current.phase === "holding") {
        if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
          cleanup();
          setState(INITIAL);
        }
        return;
      }
      // Dragging
      e.preventDefault();
      setState((s) => ({
        ...s,
        x: e.clientX,
        y: e.clientY,
        hover: detectHover(e.clientX, e.clientY),
      }));
    };

    const onUp = (e: PointerEvent) => {
      const cur = stateRef.current;
      if (cur.phase === "dragging" && cur.product) {
        const drop = detectHover(e.clientX, e.clientY);
        if (drop === "cart") {
          addItem(cur.product, 1);
          toast.success("Added to cart", { description: cur.product.title });
        } else if (drop === "buy") {
          addItem(cur.product, 1);
          navigate({ to: "/checkout" });
        }
      }
      cleanup();
      setState(INITIAL);
    };

    const onCancel = () => {
      cleanup();
      setState(INITIAL);
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [state.phase, addItem, navigate, cleanup, detectHover]);

  const bindHandle = useCallback<DragCtx["bindHandle"]>((product) => {
    return {
      style: { touchAction: "pan-y", WebkitUserSelect: "none", userSelect: "none" },
      onPointerDown: (e: React.PointerEvent) => {
        // Only primary button / touch / pen
        if (e.button != null && e.button !== 0) return;
        const el = e.currentTarget as HTMLElement;
        sourceEl.current = el;
        pointerId.current = e.pointerId;
        startPos.current = { x: e.clientX, y: e.clientY };

        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }

        setState({
          phase: "holding",
          product,
          x: e.clientX,
          y: e.clientY,
          hover: null,
        });

        if (holdTimer.current) window.clearTimeout(holdTimer.current);
        holdTimer.current = window.setTimeout(() => {
          // Promote to dragging
          document.body.style.userSelect = "none";
          document.body.style.touchAction = "none";
          // Haptic feedback when available
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            try {
              navigator.vibrate?.(15);
            } catch {
              // ignore
            }
          }
          setState((s) => ({ ...s, phase: "dragging" }));
        }, HOLD_MS);
      },
    };
  }, []);

  const value = useMemo(() => ({ bindHandle }), [bindHandle]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <DragOverlay
        state={state}
        cartZoneRef={cartZoneRef}
        buyZoneRef={buyZoneRef}
        holdMs={HOLD_MS}
      />
    </Ctx.Provider>
  );
}

function DragOverlay({
  state,
  cartZoneRef,
  buyZoneRef,
  holdMs,
}: {
  state: DragState;
  cartZoneRef: React.RefObject<HTMLDivElement | null>;
  buyZoneRef: React.RefObject<HTMLDivElement | null>;
  holdMs: number;
}) {
  const visible = state.phase !== "idle" && state.product;
  const dragging = state.phase === "dragging";

  return (
    <>
      {/* Hold-progress ring at pointer */}
      <AnimatePresence>
        {visible && state.phase === "holding" && (
          <motion.div
            key="hold-ring"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none fixed z-[100]"
            style={{
              left: state.x - 28,
              top: state.y - 28,
            }}
          >
            <svg width="56" height="56" viewBox="0 0 56 56" className="block">
              <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="3" />
              <motion.circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 24}
                initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: holdMs / 1000, ease: "linear" }}
                transform="rotate(-90 28 28)"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating product preview while dragging */}
      <AnimatePresence>
        {visible && dragging && state.product && (
          <motion.div
            key="drag-preview"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="pointer-events-none fixed z-[110]"
            style={{
              left: state.x - 44,
              top: state.y - 44,
            }}
          >
            <div className="grid h-22 w-22 place-items-center overflow-hidden rounded-2xl border-2 border-foreground bg-background shadow-pop ring-4 ring-foreground/10">
              {state.product.image ? (
                <img
                  src={state.product.image}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ width: 88, height: 88 }}
                />
              ) : (
                <div className="text-xs text-muted-foreground">No image</div>
              )}
            </div>
            <div className="mt-2 max-w-[160px] truncate rounded-md bg-foreground px-2 py-1 text-center font-mono text-[10px] text-background">
              {formatINR(state.product.price)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop zones — only visible while dragging */}
      <AnimatePresence>
        {dragging && (
          <motion.div
            key="dropzones"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[105] flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),1rem)]"
          >
            <div className="grid w-full max-w-2xl grid-cols-2 gap-3">
              <DropZone
                innerRef={cartZoneRef}
                active={state.hover === "cart"}
                icon={<ShoppingBag className="h-6 w-6" />}
                label="Add to cart"
                tone="neutral"
              />
              <DropZone
                innerRef={buyZoneRef}
                active={state.hover === "buy"}
                icon={<Zap className="h-6 w-6" />}
                label="Buy now"
                tone="accent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DropZone({
  innerRef,
  active,
  icon,
  label,
  tone,
}: {
  innerRef: React.RefObject<HTMLDivElement | null>;
  active: boolean;
  icon: ReactNode;
  label: string;
  tone: "neutral" | "accent";
}) {
  const base =
    tone === "neutral"
      ? "bg-background text-foreground border-foreground"
      : "bg-foreground text-background border-foreground";
  return (
    <motion.div
      ref={innerRef}
      animate={{ scale: active ? 1.04 : 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
      className={[
        "pointer-events-auto flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-5 shadow-pop backdrop-blur",
        base,
        active ? "border-solid ring-4 ring-foreground/20" : "",
      ].join(" ")}
    >
      {icon}
      <span className="font-mono text-[11px] uppercase tracking-[0.18em]">{label}</span>
    </motion.div>
  );
}
