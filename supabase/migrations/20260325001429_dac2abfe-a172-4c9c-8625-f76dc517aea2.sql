INSERT INTO public.feature_controls (feature_key, feature_name, is_globally_disabled, admin_bypass, disabled_message)
VALUES ('numerology', '数字学', false, true, '即将上线')
ON CONFLICT DO NOTHING;