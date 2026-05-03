
DROP POLICY IF EXISTS "Authenticated users can view inquiries" ON public.catering_inquiries;
CREATE POLICY "Admins view catering inquiries"
  ON public.catering_inquiries FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert roles"
  ON public.user_roles AS RESTRICTIVE FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles"
  ON public.user_roles AS RESTRICTIVE FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles AS RESTRICTIVE FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.place_order(
  _items jsonb,
  _ship_full_name text,
  _ship_phone text,
  _ship_line1 text,
  _ship_line2 text,
  _ship_city text,
  _ship_state text,
  _ship_pincode text
)
RETURNS TABLE(id uuid, order_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user uuid := auth.uid();
  _subtotal numeric := 0;
  _shipping numeric := 0;
  _total numeric := 0;
  _free_threshold numeric := 499;
  _flat_shipping numeric := 49;
  _order_id uuid;
  _order_number text;
  _item jsonb;
  _product record;
  _qty int;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;
  IF _items IS NULL OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'EMPTY_CART';
  END IF;
  IF length(coalesce(_ship_full_name,'')) < 2
     OR length(coalesce(_ship_phone,'')) < 10
     OR length(coalesce(_ship_line1,'')) < 5
     OR length(coalesce(_ship_city,'')) < 2
     OR length(coalesce(_ship_state,'')) < 2
     OR coalesce(_ship_pincode,'') !~ '^\d{6}$' THEN
    RAISE EXCEPTION 'INVALID_ADDRESS';
  END IF;

  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := (_item->>'quantity')::int;
    IF _qty IS NULL OR _qty < 1 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY';
    END IF;
    SELECT p.id, p.price, p.stock, p.active, p.title, p.image_url
      INTO _product
      FROM public.products p
      WHERE p.id = (_item->>'product_id')::uuid;
    IF NOT FOUND OR NOT _product.active THEN
      RAISE EXCEPTION 'PRODUCT_UNAVAILABLE';
    END IF;
    IF _product.stock < _qty THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK';
    END IF;
    _subtotal := _subtotal + (_product.price * _qty);
  END LOOP;

  _shipping := CASE WHEN _subtotal >= _free_threshold THEN 0 ELSE _flat_shipping END;
  _total := _subtotal + _shipping;

  INSERT INTO public.orders(
    user_id, subtotal, shipping_fee, total, payment_method,
    ship_full_name, ship_phone, ship_line1, ship_line2,
    ship_city, ship_state, ship_pincode
  ) VALUES (
    _user, _subtotal, _shipping, _total, 'cod',
    _ship_full_name, _ship_phone, _ship_line1, nullif(_ship_line2,''),
    _ship_city, _ship_state, _ship_pincode
  )
  RETURNING orders.id, orders.order_number INTO _order_id, _order_number;

  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := (_item->>'quantity')::int;
    SELECT p.id, p.price, p.title, p.image_url INTO _product
      FROM public.products p WHERE p.id = (_item->>'product_id')::uuid;
    INSERT INTO public.order_items(
      order_id, product_id, product_title, product_image,
      unit_price, quantity, line_total
    ) VALUES (
      _order_id, _product.id, _product.title, _product.image_url,
      _product.price, _qty, _product.price * _qty
    );
  END LOOP;

  RETURN QUERY SELECT _order_id, _order_number;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.place_order(jsonb,text,text,text,text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb,text,text,text,text,text,text,text) TO authenticated;
