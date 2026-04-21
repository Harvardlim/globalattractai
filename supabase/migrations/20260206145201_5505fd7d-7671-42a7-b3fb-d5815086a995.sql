-- Create enum for member tiers
CREATE TYPE public.member_tier AS ENUM ('normal', 'vip', 'vip_plus');

-- Add member_tier column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN member_tier public.member_tier NOT NULL DEFAULT 'normal';

-- Create index for faster tier lookups
CREATE INDEX idx_profiles_member_tier ON public.profiles(member_tier);