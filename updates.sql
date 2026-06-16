-- Put incremental SQL updates here. After applying on Supabase,
-- fold these changes into SUPABASE_SETUP.sql for the next reference.
--
-- Pending (2026-06-16): Admin registration settings + email OTP before signup.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE / idempotent policies.

-- ---------------------------------------------------------------------------
-- 1. app_settings (admin: email_otp_enabled, otp_max_attempts, resend_cooldown_seconds)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.app_settings (key, value)
VALUES (
  'registration',
  '{"email_otp_enabled": false, "otp_max_attempts": 5, "resend_cooldown_seconds": 60}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'app_settings'
      AND policyname = 'Admins read app settings'
  ) THEN
    CREATE POLICY "Admins read app settings" ON public.app_settings
    FOR SELECT TO authenticated
    USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'app_settings'
      AND policyname = 'Admins insert app settings'
  ) THEN
    CREATE POLICY "Admins insert app settings" ON public.app_settings
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'app_settings'
      AND policyname = 'Admins update app settings'
  ) THEN
    CREATE POLICY "Admins update app settings" ON public.app_settings
    FOR UPDATE TO authenticated
    USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
    WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;
END$$;

CREATE OR REPLACE FUNCTION public.get_registration_settings()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT value FROM public.app_settings WHERE key = 'registration'),
    '{"email_otp_enabled": false, "otp_max_attempts": 5, "resend_cooldown_seconds": 60}'::jsonb
  );
$$;

REVOKE ALL ON FUNCTION public.get_registration_settings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_registration_settings() TO anon, authenticated;

-- Keep only the three admin-managed keys (OTP length = 6 and validity = 10 min are fixed in app code).
UPDATE public.app_settings
SET value = jsonb_build_object(
  'email_otp_enabled', coalesce((value->>'email_otp_enabled')::boolean, false),
  'otp_max_attempts', coalesce((value->>'otp_max_attempts')::int, 5),
  'resend_cooldown_seconds', coalesce((value->>'resend_cooldown_seconds')::int, 60)
)
WHERE key = 'registration';

-- ---------------------------------------------------------------------------
-- 2. registration_email_otps + RPCs (send / verify / consume OTP before signUp)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.registration_email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  verified_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS registration_email_otps_email_created_idx
  ON public.registration_email_otps (lower(trim(email)), created_at DESC);

ALTER TABLE public.registration_email_otps ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.create_registration_email_otp(
  p_email TEXT,
  p_otp_hash TEXT,
  p_payload JSONB,
  p_expires_at TIMESTAMPTZ,
  p_max_attempts INT DEFAULT 5
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_id UUID;
BEGIN
  v_email := lower(trim(coalesce(p_email, '')));
  IF length(v_email) < 3 OR length(v_email) > 320 THEN
    RAISE EXCEPTION 'Invalid email' USING ERRCODE = '22023';
  END IF;
  IF p_otp_hash IS NULL OR length(trim(p_otp_hash)) < 32 THEN
    RAISE EXCEPTION 'Invalid otp hash' USING ERRCODE = '22023';
  END IF;
  IF p_expires_at IS NULL OR p_expires_at <= NOW() THEN
    RAISE EXCEPTION 'Invalid expiry' USING ERRCODE = '22023';
  END IF;

  UPDATE public.registration_email_otps
     SET consumed_at = NOW()
   WHERE lower(trim(email)) = v_email
     AND consumed_at IS NULL
     AND verified_at IS NULL;

  INSERT INTO public.registration_email_otps (email, otp_hash, payload, expires_at, max_attempts)
  VALUES (
    v_email,
    p_otp_hash,
    coalesce(p_payload, '{}'::jsonb),
    p_expires_at,
    greatest(coalesce(p_max_attempts, 5), 1)
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_registration_email_otp(
  p_email TEXT,
  p_otp_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_row public.registration_email_otps%ROWTYPE;
BEGIN
  v_email := lower(trim(coalesce(p_email, '')));
  IF length(v_email) < 3 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid');
  END IF;
  IF p_otp_hash IS NULL OR length(trim(p_otp_hash)) < 32 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid');
  END IF;

  SELECT *
    INTO v_row
    FROM public.registration_email_otps
   WHERE lower(trim(email)) = v_email
     AND consumed_at IS NULL
     AND verified_at IS NULL
   ORDER BY created_at DESC
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  IF v_row.expires_at <= NOW() THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'expired');
  END IF;

  IF v_row.attempts >= v_row.max_attempts THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'locked');
  END IF;

  IF v_row.otp_hash IS DISTINCT FROM p_otp_hash THEN
    UPDATE public.registration_email_otps
       SET attempts = attempts + 1
     WHERE id = v_row.id;
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid');
  END IF;

  UPDATE public.registration_email_otps
     SET verified_at = NOW()
   WHERE id = v_row.id;

  RETURN jsonb_build_object('ok', true, 'payload', v_row.payload);
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_registration_email_otp(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_consumed BOOLEAN := FALSE;
BEGIN
  v_email := lower(trim(coalesce(p_email, '')));

  UPDATE public.registration_email_otps
     SET consumed_at = NOW()
   WHERE id = (
     SELECT id
       FROM public.registration_email_otps
      WHERE lower(trim(email)) = v_email
        AND verified_at IS NOT NULL
        AND consumed_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
   )
   RETURNING TRUE INTO v_consumed;

  RETURN coalesce(v_consumed, FALSE);
END;
$$;

REVOKE ALL ON FUNCTION public.create_registration_email_otp(TEXT, TEXT, JSONB, TIMESTAMPTZ, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_registration_email_otp(TEXT, TEXT, JSONB, TIMESTAMPTZ, INT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.verify_registration_email_otp(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_registration_email_otp(TEXT, TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.consume_registration_email_otp(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_registration_email_otp(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Booking orders + consultation payments (pending → pay → confirm booking)
-- Safe to re-run: IF NOT EXISTS / CREATE OR REPLACE / idempotent policies.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.booking_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  amount_paise INT NOT NULL DEFAULT 0 CHECK (amount_paise >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'confirmed', 'failed')),
  failure_reason TEXT
    CHECK (
      failure_reason IS NULL
      OR failure_reason IN ('expired', 'payment_declined', 'payment_error', 'fulfillment_error', 'cancelled')
    ),
  booking_snapshot JSONB NOT NULL,
  guest_appointment_id UUID REFERENCES public.guest_appointments(id) ON DELETE SET NULL,
  payment_provider TEXT NOT NULL DEFAULT 'mock',
  provider_order_id TEXT,
  provider_payment_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_orders_user_id ON public.booking_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_orders_professional_id ON public.booking_orders(professional_id);
CREATE INDEX IF NOT EXISTS idx_booking_orders_status_expires ON public.booking_orders(status, expires_at);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_order_id UUID NOT NULL UNIQUE REFERENCES public.booking_orders(id) ON DELETE CASCADE,
  guest_appointment_id UUID REFERENCES public.guest_appointments(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INT NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status = 'completed'),
  payment_method TEXT NOT NULL DEFAULT 'mock',
  transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_professional_id ON public.payments(professional_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);

ALTER TABLE public.booking_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'booking_orders'
      AND policyname = 'Patients insert own booking orders'
  ) THEN
    CREATE POLICY "Patients insert own booking orders" ON public.booking_orders
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'booking_orders'
      AND policyname = 'Patients read own booking orders'
  ) THEN
    CREATE POLICY "Patients read own booking orders" ON public.booking_orders
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'booking_orders'
      AND policyname = 'Professionals read confirmed booking orders'
  ) THEN
    CREATE POLICY "Professionals read confirmed booking orders" ON public.booking_orders
      FOR SELECT TO authenticated
      USING (
        professional_id = auth.uid()
        AND status = 'confirmed'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'booking_orders'
      AND policyname = 'Admins manage all booking orders'
  ) THEN
    CREATE POLICY "Admins manage all booking orders" ON public.booking_orders
      FOR ALL TO authenticated
      USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
      WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'payments'
      AND policyname = 'Professionals read own payments'
  ) THEN
    CREATE POLICY "Professionals read own payments" ON public.payments
      FOR SELECT TO authenticated
      USING (professional_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'payments'
      AND policyname = 'Patients read own payments'
  ) THEN
    CREATE POLICY "Patients read own payments" ON public.payments
      FOR SELECT TO authenticated
      USING (client_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'payments'
      AND policyname = 'Admins manage all payments'
  ) THEN
    CREATE POLICY "Admins manage all payments" ON public.payments
      FOR ALL TO authenticated
      USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
      WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;
END$$;

CREATE OR REPLACE FUNCTION public.expire_stale_booking_orders()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.booking_orders
     SET status = 'failed',
         failure_reason = 'expired',
         updated_at = NOW()
   WHERE status = 'pending'
     AND expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_stale_booking_orders() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_stale_booking_orders() TO authenticated;

CREATE OR REPLACE FUNCTION public.patch_booking_order_status(
  p_order_id UUID,
  p_expected_status TEXT,
  p_new_status TEXT,
  p_failure_reason TEXT DEFAULT NULL,
  p_guest_appointment_id UUID DEFAULT NULL,
  p_provider_payment_id TEXT DEFAULT NULL,
  p_paid_at TIMESTAMPTZ DEFAULT NULL,
  p_confirmed_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_user_id UUID;
  v_current TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT user_id, status
    INTO v_user_id, v_current
    FROM public.booking_orders
   WHERE id = p_order_id
   FOR UPDATE;

  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF v_user_id IS DISTINCT FROM v_uid THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF v_current IS DISTINCT FROM p_expected_status THEN
    RETURN FALSE;
  END IF;

  UPDATE public.booking_orders
     SET status = p_new_status,
         failure_reason = p_failure_reason,
         guest_appointment_id = COALESCE(p_guest_appointment_id, guest_appointment_id),
         provider_payment_id = COALESCE(p_provider_payment_id, provider_payment_id),
         paid_at = COALESCE(p_paid_at, paid_at),
         confirmed_at = COALESCE(p_confirmed_at, confirmed_at),
         updated_at = NOW()
   WHERE id = p_order_id;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.patch_booking_order_status(UUID, TEXT, TEXT, TEXT, UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.patch_booking_order_status(UUID, TEXT, TEXT, TEXT, UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

CREATE OR REPLACE FUNCTION public.finalize_booking_order(
  p_order_id UUID,
  p_guest_appointment_id UUID,
  p_transaction_id TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT 'mock'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row public.booking_orders%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT *
    INTO v_row
    FROM public.booking_orders
   WHERE id = p_order_id
   FOR UPDATE;

  IF v_row.id IS NULL OR v_row.user_id IS DISTINCT FROM v_uid THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF v_row.status IS DISTINCT FROM 'processing' THEN
    RETURN FALSE;
  END IF;

  IF v_row.guest_appointment_id IS DISTINCT FROM p_guest_appointment_id THEN
    RAISE EXCEPTION 'Appointment mismatch';
  END IF;

  IF v_row.amount_paise > 0 THEN
    INSERT INTO public.payments (
      booking_order_id,
      guest_appointment_id,
      client_id,
      professional_id,
      amount,
      status,
      payment_method,
      transaction_id
    ) VALUES (
      v_row.id,
      p_guest_appointment_id,
      v_row.user_id,
      v_row.professional_id,
      v_row.amount_paise,
      'completed',
      COALESCE(p_payment_method, 'mock'),
      p_transaction_id
    );
  END IF;

  UPDATE public.booking_orders
     SET status = 'confirmed',
         confirmed_at = NOW(),
         updated_at = NOW()
   WHERE id = p_order_id;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_booking_order(UUID, UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.finalize_booking_order(UUID, UUID, TEXT, TEXT) TO authenticated;
