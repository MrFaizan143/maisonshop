CREATE TABLE public.catering_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  event_date DATE,
  headcount INTEGER,
  occasion TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.catering_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can submit a catering inquiry
CREATE POLICY "Anyone can submit catering inquiries"
ON public.catering_inquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only authenticated users (the owner) can read submissions
CREATE POLICY "Authenticated users can view inquiries"
ON public.catering_inquiries FOR SELECT
TO authenticated
USING (true);