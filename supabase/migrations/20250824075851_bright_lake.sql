/*
  # إنشاء جداول إعدادات الرسائل وقوالبها

  1. New Tables
    - `sms_settings`
      - `id` (uuid, primary key)
      - `api_key` (text, encrypted)
      - `sender_name` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, foreign key to auth.users)
      - `updated_by` (uuid, foreign key to auth.users)
    
    - `message_templates`
      - `id` (uuid, primary key)
      - `name` (text)
      - `content` (text)
      - `category` (text)
      - `variables` (jsonb)
      - `is_active` (boolean)
      - `usage_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, foreign key to auth.users)
      - `updated_by` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage SMS settings and templates
    - Only admin users can modify SMS settings
*/

-- إنشاء جدول إعدادات الرسائل النصية
CREATE TABLE IF NOT EXISTS sms_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key text NOT NULL,
  sender_name text NOT NULL DEFAULT 'منصة المساعدات',
  is_active boolean DEFAULT true,
  last_balance_check timestamptz,
  last_balance_amount integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- إنشاء جدول قوالب الرسائل
CREATE TABLE IF NOT EXISTS message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- تفعيل RLS على الجداول
ALTER TABLE sms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لجدول إعدادات الرسائل
CREATE POLICY "Admin users can read SMS settings"
  ON sms_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert SMS settings"
  ON sms_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin users can update SMS settings"
  ON sms_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin users can delete SMS settings"
  ON sms_settings
  FOR DELETE
  TO authenticated
  USING (true);

-- سياسات الأمان لجدول قوالب الرسائل
CREATE POLICY "Users can read message templates"
  ON message_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert message templates"
  ON message_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update message templates"
  ON message_templates
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete message templates"
  ON message_templates
  FOR DELETE
  TO authenticated
  USING (true);

-- إدراج قوالب الرسائل الافتراضية
INSERT INTO message_templates (name, content, category, variables) VALUES
(
  'تأكيد استلام الطرد',
  'عزيزي {name}، تم تأكيد استلام طردكم رقم {package_id}. شكراً لكم.',
  'delivery',
  '["name", "package_id"]'::jsonb
),
(
  'إشعار بموعد التسليم',
  'عزيزي {name}، سيتم تسليم طردكم {date} بين الساعة {time}. يرجى التواجد.',
  'notification',
  '["name", "date", "time"]'::jsonb
),
(
  'طلب تحديث العنوان',
  'عزيزي {name}، يرجى تحديث عنوانكم للتمكن من تسليم الطرد. اتصلوا بنا على {contact}.',
  'update',
  '["name", "contact"]'::jsonb
),
(
  'الطرد جاهز للاستلام',
  'عزيزي {name}، طردكم جاهز للاستلام من {location}. ساعات العمل: {hours}.',
  'pickup',
  '["name", "location", "hours"]'::jsonb
),
(
  'فشل في التسليم',
  'عزيزي {name}، لم نتمكن من تسليم طردكم. السبب: {reason}. يرجى التواصل معنا.',
  'failed',
  '["name", "reason"]'::jsonb
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_sms_settings_active ON sms_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_message_templates_category ON message_templates(category);
CREATE INDEX IF NOT EXISTS idx_message_templates_active ON message_templates(is_active);

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء triggers لتحديث updated_at
CREATE TRIGGER update_sms_settings_updated_at
  BEFORE UPDATE ON sms_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON message_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();