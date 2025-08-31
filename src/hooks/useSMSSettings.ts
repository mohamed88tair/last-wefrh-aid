import { useState, useEffect } from 'react';
import { smsSettingsService, messageTemplatesService } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';
import { errorLogger } from '../utils/errorLogger';

export interface SMSSettings {
  id: string;
  api_key: string;
  sender_name: string;
  is_active: boolean;
  last_balance_check?: string;
  last_balance_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export const useSMSSettings = () => {
  const { loggedInUser } = useAuth();
  const [settings, setSettings] = useState<SMSSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await smsSettingsService.getSettings();
      setSettings(data);
      
      errorLogger.logInfo('تم تحميل إعدادات SMS من Supabase', 'useSMSSettings');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل إعدادات SMS';
      setError(errorMessage);
      errorLogger.logError(new Error(errorMessage), 'useSMSSettings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (apiKey: string, senderName: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await smsSettingsService.saveSettings(
        apiKey, 
        senderName, 
        loggedInUser?.id
      );
      
      setSettings(data);
      errorLogger.logInfo('تم حفظ إعدادات SMS في Supabase', 'useSMSSettings');
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في حفظ إعدادات SMS';
      setError(errorMessage);
      errorLogger.logError(new Error(errorMessage), 'useSMSSettings');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async (balance: number) => {
    try {
      await smsSettingsService.updateBalance(balance);
      
      // إعادة جلب الإعدادات للتأكد من المزامنة
      await fetchSettings();
      
      errorLogger.logInfo(`تم تحديث رصيد SMS: ${balance}`, 'useSMSSettings');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحديث الرصيد';
      errorLogger.logError(new Error(errorMessage), 'useSMSSettings');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    saveSettings,
    updateBalance,
    refetch: fetchSettings
  };
};

export const useMessageTemplates = () => {
  const { loggedInUser } = useAuth();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await messageTemplatesService.getAll();
      setTemplates(data);
      
      errorLogger.logInfo('تم تحميل قوالب الرسائل من Supabase', 'useMessageTemplates');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل قوالب الرسائل';
      setError(errorMessage);
      errorLogger.logError(new Error(errorMessage), 'useMessageTemplates');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: {
    name: string;
    content: string;
    category: string;
    variables?: string[];
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await messageTemplatesService.create(template, loggedInUser?.id);
      setTemplates(prev => [data, ...prev]);
      
      errorLogger.logInfo(`تم إنشاء قالب رسالة جديد: ${template.name}`, 'useMessageTemplates');
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في إنشاء قالب الرسالة';
      setError(errorMessage);
      errorLogger.logError(new Error(errorMessage), 'useMessageTemplates');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (id: string, updates: {
    name?: string;
    content?: string;
    category?: string;
    variables?: string[];
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await messageTemplatesService.update(id, updates, loggedInUser?.id);
      setTemplates(prev => prev.map(t => t.id === id ? data : t));
      
      errorLogger.logInfo(`تم تحديث قالب الرسالة: ${id}`, 'useMessageTemplates');
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحديث قالب الرسالة';
      setError(errorMessage);
      errorLogger.logError(new Error(errorMessage), 'useMessageTemplates');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await messageTemplatesService.delete(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      
      errorLogger.logInfo(`تم حذف قالب الرسالة: ${id}`, 'useMessageTemplates');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في حذف قالب الرسالة';
      setError(errorMessage);
      errorLogger.logError(new Error(errorMessage), 'useMessageTemplates');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const incrementUsage = async (id: string) => {
    try {
      await messageTemplatesService.incrementUsage(id);
      setTemplates(prev => prev.map(t => 
        t.id === id ? { ...t, usage_count: t.usage_count + 1 } : t
      ));
    } catch (err) {
      // تسجيل التحذير فقط، لا نريد إيقاف العملية
      errorLogger.logWarning(`فشل في تحديث عداد الاستخدام: ${err}`, 'useMessageTemplates');
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
    refetch: fetchTemplates
  };
};