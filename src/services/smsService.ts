import { errorLogger } from '../utils/errorLogger';

export interface SMSConfig {
  apiKey: string;
  senderName: string;
  baseUrl: string;
}

export interface SMSResponse {
  success: boolean;
  message: string;
  smsId?: string;
  errorCode?: string;
}

export interface BalanceResponse {
  success: boolean;
  balance?: number;
  message: string;
  errorCode?: string;
}

export class TweetSMSService {
  private config: SMSConfig;
  private errorLogger = errorLogger;

  constructor(config: SMSConfig) {
    this.config = config;
  }

  /**
   * إرسال رسالة نصية
   */
  async sendSMS(to: string, message: string): Promise<SMSResponse> {
    try {
      // التحقق من صحة المدخلات
      if (!to.trim() || !message.trim()) {
        throw new Error('رقم الهاتف ونص الرسالة مطلوبان');
      }

      if (!this.config.apiKey.trim()) {
        throw new Error('مفتاح API مطلوب');
      }

      // بناء URL للطلب
      const url = new URL(this.config.baseUrl + '/api.php', window.location.origin);
      url.searchParams.append('comm', 'sendsms');
      url.searchParams.append('api_key', this.config.apiKey);
      url.searchParams.append('to', to);
      url.searchParams.append('message', message);
      url.searchParams.append('sender', this.config.senderName);

      this.errorLogger.logInfo(`إرسال رسالة إلى: ${to}`, 'TweetSMSService');

      // إرسال الطلب
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      this.errorLogger.logInfo(`استجابة TweetSMS: ${responseText}`, 'TweetSMSService');

      return this.parseSMSResponse(responseText);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      this.errorLogger.logError(error as Error, 'TweetSMSService');
      
      return {
        success: false,
        message: errorMessage,
        errorCode: 'NETWORK_ERROR'
      };
    }
  }

  /**
   * فحص الرصيد المتاح
   */
  async checkBalance(): Promise<BalanceResponse> {
    try {
      if (!this.config.apiKey.trim()) {
        throw new Error('مفتاح API مطلوب');
      }

      // بناء URL للطلب
      const url = new URL(this.config.baseUrl + '/api.php', window.location.origin);
      url.searchParams.append('comm', 'chk_balance');
      url.searchParams.append('api_key', this.config.apiKey);

      this.errorLogger.logInfo('فحص رصيد TweetSMS', 'TweetSMSService');

      // إرسال الطلب
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      this.errorLogger.logInfo(`استجابة فحص الرصيد: ${responseText}`, 'TweetSMSService');

      return this.parseBalanceResponse(responseText);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      this.errorLogger.logError(error as Error, 'TweetSMSService');
      
      return {
        success: false,
        message: errorMessage,
        errorCode: 'NETWORK_ERROR'
      };
    }
  }

  /**
   * إرسال رسالة جماعية
   */
  async sendBulkSMS(recipients: Array<{phone: string, message: string}>): Promise<SMSResponse[]> {
    const results: SMSResponse[] = [];
    
    for (const recipient of recipients) {
      const result = await this.sendSMS(recipient.phone, recipient.message);
      results.push(result);
      
      // تأخير قصير بين الرسائل لتجنب الحمل الزائد
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  /**
   * تحليل استجابة إرسال الرسالة
   */
  private parseSMSResponse(responseText: string): SMSResponse {
    // تنسيق الاستجابة: Result:SMS_ID:mobileNumber أو رمز خطأ
    if (responseText.includes(':')) {
      const parts = responseText.split(':');
      const result = parts[0];
      
      if (result === '1') {
        return {
          success: true,
          message: 'تم إرسال الرسالة بنجاح',
          smsId: parts[1] || 'غير محدد'
        };
      }
    }

    // التحقق من رموز الأخطاء
    const errorCodes: { [key: string]: string } = {
      '-2': 'رقم الهاتف غير صالح أو البلد غير مدعوم',
      '-999': 'فشل في الإرسال من مزود الخدمة',
      'u': 'حالة الرسالة غير معروفة',
      '-100': 'معلمات مفقودة أو فارغة (user + pass + to + message + sender)',
      '-110': 'اسم المستخدم أو كلمة المرور خاطئة',
      '-113': 'الرصيد غير كافي',
      '-115': 'اسم المرسل غير متاح (إذا لم يكن لدى المستخدم مرسل مفتوح)',
      '-116': 'اسم المرسل غير صالح'
    };

    const errorCode = responseText.trim();
    const errorMessage = errorCodes[errorCode] || `خطأ غير معروف: ${responseText}`;

    return {
      success: false,
      message: errorMessage,
      errorCode: errorCode
    };
  }

  /**
   * تحليل استجابة فحص الرصيد
   */
  private parseBalanceResponse(responseText: string): BalanceResponse {
    // محاولة تحليل الرصيد كرقم
    const balanceNumber = parseFloat(responseText);
    if (!isNaN(balanceNumber) && balanceNumber >= 0) {
      return {
        success: true,
        balance: balanceNumber,
        message: 'تم فحص الرصيد بنجاح'
      };
    }

    // التحقق من رموز الأخطاء
    const errorCodes: { [key: string]: string } = {
      '-100': 'معلمات مفقودة',
      '-110': 'اسم المستخدم أو كلمة المرور خاطئة'
    };

    const errorCode = responseText.trim();
    const errorMessage = errorCodes[errorCode] || `خطأ في فحص الرصيد: ${responseText}`;

    return {
      success: false,
      message: errorMessage,
      errorCode: errorCode
    };
  }

  /**
   * تحديث إعدادات الخدمة
   */
  updateConfig(newConfig: Partial<SMSConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * الحصول على الإعدادات الحالية
   */
  getConfig(): SMSConfig {
    return { ...this.config };
  }
}

// إنشاء مثيل افتراضي من الخدمة
export const defaultSMSService = new TweetSMSService({
  apiKey: '', // سيتم تحميلها من Supabase
  senderName: 'منصة المساعدات', // سيتم تحميلها من Supabase
  baseUrl: '/api/tweetsms'
});

// دالة لتحميل الإعدادات من Supabase وتحديث الخدمة
export const initializeSMSServiceFromSupabase = async () => {
  try {
    const { smsSettingsService } = await import('./supabaseService');
    const settings = await smsSettingsService.getSettings();
    
    if (settings) {
      defaultSMSService.updateConfig({
        apiKey: settings.api_key,
        senderName: settings.sender_name
      });
      
      errorLogger.logInfo('تم تحميل إعدادات SMS من Supabase', 'initializeSMSServiceFromSupabase');
      return true;
    }
    
    return false;
  } catch (error) {
    errorLogger.logError(error as Error, 'initializeSMSServiceFromSupabase');
    return false;
  }
};

// دوال مساعدة للاستخدام في المكونات
export const sendTestSMS = async (phone: string, message: string, apiKey?: string, senderName?: string): Promise<SMSResponse> => {
  if (apiKey || senderName) {
    defaultSMSService.updateConfig({
      ...(apiKey && { apiKey }),
      ...(senderName && { senderName })
    });
  }
  
  return defaultSMSService.sendSMS(phone, message);
};

export const checkSMSBalance = async (apiKey?: string): Promise<BalanceResponse> => {
  if (apiKey) {
    defaultSMSService.updateConfig({ apiKey });
  }
  
  return defaultSMSService.checkBalance();
};

// دالة لإرسال إشعارات للمستفيدين
export const sendBeneficiaryNotification = async (
  phone: string, 
  templateType: 'delivery_confirmation' | 'delivery_schedule' | 'address_update' | 'custom',
  variables: { [key: string]: string } = {},
  customMessage?: string
): Promise<SMSResponse> => {
  let message = '';

  switch (templateType) {
    case 'delivery_confirmation':
      message = `عزيزي ${variables.name || 'المستفيد'}، تم تأكيد استلام طردكم رقم ${variables.package_id || 'غير محدد'}. شكراً لكم.`;
      break;
    case 'delivery_schedule':
      message = `عزيزي ${variables.name || 'المستفيد'}، سيتم تسليم طردكم ${variables.date || 'غداً'} بين الساعة ${variables.time || '10-12 ظهراً'}. يرجى التواجد.`;
      break;
    case 'address_update':
      message = `عزيزي ${variables.name || 'المستفيد'}، يرجى تحديث عنوانكم للتمكن من تسليم الطرد. اتصلوا بنا على ${variables.contact || '123456789'}.`;
      break;
    case 'custom':
      message = customMessage || 'رسالة من منصة المساعدات الإنسانية';
      break;
    default:
      message = 'رسالة من منصة المساعدات الإنسانية';
  }

  return defaultSMSService.sendSMS(phone, message);
};

// دالة للحصول على قوالب الرسائل
export const getMessageTemplates = () => {
  return [
    {
      id: 'delivery_confirmation',
      name: 'تأكيد استلام الطرد',
      content: 'عزيزي {name}، تم تأكيد استلام طردكم رقم {package_id}. شكراً لكم.',
      variables: ['name', 'package_id']
    },
    {
      id: 'delivery_schedule',
      name: 'إشعار بموعد التسليم',
      content: 'عزيزي {name}، سيتم تسليم طردكم {date} بين الساعة {time}. يرجى التواجد.',
      variables: ['name', 'date', 'time']
    },
    {
      id: 'address_update',
      name: 'طلب تحديث العنوان',
      content: 'عزيزي {name}، يرجى تحديث عنوانكم للتمكن من تسليم الطرد. اتصلوا بنا على {contact}.',
      variables: ['name', 'contact']
    },
    {
      id: 'package_ready',
      name: 'الطرد جاهز للاستلام',
      content: 'عزيزي {name}، طردكم جاهز للاستلام من {location}. ساعات العمل: {hours}.',
      variables: ['name', 'location', 'hours']
    },
    {
      id: 'delivery_failed',
      name: 'فشل في التسليم',
      content: 'عزيزي {name}، لم نتمكن من تسليم طردكم. السبب: {reason}. يرجى التواصل معنا.',
      variables: ['name', 'reason']
    }
  ];
};