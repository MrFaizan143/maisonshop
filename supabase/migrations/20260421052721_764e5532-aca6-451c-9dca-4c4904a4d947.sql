DROP POLICY IF EXISTS "Anyone can submit catering inquiries" ON public.catering_inquiries;

CREATE POLICY "Anyone can submit catering inquiries"
ON public.catering_inquiries FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(name) BETWEEN 1 AND 100
  AND length(phone) BETWEEN 5 AND 20
  AND (email IS NULL OR length(email) <= 255)
  AND (occasion IS NULL OR length(occasion) <= 100)
  AND (message IS NULL OR length(message) <= 2000)
  AND (headcount IS NULL OR (headcount > 0 AND headcount <= 10000))
  AND status = 'new'
);