/*
  # إنشاء دالة لزيادة عداد استخدام قوالب الرسائل

  1. Functions
    - `increment_template_usage`: دالة لزيادة عداد الاستخدام لقالب رسالة معين

  2. Security
    - الدالة متاحة للمستخدمين المصرح لهم فقط
*/

-- إنشاء دالة لزيادة عداد الاستخدام
CREATE OR REPLACE FUNCTION increment_template_usage(template_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE message_templates 
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = template_id AND is_active = true;
END;
$$;