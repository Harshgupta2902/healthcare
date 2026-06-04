--
-- PostgreSQL database dump
--

\restrict EWb1gO01vZbCzMv2rNjFcgjB5AiHWS3FcVjcwiAlUz8NHeOYLLGnsVpFfMy5brr

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP EVENT TRIGGER IF EXISTS pgrst_drop_watch;
DROP EVENT TRIGGER IF EXISTS pgrst_ddl_watch;
DROP EVENT TRIGGER IF EXISTS issue_pg_net_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_graphql_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_cron_access;
DROP EVENT TRIGGER IF EXISTS issue_graphql_placeholder;
DROP EVENT TRIGGER IF EXISTS ensure_rls;
DROP PUBLICATION IF EXISTS supabase_realtime;
DROP POLICY IF EXISTS "Users can view own medical documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own medical documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own medical documents" ON storage.objects;
DROP POLICY IF EXISTS "Public qualification files are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Public Profiles are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Professionals can upload own qualification documents" ON storage.objects;
DROP POLICY IF EXISTS "Professionals can update own qualification documents" ON storage.objects;
DROP POLICY IF EXISTS "Professionals can delete own qualification documents" ON storage.objects;
DROP POLICY IF EXISTS guest_appointments_insert_all ON public.guest_appointments;
DROP POLICY IF EXISTS "Users insert own admin notification rows" ON public.admin_notifications;
DROP POLICY IF EXISTS "Users can view own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can view own medical info" ON public.client_medical_profiles;
DROP POLICY IF EXISTS "Users can view own history" ON public.medical_history;
DROP POLICY IF EXISTS "Users can view own documents" ON public.medical_documents;
DROP POLICY IF EXISTS "Users can view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;
DROP POLICY IF EXISTS "Users can manage own insurance" ON public.insurance;
DROP POLICY IF EXISTS "Select own" ON public.guest_appointments;
DROP POLICY IF EXISTS "Select guest bookings matching patient email" ON public.guest_appointments;
DROP POLICY IF EXISTS "Public users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Public qualifications are viewable by everyone" ON public.professional_qualifications;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.professional_profiles;
DROP POLICY IF EXISTS "Public availability is viewable by everyone" ON public.professional_availability;
DROP POLICY IF EXISTS "Professionals update own guest bookings" ON public.guest_appointments;
DROP POLICY IF EXISTS "Professionals read guest bookings assigned to them" ON public.guest_appointments;
DROP POLICY IF EXISTS "Professionals can manage own qualifications" ON public.professional_qualifications;
DROP POLICY IF EXISTS "Professionals can manage own profile" ON public.professional_profiles;
DROP POLICY IF EXISTS "Professionals can manage own availability" ON public.professional_availability;
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow trigger insert" ON public.users;
DROP POLICY IF EXISTS "Allow signup insert" ON public.users;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.guest_appointments;
DROP POLICY IF EXISTS "Allow public newsletter status update" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public newsletter signup" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public insert" ON public.guest_appointments;
DROP POLICY IF EXISTS "Allow public contact message insert" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow auth trigger insert" ON public.users;
DROP POLICY IF EXISTS "Admins store own Google calendar tokens" ON public.google_calendar_connections;
DROP POLICY IF EXISTS "Admins manage all newsletter campaigns" ON public.newsletter_campaigns;
DROP POLICY IF EXISTS "Admins can update notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can read notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can manage all qualifications" ON public.professional_qualifications;
DROP POLICY IF EXISTS "Admins can manage all professional profiles" ON public.professional_profiles;
DROP POLICY IF EXISTS "Admins can manage all medications" ON public.medications;
DROP POLICY IF EXISTS "Admins can manage all medical profiles" ON public.client_medical_profiles;
DROP POLICY IF EXISTS "Admins can manage all medical history" ON public.medical_history;
DROP POLICY IF EXISTS "Admins can manage all insurance" ON public.insurance;
DROP POLICY IF EXISTS "Admins can manage all guest appointments" ON public.guest_appointments;
DROP POLICY IF EXISTS "Admins can manage all google meet events" ON public.google_meet_events;
DROP POLICY IF EXISTS "Admins can manage all documents" ON public.medical_documents;
DROP POLICY IF EXISTS "Admins can manage all contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can manage all availability" ON public.professional_availability;
DROP POLICY IF EXISTS "Admins can manage all appointments" ON public.appointments;
ALTER TABLE IF EXISTS ONLY storage.vector_indexes DROP CONSTRAINT IF EXISTS vector_indexes_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_upload_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS "objects_bucketId_fkey";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE IF EXISTS ONLY public.professional_qualifications DROP CONSTRAINT IF EXISTS professional_qualifications_professional_id_fkey;
ALTER TABLE IF EXISTS ONLY public.professional_profiles DROP CONSTRAINT IF EXISTS professional_profiles_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.professional_availability DROP CONSTRAINT IF EXISTS professional_availability_professional_id_fkey;
ALTER TABLE IF EXISTS ONLY public.newsletter_campaigns DROP CONSTRAINT IF EXISTS newsletter_campaigns_sent_by_fkey;
ALTER TABLE IF EXISTS ONLY public.medications DROP CONSTRAINT IF EXISTS medications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.medical_history DROP CONSTRAINT IF EXISTS medical_history_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.medical_documents DROP CONSTRAINT IF EXISTS medical_documents_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.insurance DROP CONSTRAINT IF EXISTS insurance_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.guest_appointments DROP CONSTRAINT IF EXISTS guest_appointments_professional_id_fkey;
ALTER TABLE IF EXISTS ONLY public.google_meet_events DROP CONSTRAINT IF EXISTS google_meet_events_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.google_calendar_connections DROP CONSTRAINT IF EXISTS google_calendar_connections_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.client_medical_profiles DROP CONSTRAINT IF EXISTS client_medical_profiles_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_professional_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_client_id_fkey;
ALTER TABLE IF EXISTS ONLY public.admin_notifications DROP CONSTRAINT IF EXISTS admin_notifications_actor_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.webauthn_credentials DROP CONSTRAINT IF EXISTS webauthn_credentials_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.webauthn_challenges DROP CONSTRAINT IF EXISTS webauthn_challenges_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_oauth_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_flow_state_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_auth_factor_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_user_id_fkey;
DROP TRIGGER IF EXISTS update_objects_updated_at ON storage.objects;
DROP TRIGGER IF EXISTS protect_objects_delete ON storage.objects;
DROP TRIGGER IF EXISTS protect_buckets_delete ON storage.buckets;
DROP TRIGGER IF EXISTS enforce_bucket_name_length_trigger ON storage.buckets;
DROP TRIGGER IF EXISTS tr_check_filters ON realtime.subscription;
DROP TRIGGER IF EXISTS trg_admin_notify_newsletter_change ON public.newsletter_subscribers;
DROP TRIGGER IF EXISTS trg_admin_notify_new_user ON public.users;
DROP TRIGGER IF EXISTS trg_admin_notify_guest_appointment ON public.guest_appointments;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP INDEX IF EXISTS storage.vector_indexes_name_bucket_id_idx;
DROP INDEX IF EXISTS storage.name_prefix_search;
DROP INDEX IF EXISTS storage.idx_objects_bucket_id_name_lower;
DROP INDEX IF EXISTS storage.idx_objects_bucket_id_name;
DROP INDEX IF EXISTS storage.idx_multipart_uploads_list;
DROP INDEX IF EXISTS storage.buckets_analytics_unique_name_idx;
DROP INDEX IF EXISTS storage.bucketid_objname;
DROP INDEX IF EXISTS storage.bname;
DROP INDEX IF EXISTS realtime.subscription_subscription_id_entity_filters_action_filter_selec;
DROP INDEX IF EXISTS realtime.messages_inserted_at_topic_index;
DROP INDEX IF EXISTS realtime.ix_realtime_subscription_entity;
DROP INDEX IF EXISTS public.professional_availability_professional_day_unique;
DROP INDEX IF EXISTS public.newsletter_subscribers_email_lower_uidx;
DROP INDEX IF EXISTS public.idx_newsletter_campaigns_created_at;
DROP INDEX IF EXISTS public.idx_admin_notifications_unread;
DROP INDEX IF EXISTS public.idx_admin_notifications_created_at;
DROP INDEX IF EXISTS auth.webauthn_credentials_user_id_idx;
DROP INDEX IF EXISTS auth.webauthn_credentials_credential_id_key;
DROP INDEX IF EXISTS auth.webauthn_challenges_user_id_idx;
DROP INDEX IF EXISTS auth.webauthn_challenges_expires_at_idx;
DROP INDEX IF EXISTS auth.users_is_anonymous_idx;
DROP INDEX IF EXISTS auth.users_instance_id_idx;
DROP INDEX IF EXISTS auth.users_instance_id_email_idx;
DROP INDEX IF EXISTS auth.users_email_partial_key;
DROP INDEX IF EXISTS auth.user_id_created_at_idx;
DROP INDEX IF EXISTS auth.unique_phone_factor_per_user;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_pattern_idx;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_domain_idx;
DROP INDEX IF EXISTS auth.sessions_user_id_idx;
DROP INDEX IF EXISTS auth.sessions_oauth_client_id_idx;
DROP INDEX IF EXISTS auth.sessions_not_after_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_for_email_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_created_at_idx;
DROP INDEX IF EXISTS auth.saml_providers_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_updated_at_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_session_id_revoked_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_parent_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_user_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_idx;
DROP INDEX IF EXISTS auth.recovery_token_idx;
DROP INDEX IF EXISTS auth.reauthentication_token_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_user_id_token_type_key;
DROP INDEX IF EXISTS auth.one_time_tokens_token_hash_hash_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_relates_to_hash_idx;
DROP INDEX IF EXISTS auth.oauth_consents_user_order_idx;
DROP INDEX IF EXISTS auth.oauth_consents_active_user_client_idx;
DROP INDEX IF EXISTS auth.oauth_consents_active_client_idx;
DROP INDEX IF EXISTS auth.oauth_clients_deleted_at_idx;
DROP INDEX IF EXISTS auth.oauth_auth_pending_exp_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_id_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_friendly_name_unique;
DROP INDEX IF EXISTS auth.mfa_challenge_created_at_idx;
DROP INDEX IF EXISTS auth.idx_user_id_auth_method;
DROP INDEX IF EXISTS auth.idx_oauth_client_states_created_at;
DROP INDEX IF EXISTS auth.idx_auth_code;
DROP INDEX IF EXISTS auth.identities_user_id_idx;
DROP INDEX IF EXISTS auth.identities_email_idx;
DROP INDEX IF EXISTS auth.flow_state_created_at_idx;
DROP INDEX IF EXISTS auth.factor_id_created_at_idx;
DROP INDEX IF EXISTS auth.email_change_token_new_idx;
DROP INDEX IF EXISTS auth.email_change_token_current_idx;
DROP INDEX IF EXISTS auth.custom_oauth_providers_provider_type_idx;
DROP INDEX IF EXISTS auth.custom_oauth_providers_identifier_idx;
DROP INDEX IF EXISTS auth.custom_oauth_providers_enabled_idx;
DROP INDEX IF EXISTS auth.custom_oauth_providers_created_at_idx;
DROP INDEX IF EXISTS auth.confirmation_token_idx;
DROP INDEX IF EXISTS auth.audit_logs_instance_id_idx;
ALTER TABLE IF EXISTS ONLY storage.vector_indexes DROP CONSTRAINT IF EXISTS vector_indexes_pkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_pkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_pkey;
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS objects_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_name_key;
ALTER TABLE IF EXISTS ONLY storage.buckets_vectors DROP CONSTRAINT IF EXISTS buckets_vectors_pkey;
ALTER TABLE IF EXISTS ONLY storage.buckets DROP CONSTRAINT IF EXISTS buckets_pkey;
ALTER TABLE IF EXISTS ONLY storage.buckets_analytics DROP CONSTRAINT IF EXISTS buckets_analytics_pkey;
ALTER TABLE IF EXISTS ONLY realtime.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY realtime.subscription DROP CONSTRAINT IF EXISTS pk_subscription;
ALTER TABLE IF EXISTS ONLY realtime.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS realtime.messages DROP CONSTRAINT IF EXISTS messages_payload_exclusive;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.professional_qualifications DROP CONSTRAINT IF EXISTS professional_qualifications_pkey;
ALTER TABLE IF EXISTS ONLY public.professional_profiles DROP CONSTRAINT IF EXISTS professional_profiles_user_id_key;
ALTER TABLE IF EXISTS ONLY public.professional_profiles DROP CONSTRAINT IF EXISTS professional_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.professional_availability DROP CONSTRAINT IF EXISTS professional_availability_pkey;
ALTER TABLE IF EXISTS ONLY public.newsletter_subscribers DROP CONSTRAINT IF EXISTS newsletter_subscribers_pkey;
ALTER TABLE IF EXISTS ONLY public.newsletter_subscribers DROP CONSTRAINT IF EXISTS newsletter_subscribers_email_key;
ALTER TABLE IF EXISTS ONLY public.newsletter_rate_limits DROP CONSTRAINT IF EXISTS newsletter_rate_limits_pkey;
ALTER TABLE IF EXISTS ONLY public.newsletter_campaigns DROP CONSTRAINT IF EXISTS newsletter_campaigns_pkey;
ALTER TABLE IF EXISTS ONLY public.medications DROP CONSTRAINT IF EXISTS medications_pkey;
ALTER TABLE IF EXISTS ONLY public.medical_history DROP CONSTRAINT IF EXISTS medical_history_pkey;
ALTER TABLE IF EXISTS ONLY public.medical_documents DROP CONSTRAINT IF EXISTS medical_documents_pkey;
ALTER TABLE IF EXISTS ONLY public.insurance DROP CONSTRAINT IF EXISTS insurance_pkey;
ALTER TABLE IF EXISTS ONLY public.guest_appointments DROP CONSTRAINT IF EXISTS guest_appointments_pkey;
ALTER TABLE IF EXISTS ONLY public.google_meet_events DROP CONSTRAINT IF EXISTS google_meet_events_pkey;
ALTER TABLE IF EXISTS ONLY public.google_calendar_connections DROP CONSTRAINT IF EXISTS google_calendar_connections_pkey;
ALTER TABLE IF EXISTS ONLY public.contact_messages DROP CONSTRAINT IF EXISTS contact_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.client_medical_profiles DROP CONSTRAINT IF EXISTS client_medical_profiles_user_id_key;
ALTER TABLE IF EXISTS ONLY public.client_medical_profiles DROP CONSTRAINT IF EXISTS client_medical_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_pkey;
ALTER TABLE IF EXISTS ONLY public.admin_notifications DROP CONSTRAINT IF EXISTS admin_notifications_pkey;
ALTER TABLE IF EXISTS ONLY auth.webauthn_credentials DROP CONSTRAINT IF EXISTS webauthn_credentials_pkey;
ALTER TABLE IF EXISTS ONLY auth.webauthn_challenges DROP CONSTRAINT IF EXISTS webauthn_challenges_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_phone_key;
ALTER TABLE IF EXISTS ONLY auth.sso_providers DROP CONSTRAINT IF EXISTS sso_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_pkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY auth.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_entity_id_key;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_token_unique;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_user_client_unique;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_clients DROP CONSTRAINT IF EXISTS oauth_clients_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_client_states DROP CONSTRAINT IF EXISTS oauth_client_states_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_authorization_id_key;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_authorization_code_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_last_challenged_at_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_authentication_method_pkey;
ALTER TABLE IF EXISTS ONLY auth.instances DROP CONSTRAINT IF EXISTS instances_pkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_provider_id_provider_unique;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_pkey;
ALTER TABLE IF EXISTS ONLY auth.flow_state DROP CONSTRAINT IF EXISTS flow_state_pkey;
ALTER TABLE IF EXISTS ONLY auth.custom_oauth_providers DROP CONSTRAINT IF EXISTS custom_oauth_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.custom_oauth_providers DROP CONSTRAINT IF EXISTS custom_oauth_providers_identifier_key;
ALTER TABLE IF EXISTS ONLY auth.audit_log_entries DROP CONSTRAINT IF EXISTS audit_log_entries_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS amr_id_pk;
ALTER TABLE IF EXISTS auth.refresh_tokens ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS storage.vector_indexes;
DROP TABLE IF EXISTS storage.s3_multipart_uploads_parts;
DROP TABLE IF EXISTS storage.s3_multipart_uploads;
DROP TABLE IF EXISTS storage.objects;
DROP TABLE IF EXISTS storage.migrations;
DROP TABLE IF EXISTS storage.buckets_vectors;
DROP TABLE IF EXISTS storage.buckets_analytics;
DROP TABLE IF EXISTS storage.buckets;
DROP TABLE IF EXISTS realtime.subscription;
DROP TABLE IF EXISTS realtime.schema_migrations;
DROP TABLE IF EXISTS realtime.messages;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.professional_qualifications;
DROP TABLE IF EXISTS public.professional_profiles;
DROP TABLE IF EXISTS public.professional_availability;
DROP TABLE IF EXISTS public.newsletter_subscribers;
DROP TABLE IF EXISTS public.newsletter_rate_limits;
DROP TABLE IF EXISTS public.newsletter_campaigns;
DROP TABLE IF EXISTS public.medications;
DROP TABLE IF EXISTS public.medical_history;
DROP TABLE IF EXISTS public.medical_documents;
DROP TABLE IF EXISTS public.insurance;
DROP TABLE IF EXISTS public.guest_appointments;
DROP TABLE IF EXISTS public.google_meet_events;
DROP TABLE IF EXISTS public.google_calendar_connections;
DROP TABLE IF EXISTS public.contact_messages;
DROP TABLE IF EXISTS public.client_medical_profiles;
DROP TABLE IF EXISTS public.appointments;
DROP TABLE IF EXISTS public.admin_notifications;
DROP TABLE IF EXISTS auth.webauthn_credentials;
DROP TABLE IF EXISTS auth.webauthn_challenges;
DROP TABLE IF EXISTS auth.users;
DROP TABLE IF EXISTS auth.sso_providers;
DROP TABLE IF EXISTS auth.sso_domains;
DROP TABLE IF EXISTS auth.sessions;
DROP TABLE IF EXISTS auth.schema_migrations;
DROP TABLE IF EXISTS auth.saml_relay_states;
DROP TABLE IF EXISTS auth.saml_providers;
DROP SEQUENCE IF EXISTS auth.refresh_tokens_id_seq;
DROP TABLE IF EXISTS auth.refresh_tokens;
DROP TABLE IF EXISTS auth.one_time_tokens;
DROP TABLE IF EXISTS auth.oauth_consents;
DROP TABLE IF EXISTS auth.oauth_clients;
DROP TABLE IF EXISTS auth.oauth_client_states;
DROP TABLE IF EXISTS auth.oauth_authorizations;
DROP TABLE IF EXISTS auth.mfa_factors;
DROP TABLE IF EXISTS auth.mfa_challenges;
DROP TABLE IF EXISTS auth.mfa_amr_claims;
DROP TABLE IF EXISTS auth.instances;
DROP TABLE IF EXISTS auth.identities;
DROP TABLE IF EXISTS auth.flow_state;
DROP TABLE IF EXISTS auth.custom_oauth_providers;
DROP TABLE IF EXISTS auth.audit_log_entries;
DROP FUNCTION IF EXISTS storage.update_updated_at_column();
DROP FUNCTION IF EXISTS storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text);
DROP FUNCTION IF EXISTS storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text);
DROP FUNCTION IF EXISTS storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.protect_delete();
DROP FUNCTION IF EXISTS storage.operation();
DROP FUNCTION IF EXISTS storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text);
DROP FUNCTION IF EXISTS storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text);
DROP FUNCTION IF EXISTS storage.get_size_by_bucket();
DROP FUNCTION IF EXISTS storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text);
DROP FUNCTION IF EXISTS storage.foldername(name text);
DROP FUNCTION IF EXISTS storage.filename(name text);
DROP FUNCTION IF EXISTS storage.extension(name text);
DROP FUNCTION IF EXISTS storage.enforce_bucket_name_length();
DROP FUNCTION IF EXISTS storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb);
DROP FUNCTION IF EXISTS storage.allow_only_operation(expected_operation text);
DROP FUNCTION IF EXISTS storage.allow_any_operation(expected_operations text[]);
DROP FUNCTION IF EXISTS realtime.wal2json_escape_identifier(name text);
DROP FUNCTION IF EXISTS realtime.topic();
DROP FUNCTION IF EXISTS realtime.to_regrole(role_name text);
DROP FUNCTION IF EXISTS realtime.subscription_check_filters();
DROP FUNCTION IF EXISTS realtime.send_binary(payload bytea, event text, topic text, private boolean);
DROP FUNCTION IF EXISTS realtime.send(payload jsonb, event text, topic text, private boolean);
DROP FUNCTION IF EXISTS realtime.quote_wal2json(entity regclass);
DROP FUNCTION IF EXISTS realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer);
DROP FUNCTION IF EXISTS realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]);
DROP FUNCTION IF EXISTS realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text);
DROP FUNCTION IF EXISTS realtime."cast"(val text, type_ regtype);
DROP FUNCTION IF EXISTS realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]);
DROP FUNCTION IF EXISTS realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text);
DROP FUNCTION IF EXISTS realtime.apply_rls(wal jsonb, max_record_bytes integer);
DROP FUNCTION IF EXISTS public.try_newsletter_rate_limit(p_bucket_key text, p_max_attempts integer, p_window_seconds integer);
DROP FUNCTION IF EXISTS public.subscribe_newsletter(p_email text);
DROP FUNCTION IF EXISTS public.set_newsletter_status(p_email text, p_status text);
DROP FUNCTION IF EXISTS public.rls_auto_enable();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_newsletter_status(p_email text);
DROP FUNCTION IF EXISTS public.get_guest_appointment_confirmation(p_id uuid);
DROP FUNCTION IF EXISTS public.admin_notify_on_user_insert();
DROP FUNCTION IF EXISTS public.admin_notify_on_newsletter_change();
DROP FUNCTION IF EXISTS public.admin_notify_on_guest_appointment_insert();
DROP FUNCTION IF EXISTS pgbouncer.get_auth(p_usename text);
DROP FUNCTION IF EXISTS graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb);
DROP FUNCTION IF EXISTS extensions.set_graphql_placeholder();
DROP FUNCTION IF EXISTS extensions.pgrst_drop_watch();
DROP FUNCTION IF EXISTS extensions.pgrst_ddl_watch();
DROP FUNCTION IF EXISTS extensions.grant_pg_net_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_graphql_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_cron_access();
DROP FUNCTION IF EXISTS auth.uid();
DROP FUNCTION IF EXISTS auth.role();
DROP FUNCTION IF EXISTS auth.jwt();
DROP FUNCTION IF EXISTS auth.email();
DROP TYPE IF EXISTS storage.buckettype;
DROP TYPE IF EXISTS realtime.wal_rls;
DROP TYPE IF EXISTS realtime.wal_column;
DROP TYPE IF EXISTS realtime.user_defined_filter;
DROP TYPE IF EXISTS realtime.equality_op;
DROP TYPE IF EXISTS realtime.action;
DROP TYPE IF EXISTS auth.one_time_token_type;
DROP TYPE IF EXISTS auth.oauth_response_type;
DROP TYPE IF EXISTS auth.oauth_registration_type;
DROP TYPE IF EXISTS auth.oauth_client_type;
DROP TYPE IF EXISTS auth.oauth_authorization_status;
DROP TYPE IF EXISTS auth.factor_type;
DROP TYPE IF EXISTS auth.factor_status;
DROP TYPE IF EXISTS auth.code_challenge_method;
DROP TYPE IF EXISTS auth.aal_level;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS supabase_vault;
DROP EXTENSION IF EXISTS pgcrypto;
DROP EXTENSION IF EXISTS pg_stat_statements;
DROP SCHEMA IF EXISTS vault;
DROP SCHEMA IF EXISTS storage;
DROP SCHEMA IF EXISTS realtime;
DROP SCHEMA IF EXISTS pgbouncer;
DROP SCHEMA IF EXISTS graphql_public;
DROP SCHEMA IF EXISTS graphql;
DROP SCHEMA IF EXISTS extensions;
DROP SCHEMA IF EXISTS auth;
--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: -
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: admin_notify_on_guest_appointment_insert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_notify_on_guest_appointment_insert() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, body, actor_user_id, metadata)
  VALUES (
    'guest.appointment_request',
    'Guest consultation request',
    concat(trim(NEW.first_name), ' ', trim(NEW.last_name), ' — ', to_char(NEW.appointment_date, 'YYYY-MM-DD'), ' ', NEW.appointment_time),
    NEW.created_by,
    jsonb_build_object(
      'guest_appointment_id', NEW.id,
      'email', NEW.email,
      'city', NEW.city,
      'state', NEW.state,
      'category', NEW.category,
      'professional_id', NEW.professional_id
    )
  );
  RETURN NEW;
END;
$$;


--
-- Name: admin_notify_on_newsletter_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_notify_on_newsletter_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_type TEXT;
  v_title TEXT;
  v_body TEXT;
  v_actor UUID := auth.uid();
  v_prev TEXT := CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END;
BEGIN
  -- actor_user_id FKs public.users; clear it when no app-level row exists for the auth user.
  IF v_actor IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_actor) THEN
    v_actor := NULL;
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_type := 'newsletter.subscribed';
    v_title := 'New newsletter subscription';
    v_body := NEW.email || ' subscribed to the newsletter.';
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
      RETURN NEW;
    END IF;
    IF NEW.status = 'unsubscribed' THEN
      v_type := 'newsletter.unsubscribed';
      v_title := 'Newsletter unsubscribe';
      v_body := NEW.email || ' unsubscribed from the newsletter.';
    ELSIF NEW.status = 'resubscribed' THEN
      v_type := 'newsletter.resubscribed';
      v_title := 'Newsletter resubscribe';
      v_body := NEW.email || ' resubscribed to the newsletter.';
    ELSIF NEW.status = 'active' AND OLD.status IN ('unsubscribed', 'resubscribed') THEN
      v_type := 'newsletter.resubscribed';
      v_title := 'Newsletter reactivated';
      v_body := NEW.email || ' was reactivated.';
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.admin_notifications (type, title, body, actor_user_id, metadata)
  VALUES (
    v_type,
    v_title,
    v_body,
    v_actor,
    jsonb_build_object(
      'subscriber_id', NEW.id,
      'email', NEW.email,
      'status', NEW.status,
      'previous_status', v_prev
    )
  );
  RETURN NEW;
END;
$$;


--
-- Name: admin_notify_on_user_insert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_notify_on_user_insert() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.admin_notifications (type, title, body, actor_user_id, metadata)
  VALUES (
    'user.registered',
    'New user registered',
    concat(NEW.name, ' (', NEW.role, ')'),
    NEW.id,
    jsonb_build_object('user_id', NEW.id, 'email', NEW.email, 'role', NEW.role)
  );
  RETURN NEW;
END;
$$;


--
-- Name: get_guest_appointment_confirmation(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_guest_appointment_confirmation(p_id uuid) RETURNS json
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT json_build_object(
    'id', g.id,
    'category', g.category,
    'appointment_date', g.appointment_date,
    'appointment_time', g.appointment_time,
    'professional_id', g.professional_id
  )
  FROM public.guest_appointments g
  WHERE g.id = p_id
  LIMIT 1;
$$;


--
-- Name: get_newsletter_status(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_newsletter_status(p_email text) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_status TEXT;
BEGIN
  IF p_email IS NULL OR length(trim(p_email)) = 0 THEN
    RETURN NULL;
  END IF;
  SELECT status
    INTO v_status
    FROM public.newsletter_subscribers
   WHERE lower(email) = lower(trim(p_email))
   LIMIT 1;
  RETURN v_status;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  insert into public.users (
    id,
    name,
    email,
    role,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name','User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role','client'),
    now(),
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


--
-- Name: set_newsletter_status(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_newsletter_status(p_email text, p_status text) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  affected INT;
BEGIN
  IF p_status NOT IN ('active', 'unsubscribed') THEN
    RAISE EXCEPTION 'Invalid newsletter status: %', p_status USING ERRCODE = '22023';
  END IF;
  IF p_email IS NULL OR length(trim(p_email)) = 0 THEN
    RAISE EXCEPTION 'Email is required' USING ERRCODE = '22023';
  END IF;

  UPDATE public.newsletter_subscribers
     SET status = p_status
   WHERE lower(email) = lower(trim(p_email));

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;


--
-- Name: subscribe_newsletter(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.subscribe_newsletter(p_email text) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
DECLARE
  v_normalized TEXT;
  v_existing_status TEXT;
BEGIN
  v_normalized := lower(trim(coalesce(p_email, '')));

  IF length(v_normalized) = 0 OR length(v_normalized) > 320 THEN
    RAISE EXCEPTION 'Invalid email' USING ERRCODE = '22023';
  END IF;
  IF v_normalized !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email' USING ERRCODE = '22023';
  END IF;

  SELECT status
    INTO v_existing_status
    FROM public.newsletter_subscribers
   WHERE lower(email) = v_normalized
   LIMIT 1;

  IF v_existing_status IN ('active', 'resubscribed') THEN
    RETURN 'already_active';
  ELSIF v_existing_status = 'unsubscribed' THEN
    UPDATE public.newsletter_subscribers
       SET status = 'resubscribed',
           subscribed_at = NOW()
     WHERE lower(email) = v_normalized;
    RETURN 'resubscribed';
  ELSE
    INSERT INTO public.newsletter_subscribers (email, status, subscribed_at)
    VALUES (v_normalized, 'active', NOW());
    RETURN 'subscribed';
  END IF;
END;
$_$;


--
-- Name: try_newsletter_rate_limit(text, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.try_newsletter_rate_limit(p_bucket_key text, p_max_attempts integer, p_window_seconds integer) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_count INT;
  v_window_start TIMESTAMPTZ;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  IF p_bucket_key IS NULL OR length(trim(p_bucket_key)) = 0 THEN
    RETURN FALSE;
  END IF;
  IF p_max_attempts IS NULL OR p_max_attempts < 1 OR p_window_seconds IS NULL OR p_window_seconds < 1 THEN
    RAISE EXCEPTION 'Invalid rate limit parameters' USING ERRCODE = '22023';
  END IF;

  SELECT attempt_count, window_start
    INTO v_count, v_window_start
    FROM public.newsletter_rate_limits
   WHERE bucket_key = p_bucket_key
   FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.newsletter_rate_limits (bucket_key, attempt_count, window_start)
    VALUES (p_bucket_key, 1, v_now);
    RETURN TRUE;
  END IF;

  IF v_window_start + (p_window_seconds || ' seconds')::INTERVAL <= v_now THEN
    UPDATE public.newsletter_rate_limits
       SET attempt_count = 1,
           window_start = v_now
     WHERE bucket_key = p_bucket_key;
    RETURN TRUE;
  END IF;

  IF v_count >= p_max_attempts THEN
    RETURN FALSE;
  END IF;

  UPDATE public.newsletter_rate_limits
     SET attempt_count = attempt_count + 1
   WHERE bucket_key = p_bucket_key;

  RETURN TRUE;
END;
$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
    -- Regclass of the table e.g. public.notes
    entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

    -- I, U, D, T: insert, update ...
    action realtime.action = (
        case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
        end
    );

    -- Is row level security enabled for the table
    is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

    subscriptions realtime.subscription[] = array_agg(subs)
        from
            realtime.subscription subs
        where
            subs.entity = entity_
            -- Filter by action early - only get subscriptions interested in this action
            -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
            and (subs.action_filter = '*' or subs.action_filter = action::text);

    -- Subscription vars
    working_role regrole;
    working_selected_columns text[];
    claimed_role regrole;
    claims jsonb;

    subscription_id uuid;
    subscription_has_access bool;
    visible_to_subscription_ids uuid[] = '{}';

    -- structured info for wal's columns
    columns realtime.wal_column[];
    -- previous identity values for update/delete
    old_columns realtime.wal_column[];

    error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

    -- Primary jsonb output for record
    output jsonb;

    -- Loop record for iterating unique roles (outer loop)
    role_record record;
    -- Loop record for iterating unique selected_columns within a role (inner loop)
    cols_record record;
    -- Subscription ids visible at the role level (before fanning out by selected_columns)
    visible_role_sub_ids uuid[] = '{}';

begin
    perform set_config('role', null, true);

    columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    old_columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    for role_record in
        select claims_role
        from (select distinct claims_role from unnest(subscriptions)) t
        order by claims_role::text
    loop
        working_role := role_record.claims_role;

        -- Update `is_selectable` for columns and old_columns (once per role)
        columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(columns) c;

        old_columns =
                array_agg(
                    (
                        c.name,
                        c.type_name,
                        c.type_oid,
                        c.value,
                        c.is_pkey,
                        pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                    )::realtime.wal_column
                )
                from
                    unnest(old_columns) c;

        if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            -- Fan out 400 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 400: Bad Request, no primary key']
                )::realtime.wal_rls;
            end loop;

        -- The claims role does not have SELECT permission to the primary key of entity
        elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            -- Fan out 401 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 401: Unauthorized']
                )::realtime.wal_rls;
            end loop;

        else
            -- Create the prepared statement (once per role)
            if is_rls_enabled and action <> 'DELETE' then
                if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                    deallocate walrus_rls_stmt;
                end if;
                execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            -- Collect all visible subscription IDs for this role (filter check + RLS check)
            visible_role_sub_ids = '{}';

            for subscription_id, claims in (
                    select
                        subs.subscription_id,
                        subs.claims
                    from
                        unnest(subscriptions) subs
                    where
                        subs.entity = entity_
                        and subs.claims_role = working_role
                        and (
                            realtime.is_visible_through_filters(columns, subs.filters)
                            or (
                              action = 'DELETE'
                              and realtime.is_visible_through_filters(old_columns, subs.filters)
                            )
                        )
            ) loop

                if not is_rls_enabled or action = 'DELETE' then
                    visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                else
                    -- Check if RLS allows the role to see the record
                    perform
                        -- Trim leading and trailing quotes from working_role because set_config
                        -- doesn't recognize the role as valid if they are included
                        set_config('role', trim(both '"' from working_role::text), true),
                        set_config('request.jwt.claims', claims::text, true);

                    execute 'execute walrus_rls_stmt' into subscription_has_access;

                    if subscription_has_access then
                        visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                    end if;
                end if;
            end loop;

            perform set_config('role', null, true);

            -- Inner loop: per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;

                output = jsonb_build_object(
                    'schema', wal ->> 'schema',
                    'table', wal ->> 'table',
                    'type', action,
                    'commit_timestamp', to_char(
                        ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                    ),
                    'columns', (
                        select
                            jsonb_agg(
                                jsonb_build_object(
                                    'name', pa.attname,
                                    'type', pt.typname
                                )
                                order by pa.attnum asc
                            )
                        from
                            pg_attribute pa
                            join pg_type pt
                                on pa.atttypid = pt.oid
                            left join (
                                select unnest(conkey) as pkey_attnum
                                from pg_constraint
                                where conrelid = entity_ and contype = 'p'
                            ) pk on pk.pkey_attnum = pa.attnum
                        where
                            attrelid = entity_
                            and attnum > 0
                            and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
                            and (working_selected_columns is null or pa.attname = any(working_selected_columns) or pk.pkey_attnum is not null)
                    )
                )
                -- Add "record" key for insert and update
                || case
                    when action in ('INSERT', 'UPDATE') then
                        jsonb_build_object(
                            'record',
                            (
                                select
                                    jsonb_object_agg(
                                        -- if unchanged toast, get column name and value from old record
                                        coalesce((c).name, (oc).name),
                                        case
                                            when (c).name is null then (oc).value
                                            else (c).value
                                        end
                                    )
                                from
                                    unnest(columns) c
                                    full outer join unnest(old_columns) oc
                                        on (c).name = (oc).name
                                where
                                    coalesce((c).is_selectable, (oc).is_selectable)
                                    and (working_selected_columns is null or coalesce((c).name, (oc).name) = any(working_selected_columns) or coalesce((c).is_pkey, (oc).is_pkey))
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            )
                        )
                    else '{}'::jsonb
                end
                -- Add "old_record" key for update and delete
                || case
                    when action = 'UPDATE' then
                        jsonb_build_object(
                                'old_record',
                                (
                                    select jsonb_object_agg((c).name, (c).value)
                                    from unnest(old_columns) c
                                    where
                                        (c).is_selectable
                                        and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                        and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                )
                            )
                    when action = 'DELETE' then
                        jsonb_build_object(
                            'old_record',
                            (
                                select jsonb_object_agg((c).name, (c).value)
                                from unnest(old_columns) c
                                where
                                    (c).is_selectable
                                    and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                    and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                            )
                        )
                    else '{}'::jsonb
                end;

                -- Filter visible_role_sub_ids to those matching the current selected_columns group
                visible_to_subscription_ids = coalesce(
                    (
                        select array_agg(s.subscription_id)
                        from unnest(subscriptions) s
                        where s.claims_role = working_role
                          and (s.selected_columns is not distinct from working_selected_columns)
                          and s.subscription_id = any(visible_role_sub_ids)
                    ),
                    '{}'::uuid[]
                );

                return next (
                    output,
                    is_rls_enabled,
                    visible_to_subscription_ids,
                    case
                        when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                        else '{}'
                    end
                )::realtime.wal_rls;
            end loop;

        end if;
    end loop;

    perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  SELECT
    realtime.wal2json_escape_identifier(nsp.nspname::text)
    || '.'
    || realtime.wal2json_escape_identifier(pc.relname::text)
  FROM pg_class pc
  JOIN pg_namespace nsp ON pc.relnamespace = nsp.oid
  WHERE pc.oid = entity
$$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: send_binary(bytea, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, binary_payload, event, topic, private, extension)
    VALUES (generated_id, payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    col_names text[] = coalesce(
            array_agg(c.column_name order by c.ordinal_position),
            '{}'::text[]
        )
        from
            information_schema.columns c
        where
            format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
            and pg_catalog.has_column_privilege(
                (new.claims ->> 'role'),
                format('%I.%I', c.table_schema, c.table_name)::regclass,
                c.column_name,
                'SELECT'
            );
    table_col_names text[] = coalesce(
            array_agg(pa.attname),
            '{}'::text[]
        )
        from
            pg_attribute pa
        where
            pa.attrelid = new.entity
            and pa.attnum > 0;
    filter realtime.user_defined_filter;
    col_type regtype;
    in_val jsonb;
    selected_col text;
begin
    for filter in select * from unnest(new.filters) loop
        -- Filtered column is valid
        if not filter.column_name = any(col_names) then
            raise exception 'invalid column for filter %', filter.column_name;
        end if;

        -- Type is sanitized and safe for string interpolation
        col_type = (
            select atttypid::regtype
            from pg_catalog.pg_attribute
            where attrelid = new.entity
                  and attname = filter.column_name
        );
        if col_type is null then
            raise exception 'failed to lookup type for column %', filter.column_name;
        end if;
        if filter.op = 'in'::realtime.equality_op then
            in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
            if coalesce(jsonb_array_length(in_val), 0) > 100 then
                raise exception 'too many values for `in` filter. Maximum 100';
            end if;
        else
            -- raises an exception if value is not coercable to type
            perform realtime.cast(filter.value, col_type);
        end if;
    end loop;

    -- Validate that selected_columns reference columns the role can SELECT
    if new.selected_columns is not null then
        for selected_col in select * from unnest(new.selected_columns) loop
            if not selected_col = any(col_names) then
                raise exception 'invalid column for select %', selected_col;
            end if;
        end loop;
    end if;

    -- Apply consistent order to filters so the unique constraint on
    -- (subscription_id, entity, filters) can't be tricked by a different filter order
    new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value),
        '{}'
    ) from unnest(new.filters) f;

    -- Normalize selected_columns order so ARRAY['a','b'] and ARRAY['b','a'] are
    -- treated as the same subscription group in apply_rls
    new.selected_columns = (
        select array_agg(c order by c)
        from unnest(new.selected_columns) c
    );

    return new;
end;
$$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: wal2json_escape_identifier(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.wal2json_escape_identifier(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  -- Prefix `\`, `,`, `.`, and any whitespace with `\`
  SELECT regexp_replace(name, '([\\,.[:space:]])', '\\\1', 'g')
$$;


--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


--
-- Name: admin_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    body text,
    actor_user_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    professional_id uuid NOT NULL,
    appointment_type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    notes text,
    meeting_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: client_medical_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_medical_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    date_of_birth text,
    gender text,
    blood_type text,
    height text,
    weight text,
    address text,
    city text,
    state text,
    postal_code text,
    emergency_contact_name text,
    emergency_contact_phone text,
    emergency_contact_relationship text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: google_calendar_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.google_calendar_connections (
    user_id uuid NOT NULL,
    refresh_token text NOT NULL,
    access_token text,
    token_expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: google_meet_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.google_meet_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_by uuid NOT NULL,
    google_event_id text NOT NULL,
    meet_link text NOT NULL,
    html_link text,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    attendee_emails text[] DEFAULT '{}'::text[] NOT NULL,
    guest_appointment_ids uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    summary text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: guest_appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guest_appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    age integer NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    category text NOT NULL,
    state text NOT NULL,
    city text NOT NULL,
    appointment_date date NOT NULL,
    appointment_time text NOT NULL,
    message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    professional_id uuid,
    calendar_invite_url text,
    prescription_html text,
    prescription_updated_at timestamp with time zone,
    CONSTRAINT guest_appointments_age_check CHECK (((age >= 0) AND (age <= 120)))
);


--
-- Name: COLUMN guest_appointments.professional_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.guest_appointments.professional_id IS 'Professional (users.id) the patient requested when booking via consultant deeplink; null for generic bookings.';


--
-- Name: COLUMN guest_appointments.calendar_invite_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.guest_appointments.calendar_invite_url IS 'Pre-built calendar.google.com TEMPLATE link; shown as copy-only once set.';


--
-- Name: COLUMN guest_appointments.prescription_html; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.guest_appointments.prescription_html IS 'Rich HTML prescription written by assigned professional.';


--
-- Name: COLUMN guest_appointments.prescription_updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.guest_appointments.prescription_updated_at IS 'Timestamp when prescription_html was last updated.';


--
-- Name: insurance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.insurance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    provider_name text NOT NULL,
    policy_number text NOT NULL,
    group_number text,
    policy_holder_name text NOT NULL,
    relationship_to_holder text,
    expiration_date text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    notes text
);


--
-- Name: medical_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medical_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    document_name text NOT NULL,
    document_type text NOT NULL,
    file_url text NOT NULL,
    file_size integer,
    upload_date timestamp with time zone DEFAULT now() NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: medical_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medical_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    condition_name text NOT NULL,
    diagnosis_date text,
    status text DEFAULT 'active'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: medications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    medication_name text NOT NULL,
    dosage text NOT NULL,
    frequency text NOT NULL,
    start_date text NOT NULL,
    end_date text,
    prescribing_doctor text,
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: newsletter_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter_campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subject text NOT NULL,
    body_html text NOT NULL,
    sent_by uuid,
    recipient_ids integer[] DEFAULT '{}'::integer[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: newsletter_rate_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter_rate_limits (
    bucket_key text NOT NULL,
    attempt_count integer DEFAULT 0 NOT NULL,
    window_start timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter_subscribers (
    id integer NOT NULL,
    email text NOT NULL,
    subscribed_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'active'::text NOT NULL
);


--
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.newsletter_subscribers ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.newsletter_subscribers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: professional_availability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_availability (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    start_time text NOT NULL,
    end_time text NOT NULL,
    is_available boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: professional_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    specialization text NOT NULL,
    license_number text NOT NULL,
    bio text,
    years_of_experience integer,
    consultation_fee integer,
    is_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    city text,
    name_title text
);


--
-- Name: COLUMN professional_profiles.name_title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.professional_profiles.name_title IS 'Salutation shown before legal name (e.g. Dr., Mr., Mrs.)';


--
-- Name: professional_qualifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_qualifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    degree text NOT NULL,
    institution text NOT NULL,
    year integer,
    document_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    document_approved boolean
);


--
-- Name: COLUMN professional_qualifications.document_approved; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.professional_qualifications.document_approved IS 'NULL pending review; TRUE show verification link; FALSE not approved';


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    image text,
    role text DEFAULT 'client'::text NOT NULL,
    phone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    phone_country_code text,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['client'::text, 'professional'::text, 'admin'::text])))
);


--
-- Name: COLUMN users.phone; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.phone IS 'National subscriber number (digits only), without country code.';


--
-- Name: COLUMN users.phone_country_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.phone_country_code IS 'E.164 dial prefix, e.g. +91; national number stored in phone.';


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    selected_columns text[],
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
d1260aec-43b1-47d1-8dc3-754d1c1481bf	9510a2a3-8186-46b0-ac25-d3760612aabc	a3022d0a-6ed3-449b-a7fd-abecea177ad7	s256	X6cZew6jM3hvraK7_HWECIBpcLkmzIn0N4lqJ8Ram2Q	email			2026-03-02 07:41:00.386807+00	2026-03-02 07:41:11.431532+00	email/signup	2026-03-02 07:41:11.431474+00	\N	\N	\N	\N	f
a3c05e25-2d3e-44ab-8033-f15c778aebf1	b9d2077d-69b6-44ba-8c5b-34f960c795e3	d6ceb98e-cc18-41d1-8528-34e0d4cd00ab	s256	Wk7Sw7PqnHrjnHB5XCR0RLyK4rcCEDCbM6dI7I3gqF0	email			2026-04-04 10:53:15.133305+00	2026-04-04 10:54:09.413629+00	email/signup	2026-04-04 10:54:09.413555+00	\N	\N	\N	\N	f
b5575d35-bf81-4340-9cab-e480d1c37a10	05cbe7bb-2908-4619-8fc8-0e2c82c8d792	26ce7a03-7d14-45e8-8cc9-c0d13b3507ba	s256	pBbvre51unLE7YRAbafYRlqb4AIe2Yei5-snoE85jF8	email			2026-04-04 13:52:20.565188+00	2026-04-04 13:53:16.253546+00	email/signup	2026-04-04 13:53:16.253494+00	\N	\N	\N	\N	f
1f51abcf-0ad5-46d6-bb0b-e11f71785687	06db9b38-80e1-4933-b020-17d9c9dff899	1141eba8-0d9a-40f5-a537-236da66b584a	s256	6dGEJuYfT3pkd2gr1gJNfeTf5Dxq0t5ibAm1s1DixDw	email			2026-04-07 10:55:23.361424+00	2026-04-07 10:55:53.66822+00	email/signup	2026-04-07 10:55:53.667773+00	\N	\N	\N	\N	f
74f9dd1e-91d7-464f-bfc2-845e88839946	21ffa85f-d84e-49b0-be7f-062710fedf4f	06f465b6-d5c3-4285-9854-e93a1b706795	s256	aC02WpMuucL38CC-hT64vfXTptWCkVxHLB8EdcsGyR8	email			2026-05-01 10:28:13.302473+00	2026-05-01 10:36:18.678151+00	email/signup	2026-05-01 10:36:18.677452+00	\N	\N	\N	\N	f
5034c354-3e1e-45ea-a77e-9a1c05f58dba	cef0b74f-ea58-429f-b67a-7e3758d333e9	70ae86e1-0142-46ea-9f02-cb452b6ee7c6	s256	QBQPmWFtnlZJlTfwMTZarRK_o_LFZQcovuASiXGC-3w	email			2026-05-01 10:50:16.249706+00	2026-05-01 10:50:35.433215+00	email/signup	2026-05-01 10:50:35.433145+00	\N	\N	\N	\N	f
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
3bd77851-510e-469a-ab79-87d591d90cad	3bd77851-510e-469a-ab79-87d591d90cad	{"sub": "3bd77851-510e-469a-ab79-87d591d90cad", "name": "sgsgdsvybr", "role": "client", "email": "harsh.ixora@gmail.com", "email_verified": true, "phone_verified": false}	email	2026-03-01 17:23:13.200889+00	2026-03-01 17:23:13.200951+00	2026-03-01 17:23:13.200951+00	6c309983-3f29-46f9-ae84-8cf75939ddcc
9510a2a3-8186-46b0-ac25-d3760612aabc	9510a2a3-8186-46b0-ac25-d3760612aabc	{"sub": "9510a2a3-8186-46b0-ac25-d3760612aabc", "name": "Harsh", "role": "professional", "email": "harsh1248gupta@gmail.com", "email_verified": true, "phone_verified": false}	email	2026-03-02 07:41:00.380119+00	2026-03-02 07:41:00.380169+00	2026-03-02 07:41:00.380169+00	6ea5393c-f7c9-4406-9e3e-7426be494a45
cf2e5e84-fcde-4e13-936b-6ab146b8c638	cf2e5e84-fcde-4e13-936b-6ab146b8c638	{"sub": "cf2e5e84-fcde-4e13-936b-6ab146b8c638", "email": "admin@healthcare.com", "email_verified": false, "phone_verified": false}	email	2026-03-09 06:32:16.007702+00	2026-03-09 06:32:16.008239+00	2026-03-09 06:32:16.008239+00	bd12b77d-3a20-4118-a707-92d486414bd7
b9d2077d-69b6-44ba-8c5b-34f960c795e3	b9d2077d-69b6-44ba-8c5b-34f960c795e3	{"sub": "b9d2077d-69b6-44ba-8c5b-34f960c795e3", "name": "Vishal Gupta", "role": "professional", "email": "vishalcric.dav@gmail.com", "email_verified": true, "phone_verified": false}	email	2026-04-04 10:53:15.117475+00	2026-04-04 10:53:15.117528+00	2026-04-04 10:53:15.117528+00	70d6f24a-b966-458c-aaa7-67a53f24469f
05cbe7bb-2908-4619-8fc8-0e2c82c8d792	05cbe7bb-2908-4619-8fc8-0e2c82c8d792	{"sub": "05cbe7bb-2908-4619-8fc8-0e2c82c8d792", "name": "Testing  news ", "role": "client", "email": "harsh2901.websenor@gmail.com", "email_verified": true, "phone_verified": false}	email	2026-04-04 13:52:20.55898+00	2026-04-04 13:52:20.559043+00	2026-04-04 13:52:20.559043+00	cf69c84d-c674-42ef-8dac-1549df6a42ae
06db9b38-80e1-4933-b020-17d9c9dff899	06db9b38-80e1-4933-b020-17d9c9dff899	{"sub": "06db9b38-80e1-4933-b020-17d9c9dff899", "name": "Lisha Khatri", "role": "professional", "email": "mindfulhealiing@gmail.com", "email_verified": true, "phone_verified": false}	email	2026-04-07 10:55:23.357639+00	2026-04-07 10:55:23.357686+00	2026-04-07 10:55:23.357686+00	f046eebb-a557-432c-adab-90393c86460b
21ffa85f-d84e-49b0-be7f-062710fedf4f	21ffa85f-d84e-49b0-be7f-062710fedf4f	{"sub": "21ffa85f-d84e-49b0-be7f-062710fedf4f", "name": "Aditya Jain", "role": "professional", "email": "aditya.jain00712@gmail.com", "email_verified": true, "phone_verified": false}	email	2026-05-01 10:28:13.292422+00	2026-05-01 10:28:13.292881+00	2026-05-01 10:28:13.292881+00	c33ccf03-6570-458c-ad33-7474a563493f
cef0b74f-ea58-429f-b67a-7e3758d333e9	cef0b74f-ea58-429f-b67a-7e3758d333e9	{"sub": "cef0b74f-ea58-429f-b67a-7e3758d333e9", "name": "sdsdsdsdsddsd sdsddsd", "role": "professional", "email": "xagela3703@gixpos.com", "email_verified": true, "phone_verified": false}	email	2026-05-01 10:50:16.23477+00	2026-05-01 10:50:16.234823+00	2026-05-01 10:50:16.234823+00	be177d0e-4f12-44b1-aba3-4581700e84fe
8a5ec858-3b61-453a-aa19-008680673ebc	8a5ec858-3b61-453a-aa19-008680673ebc	{"sub": "8a5ec858-3b61-453a-aa19-008680673ebc", "name": "Mansi M", "role": "client", "email": "mansimeena2326@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-05-07 18:56:25.751334+00	2026-05-07 18:56:25.751382+00	2026-05-07 18:56:25.751382+00	a48acc37-c791-4935-b46b-0b5c8ac3ce16
522a7a77-91fe-4419-bdbf-8341d9bddfeb	522a7a77-91fe-4419-bdbf-8341d9bddfeb	{"sub": "522a7a77-91fe-4419-bdbf-8341d9bddfeb", "name": "teset testes", "role": "client", "email": "harsh.ixora@gmail.comg", "email_verified": false, "phone_verified": false}	email	2026-05-14 11:16:53.994291+00	2026-05-14 11:16:53.994341+00	2026-05-14 11:16:53.994341+00	5eb2332e-3607-4c24-83c1-82d2b4474102
6ee89e3c-d5cd-4788-a281-9459b6d4502d	6ee89e3c-d5cd-4788-a281-9459b6d4502d	{"sub": "6ee89e3c-d5cd-4788-a281-9459b6d4502d", "name": "Rishabh  Jain", "role": "professional", "email": "ujjaineye@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-05-20 07:18:12.090166+00	2026-05-20 07:18:12.090794+00	2026-05-20 07:18:12.090794+00	e280467a-9eb1-4ac2-a8f1-a54082a2eeba
278dd7ce-5591-458b-bde4-396e619ecc9f	278dd7ce-5591-458b-bde4-396e619ecc9f	{"sub": "278dd7ce-5591-458b-bde4-396e619ecc9f", "name": "Siddhant Mukherjee", "role": "professional", "email": "siddhant.sid1005@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-05-21 17:36:56.25143+00	2026-05-21 17:36:56.25148+00	2026-05-21 17:36:56.25148+00	b59cfdb0-69cb-4360-b239-3705d7d0dccb
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
6681a323-fdaf-4516-a4bd-8b325b0b84f5	2026-05-15 13:44:44.545139+00	2026-05-15 13:44:44.545139+00	password	8178389b-d58f-46c5-9969-acb766ebf26a
aecc0ca5-d93a-456f-bf58-b6bf753dfff5	2026-04-04 13:53:39.337673+00	2026-04-04 13:53:39.337673+00	password	b8b6a73e-1cb7-44e3-87f9-12f930325d7a
502144ba-fa08-4844-856e-c96922bf4e41	2026-04-07 10:56:50.224896+00	2026-04-07 10:56:50.224896+00	password	250586df-0c75-4954-8918-db3123678ab0
ee349dc8-e0f4-4567-8e83-fbf74079ac95	2026-05-18 08:33:47.668563+00	2026-05-18 08:33:47.668563+00	password	3ea517d6-d360-47a8-a403-23519467693d
ca1ce062-c27c-4cf0-9305-ce721b2fcf86	2026-05-20 07:18:12.153069+00	2026-05-20 07:18:12.153069+00	password	bc4f3f7d-7a3d-464e-a9db-259412e7d103
09f15c81-856f-4560-b644-fdb001b51169	2026-05-20 17:19:04.654378+00	2026-05-20 17:19:04.654378+00	password	bad0faef-36f6-4925-a5df-873e615190b1
803e25b7-4d90-43ec-b762-f46f440ebf60	2026-05-21 17:36:56.308318+00	2026-05-21 17:36:56.308318+00	password	cd57bc69-9ca7-419a-954f-d2da80ac27e0
5f7fc417-c823-4e15-a185-4c7dc4f86ef0	2026-05-21 18:36:52.716194+00	2026-05-21 18:36:52.716194+00	password	99f56d53-b083-4d2c-ac05-c738e8038c9d
61b70ed0-2788-4d0d-9694-a5577e644833	2026-06-04 06:45:09.863781+00	2026-06-04 06:45:09.863781+00	password	7f1019c4-7bfa-45aa-9f15-bc358e5d260b
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	177	glfnvfk3pcg4	9510a2a3-8186-46b0-ac25-d3760612aabc	f	2026-05-18 08:33:47.609861+00	2026-05-18 08:33:47.609861+00	\N	ee349dc8-e0f4-4567-8e83-fbf74079ac95
00000000-0000-0000-0000-000000000000	51	rbry4gt7tgqx	06db9b38-80e1-4933-b020-17d9c9dff899	t	2026-04-13 08:01:20.195047+00	2026-04-13 09:07:18.536136+00	xerj5ozaglki	502144ba-fa08-4844-856e-c96922bf4e41
00000000-0000-0000-0000-000000000000	179	lom5cynhsp3q	6ee89e3c-d5cd-4788-a281-9459b6d4502d	t	2026-05-20 07:18:12.14076+00	2026-05-20 09:14:52.984457+00	\N	ca1ce062-c27c-4cf0-9305-ce721b2fcf86
00000000-0000-0000-0000-000000000000	183	hozvofvwbsz6	9510a2a3-8186-46b0-ac25-d3760612aabc	f	2026-05-20 17:19:04.632889+00	2026-05-20 17:19:04.632889+00	\N	09f15c81-856f-4560-b644-fdb001b51169
00000000-0000-0000-0000-000000000000	53	uahgucixxfs6	06db9b38-80e1-4933-b020-17d9c9dff899	t	2026-04-13 09:07:18.551274+00	2026-04-13 11:49:38.504121+00	rbry4gt7tgqx	502144ba-fa08-4844-856e-c96922bf4e41
00000000-0000-0000-0000-000000000000	180	pccsto7kj2y7	6ee89e3c-d5cd-4788-a281-9459b6d4502d	t	2026-05-20 09:14:53.003998+00	2026-05-21 04:35:31.178963+00	lom5cynhsp3q	ca1ce062-c27c-4cf0-9305-ce721b2fcf86
00000000-0000-0000-0000-000000000000	190	k6fhzizcsvhg	278dd7ce-5591-458b-bde4-396e619ecc9f	f	2026-05-21 17:36:56.29579+00	2026-05-21 17:36:56.29579+00	\N	803e25b7-4d90-43ec-b762-f46f440ebf60
00000000-0000-0000-0000-000000000000	184	cg6dy3nazpmf	6ee89e3c-d5cd-4788-a281-9459b6d4502d	t	2026-05-21 04:35:31.194691+00	2026-05-21 18:12:02.406864+00	pccsto7kj2y7	ca1ce062-c27c-4cf0-9305-ce721b2fcf86
00000000-0000-0000-0000-000000000000	170	oqxy7zfa7gxl	8a5ec858-3b61-453a-aa19-008680673ebc	t	2026-05-15 18:23:39.019196+00	2026-05-21 18:30:19.626451+00	u6qupmz4wvdb	6681a323-fdaf-4516-a4bd-8b325b0b84f5
00000000-0000-0000-0000-000000000000	192	7tsjcsicz4ml	8a5ec858-3b61-453a-aa19-008680673ebc	f	2026-05-21 18:30:19.650311+00	2026-05-21 18:30:19.650311+00	oqxy7zfa7gxl	6681a323-fdaf-4516-a4bd-8b325b0b84f5
00000000-0000-0000-0000-000000000000	191	3outznunt3sb	6ee89e3c-d5cd-4788-a281-9459b6d4502d	t	2026-05-21 18:12:02.440133+00	2026-05-21 19:36:46.908803+00	cg6dy3nazpmf	ca1ce062-c27c-4cf0-9305-ce721b2fcf86
00000000-0000-0000-0000-000000000000	60	at5k3gu5fgey	06db9b38-80e1-4933-b020-17d9c9dff899	t	2026-04-13 11:49:38.516571+00	2026-04-19 08:50:04.361618+00	uahgucixxfs6	502144ba-fa08-4844-856e-c96922bf4e41
00000000-0000-0000-0000-000000000000	72	z4vo6ncuhlea	06db9b38-80e1-4933-b020-17d9c9dff899	t	2026-04-19 08:50:04.384141+00	2026-04-19 08:54:36.26992+00	at5k3gu5fgey	502144ba-fa08-4844-856e-c96922bf4e41
00000000-0000-0000-0000-000000000000	193	wootvigjbiso	8a5ec858-3b61-453a-aa19-008680673ebc	t	2026-05-21 18:36:52.656909+00	2026-05-22 02:51:43.582227+00	\N	5f7fc417-c823-4e15-a185-4c7dc4f86ef0
00000000-0000-0000-0000-000000000000	73	pzyanft7idd4	06db9b38-80e1-4933-b020-17d9c9dff899	t	2026-04-19 08:54:36.355511+00	2026-04-19 15:02:39.066297+00	z4vo6ncuhlea	502144ba-fa08-4844-856e-c96922bf4e41
00000000-0000-0000-0000-000000000000	196	tbmxsk3alzkc	8a5ec858-3b61-453a-aa19-008680673ebc	f	2026-05-22 02:51:43.600215+00	2026-05-22 02:51:43.600215+00	wootvigjbiso	5f7fc417-c823-4e15-a185-4c7dc4f86ef0
00000000-0000-0000-0000-000000000000	74	syzzoyxoazx6	06db9b38-80e1-4933-b020-17d9c9dff899	t	2026-04-19 15:02:39.083753+00	2026-04-20 05:52:57.105779+00	pzyanft7idd4	502144ba-fa08-4844-856e-c96922bf4e41
00000000-0000-0000-0000-000000000000	75	rof4wbhthytp	06db9b38-80e1-4933-b020-17d9c9dff899	f	2026-04-20 05:52:57.127278+00	2026-04-20 05:52:57.127278+00	syzzoyxoazx6	502144ba-fa08-4844-856e-c96922bf4e41
00000000-0000-0000-0000-000000000000	195	l4p7tjh4sqme	6ee89e3c-d5cd-4788-a281-9459b6d4502d	t	2026-05-21 19:36:46.939649+00	2026-05-27 15:14:06.037885+00	3outznunt3sb	ca1ce062-c27c-4cf0-9305-ce721b2fcf86
00000000-0000-0000-0000-000000000000	197	rm6ovpwnnfoq	6ee89e3c-d5cd-4788-a281-9459b6d4502d	f	2026-05-27 15:14:06.06011+00	2026-05-27 15:14:06.06011+00	l4p7tjh4sqme	ca1ce062-c27c-4cf0-9305-ce721b2fcf86
00000000-0000-0000-0000-000000000000	201	ov23bpqem7nd	cf2e5e84-fcde-4e13-936b-6ab146b8c638	t	2026-06-04 06:45:09.84434+00	2026-06-04 08:52:42.301283+00	\N	61b70ed0-2788-4d0d-9694-a5577e644833
00000000-0000-0000-0000-000000000000	168	gpbf7gsmxooi	8a5ec858-3b61-453a-aa19-008680673ebc	t	2026-05-15 13:44:44.512883+00	2026-05-15 14:48:15.581816+00	\N	6681a323-fdaf-4516-a4bd-8b325b0b84f5
00000000-0000-0000-0000-000000000000	202	tbeembmo7igo	cf2e5e84-fcde-4e13-936b-6ab146b8c638	t	2026-06-04 08:52:42.321576+00	2026-06-04 09:59:29.345328+00	ov23bpqem7nd	61b70ed0-2788-4d0d-9694-a5577e644833
00000000-0000-0000-0000-000000000000	169	u6qupmz4wvdb	8a5ec858-3b61-453a-aa19-008680673ebc	t	2026-05-15 14:48:15.60365+00	2026-05-15 18:23:38.997811+00	gpbf7gsmxooi	6681a323-fdaf-4516-a4bd-8b325b0b84f5
00000000-0000-0000-0000-000000000000	203	we3ig5dftjvg	cf2e5e84-fcde-4e13-936b-6ab146b8c638	f	2026-06-04 09:59:29.358286+00	2026-06-04 09:59:29.358286+00	tbeembmo7igo	61b70ed0-2788-4d0d-9694-a5577e644833
00000000-0000-0000-0000-000000000000	40	wpxtkx4s2rle	05cbe7bb-2908-4619-8fc8-0e2c82c8d792	f	2026-04-04 13:53:39.33632+00	2026-04-04 13:53:39.33632+00	\N	aecc0ca5-d93a-456f-bf58-b6bf753dfff5
00000000-0000-0000-0000-000000000000	42	gtjykquphwin	06db9b38-80e1-4933-b020-17d9c9dff899	t	2026-04-07 10:56:50.198595+00	2026-04-08 12:44:10.272334+00	\N	502144ba-fa08-4844-856e-c96922bf4e41
00000000-0000-0000-0000-000000000000	43	ozuopva5njhu	06db9b38-80e1-4933-b020-17d9c9dff899	t	2026-04-08 12:44:10.294443+00	2026-04-10 04:51:31.869472+00	gtjykquphwin	502144ba-fa08-4844-856e-c96922bf4e41
00000000-0000-0000-0000-000000000000	44	mgo2vgxh6wlv	06db9b38-80e1-4933-b020-17d9c9dff899	t	2026-04-10 04:51:31.905639+00	2026-04-13 05:17:25.036473+00	ozuopva5njhu	502144ba-fa08-4844-856e-c96922bf4e41
00000000-0000-0000-0000-000000000000	45	3icto2mn4phy	06db9b38-80e1-4933-b020-17d9c9dff899	t	2026-04-13 05:17:25.063251+00	2026-04-13 06:55:44.07482+00	mgo2vgxh6wlv	502144ba-fa08-4844-856e-c96922bf4e41
00000000-0000-0000-0000-000000000000	49	xerj5ozaglki	06db9b38-80e1-4933-b020-17d9c9dff899	t	2026-04-13 06:55:44.09289+00	2026-04-13 08:01:20.167805+00	3icto2mn4phy	502144ba-fa08-4844-856e-c96922bf4e41
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
803e25b7-4d90-43ec-b762-f46f440ebf60	278dd7ce-5591-458b-bde4-396e619ecc9f	2026-05-21 17:36:56.283972+00	2026-05-21 17:36:56.283972+00	\N	aal1	\N	\N	node	32.198.88.220	\N	\N	\N	\N	\N
6681a323-fdaf-4516-a4bd-8b325b0b84f5	8a5ec858-3b61-453a-aa19-008680673ebc	2026-05-15 13:44:44.488779+00	2026-05-21 18:30:21.61164+00	\N	aal1	\N	2026-05-21 18:30:21.611541	node	44.220.181.48	\N	\N	\N	\N	\N
5f7fc417-c823-4e15-a185-4c7dc4f86ef0	8a5ec858-3b61-453a-aa19-008680673ebc	2026-05-21 18:36:52.544047+00	2026-05-22 02:51:46.668332+00	\N	aal1	\N	2026-05-22 02:51:46.666879	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1	38.183.11.96	\N	\N	\N	\N	\N
502144ba-fa08-4844-856e-c96922bf4e41	06db9b38-80e1-4933-b020-17d9c9dff899	2026-04-07 10:56:50.175099+00	2026-04-20 05:53:02.931612+00	\N	aal1	\N	2026-04-20 05:53:02.931501	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	49.36.177.39	\N	\N	\N	\N	\N
ca1ce062-c27c-4cf0-9305-ce721b2fcf86	6ee89e3c-d5cd-4788-a281-9459b6d4502d	2026-05-20 07:18:12.130086+00	2026-05-27 15:14:11.872886+00	\N	aal1	\N	2026-05-27 15:14:11.872224	node	3.215.73.149	\N	\N	\N	\N	\N
61b70ed0-2788-4d0d-9694-a5577e644833	cf2e5e84-fcde-4e13-936b-6ab146b8c638	2026-06-04 06:45:09.817838+00	2026-06-04 09:59:33.882169+00	\N	aal1	\N	2026-06-04 09:59:33.88207	node	125.20.69.26	\N	\N	\N	\N	\N
ee349dc8-e0f4-4567-8e83-fbf74079ac95	9510a2a3-8186-46b0-ac25-d3760612aabc	2026-05-18 08:33:47.545112+00	2026-05-18 08:33:47.545112+00	\N	aal1	\N	\N	node	3.95.151.144	\N	\N	\N	\N	\N
aecc0ca5-d93a-456f-bf58-b6bf753dfff5	05cbe7bb-2908-4619-8fc8-0e2c82c8d792	2026-04-04 13:53:39.331304+00	2026-04-04 13:53:39.331304+00	\N	aal1	\N	\N	node	122.168.84.84	\N	\N	\N	\N	\N
09f15c81-856f-4560-b644-fdb001b51169	9510a2a3-8186-46b0-ac25-d3760612aabc	2026-05-20 17:19:04.610754+00	2026-05-20 17:19:04.610754+00	\N	aal1	\N	\N	node	122.168.86.237	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	05cbe7bb-2908-4619-8fc8-0e2c82c8d792	authenticated	authenticated	harsh2901.websenor@gmail.com	$2a$10$uNjmy/DS4gjZgRhAbwmALuafjtcaadyNxK7UgqALKvwgltXBQtEzu	2026-04-04 13:53:16.240309+00	\N		2026-04-04 13:52:20.583033+00		\N			\N	2026-04-04 13:53:39.331215+00	{"provider": "email", "providers": ["email"]}	{"sub": "05cbe7bb-2908-4619-8fc8-0e2c82c8d792", "name": "Testing  news ", "role": "client", "email": "harsh2901.websenor@gmail.com", "email_verified": true, "phone_verified": false}	\N	2026-04-04 13:52:20.486304+00	2026-04-04 13:53:39.33732+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	522a7a77-91fe-4419-bdbf-8341d9bddfeb	authenticated	authenticated	harsh.ixora@gmail.comg	$2a$10$/NKPPq76Z.En8AW.fp.gbOzmB/kSMWREy3vdN8HMKyDU1rGWvTXEm	2026-05-14 11:16:54.003431+00	\N		\N		\N			\N	2026-05-14 11:16:54.016686+00	{"provider": "email", "providers": ["email"]}	{"sub": "522a7a77-91fe-4419-bdbf-8341d9bddfeb", "name": "teset testes", "role": "client", "email": "harsh.ixora@gmail.comg", "email_verified": true, "phone_verified": false}	\N	2026-05-14 11:16:53.925448+00	2026-05-14 11:16:54.038464+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	06db9b38-80e1-4933-b020-17d9c9dff899	authenticated	authenticated	mindfulhealiing@gmail.com	$2a$10$2wtuB9N6dAufdfdW86hG9OzRD17s9HHVn.aW3v8oMK63THEaujywC	2026-04-07 10:55:53.639503+00	\N		2026-04-07 10:55:23.377783+00		\N			\N	2026-04-07 10:56:50.175004+00	{"provider": "email", "providers": ["email"]}	{"sub": "06db9b38-80e1-4933-b020-17d9c9dff899", "name": "Lisha Khatri", "role": "professional", "email": "mindfulhealiing@gmail.com", "image": "https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/profiles/06db9b38-80e1-4933-b020-17d9c9dff899/1775652368109.webp", "name_title": "Ms.", "email_verified": true, "phone_verified": false}	\N	2026-04-07 10:55:23.316713+00	2026-04-20 05:52:57.137124+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	8a5ec858-3b61-453a-aa19-008680673ebc	authenticated	authenticated	mansimeena2326@gmail.com	$2a$10$AxUi/eQO4PNwZyXIZkineubzUkqXd8RzEuNRPqewQQGLPlekt8Rji	2026-05-07 18:56:25.761691+00	\N		\N		\N			\N	2026-05-21 18:36:52.543627+00	{"provider": "email", "providers": ["email"]}	{"sub": "8a5ec858-3b61-453a-aa19-008680673ebc", "name": "Mansi M", "role": "client", "email": "mansimeena2326@gmail.com", "image": "https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/profiles/8a5ec858-3b61-453a-aa19-008680673ebc/1778439297725.webp", "email_verified": true, "phone_verified": false}	\N	2026-05-07 18:56:25.61029+00	2026-05-22 02:51:43.608484+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	cf2e5e84-fcde-4e13-936b-6ab146b8c638	authenticated	authenticated	admin@healthcare.com	$2a$10$SKsI5nauSDzMqNTSwCnTZ.UeKvgUq0M5HpMvLC0N18oILqJve5a3.	2026-03-09 06:32:16.012695+00	\N		\N		\N			\N	2026-06-04 06:45:09.817739+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-09 06:32:15.998703+00	2026-06-04 09:59:29.364019+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	b9d2077d-69b6-44ba-8c5b-34f960c795e3	authenticated	authenticated	vishalcric.dav@gmail.com	$2a$10$t/w4.UC1Ci.6ZpWexufgMO1LxYWsCszCXhRD0ByacFAaD.lIhOnFK	2026-04-04 10:54:09.312503+00	\N		2026-04-04 10:53:15.188963+00		\N			\N	2026-05-16 09:25:37.454074+00	{"provider": "email", "providers": ["email"]}	{"sub": "b9d2077d-69b6-44ba-8c5b-34f960c795e3", "name": "Vishal Gupta", "role": "professional", "email": "vishalcric.dav@gmail.com", "image": "https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/profiles/b9d2077d-69b6-44ba-8c5b-34f960c795e3/1777630856177.webp", "name_title": "Mr.", "email_verified": true, "phone_verified": false}	\N	2026-04-04 10:53:15.030113+00	2026-05-16 09:25:37.513967+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	3bd77851-510e-469a-ab79-87d591d90cad	authenticated	authenticated	harsh.ixora@gmail.com	$2a$10$eiu0wYqnQ164dx2zZKwOC.9y0oYlieH3RTrpp5NsOhx7Cyzs5FUd6	2026-03-01 17:27:48.849508+00	\N		2026-03-01 17:23:13.230507+00		\N			\N	2026-05-21 15:54:05.115353+00	{"provider": "email", "providers": ["email"]}	{"sub": "3bd77851-510e-469a-ab79-87d591d90cad", "name": "sgsgdsvybr", "role": "client", "email": "harsh.ixora@gmail.com", "image": "https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/profiles/3bd77851-510e-469a-ab79-87d591d90cad/1776086543948.webp", "email_verified": true, "phone_verified": false}	\N	2026-03-01 17:23:13.154971+00	2026-05-30 05:26:44.520083+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	21ffa85f-d84e-49b0-be7f-062710fedf4f	authenticated	authenticated	aditya.jain00712@gmail.com	$2a$10$eoMP5D5AX8fhiOYlTrm9S.VzetutvCBf3/R2Eq7E2u34SSQ79KgYa	2026-05-01 10:36:18.645718+00	\N		2026-05-01 10:28:13.317568+00		\N			\N	2026-05-20 07:14:52.567994+00	{"provider": "email", "providers": ["email"]}	{"sub": "21ffa85f-d84e-49b0-be7f-062710fedf4f", "name": "Aditya Jain", "role": "professional", "email": "aditya.jain00712@gmail.com", "name_title": "Dr.", "email_verified": true, "phone_verified": false}	\N	2026-05-01 10:28:13.254445+00	2026-05-20 07:14:52.614558+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	cef0b74f-ea58-429f-b67a-7e3758d333e9	authenticated	authenticated	xagela3703@gixpos.com	$2a$10$ccedI0fz1Z.NIgaCvC6esupafshZCeSeF.FWhwfWlq9/AMqATiM3C	2026-05-01 10:50:35.415384+00	\N		2026-05-01 10:50:16.265803+00		\N			\N	2026-05-18 08:00:04.48104+00	{"provider": "email", "providers": ["email"]}	{"sub": "cef0b74f-ea58-429f-b67a-7e3758d333e9", "name": "sdsdsdsdsddsd sdsddsd", "role": "professional", "email": "xagela3703@gixpos.com", "email_verified": true, "phone_verified": false}	\N	2026-05-01 10:50:16.128713+00	2026-05-18 08:00:04.536539+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	9510a2a3-8186-46b0-ac25-d3760612aabc	authenticated	authenticated	harsh1248gupta@gmail.com	$2a$10$KXcnnJjmYDoG/roL4wbkJOErFuMD66NhEMZFaN9ZdN.lWSqZFV9q6	2026-03-02 07:41:11.393403+00	\N		2026-03-02 07:41:00.399569+00		\N			\N	2026-05-20 17:19:04.609361+00	{"provider": "email", "providers": ["email"]}	{"sub": "9510a2a3-8186-46b0-ac25-d3760612aabc", "name": "Harsh", "role": "professional", "email": "harsh1248gupta@gmail.com", "image": "https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/profiles/9510a2a3-8186-46b0-ac25-d3760612aabc/1776084934982.webp", "name_title": "Prof.", "email_verified": true, "phone_verified": false}	\N	2026-03-02 07:41:00.35222+00	2026-05-20 17:19:04.650082+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	278dd7ce-5591-458b-bde4-396e619ecc9f	authenticated	authenticated	siddhant.sid1005@gmail.com	$2a$10$b2tEtzUOkkWSkpifYNxkJu0uQ9cmFkidBPo.KuxJPkyXj1kUiAyHK	2026-05-21 17:36:56.267801+00	\N		\N		\N			\N	2026-05-21 17:36:56.283879+00	{"provider": "email", "providers": ["email"]}	{"sub": "278dd7ce-5591-458b-bde4-396e619ecc9f", "name": "Siddhant Mukherjee", "role": "professional", "email": "siddhant.sid1005@gmail.com", "email_verified": true, "phone_verified": false}	\N	2026-05-21 17:36:56.18781+00	2026-05-21 17:36:56.307723+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	6ee89e3c-d5cd-4788-a281-9459b6d4502d	authenticated	authenticated	ujjaineye@gmail.com	$2a$10$XADD717BD5dhOhtfnLA68uONlq/9tRdSvSY.0LQeh4WIVTvmxRAeq	2026-05-20 07:18:12.107835+00	\N		\N		\N			\N	2026-05-20 07:18:12.129311+00	{"provider": "email", "providers": ["email"]}	{"sub": "6ee89e3c-d5cd-4788-a281-9459b6d4502d", "name": "Rishabh  Jain", "role": "professional", "email": "ujjaineye@gmail.com", "email_verified": true, "phone_verified": false}	\N	2026-05-20 07:18:11.995381+00	2026-05-27 15:14:06.076622+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: admin_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_notifications (id, type, title, body, actor_user_id, metadata, read_at, created_at) FROM stdin;
829986f3-7f3c-47eb-ba5f-773684754c72	professional.profile_updated	Professional: profile updated	Harsh has updated specialization from Neurologist to Psychiatrist.\nHarsh has updated name title (salutation) from Dr. to Prof..	9510a2a3-8186-46b0-ac25-d3760612aabc	{"changes": [{"to": "Psychiatrist", "from": "Neurologist", "label": "specialization"}, {"to": "Prof.", "from": "Dr.", "label": "name title (salutation)"}], "section": "profile", "actor_name": "Harsh", "actor_role": "professional"}	2026-05-01 13:55:48.065+00	2026-05-01 13:53:16.859502+00
4a42b750-853d-4102-99f3-be674b2ed507	user.registered	New user registered	Mansi M (client)	8a5ec858-3b61-453a-aa19-008680673ebc	{"role": "client", "email": "mansimeena2326@gmail.com", "user_id": "8a5ec858-3b61-453a-aa19-008680673ebc"}	2026-05-07 19:01:26.363+00	2026-05-07 18:56:25.607723+00
a34f886f-4344-4bc7-8c75-c3954d2b2666	guest.appointment_request	Guest consultation request	Mansi Meena — 2026-05-08 11:00	8a5ec858-3b61-453a-aa19-008680673ebc	{"city": "Chandigarh", "email": "mansimeena2326@gmail.com", "state": "Chandigarh", "category": "Mental Health", "professional_id": "b9d2077d-69b6-44ba-8c5b-34f960c795e3", "guest_appointment_id": "8c8b430b-06d9-4e22-8122-5ea7514feed6"}	2026-05-07 19:01:29.178+00	2026-05-07 18:59:45.259668+00
61bcb9e9-93a3-44d3-8b30-c52697791bfb	guest.appointment_request	Guest consultation request	Mansi Meena — 2026-05-08 11:00	8a5ec858-3b61-453a-aa19-008680673ebc	{"city": "Chandigarh", "email": "mansimeena2326@gmail.com", "state": "Chandigarh", "category": "Mental Health", "professional_id": "b9d2077d-69b6-44ba-8c5b-34f960c795e3", "guest_appointment_id": "cd4ce140-0be5-40d3-87f7-0f556e5924bd"}	2026-05-07 19:01:31.503+00	2026-05-07 19:00:16.803107+00
63f20531-7c04-42f7-b7cb-4d60c8d2a7f8	newsletter.unsubscribed	Newsletter unsubscribe	harsh2902@gmail.com unsubscribed from the newsletter.	cf2e5e84-fcde-4e13-936b-6ab146b8c638	{"email": "harsh2902@gmail.com", "status": "unsubscribed", "subscriber_id": 8, "previous_status": "active"}	2026-05-11 08:27:33.513+00	2026-05-10 15:26:04.184369+00
e1e308f3-3242-4016-8c99-a7b67ea24b52	newsletter.unsubscribed	Newsletter unsubscribe	harsh.wooden@mail.com unsubscribed from the newsletter.	cf2e5e84-fcde-4e13-936b-6ab146b8c638	{"email": "harsh.wooden@mail.com", "status": "unsubscribed", "subscriber_id": 7, "previous_status": "resubscribed"}	2026-05-11 08:27:33.513+00	2026-05-10 15:26:09.015117+00
bf368553-0b3a-4e9d-b8ff-fa96cdfe88fa	user.profile_image_updated	Profile photo updated	A user uploaded or changed their profile image.	8a5ec858-3b61-453a-aa19-008680673ebc	{}	2026-05-11 08:27:33.513+00	2026-05-10 18:55:01.766086+00
675882bd-847c-40e9-b2c7-2a366d29003b	newsletter.subscribed	New newsletter subscription	ipotech24@gmail.com subscribed to the newsletter.	\N	{"email": "ipotech24@gmail.com", "status": "active", "subscriber_id": 9, "previous_status": null}	2026-05-11 08:27:33.513+00	2026-05-11 05:33:00.552619+00
6e3f3cb4-e8b8-4ba4-8888-327d392ebae5	newsletter.unsubscribed	Newsletter unsubscribe	ipotech24@gmail.com unsubscribed from the newsletter.	cf2e5e84-fcde-4e13-936b-6ab146b8c638	{"email": "ipotech24@gmail.com", "status": "unsubscribed", "subscriber_id": 9, "previous_status": "active"}	2026-05-11 08:27:33.513+00	2026-05-11 05:37:24.110667+00
2797e290-142b-4c88-9d16-9536d9498287	newsletter.subscribed	New newsletter subscription	ipotech24@gmail.com subscribed to the newsletter.	\N	{"email": "ipotech24@gmail.com", "status": "active", "subscriber_id": 10, "previous_status": null}	2026-05-11 08:27:33.513+00	2026-05-11 05:37:43.435667+00
8c40eecb-ddb0-430e-955d-aff322473bbc	newsletter.resubscribed	Newsletter resubscribe	harsh.ixora@gmail.com resubscribed to the newsletter.	\N	{"email": "harsh.ixora@gmail.com", "status": "resubscribed", "subscriber_id": 3, "previous_status": "unsubscribed"}	2026-05-11 08:27:33.513+00	2026-05-11 05:43:20.788652+00
fe51c5a8-0274-4234-a9b7-dea2ee409ea7	newsletter.subscribed	New newsletter subscription	harsh.wooden@gmail.com subscribed to the newsletter.	\N	{"email": "harsh.wooden@gmail.com", "status": "active", "subscriber_id": 11, "previous_status": null}	2026-05-11 08:27:33.513+00	2026-05-11 05:45:00.588557+00
1d63f375-de73-4ea4-84ab-cd3bbc24811d	user.registered	New user registered	teset testes (client)	522a7a77-91fe-4419-bdbf-8341d9bddfeb	{"role": "client", "email": "harsh.ixora@gmail.comg", "user_id": "522a7a77-91fe-4419-bdbf-8341d9bddfeb"}	2026-05-16 09:06:01.028+00	2026-05-14 11:16:53.925047+00
84d1f829-2d22-445a-9688-159de1ccfdd4	guest.appointment_request	Guest consultation request	Charchita Gupta — 2026-05-23 15:30	\N	{"city": "Indore", "email": "charchita1597@gmail.com", "state": "Madhya Pradesh", "category": "Women's Health", "professional_id": null, "guest_appointment_id": "95791710-98a1-4458-b211-c636d992833e"}	2026-05-16 09:06:01.028+00	2026-05-15 05:21:42.490288+00
e74c9c90-df1c-4978-8cf7-c9643db71460	guest.appointment_request	Guest consultation request	Charchita Gupta — 2026-05-23 15:30	\N	{"city": "Indore", "email": "charchita1597@gmail.com", "state": "Madhya Pradesh", "category": "Women's Health", "professional_id": null, "guest_appointment_id": "6fb3a098-a9d3-42f6-984c-6b9ffadc2997"}	2026-05-16 09:06:01.028+00	2026-05-15 05:21:43.691149+00
ea242ea5-1ecb-44b2-b9c8-dbe6a5ca54d1	newsletter.subscribed	New newsletter subscription	mansimeena2326@gmail.com subscribed to the newsletter.	8a5ec858-3b61-453a-aa19-008680673ebc	{"email": "mansimeena2326@gmail.com", "status": "active", "subscriber_id": 12, "previous_status": null}	2026-05-16 09:06:01.028+00	2026-05-15 14:56:40.594928+00
eb2452f2-605d-402a-b05f-79e1423ce762	user.registered	New user registered	sdsdsdsdsddsd sdsddsd (professional)	cef0b74f-ea58-429f-b67a-7e3758d333e9	{"role": "professional", "email": "xagela3703@gixpos.com", "user_id": "cef0b74f-ea58-429f-b67a-7e3758d333e9"}	2026-05-21 08:38:24.933+00	2026-05-16 11:00:23.553147+00
48785dce-9ce1-437e-99a7-3be88bd7a650	guest.appointment_request	Guest consultation request	sdsdsdsdsddsd sdsddsd — 2026-05-22 14:00	cef0b74f-ea58-429f-b67a-7e3758d333e9	{"city": "Ujjain", "email": "xagela3703@gixpos.com", "state": "Ujjain", "category": "Rehabilitation counsellor", "professional_id": "b9d2077d-69b6-44ba-8c5b-34f960c795e3", "guest_appointment_id": "eac11ef4-88e4-422f-a52b-7ecd0e4d9f9b"}	2026-05-21 08:38:24.933+00	2026-05-16 11:37:44.248022+00
609df667-e5d6-4f38-b9c7-af4ff7674067	guest.appointment_request	Guest consultation request	sdsdsdsdsddsd sdsddsd — 2026-05-29 14:00	cef0b74f-ea58-429f-b67a-7e3758d333e9	{"city": "Ujjain", "email": "xagela3703@gixpos.com", "state": "Ujjain", "category": "Rehabilitation counsellor", "professional_id": "b9d2077d-69b6-44ba-8c5b-34f960c795e3", "guest_appointment_id": "ef5bb75f-d628-4b2c-8c57-177f7f143296"}	2026-05-21 08:38:24.933+00	2026-05-16 11:42:35.051972+00
c2e97eb0-d7e7-4de0-8bfe-9f522a92b125	guest.appointment_request	Guest consultation request	Harsh Gupta — 2026-05-26 18:00	\N	{"city": "Indore", "email": "harsh.ixora@gmail.com", "state": "Madhya Pradesh", "category": "Mental Health", "professional_id": null, "guest_appointment_id": "8e929f26-402f-4fd2-845f-da7c2fd32bda"}	2026-05-21 08:38:24.933+00	2026-05-16 12:04:35.702595+00
88eb5989-c74f-4885-a2cc-5d6789c56f18	user.registered	New user registered	Rishabh  Jain (professional)	6ee89e3c-d5cd-4788-a281-9459b6d4502d	{"role": "professional", "email": "ujjaineye@gmail.com", "user_id": "6ee89e3c-d5cd-4788-a281-9459b6d4502d"}	2026-05-21 08:38:24.933+00	2026-05-20 07:18:11.991717+00
b2d6d207-eaf8-4eb0-b4da-ae63c020419c	newsletter.subscribed	New newsletter subscription	harsh.ixora@gmail.comaa subscribed to the newsletter.	\N	{"email": "harsh.ixora@gmail.comaa", "status": "active", "subscriber_id": 13, "previous_status": null}	2026-05-21 08:38:24.933+00	2026-05-20 15:22:50.1933+00
765a87d6-2d87-4407-a6b4-5671c054d5f2	newsletter.subscribed	New newsletter subscription	harsh.ixora@gmail.comhh subscribed to the newsletter.	\N	{"email": "harsh.ixora@gmail.comhh", "status": "active", "subscriber_id": 14, "previous_status": null}	2026-05-21 08:38:24.933+00	2026-05-20 15:23:17.890246+00
61177216-c5b2-43be-9c87-a2c7477282d7	newsletter.subscribed	New newsletter subscription	harsh.ixora@gmail.comas subscribed to the newsletter.	\N	{"email": "harsh.ixora@gmail.comas", "status": "active", "subscriber_id": 15, "previous_status": null}	2026-05-21 08:38:24.933+00	2026-05-20 15:23:27.890535+00
a09a2988-433c-4b5d-835b-67fa99cbab22	newsletter.subscribed	New newsletter subscription	harsh.ixora@gmail.comaai subscribed to the newsletter.	\N	{"email": "harsh.ixora@gmail.comaai", "status": "active", "subscriber_id": 16, "previous_status": null}	2026-05-21 08:38:24.933+00	2026-05-20 15:23:37.370557+00
4c500a2d-058b-45c4-9de1-ee39c32a28d8	professional.calendar_slot_removed	Calendar: weekly slot removed	Harsh removed Monday 09:00–17:00.	9510a2a3-8186-46b0-ac25-d3760612aabc	{"section": "calendar", "actor_name": "Harsh", "actor_role": "professional", "day_of_week": 1}	2026-05-21 08:38:24.933+00	2026-05-20 17:25:32.038758+00
34d6e777-c335-4ac3-97d6-a8c1e3082797	professional.calendar_slot_removed	Calendar: weekly slot removed	Harsh removed Monday 09:00–17:00.	9510a2a3-8186-46b0-ac25-d3760612aabc	{"section": "calendar", "actor_name": "Harsh", "actor_role": "professional", "day_of_week": 1}	2026-05-21 08:38:24.933+00	2026-05-20 17:25:34.791126+00
be53acef-c826-4ab9-bb3e-6cfd7c8eee25	user.registered	New user registered	Siddhant Mukherjee (professional)	278dd7ce-5591-458b-bde4-396e619ecc9f	{"role": "professional", "email": "siddhant.sid1005@gmail.com", "user_id": "278dd7ce-5591-458b-bde4-396e619ecc9f"}	2026-05-21 18:47:22.656+00	2026-05-21 17:36:56.186569+00
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointments (id, client_id, professional_id, appointment_type, status, start_time, end_time, notes, meeting_url, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: client_medical_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.client_medical_profiles (id, user_id, date_of_birth, gender, blood_type, height, weight, address, city, state, postal_code, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, created_at, updated_at) FROM stdin;
9b449b38-0967-4f39-bf66-e33a44c8bc23	8a5ec858-3b61-453a-aa19-008680673ebc	1998-12-09	female	A+	152	47	552, Greater Kailash Colony, Jandli	Ambala City	Haryana	134003	Vishal Gupta	9981322736	Partner	2026-05-10 18:52:08.171577+00	2026-05-10 18:52:07.732+00
40e2d981-7755-46cc-93a8-6439b5b0291f	3bd77851-510e-469a-ab79-87d591d90cad	2026-05-01	male	A-	567	78	tes	ttr	tttftft	5436545	ggcfgh	675767556556776566	sterytuwru	2026-05-12 09:50:03.791546+00	2026-05-12 09:50:03.553+00
\.


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_messages (id, email, subject, message, created_at) FROM stdin;
b60cef7f-d630-49f2-be6a-e76bfa61e1bd	harsh.ixora@gmail.com	Testing	Testing is the main	2026-03-02 10:47:42.312727+00
56399a6b-38de-441d-9283-786c9a671a67	fdfdfd@fdfdf.dfdf	fdfdfdff	dfdfdffdfdfdfdf	2026-03-28 15:19:54.697597+00
d5fc9abf-af47-47fe-866b-f7e5bd29e4c2	mansimeena2326@gmail.com	ABC	ABCDEFGHIJK	2026-05-07 19:08:34.727208+00
b7f91686-8a4a-4793-a779-b025d44533bb	harsh.ixora@gmail.com	sd sfsdfsdf sdfssdsd	sdfes tet esrt we	2026-05-08 05:26:47.026902+00
\.


--
-- Data for Name: google_calendar_connections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.google_calendar_connections (user_id, refresh_token, access_token, token_expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: google_meet_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.google_meet_events (id, created_by, google_event_id, meet_link, html_link, start_time, end_time, attendee_emails, guest_appointment_ids, summary, created_at) FROM stdin;
\.


--
-- Data for Name: guest_appointments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.guest_appointments (id, first_name, last_name, age, phone, email, category, state, city, appointment_date, appointment_time, message, created_at, created_by, professional_id, calendar_invite_url, prescription_html, prescription_updated_at) FROM stdin;
2ad25f25-c680-4e32-bf9d-0bdea013a313	Harsh	Gupta	43	8787878878	harsh.ixora@gmail.com	Mental Health	Rajasthan	Kota	2026-05-01	09:25	sdsddsdsdddsdsdsd	2026-04-30 15:52:33.787814+00	3bd77851-510e-469a-ab79-87d591d90cad	06db9b38-80e1-4933-b020-17d9c9dff899	https://calendar.google.com/calendar/render?action=TEMPLATE&text=Consultation+Meeting&dates=20260501T035500Z%2F20260501T045500Z&add=harsh.ixora%40gmail.com&add=mindfulhealiing%40gmail.com	\N	\N
2cde652d-e3ab-4404-a947-e7da58552670	Harsh	Gfdf 	34	4343434343	dkfkdf@fksefk.aaawea	Bone & Joint Pain	Rajasthan	Udaipur	2026-04-01	08:33	testing 	2026-03-29 12:01:15.808907+00	\N	06db9b38-80e1-4933-b020-17d9c9dff899	https://calendar.google.com/calendar/render?action=TEMPLATE&text=Consultation+Meeting&dates=20260401T030300Z%2F20260401T040300Z&add=dkfkdf%40fksefk.aaawea&add=mindfulhealiing%40gmail.com	\N	\N
8c8b430b-06d9-4e22-8122-5ea7514feed6	Mansi	Meena	27	7988425220	mansimeena2326@gmail.com	Mental Health	Chandigarh	Chandigarh	2026-05-08	11:00		2026-05-07 18:59:45.259668+00	8a5ec858-3b61-453a-aa19-008680673ebc	b9d2077d-69b6-44ba-8c5b-34f960c795e3	https://calendar.google.com/calendar/render?action=TEMPLATE&text=Consultation+Meeting&dates=20260508T053000Z%2F20260508T063000Z&add=mansimeena2326%40gmail.com&add=vishalcric.dav%40gmail.com	\N	\N
cd4ce140-0be5-40d3-87f7-0f556e5924bd	Mansi	Meena	27	7988425220	mansimeena2326@gmail.com	Mental Health	Chandigarh	Chandigarh	2026-05-08	11:00		2026-05-07 19:00:16.803107+00	8a5ec858-3b61-453a-aa19-008680673ebc	b9d2077d-69b6-44ba-8c5b-34f960c795e3	https://calendar.google.com/calendar/render?action=TEMPLATE&text=Consultation+Meeting&dates=20260508T053000Z%2F20260508T063000Z&add=mansimeena2326%40gmail.com&add=vishalcric.dav%40gmail.com	\N	\N
95791710-98a1-4458-b211-c636d992833e	Charchita 	Gupta	28	9425962160	charchita1597@gmail.com	Women's Health	Madhya Pradesh	Indore	2026-05-23	15:30		2026-05-15 05:21:42.490288+00	\N	\N	\N	\N	\N
6fb3a098-a9d3-42f6-984c-6b9ffadc2997	Charchita 	Gupta	28	9425962160	charchita1597@gmail.com	Women's Health	Madhya Pradesh	Indore	2026-05-23	15:30		2026-05-15 05:21:43.691149+00	\N	\N	\N	\N	\N
eac11ef4-88e4-422f-a52b-7ecd0e4d9f9b	sdsdsdsdsddsd	sdsddsd	34	3434343434	xagela3703@gixpos.com	Rehabilitation counsellor	Ujjain	Ujjain	2026-05-22	14:00	teefsfsdfd fbvdfvefe rfrrredg fdgdfg	2026-05-16 11:37:44.248022+00	cef0b74f-ea58-429f-b67a-7e3758d333e9	b9d2077d-69b6-44ba-8c5b-34f960c795e3	\N	\N	\N
ef5bb75f-d628-4b2c-8c57-177f7f143296	sdsdsdsdsddsd	sdsddsd	23	2324342325	xagela3703@gixpos.com	Rehabilitation counsellor	Ujjain	Ujjain	2026-05-29	14:00	ererer wer et ert er	2026-05-16 11:42:35.051972+00	cef0b74f-ea58-429f-b67a-7e3758d333e9	b9d2077d-69b6-44ba-8c5b-34f960c795e3	https://meet.jit.si/HealthHere-ef5bb75fd628	\N	\N
8e929f26-402f-4fd2-845f-da7c2fd32bda	Harsh	Gupta	34	2354234523	harsh.ixora@gmail.com	Mental Health	Madhya Pradesh	Indore	2026-05-26	18:00	this is the without login testing 	2026-05-16 12:04:35.702595+00	\N	9510a2a3-8186-46b0-ac25-d3760612aabc	https://meet.jit.si/HealthHere-8e929f26402f	\N	\N
19ed1951-c426-4ebd-bbf0-3d459cb03089	Harsh	Gupta	34	4344343444	harsh.ixora@gmail.com	Psychiatric Care	Rajasthan	Udaipur	2026-03-26	03:24	sdsdsd	2026-03-22 09:59:12.359493+00	3bd77851-510e-469a-ab79-87d591d90cad	9510a2a3-8186-46b0-ac25-d3760612aabc	https://meet.jit.si/HealthHere-19ed1951c426	<p class="mb-1 text-[14px] leading-relaxed text-slate-800" style="text-align: center;"><b><strong class="font-bold" style="white-space: pre-wrap;">Harsh Gupta</strong></b></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800" style="text-align: center;"><span style="white-space: pre-wrap;">33/515, Kotri, Kota, 324007 (Raj.)</span></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800" style="text-align: center;"><span style="white-space: pre-wrap;"> +91 8764485661  </span><a href="mailto:harsh1248gupta@gmail.com" class="text-indigo-600 underline underline-offset-2"><span style="white-space: pre-wrap;">harsh1248gupta@gmail.com  harsh29.vercel.app</span></a></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><br></p><h1 class="text-2xl font-bold mb-2 text-slate-900"><b><strong class="font-bold" style="white-space: pre-wrap;">SUMMARY</strong></b></h1><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Experienced Flutter Developer with 3 years of developing and deploying high- performance mobile applications for Android and iOS using Flutter, Dart, Java, Kotlin, and Swift. Skilled in MVVM, MVC, and multithreading for responsive and scalable apps.</span></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800" style="text-align: justify;"><span style="white-space: pre-wrap;">Proficient in Flutter, Firebase, Android SDK, iOS SDK, and back-end technologies. Strong background in fintech, educational, and e-commerce applications, with a focus on clean, maintainable, and user-friendly solutions</span></p><h1 class="text-2xl font-bold mb-2 text-slate-900"><b><strong class="font-bold" style="white-space: pre-wrap;">EDUCATION</strong></b></h1><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><b><strong class="font-bold" style="white-space: pre-wrap;">CAREER POINT UNIVERSITY</strong></b><span style="white-space: pre-wrap;">\t</span><span style="white-space: pre-wrap;">2019 - 2023</span></p><h2 class="text-xl font-bold mb-2 text-slate-900"><i><em class="italic" style="white-space: pre-wrap;">B. Tech. in Computer Science</em></i></h2><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Secured 8.2 CGPA</span></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><b><strong class="font-bold" style="white-space: pre-wrap;">SHREE RAM SR. SEC. SCHOOL, UDAIPUR (RAJ.)</strong></b><span style="white-space: pre-wrap;">\t</span><span style="white-space: pre-wrap;">2018 - 2019</span></p><h2 class="text-xl font-bold mb-2 text-slate-900"><i><em class="italic" style="white-space: pre-wrap;">Higher Secondary Certificate in Science</em></i></h2><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">secured 61.40%</span></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><br></p><h1 class="text-2xl font-bold mb-2 text-slate-900"><b><strong class="font-bold" style="white-space: pre-wrap;">WORK EXPERIENCE</strong></b></h1><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><b><strong class="font-bold" style="white-space: pre-wrap;">GyaniTalk OPC PVT LTD</strong></b><span style="white-space: pre-wrap;">\t</span><span style="white-space: pre-wrap;">Nov 2024 - Present</span></p><h2 class="text-xl font-bold mb-2 text-slate-900"><i><em class="italic" style="white-space: pre-wrap;">Senior Flutter Developer</em></i></h2><ul class="list-disc ml-6 mb-2"><li value="1" class="mb-0.5"><span style="white-space: pre-wrap;">Developing and maintaining high-performance Astrology Apps and handling Client Side Projects.</span></li><li value="2" class="mb-0.5"><span style="white-space: pre-wrap;">Enhancing and Optimising user experience and integrating new features for better engagement.</span></li></ul><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><br></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><b><strong class="font-bold" style="white-space: pre-wrap;">Cognus Technology (Gradding), WoodenStreet</strong></b><span style="white-space: pre-wrap;">\t</span><span style="white-space: pre-wrap;">Sep 2023 - Oct 2024</span></p><h2 class="text-xl font-bold mb-2 text-slate-900"><i><em class="italic" style="white-space: pre-wrap;">Executive Flutter Developer</em></i></h2><ul class="list-disc ml-6 mb-2"><li value="1" class="mb-0.5"><span style="white-space: pre-wrap;">Developed and launched an educational app for international student consultations.</span></li><li value="2" class="mb-0.5"><span style="white-space: pre-wrap;">Improved app usability, boosting engagement and user satisfaction.</span></li></ul><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><br></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><b><strong class="font-bold" style="white-space: pre-wrap;">IXORA INFOTECH PVT. LTD., INDORE</strong></b><span style="white-space: pre-wrap;">\t</span><span style="white-space: pre-wrap;">June 2023 - Sep 2023</span></p><h2 class="text-xl font-bold mb-2 text-slate-900"><i><em class="italic" style="white-space: pre-wrap;">Flutter Developer</em></i></h2><ul class="list-disc ml-6 mb-2"><li value="1" class="mb-0.5"><span style="white-space: pre-wrap;">Led development of App, managing the deployment of six Play Store apps.</span></li><li value="2" class="mb-0.5"><span style="white-space: pre-wrap;">Enhanced user engagement and app accessibility.</span></li></ul><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><br></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><b><strong class="font-bold" style="white-space: pre-wrap;">IXORA INFOTECH PVT. LTD., INDORE</strong></b><span style="white-space: pre-wrap;">\t</span><span style="white-space: pre-wrap;">July 2022 - Sep 2022</span></p><h2 class="text-xl font-bold mb-2 text-slate-900"><i><em class="italic" style="white-space: pre-wrap;">InternShip</em></i></h2><ul class="list-disc ml-6 mb-2"><li value="1" class="mb-0.5"><span style="white-space: pre-wrap;">Contributed to Android and web project development and testing.</span></li><li value="2" class="mb-0.5"><span style="white-space: pre-wrap;">Gained hands-on experience in application lifecycle management.</span></li></ul><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><br></p><h1 class="text-2xl font-bold mb-2 text-slate-900"><b><strong class="font-bold" style="white-space: pre-wrap;">SKILLS</strong></b></h1><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Application Development</span><span style="white-space: pre-wrap;">\t</span><span style="white-space: pre-wrap;">Flutter, Dart, Firebase, Java, Kotlin, Swift Frontend</span><span style="white-space: pre-wrap;">\t</span><span style="white-space: pre-wrap;">Bootstrap, Tailwind, NextJs</span></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><br></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Backend</span><span style="white-space: pre-wrap;">\t</span><span style="white-space: pre-wrap;">CodeIgniter3, MySQL, NodeJs, Prisma</span></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><br></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Development Tools</span><span style="white-space: pre-wrap;">\t</span><span style="white-space: pre-wrap;">Android Studio, Xcode, Swagger APIs, VS Code Networking</span><span style="white-space: pre-wrap;">\t</span><span style="white-space: pre-wrap;">WebSockets, TCP/IP, Wi-Fi APIs</span></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><br><br></p><h1 class="text-2xl font-bold mb-2 text-slate-900"><b><strong class="font-bold" style="white-space: pre-wrap;">PROJECTS</strong></b></h1><ol class="list-decimal ml-6 mb-2"><li value="1" class="mb-0.5"><b><strong class="font-bold" style="white-space: pre-wrap;">GyaniTalk</strong></b><span style="white-space: pre-wrap;">: Optimized the Astrology app by integrating Firebase for a smoother and more streamlined user experience. Added new features to improve real-time presence and keep users online within the app.</span></li><li value="2" class="mb-0.5"><b><strong class="font-bold" style="white-space: pre-wrap;">WoodenStreet</strong></b><span style="white-space: pre-wrap;">: Maintained and optimised an e-commerce app, enhancing user experience and integrating new features to improve performance and engagement.</span></li><li value="3" class="mb-0.5"><b><strong class="font-bold" style="white-space: pre-wrap;">IPO LIVE GMP</strong></b><span style="white-space: pre-wrap;">: Developed an app providing live IPO insights, GMP updates, and notifications to aid informed investments in Mainboard and SME IPOs.</span></li><li value="4" class="mb-0.5"><b><strong class="font-bold" style="white-space: pre-wrap;">Gradding</strong></b><span style="white-space: pre-wrap;">: Developed an educational app for international consultations, increasing client success rates.</span></li><li value="5" class="mb-0.5"><b><strong class="font-bold" style="white-space: pre-wrap;">Global Assignment Help</strong></b><span style="white-space: pre-wrap;">: Redesigned the assignment assistance platform and managed Play Store deployment.</span></li><li value="6" class="mb-0.5"><b><strong class="font-bold" style="white-space: pre-wrap;">MySIP Online</strong></b><span style="white-space: pre-wrap;">: Built a fintech platform to manage SIP and Lump Sum investments in mutual funds, improving investment tracking and user control.</span></li></ol>	2026-05-09 04:52:05.365+00
\.


--
-- Data for Name: insurance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.insurance (id, user_id, provider_name, policy_number, group_number, policy_holder_name, relationship_to_holder, expiration_date, created_at, updated_at, notes) FROM stdin;
76888c94-d50e-467d-bea4-8e2eba76471b	3bd77851-510e-469a-ab79-87d591d90cad	sf sf	sdfsf		sdf sf dsf		2026-05-08	2026-05-18 08:13:45.101458+00	2026-05-18 08:13:45.101458+00	
\.


--
-- Data for Name: medical_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.medical_documents (id, user_id, document_name, document_type, file_url, file_size, upload_date, notes, created_at, updated_at) FROM stdin;
a687c497-5a63-453e-9aff-3874a26237f9	3bd77851-510e-469a-ab79-87d591d90cad	sddsdd	imaging	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/medical-documents/3bd77851-510e-469a-ab79-87d591d90cad/4c8bd52799facc0de694824471d01eab.webp	181342	2026-05-18 08:13:25.093089+00		2026-05-18 08:13:25.093089+00	2026-05-18 08:13:25.093089+00
\.


--
-- Data for Name: medical_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.medical_history (id, user_id, condition_name, diagnosis_date, status, notes, created_at, updated_at) FROM stdin;
92de9d42-cc05-426d-9a68-df64a86d3621	3bd77851-510e-469a-ab79-87d591d90cad	dsdsdsad	2026-05-08	managed	sdsdd	2026-05-18 08:12:22.351387+00	2026-05-18 08:12:22.351387+00
\.


--
-- Data for Name: medications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.medications (id, user_id, medication_name, dosage, frequency, start_date, end_date, prescribing_doctor, notes, is_active, created_at, updated_at) FROM stdin;
8e6fa234-3ee4-45c0-9278-f7da0aeb5719	3bd77851-510e-469a-ab79-87d591d90cad	sdsds	sd	sd	2026-05-07				t	2026-05-18 08:12:42.410134+00	2026-05-18 08:12:42.410134+00
e94aed4f-20c4-4734-aefb-8d00bdcd7f6c	3bd77851-510e-469a-ab79-87d591d90cad	sdsdsdd	sdsd	sdsd	2026-05-01	2026-05-07			t	2026-05-18 08:12:53.585258+00	2026-05-18 08:12:53.585258+00
\.


--
-- Data for Name: newsletter_campaigns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.newsletter_campaigns (id, subject, body_html, sent_by, recipient_ids, created_at) FROM stdin;
2b104a02-800f-4b7a-83bb-bebdd8dc3d18	Testing Newletter	<p class="mb-1 text-[14px] leading-relaxed text-slate-800"><b><strong class="font-bold" style="white-space: pre-wrap;">Caring for Your Health, Every Step of the Way</strong></b></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Hello [First Name],</span></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Welcome to this month’s healthcare newsletter. Here’s the latest health information, clinic updates, and wellness tips from our team.</span></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><br></p><h2 class="text-xl font-bold mb-2 text-slate-900"><span style="white-space: pre-wrap;">🩺 Featured Health Topic</span></h2><h3 class="text-lg font-semibold mb-1 text-slate-900"><span style="white-space: pre-wrap;">[Headline Example: 5 Simple Ways to Improve Heart Health]</span></h3><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Brief introduction paragraph explaining why this topic matters to patients and families.</span></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><b><strong class="font-bold" style="white-space: pre-wrap;">Quick Tips:</strong></b></p><ul class="list-disc ml-6 mb-2"><li value="1" class="mb-0.5"><span style="white-space: pre-wrap;">Eat more fruits and vegetables</span></li><li value="2" class="mb-0.5"><span style="white-space: pre-wrap;">Stay active for at least 30 minutes daily</span></li><li value="3" class="mb-0.5"><span style="white-space: pre-wrap;">Monitor blood pressure regularly</span></li><li value="4" class="mb-0.5"><span style="white-space: pre-wrap;">Reduce stress and improve sleep</span></li><li value="5" class="mb-0.5"><span style="white-space: pre-wrap;">Schedule preventive checkups</span></li></ul><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><b><strong class="font-bold" style="white-space: pre-wrap;">Learn More:</strong></b><br><span style="white-space: pre-wrap;">[Insert website or appointment link]</span></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><br></p><h2 class="text-xl font-bold mb-2 text-slate-900"><span style="white-space: pre-wrap;">📢 Clinic &amp; Hospital Updates</span></h2><ul class="list-disc ml-6 mb-2"><li value="1" class="mb-0.5"><span style="white-space: pre-wrap;">New specialist joining our team: Dr. [Name]</span></li><li value="2" class="mb-0.5"><span style="white-space: pre-wrap;">Extended clinic hours now available</span></li><li value="3" class="mb-0.5"><span style="white-space: pre-wrap;">New telehealth appointments offered</span></li><li value="4" class="mb-0.5"><span style="white-space: pre-wrap;">Upcoming vaccination drive on [Date]</span></li></ul><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><br></p><h2 class="text-xl font-bold mb-2 text-slate-900"><span style="white-space: pre-wrap;">💡 Wellness Corner</span></h2><h3 class="text-lg font-semibold mb-1 text-slate-900"><span style="white-space: pre-wrap;">Healthy Habit of the Month</span></h3><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Share one practical wellness recommendation.</span></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Example:</span></p><blockquote class="border-l-4 border-indigo-200 pl-3 italic text-slate-600"><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Drinking enough water daily supports digestion, energy, and overall health.</span></p></blockquote><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><br></p><h2 class="text-xl font-bold mb-2 text-slate-900"><span style="white-space: pre-wrap;">📅 Upcoming Events</span></h2><table class="border-collapse w-full my-3 overflow-visible text-sm"><colgroup><col><col><col></colgroup><tbody><tr><th class="border border-slate-300 px-2 py-1.5 align-top min-w-[72px] text-slate-800 bg-slate-100 font-semibold text-slate-900" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start; background-color: rgb(242, 243, 245);"><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Event</span></p></th><th class="border border-slate-300 px-2 py-1.5 align-top min-w-[72px] text-slate-800 bg-slate-100 font-semibold text-slate-900" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start; background-color: rgb(242, 243, 245);"><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Date</span></p></th><th class="border border-slate-300 px-2 py-1.5 align-top min-w-[72px] text-slate-800 bg-slate-100 font-semibold text-slate-900" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start; background-color: rgb(242, 243, 245);"><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Time</span></p></th></tr><tr><td class="border border-slate-300 px-2 py-1.5 align-top min-w-[72px] text-slate-800" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Free Health Screening</span></p></td><td class="border border-slate-300 px-2 py-1.5 align-top min-w-[72px] text-slate-800" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">June 12</span></p></td><td class="border border-slate-300 px-2 py-1.5 align-top min-w-[72px] text-slate-800" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">10:00 AM</span></p></td></tr><tr><td class="border border-slate-300 px-2 py-1.5 align-top min-w-[72px] text-slate-800" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Diabetes Awareness Webinar</span></p></td><td class="border border-slate-300 px-2 py-1.5 align-top min-w-[72px] text-slate-800" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">June 18</span></p></td><td class="border border-slate-300 px-2 py-1.5 align-top min-w-[72px] text-slate-800" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">5:00 PM</span></p></td></tr><tr><td class="border border-slate-300 px-2 py-1.5 align-top min-w-[72px] text-slate-800" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Community Wellness Camp</span></p></td><td class="border border-slate-300 px-2 py-1.5 align-top min-w-[72px] text-slate-800" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">June 25</span></p></td><td class="border border-slate-300 px-2 py-1.5 align-top min-w-[72px] text-slate-800" style="border: 1px solid black; width: 75px; vertical-align: top; text-align: start;"><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">9:00 AM</span></p></td></tr></tbody></table><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><br></p><h2 class="text-xl font-bold mb-2 text-slate-900"><span style="white-space: pre-wrap;">👩‍⚕️ Doctor’s Advice</span></h2><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">“Preventive care is the best way to detect health concerns early and maintain long-term wellness.”</span><br><span style="white-space: pre-wrap;">— Dr. [Name]</span></p><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><br></p><h2 class="text-xl font-bold mb-2 text-slate-900"><span style="white-space: pre-wrap;">📲 Stay Connected</span></h2><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Follow us for health tips and updates:</span></p><ul class="list-disc ml-6 mb-2"><li value="1" class="mb-0.5"><span style="white-space: pre-wrap;">Facebook</span></li><li value="2" class="mb-0.5"><span style="white-space: pre-wrap;">Instagram</span></li><li value="3" class="mb-0.5"><span style="white-space: pre-wrap;">LinkedIn</span></li></ul><p class="mb-1 text-[14px] leading-relaxed text-slate-800"><span style="white-space: pre-wrap;">Book appointments online or contact us at:</span></p><ul class="list-disc ml-6 mb-2"><li value="1" class="mb-0.5"><span style="white-space: pre-wrap;">Phone: [Phone Number]</span></li><li value="2" class="mb-0.5"><span style="white-space: pre-wrap;">Email: [Email Address]</span></li><li value="3" class="mb-0.5"><span style="white-space: pre-wrap;">Website: [Website]</span></li></ul>	cf2e5e84-fcde-4e13-936b-6ab146b8c638	{3,4,5,7,8}	2026-05-10 15:08:31.592198+00
\.


--
-- Data for Name: newsletter_rate_limits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.newsletter_rate_limits (bucket_key, attempt_count, window_start) FROM stdin;
email:harsh.ixora@gmail.comaa	1	2026-05-20 15:22:49.690245+00
login_hour:49.43.1.193|51ed1ffe5f53a76a4bd5ed51c69c841ef86a31813fe6bbf5a4b936f2bd6077ec	1	2026-05-21 18:46:35.580921+00
email:harsh.ixora@gmail.comhh	1	2026-05-20 15:23:17.438565+00
login_minute:::1|e026af0a283806f54880b614bfb2b91452a69b23ee2338cc40239239d2059ccf	1	2026-06-04 06:45:08.810711+00
login_hour:::1|e026af0a283806f54880b614bfb2b91452a69b23ee2338cc40239239d2059ccf	1	2026-06-04 06:45:09.176683+00
email:harsh.ixora@gmail.comas	1	2026-05-20 15:23:27.455565+00
login_email_hour:admin@healthcare.com	1	2026-06-04 06:45:09.38732+00
ip:::1	5	2026-05-20 15:22:49.291555+00
email:harsh.ixora@gmail.comaai	1	2026-05-20 15:23:36.494965+00
device:aee5b8e3944cece720fa12827797a00059cf3b8d3c322c3ad7df13bb4e7bbeab	4	2026-05-20 15:22:49.944979+00
login_minute:::1|5e31fe8390d633bb263d8dba65bb76f0497d12d5c83ffe064b76dcc8aba88df4	1	2026-05-20 17:19:03.427519+00
login_hour:::1|5e31fe8390d633bb263d8dba65bb76f0497d12d5c83ffe064b76dcc8aba88df4	1	2026-05-20 17:19:03.988844+00
login_email_hour:harsh1248gupta@gmail.com	1	2026-05-20 17:19:04.220139+00
login_minute:122.168.86.237|f681d24fdf22c259b1a394d89064931e119371c4402130a7be60bac7e624db3e	5	2026-05-20 17:45:30.207529+00
login_hour:122.168.86.237|f681d24fdf22c259b1a394d89064931e119371c4402130a7be60bac7e624db3e	5	2026-05-20 17:45:31.268552+00
login_email_hour:harsah.ixora@gmail.com	1	2026-05-21 15:53:54.755988+00
login_minute:122.168.84.145|e9b78cc8b72fdf3d452c30baf533569418de2c0de0b18af9b98b5a16ae128776	3	2026-05-21 15:53:08.444526+00
login_hour:122.168.84.145|e9b78cc8b72fdf3d452c30baf533569418de2c0de0b18af9b98b5a16ae128776	3	2026-05-21 15:53:09.448077+00
login_email_hour:harsh.ixora@gmail.com	1	2026-05-21 15:54:04.234833+00
register_minute:171.61.162.239|639308ab6186cee351692a97244c4c672448e659b669f0a9f20c1d84037a4283	1	2026-05-21 17:36:53.833828+00
register_hour:171.61.162.239|639308ab6186cee351692a97244c4c672448e659b669f0a9f20c1d84037a4283	1	2026-05-21 17:36:54.808261+00
register_email_day:siddhant.sid1005@gmail.com	1	2026-05-21 17:36:55.111034+00
login_minute:38.183.11.109|824db57f78d2f325dc64e95c79eb2f8f88e760c2b0ef4d3dc1c76ce201d55f64	2	2026-05-21 18:36:43.89577+00
login_hour:38.183.11.109|824db57f78d2f325dc64e95c79eb2f8f88e760c2b0ef4d3dc1c76ce201d55f64	6	2026-05-21 18:35:17.636045+00
login_email_hour:mansimeena2326@gmail.com	6	2026-05-21 18:35:18.48719+00
login_minute:49.43.1.193|51ed1ffe5f53a76a4bd5ed51c69c841ef86a31813fe6bbf5a4b936f2bd6077ec	1	2026-05-21 18:46:35.018866+00
\.


--
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.newsletter_subscribers (id, email, subscribed_at, status) FROM stdin;
4	harsh1248gupta@gmail.com	2026-05-10 06:31:14.477+00	active
5	vishalcric.dav@gmail.com	2026-05-10 06:33:21.614+00	active
8	harsh2902@gmail.com	2026-05-10 08:55:09.721251+00	unsubscribed
7	harsh.wooden@mail.com	2026-05-10 08:54:52.268771+00	unsubscribed
3	harsh.ixora@gmail.com	2026-05-11 05:43:20.788652+00	resubscribed
11	harsh.wooden@gmail.com	2026-05-11 05:45:00.588557+00	active
12	mansimeena2326@gmail.com	2026-05-15 14:56:40.594928+00	active
\.


--
-- Data for Name: professional_availability; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.professional_availability (id, professional_id, day_of_week, start_time, end_time, is_available, created_at, updated_at) FROM stdin;
be896bdc-523a-4d5e-83f5-d6904a9ffe39	9510a2a3-8186-46b0-ac25-d3760612aabc	2	09:00	17:00	t	2026-03-04 10:00:15.464893+00	2026-03-04 10:00:15.252+00
4f572ada-ee16-4191-ac07-25aa6e96e03f	9510a2a3-8186-46b0-ac25-d3760612aabc	3	09:00	17:00	t	2026-03-04 10:00:34.872133+00	2026-03-04 10:00:34.708+00
a6621f16-1e64-4901-9300-471af15a6b79	9510a2a3-8186-46b0-ac25-d3760612aabc	4	09:00	17:58	t	2026-03-04 10:00:42.430262+00	2026-03-04 10:00:42.286+00
2e81f396-a483-4a29-a0da-541ebaf07ecb	06db9b38-80e1-4933-b020-17d9c9dff899	1	12:00	07:00	t	2026-04-19 08:52:47.608556+00	2026-04-19 08:52:47.496+00
e79904a9-1348-4828-8ae7-bc3c701888b1	06db9b38-80e1-4933-b020-17d9c9dff899	2	12:00	07:00	t	2026-04-19 08:52:54.698666+00	2026-04-19 08:52:54.59+00
48d9bbf3-9b44-40fa-8acd-265e243b3473	06db9b38-80e1-4933-b020-17d9c9dff899	3	12:00	07:00	t	2026-04-19 08:53:00.009239+00	2026-04-19 08:52:59.705+00
21d8771d-fd15-4e8e-b1a3-173e44104929	06db9b38-80e1-4933-b020-17d9c9dff899	4	12:00	07:00	t	2026-04-19 08:53:05.483802+00	2026-04-19 08:53:05.357+00
d8c2fe11-4f74-4142-a24a-bff3b1659a67	06db9b38-80e1-4933-b020-17d9c9dff899	5	12:00	07:00	t	2026-04-19 08:53:12.282519+00	2026-04-19 08:53:11.711+00
a95009e9-e66e-4fef-8e96-63afaf9ee5ff	06db9b38-80e1-4933-b020-17d9c9dff899	6	12:00	07:00	t	2026-04-19 08:53:18.565807+00	2026-04-19 08:53:17.986+00
1699b0d0-3219-450e-8f28-5f25bb72404f	b9d2077d-69b6-44ba-8c5b-34f960c795e3	1	11:00	16:00	t	2026-05-01 10:23:34.547513+00	2026-05-01 10:23:33.942+00
2a904b95-cd90-4546-a3c4-c649f6bd2100	b9d2077d-69b6-44ba-8c5b-34f960c795e3	2	11:00	16:00	t	2026-05-01 10:23:41.025282+00	2026-05-01 10:23:40.41+00
d77558d7-b4f5-4dcc-a8a9-5e2bfd920e90	b9d2077d-69b6-44ba-8c5b-34f960c795e3	3	11:00	16:00	t	2026-05-01 10:23:45.30315+00	2026-05-01 10:23:45.207+00
fec337c0-1563-4103-94e0-66ace81bfe3d	b9d2077d-69b6-44ba-8c5b-34f960c795e3	4	11:00	16:00	t	2026-05-01 10:23:49.246006+00	2026-05-01 10:23:49.14+00
50330f8c-bf43-413c-8de6-0390365edbd2	b9d2077d-69b6-44ba-8c5b-34f960c795e3	5	11:00	16:00	t	2026-05-01 10:23:53.630324+00	2026-05-01 10:23:53.525+00
79794b35-3dec-419e-a081-398214781124	b9d2077d-69b6-44ba-8c5b-34f960c795e3	6	11:00	16:00	t	2026-05-01 10:23:58.042223+00	2026-05-01 10:23:57.937+00
7ace5481-0c20-42b3-9738-e63cc05dda15	21ffa85f-d84e-49b0-be7f-062710fedf4f	1	11:00	17:00	t	2026-05-01 11:13:27.628494+00	2026-05-01 11:13:27.543+00
dbf1a7ff-ce69-49fc-a47d-72646d7440c8	21ffa85f-d84e-49b0-be7f-062710fedf4f	2	11:00	20:00	t	2026-05-01 11:13:47.656346+00	2026-05-01 11:13:47.322+00
3b54676a-6c0a-4bac-8380-17125e2555a9	21ffa85f-d84e-49b0-be7f-062710fedf4f	3	11:00	20:00	t	2026-05-01 11:14:00.769065+00	2026-05-01 11:14:00.6+00
f13d692f-464e-407b-9ddd-da58e6b4c6df	21ffa85f-d84e-49b0-be7f-062710fedf4f	4	11:00	20:00	t	2026-05-01 11:14:05.686995+00	2026-05-01 11:14:05.557+00
e332d964-a1c2-422f-95e4-1b034fd63ac3	21ffa85f-d84e-49b0-be7f-062710fedf4f	5	11:00	20:00	t	2026-05-01 11:14:12.75102+00	2026-05-01 11:14:12.178+00
d6e31205-597e-480b-bd61-7a636b43f224	21ffa85f-d84e-49b0-be7f-062710fedf4f	6	11:00	20:00	t	2026-05-01 11:14:18.363299+00	2026-05-01 11:14:18.254+00
888c331b-3106-4efc-8b5d-5cfb0e059e29	21ffa85f-d84e-49b0-be7f-062710fedf4f	0	11:00	20:00	t	2026-05-01 11:14:26.616242+00	2026-05-01 11:14:26.502+00
\.


--
-- Data for Name: professional_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.professional_profiles (id, user_id, specialization, license_number, bio, years_of_experience, consultation_fee, is_verified, created_at, updated_at, city, name_title) FROM stdin;
32d1a2f4-4b30-4b87-bd12-ab2c33295866	06db9b38-80e1-4933-b020-17d9c9dff899	Rehabilitation counsellor	A118723	Counseling Psychologist and RCI-registered Rehabilitation Professional offering evidence-based therapy for individuals and couples. Practice integrates multiple approaches including CBT, Psychodynamic Therapy, ACT, EFT, SFT, Behavior Therapy, and Gottman-based Relationship Counseling. Also trained in Art Therapy for emotional expression and regulation. Focus areas include anxiety, stress, relationship concerns, emotional regulation, and personal growth. Sessions are structured, goal-oriented, and tailored to individual needs, with an emphasis on creating a safe, non-judgmental space. Known for a balanced approach combining clinical depth with practical, actionable strategies.	2	150000	t	2026-04-07 11:04:06.083073+00	2026-05-01 10:30:51.263+00	Delhi	Ms.
7e274d92-e69d-4c24-88e2-71d6f33426b5	b9d2077d-69b6-44ba-8c5b-34f960c795e3	Rehabilitation counsellor	A120938	Psychologist	5	200000	t	2026-04-04 11:00:09.971262+00	2026-05-01 10:31:00.045+00	Ujjain	Mr.
78aa8be1-8d3e-44a5-838e-be207620d032	21ffa85f-d84e-49b0-be7f-062710fedf4f	General Physician	122132024	Dr. ADITYA JAIN is a compassionate and experienced General Physician dedicated to providing comprehensive primary healthcare for patients of all ages. With a strong focus on preventive medicine, early diagnosis, and holistic treatment\n Dr. JAIN is committed to improving overall health and well-being through personalized care.\nAfter earning a medical degree from RDGMC , Their approach emphasizes accurate diagnosis, evidence-based treatment, and patient education to promote long-term health.\nDr. JAIN is known for attentive listening, clear communication, and a patient-first philosophy. They believe in building lasting relationships with patients, ensuring comfort, trust, and continuity of care.\nCommitted to staying updated with the latest medical advancements, Dr. JAIN regularly participates in medical education programs and professional development activities.\nSpecialties: General Medicine, Preventive Care, Chronic Disease Management\nQualifications: MBBS\nExperience: 2 years in clinical practice\n	2	50000	t	2026-05-01 11:13:05.205333+00	2026-05-01 11:45:40.985+00	Ujjain	Dr.
\.


--
-- Data for Name: professional_qualifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.professional_qualifications (id, professional_id, degree, institution, year, document_url, created_at, updated_at, document_approved) FROM stdin;
ae87cd11-81e7-4fbf-b831-b9f5ba87c6a4	9510a2a3-8186-46b0-ac25-d3760612aabc	zhjdvf sf	df df	2023	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/qualifications/9510a2a3-8186-46b0-ac25-d3760612aabc/1a66ddda9f45360cf2b85619b50a5246.cursorrules	2026-04-13 06:45:59.073089+00	2026-04-13 06:45:59.073089+00	\N
437f5ea2-d84a-4925-81ba-deb3c267c8fd	9510a2a3-8186-46b0-ac25-d3760612aabc	jafh	sdf sfiu	2008	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/qualifications/9510a2a3-8186-46b0-ac25-d3760612aabc/8386d9ac65f09fe9571652b5b8957a94.webp	2026-04-13 06:52:04.424269+00	2026-04-13 06:52:04.424269+00	\N
0024283b-d852-40e6-a96f-75a29fff6e84	9510a2a3-8186-46b0-ac25-d3760612aabc	fwe wt wt wt	d ty rty rt r 	2026	/uploads/qualifications/42d3b1546fdb8011480b521664f46822.png	2026-03-04 09:58:26.646862+00	2026-04-13 10:03:17.612+00	t
1864648a-c802-42ef-b485-983938c94973	06db9b38-80e1-4933-b020-17d9c9dff899	BA in Applied Psychology	Delhi university	2022	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/qualifications/06db9b38-80e1-4933-b020-17d9c9dff899/939b8720b752121486bd47845e56522c.webp	2026-04-13 06:56:25.169106+00	2026-04-13 11:43:06.193+00	t
7506c3d8-c01d-46ee-92aa-40f9ecdb2235	06db9b38-80e1-4933-b020-17d9c9dff899	MA in Counseling Psychology	Amity University Noida	2024	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/qualifications/06db9b38-80e1-4933-b020-17d9c9dff899/40812a039859c65786e50704068992cb.pdf	2026-04-13 06:57:08.979888+00	2026-04-13 11:43:18.207+00	t
112712df-5240-4830-9977-e5a779bb0115	06db9b38-80e1-4933-b020-17d9c9dff899	Post Graduation Diploma in Rehabiliation Psychology	RCI	2025	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/qualifications/06db9b38-80e1-4933-b020-17d9c9dff899/eabe1383b31677298b6e1e282b6f193d.webp	2026-04-13 06:57:57.922326+00	2026-04-13 11:43:32.528+00	t
7dc417af-9b69-4576-92f6-f2aaaa395c59	06db9b38-80e1-4933-b020-17d9c9dff899	CBT Practitioner certificate	Skill india course	2026	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/qualifications/06db9b38-80e1-4933-b020-17d9c9dff899/023b4d61041dfbcaaf9b57fef0133343.pdf	2026-04-13 07:02:48.974405+00	2026-04-13 11:43:55.813+00	t
efdee66e-cacb-4f1d-b2e9-f08117662bea	06db9b38-80e1-4933-b020-17d9c9dff899	Relationship Counseling	Skill India Course	2026	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/qualifications/06db9b38-80e1-4933-b020-17d9c9dff899/d6d83890f3a8817fd39b66964d72bb8d.pdf	2026-04-13 07:03:44.092428+00	2026-04-13 11:44:07.008+00	t
ecf9cd67-73ae-4af2-9e8b-532294fd032d	9510a2a3-8186-46b0-ac25-d3760612aabc	uyserg ufsf segf	ha uyew wyr	2026	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/qualifications/9510a2a3-8186-46b0-ac25-d3760612aabc/bdcd6e0d2137574786aaa73f84d6eb19.webp	2026-04-13 06:53:16.930454+00	2026-05-01 10:33:15.689+00	f
d2f58ee3-b952-4892-a81d-3d3514c8c1eb	06db9b38-80e1-4933-b020-17d9c9dff899	Art therapy Practioner	Skill India Course	2024	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/qualifications/06db9b38-80e1-4933-b020-17d9c9dff899/bd1487be7646256f9e2096a345624255.pdf	2026-04-19 08:52:00.004788+00	2026-05-01 10:33:29.35+00	t
1afd9cc6-4ec1-4b2a-95be-7f835443f44c	b9d2077d-69b6-44ba-8c5b-34f960c795e3	RCI License	Rehabilitation Council of India	2026	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/qualifications/b9d2077d-69b6-44ba-8c5b-34f960c795e3/ccec89c02d31c656b6c6bbaac41e61b3.pdf	2026-05-01 10:21:39.824897+00	2026-05-01 10:33:56.934+00	t
7acaf050-d246-4722-abf5-ae0f1e9aae3e	b9d2077d-69b6-44ba-8c5b-34f960c795e3	Masters in Psychology	Panjab University Chandigarh	2023	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/qualifications/b9d2077d-69b6-44ba-8c5b-34f960c795e3/592d5ef7b0f5dc495e0e65cb700c76af.webp	2026-05-01 10:22:41.351707+00	2026-05-01 10:34:00.655+00	t
c044294e-2c36-4de4-9ddf-85d6a54ff872	b9d2077d-69b6-44ba-8c5b-34f960c795e3	Bachelors in Psychology Hons.	Graphic Era Deemed To Be University	2021	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/qualifications/b9d2077d-69b6-44ba-8c5b-34f960c795e3/06f6304ccfbbf5bf0394471bb949bc38.webp	2026-05-01 10:23:16.479406+00	2026-05-01 10:34:04.414+00	t
68bef063-00cc-4acd-a65b-cf030a791498	21ffa85f-d84e-49b0-be7f-062710fedf4f	Mbbs	Rdgmc	2024	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/qualifications/21ffa85f-d84e-49b0-be7f-062710fedf4f/6ea9e7d24d59f549ea6786e733b2de44.webp	2026-05-01 11:18:06.898279+00	2026-05-01 11:18:06.898279+00	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, image, role, phone, created_at, updated_at, phone_country_code) FROM stdin;
522a7a77-91fe-4419-bdbf-8341d9bddfeb	teset testes	harsh.ixora@gmail.comg	\N	client	\N	2026-05-14 11:16:53.925047+00	2026-05-14 11:16:55.161+00	\N
b9d2077d-69b6-44ba-8c5b-34f960c795e3	Vishal Gupta	vishalcric.dav@gmail.com	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/profiles/b9d2077d-69b6-44ba-8c5b-34f960c795e3/1777630856177.webp	professional	09981322736	2026-04-04 10:53:15.029296+00	2026-05-16 09:25:39.531+00	\N
cef0b74f-ea58-429f-b67a-7e3758d333e9	sdsdsdsdsddsd sdsddsd	xagela3703@gixpos.com	\N	professional	\N	2026-05-16 11:00:23.553147+00	2026-05-18 08:00:06.079+00	\N
21ffa85f-d84e-49b0-be7f-062710fedf4f	Aditya Jain	aditya.jain00712@gmail.com	\N	professional	6265888313	2026-05-01 10:28:13.253649+00	2026-05-20 07:14:54.137+00	\N
6ee89e3c-d5cd-4788-a281-9459b6d4502d	Rishabh  Jain	ujjaineye@gmail.com	\N	professional	\N	2026-05-20 07:18:11.991717+00	2026-05-20 07:18:13.275+00	\N
05cbe7bb-2908-4619-8fc8-0e2c82c8d792	Testing  news 	harsh2901.websenor@gmail.com	\N	client	\N	2026-04-04 13:52:20.485269+00	2026-04-04 13:53:41.101+00	\N
9510a2a3-8186-46b0-ac25-d3760612aabc	Harsh	harsh1248gupta@gmail.com	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/profiles/9510a2a3-8186-46b0-ac25-d3760612aabc/1776084934982.webp	professional	434343434	2026-03-02 07:41:00.351869+00	2026-05-20 17:19:09.027+00	+244
3bd77851-510e-469a-ab79-87d591d90cad	sgsgdsvybr	harsh.ixora@gmail.com	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/profiles/3bd77851-510e-469a-ab79-87d591d90cad/1776086543948.webp	client	7673648736	2026-04-13 13:14:14.652237+00	2026-05-21 15:54:06.103+00	+91
278dd7ce-5591-458b-bde4-396e619ecc9f	Siddhant Mukherjee	siddhant.sid1005@gmail.com	\N	professional	\N	2026-05-21 17:36:56.186569+00	2026-05-21 17:36:58.504+00	\N
8a5ec858-3b61-453a-aa19-008680673ebc	Mansi M	mansimeena2326@gmail.com	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/profiles/8a5ec858-3b61-453a-aa19-008680673ebc/1778439297725.webp	client	7988425220	2026-05-07 18:56:25.607723+00	2026-05-21 18:36:53.736+00	+91
06db9b38-80e1-4933-b020-17d9c9dff899	Lisha Khatri	mindfulhealiing@gmail.com	https://ywgclhmgavvipuupziwe.supabase.co/storage/v1/object/public/profiles/06db9b38-80e1-4933-b020-17d9c9dff899/1775652368109.webp	professional	9625804552	2026-04-07 10:55:23.315805+00	2026-04-19 08:54:31.076+00	\N
cf2e5e84-fcde-4e13-936b-6ab146b8c638	admin@healthcare.com	admin@healthcare.com	\N	admin	\N	2026-03-09 06:32:15.995802+00	2026-06-04 06:45:10.739+00	\N
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-03-01 15:31:28
20211116045059	2026-03-01 15:31:28
20211116050929	2026-03-01 15:31:29
20211116051442	2026-03-01 15:31:30
20211116212300	2026-03-01 15:31:31
20211116213355	2026-03-01 15:31:31
20211116213934	2026-03-01 15:31:32
20211116214523	2026-03-01 15:31:33
20211122062447	2026-03-01 15:31:34
20211124070109	2026-03-01 15:31:34
20211202204204	2026-03-01 15:31:35
20211202204605	2026-03-01 15:31:36
20211210212804	2026-03-01 15:31:38
20211228014915	2026-03-01 15:31:39
20220107221237	2026-03-01 15:31:39
20220228202821	2026-03-01 15:31:40
20220312004840	2026-03-01 15:31:41
20220603231003	2026-03-01 15:31:42
20220603232444	2026-03-01 15:31:43
20220615214548	2026-03-01 15:31:43
20220712093339	2026-03-01 15:31:44
20220908172859	2026-03-01 15:31:45
20220916233421	2026-03-01 15:31:45
20230119133233	2026-03-01 15:31:46
20230128025114	2026-03-01 15:31:47
20230128025212	2026-03-01 15:31:48
20230227211149	2026-03-01 15:31:48
20230228184745	2026-03-01 15:31:49
20230308225145	2026-03-01 15:31:50
20230328144023	2026-03-01 15:31:51
20231018144023	2026-03-01 15:31:51
20231204144023	2026-03-01 15:31:52
20231204144024	2026-03-01 15:31:53
20231204144025	2026-03-01 15:31:54
20240108234812	2026-03-01 15:31:54
20240109165339	2026-03-01 15:31:55
20240227174441	2026-03-01 15:31:56
20240311171622	2026-03-01 15:31:57
20240321100241	2026-03-01 15:31:59
20240401105812	2026-03-01 15:32:01
20240418121054	2026-03-01 15:32:02
20240523004032	2026-03-01 15:32:04
20240618124746	2026-03-01 15:32:05
20240801235015	2026-03-01 15:32:06
20240805133720	2026-03-01 15:32:06
20240827160934	2026-03-01 15:32:07
20240919163303	2026-03-01 15:32:08
20240919163305	2026-03-01 15:32:09
20241019105805	2026-03-01 15:32:09
20241030150047	2026-03-01 15:32:12
20241108114728	2026-03-01 15:32:13
20241121104152	2026-03-01 15:32:14
20241130184212	2026-03-01 15:32:14
20241220035512	2026-03-01 15:32:15
20241220123912	2026-03-01 15:32:16
20241224161212	2026-03-01 15:32:16
20250107150512	2026-03-01 15:32:17
20250110162412	2026-03-01 15:32:18
20250123174212	2026-03-01 15:32:18
20250128220012	2026-03-01 15:32:19
20250506224012	2026-03-01 15:32:20
20250523164012	2026-03-01 15:32:20
20250714121412	2026-03-01 15:32:21
20250905041441	2026-03-01 15:32:22
20251103001201	2026-03-01 15:32:22
20251120212548	2026-03-01 15:32:23
20251120215549	2026-03-01 15:32:24
20260218120000	2026-03-01 15:32:25
20260326120000	2026-04-30 09:41:32
20260514120000	2026-06-04 10:32:39
20260527120000	2026-06-04 10:32:41
20260528120000	2026-06-04 10:32:42
20260603120000	2026-06-04 10:32:43
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter, selected_columns) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
profiles	profiles	\N	2026-03-13 16:56:03.062848+00	2026-03-13 16:56:03.062848+00	t	f	\N	\N	\N	STANDARD
medical-documents	medical-documents	\N	2026-03-13 16:56:03.062848+00	2026-03-13 16:56:03.062848+00	t	f	\N	\N	\N	STANDARD
qualifications	qualifications	\N	2026-04-13 06:12:08.091458+00	2026-04-13 06:12:08.091458+00	t	f	\N	\N	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-03-01 15:31:31.312356
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-03-01 15:31:31.319887
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-03-01 15:31:31.326593
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-03-01 15:31:31.350504
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-03-01 15:31:31.416276
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-03-01 15:31:31.419012
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-03-01 15:31:31.423031
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-03-01 15:31:31.426902
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-03-01 15:31:31.430325
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-03-01 15:31:31.433789
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-03-01 15:31:31.436595
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-03-01 15:31:31.43975
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-03-01 15:31:31.443155
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-03-01 15:31:31.446093
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-03-01 15:31:31.44914
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-03-01 15:31:31.471886
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-03-01 15:31:31.475176
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-03-01 15:31:31.477984
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-03-01 15:31:31.481036
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-03-01 15:31:31.485854
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-03-01 15:31:31.488685
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-03-01 15:31:31.492709
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-03-01 15:31:31.504451
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-03-01 15:31:31.516394
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-03-01 15:31:31.519902
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-03-01 15:31:31.523371
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-03-01 15:31:31.526474
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-03-01 15:31:31.52874
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-03-01 15:31:31.530997
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-03-01 15:31:31.533555
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-03-01 15:31:31.535868
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-03-01 15:31:31.538039
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-03-01 15:31:31.540098
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-03-01 15:31:31.542163
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-03-01 15:31:31.544356
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-03-01 15:31:31.546968
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-03-01 15:31:31.549173
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-03-01 15:31:31.551571
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-03-01 15:31:31.555999
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-03-01 15:31:31.566498
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-03-01 15:31:31.568781
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-03-01 15:31:31.571204
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-03-01 15:31:31.573863
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-03-01 15:31:31.578559
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-03-01 15:31:31.581429
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-03-01 15:31:31.586051
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-03-01 15:31:31.604476
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-03-01 15:31:31.607627
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-03-01 15:31:31.609904
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-03-01 15:31:31.632617
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-03-01 15:31:31.639297
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-03-01 15:31:31.733858
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-03-01 15:31:31.735034
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-03-01 15:31:31.745979
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-03-01 15:31:31.747612
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-03-01 15:31:31.74864
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-04-08 12:46:11.367456
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-04-08 12:46:11.393744
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-03-01 15:31:31.752534
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-05-06 05:38:29.724151
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-05-06 05:38:29.749333
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
43a320da-b9b8-438f-9c30-68780ef4c4ac	medical-documents	3bd77851-510e-469a-ab79-87d591d90cad/d844915cab4a7cfda13b7bc5aec19b2f.webp	3bd77851-510e-469a-ab79-87d591d90cad	2026-03-13 17:27:01.05352+00	2026-03-13 17:27:01.05352+00	2026-03-13 17:27:01.05352+00	{"eTag": "\\"f0d42e843133a21605b61dc8d21fee4f\\"", "size": 32492, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-03-13T17:27:02.000Z", "contentLength": 32492, "httpStatusCode": 200}	de1d3cd1-2aae-4612-b9ee-a367d8ba580d	3bd77851-510e-469a-ab79-87d591d90cad	{}
6c6d063b-9b7e-4255-b8da-13a8233b19e0	profiles	06db9b38-80e1-4933-b020-17d9c9dff899/1775652368109.webp	06db9b38-80e1-4933-b020-17d9c9dff899	2026-04-08 12:46:08.755192+00	2026-04-08 12:46:08.755192+00	2026-04-08 12:46:08.755192+00	{"eTag": "\\"cabad4bef891b09ca21f5e1491ee2f5b\\"", "size": 70116, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-04-08T12:46:09.000Z", "contentLength": 70116, "httpStatusCode": 200}	e41d8113-4940-4865-a420-021d0b99677e	06db9b38-80e1-4933-b020-17d9c9dff899	{}
d27d0107-ac0d-4749-895c-f0bdb0bb0566	medical-documents	3bd77851-510e-469a-ab79-87d591d90cad/16f0da8f3a7ba7975c08b8c720670863.cursorrules	3bd77851-510e-469a-ab79-87d591d90cad	2026-04-13 06:38:33.538897+00	2026-04-13 06:38:33.538897+00	2026-04-13 06:38:33.538897+00	{"eTag": "\\"40b2ccfe7a380d8d7c3c94a35da2fb2d\\"", "size": 1614, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2026-04-13T06:38:34.000Z", "contentLength": 1614, "httpStatusCode": 200}	cfd7292a-712c-4c9d-90ed-ada714f7ba71	3bd77851-510e-469a-ab79-87d591d90cad	{}
d4fc5b84-3233-4c66-bac5-bc20331f9454	qualifications	9510a2a3-8186-46b0-ac25-d3760612aabc/1a66ddda9f45360cf2b85619b50a5246.cursorrules	9510a2a3-8186-46b0-ac25-d3760612aabc	2026-04-13 06:45:58.167441+00	2026-04-13 06:45:58.167441+00	2026-04-13 06:45:58.167441+00	{"eTag": "\\"40b2ccfe7a380d8d7c3c94a35da2fb2d\\"", "size": 1614, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2026-04-13T06:45:59.000Z", "contentLength": 1614, "httpStatusCode": 200}	8e83cb72-5207-42b7-91b8-2a9e9d26af65	9510a2a3-8186-46b0-ac25-d3760612aabc	{}
d6fae7a0-4ae3-4bb3-8196-595d058e20a5	qualifications	9510a2a3-8186-46b0-ac25-d3760612aabc/8386d9ac65f09fe9571652b5b8957a94.webp	9510a2a3-8186-46b0-ac25-d3760612aabc	2026-04-13 06:52:03.682775+00	2026-04-13 06:52:03.682775+00	2026-04-13 06:52:03.682775+00	{"eTag": "\\"20f027133869531e1da722c7ccfc38cc\\"", "size": 6680, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-04-13T06:52:04.000Z", "contentLength": 6680, "httpStatusCode": 200}	f4487136-4ff6-4f86-87c9-06ee251e15d0	9510a2a3-8186-46b0-ac25-d3760612aabc	{}
ee181d16-b7c1-4dd7-bbe4-fb28693d83c5	qualifications	9510a2a3-8186-46b0-ac25-d3760612aabc/bdcd6e0d2137574786aaa73f84d6eb19.webp	9510a2a3-8186-46b0-ac25-d3760612aabc	2026-04-13 06:53:16.603043+00	2026-04-13 06:53:16.603043+00	2026-04-13 06:53:16.603043+00	{"eTag": "\\"28dcfe35d49e2165431ee685e9775a69\\"", "size": 66520, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-04-13T06:53:17.000Z", "contentLength": 66520, "httpStatusCode": 200}	87ce2e51-840f-481c-b4ea-e165919da5b4	9510a2a3-8186-46b0-ac25-d3760612aabc	{}
217c3628-ddaf-4d45-8391-89f9bd4a7808	qualifications	06db9b38-80e1-4933-b020-17d9c9dff899/939b8720b752121486bd47845e56522c.webp	06db9b38-80e1-4933-b020-17d9c9dff899	2026-04-13 06:56:24.451238+00	2026-04-13 06:56:24.451238+00	2026-04-13 06:56:24.451238+00	{"eTag": "\\"a8f0f078e9cc03749005c068057dbce3\\"", "size": 170008, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-04-13T06:56:25.000Z", "contentLength": 170008, "httpStatusCode": 200}	46b5fa00-6471-4147-9617-1e37a9db7480	06db9b38-80e1-4933-b020-17d9c9dff899	{}
d8f0bb8c-0937-4b4e-bfeb-65586c94c74d	qualifications	06db9b38-80e1-4933-b020-17d9c9dff899/40812a039859c65786e50704068992cb.pdf	06db9b38-80e1-4933-b020-17d9c9dff899	2026-04-13 06:57:08.581646+00	2026-04-13 06:57:08.581646+00	2026-04-13 06:57:08.581646+00	{"eTag": "\\"fcbb452c7dd31677d953bf126f53f57c\\"", "size": 302671, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-04-13T06:57:09.000Z", "contentLength": 302671, "httpStatusCode": 200}	1235c7ff-4fac-4b97-9b1c-e8633dc5fc57	06db9b38-80e1-4933-b020-17d9c9dff899	{}
286a8fa0-dd24-4e70-958e-567534943400	qualifications	06db9b38-80e1-4933-b020-17d9c9dff899/eabe1383b31677298b6e1e282b6f193d.webp	06db9b38-80e1-4933-b020-17d9c9dff899	2026-04-13 06:57:57.477246+00	2026-04-13 06:57:57.477246+00	2026-04-13 06:57:57.477246+00	{"eTag": "\\"4b37872571e7f3577290bdca75ac640f\\"", "size": 150538, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-04-13T06:57:58.000Z", "contentLength": 150538, "httpStatusCode": 200}	69d3e366-fc69-4bf2-8f5d-6944fa6e1548	06db9b38-80e1-4933-b020-17d9c9dff899	{}
2af7eb9b-f0d0-4422-a350-7b189e00a55f	qualifications	06db9b38-80e1-4933-b020-17d9c9dff899/023b4d61041dfbcaaf9b57fef0133343.pdf	06db9b38-80e1-4933-b020-17d9c9dff899	2026-04-13 07:02:47.938178+00	2026-04-13 07:02:47.938178+00	2026-04-13 07:02:47.938178+00	{"eTag": "\\"cb875ecbeb4e582dfcc9b03bcf89f981\\"", "size": 2601652, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-04-13T07:02:48.000Z", "contentLength": 2601652, "httpStatusCode": 200}	db638b6a-66c2-4f57-be1e-4fabd9f842b8	06db9b38-80e1-4933-b020-17d9c9dff899	{}
e483b3dd-811f-409a-86e7-de3df523a7fa	qualifications	06db9b38-80e1-4933-b020-17d9c9dff899/d6d83890f3a8817fd39b66964d72bb8d.pdf	06db9b38-80e1-4933-b020-17d9c9dff899	2026-04-13 07:03:43.107477+00	2026-04-13 07:03:43.107477+00	2026-04-13 07:03:43.107477+00	{"eTag": "\\"e94766e168b8486afce9a5aba9549561\\"", "size": 2609862, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-04-13T07:03:44.000Z", "contentLength": 2609862, "httpStatusCode": 200}	93e9292c-707a-4bef-939d-ae092c62505f	06db9b38-80e1-4933-b020-17d9c9dff899	{}
ec8a4c7b-aa1f-45c9-8673-fd7cb87361a1	profiles	9510a2a3-8186-46b0-ac25-d3760612aabc/1776084934982.webp	9510a2a3-8186-46b0-ac25-d3760612aabc	2026-04-13 12:55:35.360095+00	2026-04-13 12:55:35.360095+00	2026-04-13 12:55:35.360095+00	{"eTag": "\\"0a5ad057f5c7e0368478bd50f8775ca8\\"", "size": 6066, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-04-13T12:55:36.000Z", "contentLength": 6066, "httpStatusCode": 200}	e9af8968-6447-4810-bd36-02f2eb432873	9510a2a3-8186-46b0-ac25-d3760612aabc	{}
63169976-e4e5-45ff-9bfd-b52d7ad2cad0	profiles	3bd77851-510e-469a-ab79-87d591d90cad/1776086543948.webp	3bd77851-510e-469a-ab79-87d591d90cad	2026-04-13 13:22:25.508514+00	2026-04-13 13:22:25.508514+00	2026-04-13 13:22:25.508514+00	{"eTag": "\\"5f7609b122ea8e5337c551bb8f6fe5be\\"", "size": 8380, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-04-13T13:22:26.000Z", "contentLength": 8380, "httpStatusCode": 200}	887bfff0-72bf-44f4-b38f-ea199d63a798	3bd77851-510e-469a-ab79-87d591d90cad	{}
4e7c32a1-7e69-40f4-b7c1-49cfd1ffee29	qualifications	06db9b38-80e1-4933-b020-17d9c9dff899/bd1487be7646256f9e2096a345624255.pdf	06db9b38-80e1-4933-b020-17d9c9dff899	2026-04-19 08:51:58.861779+00	2026-04-19 08:51:58.861779+00	2026-04-19 08:51:58.861779+00	{"eTag": "\\"004ba0e08869bcb3670eef79e7986344\\"", "size": 291385, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-04-19T08:51:59.000Z", "contentLength": 291385, "httpStatusCode": 200}	3f6e8955-53cb-492d-bfd1-5c1391b124e6	06db9b38-80e1-4933-b020-17d9c9dff899	{}
1b4164cb-6398-4674-80cb-dc2a4435d401	profiles	b9d2077d-69b6-44ba-8c5b-34f960c795e3/1777630856177.webp	b9d2077d-69b6-44ba-8c5b-34f960c795e3	2026-05-01 10:20:56.764875+00	2026-05-01 10:20:56.764875+00	2026-05-01 10:20:56.764875+00	{"eTag": "\\"6c7b4db1a5e5e4bc1ae9485b55b43ae3\\"", "size": 66266, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-05-01T10:20:57.000Z", "contentLength": 66266, "httpStatusCode": 200}	f6972976-77f6-4dee-8631-3812495d464d	b9d2077d-69b6-44ba-8c5b-34f960c795e3	{}
0d981862-911f-4207-9d21-5b5d0b2195c8	qualifications	b9d2077d-69b6-44ba-8c5b-34f960c795e3/ccec89c02d31c656b6c6bbaac41e61b3.pdf	b9d2077d-69b6-44ba-8c5b-34f960c795e3	2026-05-01 10:21:39.236395+00	2026-05-01 10:21:39.236395+00	2026-05-01 10:21:39.236395+00	{"eTag": "\\"6498952e17a2afa73fc147f61f35651e\\"", "size": 1805223, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-05-01T10:21:40.000Z", "contentLength": 1805223, "httpStatusCode": 200}	f6c6c230-9eff-49ee-a070-83ec1c8521aa	b9d2077d-69b6-44ba-8c5b-34f960c795e3	{}
67b88ce8-afb5-40d0-a3c3-f9391c786158	qualifications	b9d2077d-69b6-44ba-8c5b-34f960c795e3/592d5ef7b0f5dc495e0e65cb700c76af.webp	b9d2077d-69b6-44ba-8c5b-34f960c795e3	2026-05-01 10:22:40.177236+00	2026-05-01 10:22:40.177236+00	2026-05-01 10:22:40.177236+00	{"eTag": "\\"df6d6a4f4f3c62e0aba00c6dc70f8edf\\"", "size": 155312, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-05-01T10:22:41.000Z", "contentLength": 155312, "httpStatusCode": 200}	5c07d1c5-4bfd-468a-9af2-5865c343338b	b9d2077d-69b6-44ba-8c5b-34f960c795e3	{}
71636aad-2132-405d-afff-0b13704b9c0f	qualifications	b9d2077d-69b6-44ba-8c5b-34f960c795e3/06f6304ccfbbf5bf0394471bb949bc38.webp	b9d2077d-69b6-44ba-8c5b-34f960c795e3	2026-05-01 10:23:15.989488+00	2026-05-01 10:23:15.989488+00	2026-05-01 10:23:15.989488+00	{"eTag": "\\"17abd739e2f9787de966beded7baeba5\\"", "size": 77916, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-05-01T10:23:16.000Z", "contentLength": 77916, "httpStatusCode": 200}	26e94dfd-fbcf-4a93-a257-1f524fbd3f5d	b9d2077d-69b6-44ba-8c5b-34f960c795e3	{}
c931fda5-98f5-4622-8504-6ca576ffb12c	qualifications	21ffa85f-d84e-49b0-be7f-062710fedf4f/6ea9e7d24d59f549ea6786e733b2de44.webp	21ffa85f-d84e-49b0-be7f-062710fedf4f	2026-05-01 11:18:06.631117+00	2026-05-01 11:18:06.631117+00	2026-05-01 11:18:06.631117+00	{"eTag": "\\"5636b70b49a7ab30c202ca918d3cfd2a\\"", "size": 73874, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-05-01T11:18:07.000Z", "contentLength": 73874, "httpStatusCode": 200}	bbb5c847-fb7b-4e06-99e3-9387a8a1b0b0	21ffa85f-d84e-49b0-be7f-062710fedf4f	{}
6234b9ef-3ad1-40be-8f00-055e63167f67	profiles	8a5ec858-3b61-453a-aa19-008680673ebc/1778439297725.webp	8a5ec858-3b61-453a-aa19-008680673ebc	2026-05-10 18:54:58.348849+00	2026-05-10 18:54:58.348849+00	2026-05-10 18:54:58.348849+00	{"eTag": "\\"7a1700616f2f382d42495f239aed3a35\\"", "size": 24408, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-05-10T18:54:59.000Z", "contentLength": 24408, "httpStatusCode": 200}	2d20aed6-9862-481a-aa9f-75ed6900e4f5	8a5ec858-3b61-453a-aa19-008680673ebc	{}
e87dc39b-6123-4455-bee9-7ef9af002148	medical-documents	3bd77851-510e-469a-ab79-87d591d90cad/4c8bd52799facc0de694824471d01eab.webp	3bd77851-510e-469a-ab79-87d591d90cad	2026-05-18 08:13:24.34983+00	2026-05-18 08:13:24.34983+00	2026-05-18 08:13:24.34983+00	{"eTag": "\\"3ed83d0086ce513850f757a5fe9708b2\\"", "size": 181342, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-05-18T08:13:25.000Z", "contentLength": 181342, "httpStatusCode": 200}	b4fce05b-445a-48ac-8ab3-a3c3e6218cdb	3bd77851-510e-469a-ab79-87d591d90cad	{}
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 203, true);


--
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.newsletter_subscribers_id_seq', 16, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: admin_notifications admin_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_notifications
    ADD CONSTRAINT admin_notifications_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: client_medical_profiles client_medical_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_medical_profiles
    ADD CONSTRAINT client_medical_profiles_pkey PRIMARY KEY (id);


--
-- Name: client_medical_profiles client_medical_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_medical_profiles
    ADD CONSTRAINT client_medical_profiles_user_id_key UNIQUE (user_id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: google_calendar_connections google_calendar_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_calendar_connections
    ADD CONSTRAINT google_calendar_connections_pkey PRIMARY KEY (user_id);


--
-- Name: google_meet_events google_meet_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_meet_events
    ADD CONSTRAINT google_meet_events_pkey PRIMARY KEY (id);


--
-- Name: guest_appointments guest_appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_appointments
    ADD CONSTRAINT guest_appointments_pkey PRIMARY KEY (id);


--
-- Name: insurance insurance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insurance
    ADD CONSTRAINT insurance_pkey PRIMARY KEY (id);


--
-- Name: medical_documents medical_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_documents
    ADD CONSTRAINT medical_documents_pkey PRIMARY KEY (id);


--
-- Name: medical_history medical_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_history
    ADD CONSTRAINT medical_history_pkey PRIMARY KEY (id);


--
-- Name: medications medications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medications
    ADD CONSTRAINT medications_pkey PRIMARY KEY (id);


--
-- Name: newsletter_campaigns newsletter_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_campaigns
    ADD CONSTRAINT newsletter_campaigns_pkey PRIMARY KEY (id);


--
-- Name: newsletter_rate_limits newsletter_rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_rate_limits
    ADD CONSTRAINT newsletter_rate_limits_pkey PRIMARY KEY (bucket_key);


--
-- Name: newsletter_subscribers newsletter_subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: professional_availability professional_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_availability
    ADD CONSTRAINT professional_availability_pkey PRIMARY KEY (id);


--
-- Name: professional_profiles professional_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_profiles
    ADD CONSTRAINT professional_profiles_pkey PRIMARY KEY (id);


--
-- Name: professional_profiles professional_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_profiles
    ADD CONSTRAINT professional_profiles_user_id_key UNIQUE (user_id);


--
-- Name: professional_qualifications professional_qualifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_qualifications
    ADD CONSTRAINT professional_qualifications_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: messages messages_payload_exclusive; Type: CHECK CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages
    ADD CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALID;


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: idx_admin_notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_notifications_created_at ON public.admin_notifications USING btree (created_at DESC);


--
-- Name: idx_admin_notifications_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_notifications_unread ON public.admin_notifications USING btree (created_at DESC) WHERE (read_at IS NULL);


--
-- Name: idx_newsletter_campaigns_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_newsletter_campaigns_created_at ON public.newsletter_campaigns USING btree (created_at DESC);


--
-- Name: newsletter_subscribers_email_lower_uidx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX newsletter_subscribers_email_lower_uidx ON public.newsletter_subscribers USING btree (lower(email));


--
-- Name: professional_availability_professional_day_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX professional_availability_professional_day_unique ON public.professional_availability USING btree (professional_id, day_of_week);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_selec; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_selec ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter, COALESCE(selected_columns, '{}'::text[]));


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: guest_appointments trg_admin_notify_guest_appointment; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_admin_notify_guest_appointment AFTER INSERT ON public.guest_appointments FOR EACH ROW EXECUTE FUNCTION public.admin_notify_on_guest_appointment_insert();


--
-- Name: users trg_admin_notify_new_user; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_admin_notify_new_user AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.admin_notify_on_user_insert();


--
-- Name: newsletter_subscribers trg_admin_notify_newsletter_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_admin_notify_newsletter_change AFTER INSERT OR UPDATE OF status ON public.newsletter_subscribers FOR EACH ROW EXECUTE FUNCTION public.admin_notify_on_newsletter_change();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: admin_notifications admin_notifications_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_notifications
    ADD CONSTRAINT admin_notifications_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: appointments appointments_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: client_medical_profiles client_medical_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_medical_profiles
    ADD CONSTRAINT client_medical_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: google_calendar_connections google_calendar_connections_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_calendar_connections
    ADD CONSTRAINT google_calendar_connections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: google_meet_events google_meet_events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_meet_events
    ADD CONSTRAINT google_meet_events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: guest_appointments guest_appointments_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_appointments
    ADD CONSTRAINT guest_appointments_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.users(id);


--
-- Name: insurance insurance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insurance
    ADD CONSTRAINT insurance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: medical_documents medical_documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_documents
    ADD CONSTRAINT medical_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: medical_history medical_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_history
    ADD CONSTRAINT medical_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: medications medications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medications
    ADD CONSTRAINT medications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: newsletter_campaigns newsletter_campaigns_sent_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_campaigns
    ADD CONSTRAINT newsletter_campaigns_sent_by_fkey FOREIGN KEY (sent_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: professional_availability professional_availability_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_availability
    ADD CONSTRAINT professional_availability_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: professional_profiles professional_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_profiles
    ADD CONSTRAINT professional_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: professional_qualifications professional_qualifications_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_qualifications
    ADD CONSTRAINT professional_qualifications_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: appointments Admins can manage all appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all appointments" ON public.appointments USING ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text));


--
-- Name: professional_availability Admins can manage all availability; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all availability" ON public.professional_availability USING ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text));


--
-- Name: contact_messages Admins can manage all contact messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all contact messages" ON public.contact_messages USING ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text));


--
-- Name: medical_documents Admins can manage all documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all documents" ON public.medical_documents USING ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text));


--
-- Name: google_meet_events Admins can manage all google meet events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all google meet events" ON public.google_meet_events TO authenticated USING ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text)) WITH CHECK ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text));


--
-- Name: guest_appointments Admins can manage all guest appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all guest appointments" ON public.guest_appointments USING ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text));


--
-- Name: insurance Admins can manage all insurance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all insurance" ON public.insurance USING ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text));


--
-- Name: medical_history Admins can manage all medical history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all medical history" ON public.medical_history USING ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text));


--
-- Name: client_medical_profiles Admins can manage all medical profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all medical profiles" ON public.client_medical_profiles USING ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text));


--
-- Name: medications Admins can manage all medications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all medications" ON public.medications USING ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text));


--
-- Name: professional_profiles Admins can manage all professional profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all professional profiles" ON public.professional_profiles USING ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text));


--
-- Name: professional_qualifications Admins can manage all qualifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all qualifications" ON public.professional_qualifications USING ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text));


--
-- Name: newsletter_subscribers Admins can manage all subscribers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all subscribers" ON public.newsletter_subscribers USING ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text));


--
-- Name: users Admins can manage all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all users" ON public.users USING ((EXISTS ( SELECT 1
   FROM auth.users users_1
  WHERE ((users_1.id = auth.uid()) AND ((users_1.raw_user_meta_data ->> 'role'::text) = 'admin'::text)))));


--
-- Name: admin_notifications Admins can read notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can read notifications" ON public.admin_notifications FOR SELECT TO authenticated USING ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text));


--
-- Name: admin_notifications Admins can update notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update notifications" ON public.admin_notifications FOR UPDATE TO authenticated USING ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text)) WITH CHECK ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text));


--
-- Name: newsletter_campaigns Admins manage all newsletter campaigns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage all newsletter campaigns" ON public.newsletter_campaigns TO authenticated USING ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text)) WITH CHECK ((( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text));


--
-- Name: google_calendar_connections Admins store own Google calendar tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins store own Google calendar tokens" ON public.google_calendar_connections TO authenticated USING (((auth.uid() = user_id) AND (( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text))) WITH CHECK (((auth.uid() = user_id) AND (( SELECT users.role
   FROM public.users
  WHERE (users.id = auth.uid())) = 'admin'::text)));


--
-- Name: users Allow auth trigger insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow auth trigger insert" ON public.users FOR INSERT WITH CHECK (true);


--
-- Name: contact_messages Allow public contact message insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public contact message insert" ON public.contact_messages FOR INSERT TO authenticated, anon WITH CHECK (((email IS NOT NULL) AND ((char_length(TRIM(BOTH FROM email)) >= 3) AND (char_length(TRIM(BOTH FROM email)) <= 320)) AND (subject IS NOT NULL) AND ((char_length(TRIM(BOTH FROM subject)) >= 3) AND (char_length(TRIM(BOTH FROM subject)) <= 500)) AND (message IS NOT NULL) AND ((char_length(TRIM(BOTH FROM message)) >= 10) AND (char_length(TRIM(BOTH FROM message)) <= 20000))));


--
-- Name: guest_appointments Allow public insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert" ON public.guest_appointments FOR INSERT TO authenticated, anon WITH CHECK (true);


--
-- Name: newsletter_subscribers Allow public newsletter signup; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public newsletter signup" ON public.newsletter_subscribers FOR INSERT TO authenticated, anon WITH CHECK (((email IS NOT NULL) AND (char_length(email) <= 320) AND (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text) AND (COALESCE(status, 'active'::text) = 'active'::text)));


--
-- Name: newsletter_subscribers Allow public newsletter status update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public newsletter status update" ON public.newsletter_subscribers FOR UPDATE TO authenticated, anon USING (true) WITH CHECK ((status = ANY (ARRAY['active'::text, 'unsubscribed'::text, 'resubscribed'::text])));


--
-- Name: guest_appointments Allow select for authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow select for authenticated" ON public.guest_appointments FOR SELECT TO authenticated USING (true);


--
-- Name: users Allow signup insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow signup insert" ON public.users FOR INSERT WITH CHECK (true);


--
-- Name: users Allow trigger insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow trigger insert" ON public.users FOR INSERT WITH CHECK (true);


--
-- Name: contact_messages Anyone can insert contact messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);


--
-- Name: professional_availability Professionals can manage own availability; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can manage own availability" ON public.professional_availability USING ((auth.uid() = professional_id));


--
-- Name: professional_profiles Professionals can manage own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can manage own profile" ON public.professional_profiles USING ((auth.uid() = user_id));


--
-- Name: professional_qualifications Professionals can manage own qualifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can manage own qualifications" ON public.professional_qualifications USING ((auth.uid() = professional_id));


--
-- Name: guest_appointments Professionals read guest bookings assigned to them; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals read guest bookings assigned to them" ON public.guest_appointments FOR SELECT TO authenticated USING (((professional_id IS NOT NULL) AND (professional_id = auth.uid())));


--
-- Name: guest_appointments Professionals update own guest bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals update own guest bookings" ON public.guest_appointments FOR UPDATE TO authenticated USING (((professional_id IS NOT NULL) AND (professional_id = auth.uid()))) WITH CHECK (((professional_id IS NOT NULL) AND (professional_id = auth.uid())));


--
-- Name: professional_availability Public availability is viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public availability is viewable by everyone" ON public.professional_availability FOR SELECT USING (true);


--
-- Name: professional_profiles Public profiles are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public profiles are viewable by everyone" ON public.professional_profiles FOR SELECT USING (true);


--
-- Name: professional_qualifications Public qualifications are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public qualifications are viewable by everyone" ON public.professional_qualifications FOR SELECT USING (true);


--
-- Name: users Public users are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public users are viewable by everyone" ON public.users FOR SELECT USING (true);


--
-- Name: guest_appointments Select guest bookings matching patient email; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Select guest bookings matching patient email" ON public.guest_appointments FOR SELECT TO authenticated USING (((email IS NOT NULL) AND (( SELECT u.email
   FROM public.users u
  WHERE (u.id = auth.uid())) IS NOT NULL) AND (lower(btrim(email)) = lower(btrim(( SELECT u.email
   FROM public.users u
  WHERE (u.id = auth.uid())))))));


--
-- Name: guest_appointments Select own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Select own" ON public.guest_appointments FOR SELECT TO authenticated USING ((created_by = auth.uid()));


--
-- Name: insurance Users can manage own insurance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own insurance" ON public.insurance USING ((auth.uid() = user_id));


--
-- Name: users Users can update own record; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: appointments Users can view own appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own appointments" ON public.appointments USING (((auth.uid() = client_id) OR (auth.uid() = professional_id)));


--
-- Name: medical_documents Users can view own documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own documents" ON public.medical_documents USING ((auth.uid() = user_id));


--
-- Name: medical_history Users can view own history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own history" ON public.medical_history USING ((auth.uid() = user_id));


--
-- Name: client_medical_profiles Users can view own medical info; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own medical info" ON public.client_medical_profiles USING ((auth.uid() = user_id));


--
-- Name: medications Users can view own medications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own medications" ON public.medications USING ((auth.uid() = user_id));


--
-- Name: admin_notifications Users insert own admin notification rows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own admin notification rows" ON public.admin_notifications FOR INSERT TO authenticated WITH CHECK (((actor_user_id IS NOT NULL) AND (actor_user_id = auth.uid())));


--
-- Name: admin_notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: appointments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

--
-- Name: client_medical_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_medical_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: contact_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: google_calendar_connections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.google_calendar_connections ENABLE ROW LEVEL SECURITY;

--
-- Name: google_meet_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.google_meet_events ENABLE ROW LEVEL SECURITY;

--
-- Name: guest_appointments guest_appointments_insert_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY guest_appointments_insert_all ON public.guest_appointments FOR INSERT TO authenticated, anon WITH CHECK (true);


--
-- Name: insurance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.insurance ENABLE ROW LEVEL SECURITY;

--
-- Name: medical_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: medical_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;

--
-- Name: medications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

--
-- Name: newsletter_campaigns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: newsletter_rate_limits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.newsletter_rate_limits ENABLE ROW LEVEL SECURITY;

--
-- Name: newsletter_subscribers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_availability; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_availability ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_qualifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_qualifications ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Professionals can delete own qualification documents; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Professionals can delete own qualification documents" ON storage.objects FOR DELETE USING (((bucket_id = 'qualifications'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


--
-- Name: objects Professionals can update own qualification documents; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Professionals can update own qualification documents" ON storage.objects FOR UPDATE USING (((bucket_id = 'qualifications'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


--
-- Name: objects Professionals can upload own qualification documents; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Professionals can upload own qualification documents" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'qualifications'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


--
-- Name: objects Public Profiles are viewable by everyone; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public Profiles are viewable by everyone" ON storage.objects FOR SELECT USING ((bucket_id = 'profiles'::text));


--
-- Name: objects Public qualification files are viewable by everyone; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public qualification files are viewable by everyone" ON storage.objects FOR SELECT USING ((bucket_id = 'qualifications'::text));


--
-- Name: objects Users can delete own medical documents; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can delete own medical documents" ON storage.objects FOR DELETE USING (((bucket_id = 'medical-documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


--
-- Name: objects Users can delete their own profile image; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can delete their own profile image" ON storage.objects FOR DELETE USING (((bucket_id = 'profiles'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


--
-- Name: objects Users can update their own profile image; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can update their own profile image" ON storage.objects FOR UPDATE USING (((bucket_id = 'profiles'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


--
-- Name: objects Users can upload own medical documents; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can upload own medical documents" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'medical-documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


--
-- Name: objects Users can upload their own profile image; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can upload their own profile image" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'profiles'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


--
-- Name: objects Users can view own medical documents; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can view own medical documents" ON storage.objects FOR SELECT USING (((bucket_id = 'medical-documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: ensure_rls; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER ensure_rls ON ddl_command_end
         WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
   EXECUTE FUNCTION public.rls_auto_enable();


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict EWb1gO01vZbCzMv2rNjFcgjB5AiHWS3FcVjcwiAlUz8NHeOYLLGnsVpFfMy5brr

