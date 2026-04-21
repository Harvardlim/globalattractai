INSERT INTO public.feature_controls (feature_key, feature_name, disabled_message)
VALUES ('sihai_analysis', '四害分析', '即将上线')
ON CONFLICT DO NOTHING;