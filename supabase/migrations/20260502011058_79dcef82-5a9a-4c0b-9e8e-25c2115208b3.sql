-- Lock down SECURITY DEFINER functions: they're meant for internal RLS/trigger use only,
-- not direct API calls. RLS policies still call them because policy evaluation happens
-- with elevated privileges, independent of the caller's EXECUTE grant.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;