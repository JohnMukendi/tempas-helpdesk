-- Setup script for Announcements feature

-- 1. Create Announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    version TEXT UNIQUE NOT NULL, -- e.g. v1.2.0
    type TEXT NOT NULL DEFAULT 'update', -- e.g. 'update', 'feature', 'announcement'
    title TEXT NOT NULL,
    description TEXT, -- Short description or subtitle
    content TEXT NOT NULL, -- Will store Rich Text (HTML)
    gif_url TEXT, -- URL to the converted GIF in Supabase Storage
    steps JSONB NOT NULL DEFAULT '[]'::jsonb, -- Onboarding data for features
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Policies for announcements
CREATE POLICY "Allow public select" 
    ON public.announcements 
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow public insert" 
    ON public.announcements 
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public update" 
    ON public.announcements 
    FOR UPDATE 
    USING (true);

CREATE POLICY "Allow public delete" 
    ON public.announcements 
    FOR DELETE 
    USING (true);

-- Note: User tracking is handled by the `preferences.lastSeenWhatsNew` JSON field on the User object in the main Tempas App.
-- Note: The 'announcemnt_recordings' storage bucket should be set to Public.
