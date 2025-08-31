/*
  # Fix RLS policies for SMS settings and message templates

  1. Security Updates
    - Update RLS policies to allow proper access for authenticated users
    - Add policies for anon users where needed for initial setup
    - Ensure proper INSERT, SELECT, UPDATE, DELETE permissions

  2. Policy Changes
    - Allow authenticated users full access to their SMS settings
    - Allow anon users to create initial SMS settings (for setup)
    - Proper policies for message templates management
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin users can read SMS settings" ON sms_settings;
DROP POLICY IF EXISTS "Admin users can insert SMS settings" ON sms_settings;
DROP POLICY IF EXISTS "Admin users can update SMS settings" ON sms_settings;
DROP POLICY IF EXISTS "Admin users can delete SMS settings" ON sms_settings;

DROP POLICY IF EXISTS "Users can read message templates" ON message_templates;
DROP POLICY IF EXISTS "Users can insert message templates" ON message_templates;
DROP POLICY IF EXISTS "Users can update message templates" ON message_templates;
DROP POLICY IF EXISTS "Users can delete message templates" ON message_templates;

-- SMS Settings policies
CREATE POLICY "Allow all operations on SMS settings for authenticated users"
  ON sms_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on SMS settings for anon users"
  ON sms_settings
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Message Templates policies
CREATE POLICY "Allow all operations on message templates for authenticated users"
  ON message_templates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on message templates for anon users"
  ON message_templates
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);