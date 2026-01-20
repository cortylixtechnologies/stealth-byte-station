-- Drop existing enrollment policy
DROP POLICY IF EXISTS "Users can enroll themselves" ON course_enrollments;

-- Create new enrollment policy that only allows enrollment in free courses
-- Paid courses will require a payment system integration in the future
CREATE POLICY "Users can enroll in free courses" 
  ON course_enrollments FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM courses 
      WHERE id = course_id 
      AND is_free = true
    )
  );

-- Add UPDATE policy for enrollments (needed for marking completion)
CREATE POLICY "Users can update own enrollments" 
  ON course_enrollments FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add admin update policy for enrollments
CREATE POLICY "Admins can update enrollments" 
  ON course_enrollments FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add INSERT policy for certificates that allows users to insert their own certificate
-- when they complete a course (for automatic certificate generation)
CREATE POLICY "Users can create own certificates"
  ON certificates FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM course_enrollments
      WHERE course_id = certificates.course_id
      AND user_id = auth.uid()
      AND is_completed = true
    )
  );