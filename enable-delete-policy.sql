-- Enable delete policy for test data cleanup
-- This adds temporary delete permission for anon users

-- Add delete policy for anonymous users (temporary for cleanup)
CREATE POLICY "Temporary delete policy for cleanup" ON products
    FOR DELETE USING (true);

-- Grant delete permission to anonymous users
GRANT DELETE ON products TO anon;