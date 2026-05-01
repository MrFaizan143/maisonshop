CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  -- Snapshot fields so we can render the cart even if the product changes
  title text NOT NULL,
  slug text NOT NULL,
  price numeric NOT NULL,
  image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX idx_cart_items_user ON public.cart_items(user_id);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own cart" ON public.cart_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own cart" ON public.cart_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own cart" ON public.cart_items
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users delete own cart" ON public.cart_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();