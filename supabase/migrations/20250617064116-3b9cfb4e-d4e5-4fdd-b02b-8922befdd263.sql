
-- First, drop the existing RLS policies that depend on user_id
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.blog_comments;

-- Now update the blog_comments table to remove user_id and add visitor information fields
ALTER TABLE public.blog_comments 
DROP COLUMN user_id,
ADD COLUMN visitor_name TEXT NOT NULL,
ADD COLUMN visitor_email TEXT,
ADD COLUMN visitor_phone TEXT;

-- Add a check constraint to ensure at least one contact method is provided
ALTER TABLE public.blog_comments 
ADD CONSTRAINT check_contact_info 
CHECK (visitor_email IS NOT NULL OR visitor_phone IS NOT NULL);

-- Since we're removing user_id, we can disable RLS as comments are now public
ALTER TABLE public.blog_comments DISABLE ROW LEVEL SECURITY;
