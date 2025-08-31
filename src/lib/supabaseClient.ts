import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ متغيرات بيئة Supabase غير محددة. يرجى إعداد VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

export const checkConnection = async (): Promise<boolean> => {
  if (!supabase) {
    console.warn('عميل Supabase غير متاح');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('sms_settings')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('خطأ في اختبار الاتصال:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في الاتصال بـ Supabase:', error);
    return false;
  }
};

export const getProjectInfo = async () => {
  if (!supabase) {
    return {
      connected: false,
      url: 'غير متصل',
      hasData: false,
      error: 'متغيرات بيئة Supabase غير محددة'
    };
  }

  try {
    const { data, error } = await supabase
      .from('sms_settings')
      .select('id')
      .limit(1);
    
    return {
      connected: !error,
      url: supabaseUrl || 'غير محدد',
      hasData: data && data.length > 0,
      error: error?.message || null
    };
  } catch (error) {
    return {
      connected: false,
      url: supabaseUrl || 'غير محدد',
      hasData: false,
      error: error instanceof Error ? error.message : 'خطأ غير معروف'
    };
  }
};

export default supabase;