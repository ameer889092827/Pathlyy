
-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    majors_explored TEXT[] DEFAULT '{}',
    roadmaps_viewed TEXT[] DEFAULT '{}',
    assessments_taken TEXT[] DEFAULT '{}',
    major_progress JSONB DEFAULT '{}',
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    total_days_active INTEGER DEFAULT 0,
    achievements JSONB DEFAULT '{}',
    goals JSONB DEFAULT '[]',
    activities JSONB DEFAULT '[]',
    welcome_challenges_completed INTEGER DEFAULT 0,
    last_welcome_challenge_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Create RLS policies
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own progress
CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE
    ON public.user_progress FOR EACH ROW EXECUTE PROCEDURE
    update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_last_activity ON public.user_progress(last_activity_date);
