import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, DollarSign, CheckCircle, AlertTriangle, Phone, Settings, RefreshCw, X, Eye, EyeOff, Smartphone, Globe, Clock, Shield, Bell, Zap, Wifi, WifiOff, Save, Plus, Edit, Trash2, Copy } from 'lucide-react';
import { useErrorLogger } from '../../utils/errorLogger';
import { Button, Card, Input, Badge, Modal } from '../ui';
import { defaultSMSService } from '../../services/smsService';
import { useSMSSettings, useMessageTemplates, type MessageTemplate } from '../../hooks/useSMSSettings';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../lib/supabaseClient';

interface SMSResponse {
  success: boolean;
  message: string;
  smsId?: string;
  errorCode?: string;
}

export default function MessagesSettingsPage() {
  const { logInfo, logError } = useErrorLogger();
  const { loggedInUser } = useAuth();
  
  // Hooks for Supabase data
  const { 
    settings, 
    loading: settingsLoading, 
    error: settingsError, 
    saveSettings: saveSettingsToSupabase, 
    updateBalance,
    refetch: refetchSettings 
  } = useSMSSettings();
  
  const { 
    templates, 
    loading: templatesLoading, 
    error: templatesError, 
    createTemplate, 
    updateTemplate, 
    deleteTemplate,
    incrementUsage,
    refetch: refetchTemplates 
  } = useMessageTemplates();
  
  // Form states
  const [testPhone, setTestPhone] = useState('972594127070');
  const [testMessage, setTestMessage] = useState('رسالة تجريبية من منصة المساعدات الإنسانية');
  const [isLoading, setIsLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  
  // Settings states
  const [apiKey, setApiKey] = useState('');
  const [senderName, setSenderName] = useState('منصة المساعدات');
  const [showApiKey, setShowApiKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Template modal states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateModalType, setTemplateModalType] = useState<'add' | 'edit'>('add');
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    content: '',
    category: 'delivery',
    variables: [] as string[]
  });

  // Load settings from Supabase when available
  useEffect(() => {
    if (settings) {
      setApiKey(settings.api_key || '');
      setSenderName(settings.sender_name || 'منصة المساعدات');
      setSettingsSaved(true);
      
      // استنتاج حالة الاتصال من البيانات المحفوظة
      if (settings.last_balance_check && settings.last_balance_amount !== null) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('unknown');
      }
      
      // Update SMS service config
      defaultSMSService.updateConfig({
        apiKey: settings.api_key,
        senderName: settings.sender_name
      });
    }
  }, [settings]);

  const saveSettings = async () => {
    if (!apiKey.trim() || !senderName.trim()) {
      setNotification({ message: 'يرجى إدخال مفتاح API واسم المرسل', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setConnectionLoading(true);
    setNotification(null);

    try {
      // Save to Supabase
      await saveSettingsToSupabase(apiKey, senderName);

      // Update SMS service config
      defaultSMSService.updateConfig({
        apiKey: apiKey,
        senderName: senderName
      });

      setSettingsSaved(true);
      setConnectionStatus('unknown'); // Reset connection status
      setNotification({ 
        message: 'تم حفظ الإعدادات بنجاح في قاعدة البيانات', 
        type: 'success' 
      });
      logInfo('تم حفظ إعدادات SMS في Supabase', 'MessagesSettingsPage');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ في حفظ الإعدادات';
      setNotification({ message: errorMessage, type: 'error' });
      logError(error as Error, 'MessagesSettingsPage');
    } finally {
      setConnectionLoading(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const testConnection = async () => {
    if (!apiKey.trim() || !senderName.trim()) {
      setNotification({ message: 'يرجى إدخال مفتاح API واسم المرسل أولاً', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (!settingsSaved) {
      setNotification({ message: 'يرجى حفظ الإعدادات أولاً', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setConnectionLoading(true);
    setNotification(null);

    try {
      logInfo('اختبار الاتصال مع خدمة TweetSMS', 'MessagesSettingsPage');

      // Test connection by checking balance
      const result = await defaultSMSService.checkBalance();

      if (result.success && result.balance !== undefined) {
        setConnectionStatus('connected');
        
        // Update balance in Supabase
        await updateBalance(result.balance);
        
        setNotification({ 
          message: `تم الاتصال بنجاح! الرصيد المتاح: ${result.balance} رسالة`, 
          type: 'success' 
        });
        logInfo(`تم الاتصال بنجاح. الرصيد: ${result.balance}`, 'MessagesSettingsPage');
      } else {
        setConnectionStatus('failed');
        setNotification({ 
          message: `فشل الاتصال: ${result.message}`, 
          type: 'error' 
        });
        logError(new Error(`فشل اختبار الاتصال: ${result.message}`), 'MessagesSettingsPage');
      }

    } catch (error) {
      setConnectionStatus('failed');
      const errorMessage = error instanceof Error ? error.message : 'خطأ في الاتصال بخدمة الرسائل';
      setNotification({ message: errorMessage, type: 'error' });
      logError(error as Error, 'MessagesSettingsPage');
    } finally {
      setConnectionLoading(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const sendTestSMS = async () => {
    if (!testPhone.trim() || !testMessage.trim()) {
      setNotification({ message: 'يرجى إدخال رقم الهاتف ونص الرسالة', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (connectionStatus !== 'connected') {
      setNotification({ message: 'يرجى اختبار الاتصال بنجاح أولاً', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setIsLoading(true);
    setNotification(null);

    try {
      logInfo(`محاولة إرسال رسالة تجريبية إلى: ${testPhone}`, 'MessagesSettingsPage');

      const result = await defaultSMSService.sendSMS(testPhone, testMessage);

      if (result.success) {
        setNotification({ 
          message: `تم إرسال الرسالة بنجاح! معرف الرسالة: ${result.smsId}`, 
          type: 'success' 
        });
        logInfo(`تم إرسال الرسالة بنجاح. معرف الرسالة: ${result.smsId}`, 'MessagesSettingsPage');
      } else {
        setNotification({ 
          message: `فشل في إرسال الرسالة: ${result.message}`, 
          type: 'error' 
        });
        logError(new Error(`فشل إرسال SMS: ${result.message}`), 'MessagesSettingsPage');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ في الاتصال بخدمة الرسائل';
      setNotification({ message: errorMessage, type: 'error' });
      logError(error as Error, 'MessagesSettingsPage');
    } finally {
      setIsLoading(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const checkBalance = async () => {
    if (connectionStatus !== 'connected') {
      setNotification({ message: 'يرجى اختبار الاتصال بنجاح أولاً', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setBalanceLoading(true);
    setNotification(null);

    try {
      logInfo('فحص رصيد خدمة TweetSMS', 'MessagesSettingsPage');

      const result = await defaultSMSService.checkBalance();

      if (result.success && result.balance !== undefined) {
        // Update balance in Supabase
        await updateBalance(result.balance);
        
        setNotification({ 
          message: `الرصيد المتاح: ${result.balance} رسالة`, 
          type: 'success' 
        });
        logInfo(`الرصيد المتاح: ${result.balance}`, 'MessagesSettingsPage');
      } else {
        setNotification({ 
          message: `فشل في فحص الرصيد: ${result.message}`, 
          type: 'error' 
        });
        logError(new Error(`فشل فحص الرصيد: ${result.message}`), 'MessagesSettingsPage');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ في الاتصال بخدمة الرسائل';
      setNotification({ message: errorMessage, type: 'error' });
      logError(error as Error, 'MessagesSettingsPage');
    } finally {
      setBalanceLoading(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Template management functions
  const handleAddTemplate = () => {
    setTemplateModalType('add');
    setSelectedTemplate(null);
    setTemplateForm({
      name: '',
      content: '',
      category: 'delivery',
      variables: []
    });
    setShowTemplateModal(true);
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setTemplateModalType('edit');
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      content: template.content,
      category: template.category,
      variables: template.variables
    });
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.content.trim()) {
      setNotification({ message: 'يرجى إدخال اسم القالب والمحتوى', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      if (templateModalType === 'add') {
        await createTemplate(templateForm);
        setNotification({ message: 'تم إنشاء القالب بنجاح', type: 'success' });
      } else if (selectedTemplate) {
        await updateTemplate(selectedTemplate.id, templateForm);
        setNotification({ message: 'تم تحديث القالب بنجاح', type: 'success' });
      }
      
      setShowTemplateModal(false);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ في حفظ القالب';
      setNotification({ message: errorMessage, type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteTemplate = async (template: MessageTemplate) => {
    if (confirm(`هل أنت متأكد من حذف القالب "${template.name}"؟`)) {
      try {
        await deleteTemplate(template.id);
        setNotification({ message: 'تم حذف القالب بنجاح', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'خطأ في حذف القالب';
        setNotification({ message: errorMessage, type: 'error' });
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  const handleUseTemplate = async (template: MessageTemplate) => {
    setTestMessage(template.content);
    
    // Increment usage count
    try {
      await incrementUsage(template.id);
    } catch (error) {
      // Silent fail for usage count
      console.warn('فشل في تحديث عداد الاستخدام:', error);
    }
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const getNotificationClasses = (type: 'success' | 'error' | 'warning') => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-200 text-green-800';
      case 'error': return 'bg-red-100 border-red-200 text-red-800';
      case 'warning': return 'bg-orange-100 border-orange-200 text-orange-800';
    }
  };

  const getNotificationIcon = (type: 'success' | 'error' | 'warning') => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning': return <Clock className="w-5 h-5 text-orange-600" />;
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="w-5 h-5 text-green-600" />;
      case 'failed': return <WifiOff className="w-5 h-5 text-red-600" />;
      default: return <Globe className="w-5 h-5 text-gray-600" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'متصل بنجاح';
      case 'failed': return 'فشل الاتصال';
      default: return 'لم يتم الاختبار';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'delivery': return 'تسليم';
      case 'notification': return 'إشعار';
      case 'update': return 'تحديث';
      case 'pickup': return 'استلام';
      case 'failed': return 'فشل';
      case 'general': return 'عام';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'delivery': return 'bg-green-100 text-green-800';
      case 'notification': return 'bg-blue-100 text-blue-800';
      case 'update': return 'bg-orange-100 text-orange-800';
      case 'pickup': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 space-x-reverse ${getNotificationClasses(notification.type)}`}>
          {getNotificationIcon(notification.type)}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Supabase Connection Status */}
      <Card className={supabase ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} padding="sm">
        <div className="flex items-center space-x-2 space-x-reverse">
          {supabase ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                متصل بـ Supabase - البيانات ستُحفظ في قاعدة البيانات
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                غير متصل بـ Supabase - يرجى إعداد متغيرات البيئة
              </span>
            </>
          )}
        </div>
      </Card>

      {/* SMS Service Configuration */}
      <Card>
        <div className="flex items-center space-x-3 space-x-reverse mb-6">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">إعدادات خدمة الرسائل النصية</h3>
            <p className="text-gray-600">تكوين خدمة TweetSMS لإرسال الرسائل النصية</p>
          </div>
        </div>

        {/* Loading state for settings */}
        {settingsLoading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 ml-3" />
            <span className="text-gray-600">جاري تحميل الإعدادات من قاعدة البيانات...</span>
          </div>
        )}

        {/* Settings error */}
        {settingsError && (
          <Card className="bg-red-50 border-red-200 mb-6" padding="sm">
            <div className="flex items-center space-x-2 space-x-reverse">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">خطأ في تحميل الإعدادات: {settingsError}</span>
            </div>
          </Card>
        )}

        {!settingsLoading && (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مفتاح API *
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setSettingsSaved(false);
                      setConnectionStatus('unknown');
                    }}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل مفتاح API..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  للحصول على مفتاح API، تواصل على واتساب: 972594127070
                </p>
              </div>

              <Input
                label="اسم المرسل *"
                type="text"
                value={senderName}
                onChange={(e) => {
                  setSenderName(e.target.value);
                  setSettingsSaved(false);
                  setConnectionStatus('unknown');
                }}
                placeholder="مثال: منصة المساعدات"
              />
            </div>

            {/* Connection Status and Actions */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  {getConnectionStatusIcon()}
                  <div>
                    <span className={`font-medium ${getConnectionStatusColor()}`}>
                      حالة الاتصال: {getConnectionStatusText()}
                    </span>
                    {connectionStatus === 'connected' && settings?.last_balance_amount !== undefined && (
                      <p className="text-sm text-gray-600 mt-1">
                        الرصيد المتاح: {settings.last_balance_amount} رسالة
                        {settings.last_balance_check && (
                          <span className="text-xs text-gray-500 mr-2">
                            (آخر فحص: {new Date(settings.last_balance_check).toLocaleString('ar-SA')})
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 space-x-reverse">
                  <Button
                    variant="primary"
                    icon={connectionLoading ? undefined : Save}
                    iconPosition="right"
                    onClick={saveSettings}
                    disabled={connectionLoading || !apiKey.trim() || !senderName.trim()}
                    loading={connectionLoading}
                    size="sm"
                  >
                    حفظ الإعدادات
                  </Button>
                  <Button
                    variant="secondary"
                    icon={connectionLoading ? undefined : Wifi}
                    iconPosition="right"
                    onClick={testConnection}
                    disabled={connectionLoading || !settingsSaved}
                    loading={connectionLoading}
                    size="sm"
                  >
                    اختبار الاتصال
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3 space-x-reverse">
                <Shield className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">خطوات الإعداد</h4>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li className={settingsSaved ? 'line-through text-blue-500' : ''}>
                      أدخل مفتاح API واسم المرسل
                    </li>
                    <li className={settingsSaved ? (connectionStatus === 'connected' ? 'line-through text-blue-500' : '') : 'text-gray-500'}>
                      اضغط "حفظ الإعدادات" لحفظ البيانات في قاعدة البيانات
                    </li>
                    <li className={connectionStatus === 'connected' ? 'line-through text-blue-500' : settingsSaved ? '' : 'text-gray-500'}>
                      اضغط "اختبار الاتصال" للتأكد من صحة البيانات
                    </li>
                    <li className={connectionStatus === 'connected' ? '' : 'text-gray-500'}>
                      بعد نجاح الاتصال، يمكنك إرسال رسائل تجريبية
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Balance Check Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-green-100 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">فحص الرصيد</h3>
              <p className="text-gray-600">التحقق من الرصيد المتاح في حساب TweetSMS</p>
            </div>
          </div>
          <Button
            variant="success"
            icon={balanceLoading ? undefined : RefreshCw}
            iconPosition="right"
            onClick={checkBalance}
            disabled={balanceLoading || connectionStatus !== 'connected'}
            loading={balanceLoading}
          >
            فحص الرصيد
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">الرصيد الحالي</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {settings?.last_balance_amount !== undefined ? `${settings.last_balance_amount} رسالة` : 'غير محدد'}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">آخر فحص</span>
            </div>
            <p className="text-sm text-blue-900">
              {settings?.last_balance_check ? 
                new Date(settings.last_balance_check).toLocaleString('ar-SA') : 
                'لم يتم الفحص بعد'
              }
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <Bell className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-800">تنبيه الرصيد</span>
            </div>
            <p className="text-sm text-orange-900">
              {settings?.last_balance_amount !== undefined && settings.last_balance_amount < 100 ? 'رصيد منخفض!' : 'الرصيد جيد'}
            </p>
          </div>
        </div>
      </Card>

      {/* Test SMS Section */}
      <Card>
        <div className="flex items-center space-x-3 space-x-reverse mb-6">
          <div className="bg-purple-100 p-3 rounded-xl">
            <Smartphone className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">إرسال رسالة تجريبية</h3>
            <p className="text-gray-600">اختبار خدمة الرسائل النصية بإرسال رسالة تجريبية</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="رقم الهاتف المستلم *"
            type="tel"
            icon={Phone}
            iconPosition="right"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="مثال: 972594127070"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نص الرسالة *
            </label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="أدخل نص الرسالة التجريبية..."
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">
              {testMessage.length}/160 حرف
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            variant="primary"
            icon={isLoading ? undefined : Send}
            iconPosition="right"
            onClick={sendTestSMS}
            disabled={isLoading || connectionStatus !== 'connected' || !testPhone.trim() || !testMessage.trim()}
            loading={isLoading}
            className="px-8"
          >
            إرسال رسالة تجريبية
          </Button>
        </div>

        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start space-x-3 space-x-reverse">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-orange-800 mb-2">تعليمات الاختبار</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• تأكد من حفظ الإعدادات واختبار الاتصال أولاً</li>
                <li>• رقم الهاتف يجب أن يبدأ برمز البلد (مثال: 972 لفلسطين)</li>
                <li>• الرسالة محدودة بـ 160 حرف كحد أقصى</li>
                <li>• سيتم خصم رسالة واحدة من رصيدك عند الإرسال</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Message Templates */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-indigo-100 p-3 rounded-xl">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">قوالب الرسائل</h3>
              <p className="text-gray-600">قوالب محفوظة في قاعدة البيانات للرسائل النصية المختلفة</p>
            </div>
          </div>
          <Button 
            variant="primary" 
            icon={Plus} 
            iconPosition="right"
            onClick={handleAddTemplate}
            disabled={templatesLoading}
          >
            إضافة قالب جديد
          </Button>
        </div>

        {/* Templates loading state */}
        {templatesLoading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 ml-3" />
            <span className="text-gray-600">جاري تحميل القوالب من قاعدة البيانات...</span>
          </div>
        )}

        {/* Templates error */}
        {templatesError && (
          <Card className="bg-red-50 border-red-200 mb-6" padding="sm">
            <div className="flex items-center space-x-2 space-x-reverse">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">خطأ في تحميل القوالب: {templatesError}</span>
            </div>
          </Card>
        )}

        {!templatesLoading && (
          <div className="space-y-4">
            {templates.length > 0 ? (
              templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      <Badge 
                        variant={
                          template.category === 'delivery' ? 'success' :
                          template.category === 'notification' ? 'info' :
                          template.category === 'failed' ? 'error' : 'warning'
                        }
                        size="sm"
                      >
                        {getCategoryText(template.category)}
                      </Badge>
                      {template.usage_count > 0 && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          استُخدم {template.usage_count} مرة
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2 space-x-reverse">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        icon={Edit}
                        onClick={() => handleEditTemplate(template)}
                      >
                        تعديل
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm"
                        icon={Copy}
                        onClick={() => handleUseTemplate(template)}
                      >
                        استخدام
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteTemplate(template)}
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {template.content}
                  </p>
                  {template.variables.length > 0 && (
                    <div className="mt-2 flex items-center space-x-2 space-x-reverse">
                      <span className="text-xs text-gray-500">المتغيرات:</span>
                      {template.variables.map((variable) => (
                        <code key={variable} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          {`{${variable}}`}
                        </code>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">لا توجد قوالب رسائل</p>
                <p className="text-sm mt-2">ابدأ بإضافة قالب رسالة جديد</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Template Modal */}
      {showTemplateModal && (
        <Modal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          title={templateModalType === 'add' ? 'إضافة قالب رسالة جديد' : 'تعديل قالب الرسالة'}
          size="lg"
        >
          <div className="p-6 space-y-4">
            <Input
              label="اسم القالب *"
              type="text"
              value={templateForm.name}
              onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
              placeholder="مثال: تأكيد استلام الطرد"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">فئة القالب *</label>
              <select
                value={templateForm.category}
                onChange={(e) => setTemplateForm({...templateForm, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="delivery">تسليم</option>
                <option value="notification">إشعار</option>
                <option value="update">تحديث</option>
                <option value="pickup">استلام</option>
                <option value="failed">فشل</option>
                <option value="general">عام</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">محتوى الرسالة *</label>
              <textarea
                value={templateForm.content}
                onChange={(e) => {
                  const content = e.target.value;
                  setTemplateForm({
                    ...templateForm, 
                    content,
                    variables: extractVariables(content)
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="أدخل نص الرسالة... استخدم {متغير} للمتغيرات"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">
                {templateForm.content.length}/160 حرف
              </p>
            </div>

            {templateForm.variables.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المتغيرات المكتشفة</label>
                <div className="flex flex-wrap gap-2">
                  {templateForm.variables.map((variable) => (
                    <code key={variable} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                      {`{${variable}}`}
                    </code>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3 space-x-reverse justify-end pt-4">
              <Button variant="secondary" onClick={() => setShowTemplateModal(false)}>
                إلغاء
              </Button>
              <Button variant="primary" onClick={handleSaveTemplate}>
                {templateModalType === 'add' ? 'إضافة القالب' : 'حفظ التغييرات'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* API Documentation */}
      <Card>
        <div className="flex items-center space-x-3 space-x-reverse mb-6">
          <div className="bg-gray-100 p-3 rounded-xl">
            <Globe className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">معلومات خدمة TweetSMS</h3>
            <p className="text-gray-600">تفاصيل تقنية حول خدمة الرسائل النصية المستخدمة</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">نقاط النهاية المستخدمة:</h4>
              <div className="space-y-2 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-mono text-blue-600">GET</span>
                  <span className="mr-2 text-gray-700">إرسال رسالة:</span>
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                    tweetsms.ps/api.php?comm=sendsms
                  </code>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-mono text-green-600">GET</span>
                  <span className="mr-2 text-gray-700">فحص الرصيد:</span>
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                    tweetsms.ps/api.php?comm=chk_balance
                  </code>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">المعلمات المطلوبة:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <code className="bg-gray-200 px-1 rounded">api_key</code>: مفتاح API</li>
                <li>• <code className="bg-gray-200 px-1 rounded">to</code>: رقم الهاتف المستلم</li>
                <li>• <code className="bg-gray-200 px-1 rounded">message</code>: نص الرسالة</li>
                <li>• <code className="bg-gray-200 px-1 rounded">sender</code>: اسم المرسل</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">رموز الاستجابة:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <code className="font-mono text-green-600">1</code>
                  <span className="text-green-700">تم الإرسال بنجاح</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <code className="font-mono text-red-600">-2</code>
                  <span className="text-red-700">رقم غير صالح</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <code className="font-mono text-red-600">-100</code>
                  <span className="text-red-700">معلمات مفقودة</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <code className="font-mono text-red-600">-110</code>
                  <span className="text-red-700">مفتاح API خاطئ</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <code className="font-mono text-red-600">-113</code>
                  <span className="text-red-700">رصيد غير كافي</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">معلومات الاتصال:</h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p className="text-gray-700 mb-1">
                  <strong>واتساب للدعم:</strong> 972594127070
                </p>
                <p className="text-gray-700">
                  <strong>الموقع الرسمي:</strong> tweetsms.ps
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <div className="flex items-center space-x-3 space-x-reverse mb-6">
          <div className="bg-yellow-100 p-3 rounded-xl">
            <Zap className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">إحصائيات الاستخدام</h3>
            <p className="text-gray-600">إحصائيات استخدام خدمة الرسائل النصية</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="text-center">
              <p className="text-sm text-blue-600">قوالب نشطة</p>
              <p className="text-2xl font-bold text-blue-900">{templates.filter(t => t.is_active).length}</p>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="text-center">
              <p className="text-sm text-green-600">إجمالي الاستخدام</p>
              <p className="text-2xl font-bold text-green-900">
                {templates.reduce((sum, t) => sum + t.usage_count, 0)}
              </p>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <div className="text-center">
              <p className="text-sm text-purple-600">أكثر القوالب استخداماً</p>
              <p className="text-sm font-bold text-purple-900">
                {templates.length > 0 ? 
                  templates.reduce((max, t) => t.usage_count > max.usage_count ? t : max, templates[0])?.name || 'غير محدد'
                  : 'غير محدد'
                }
              </p>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <div className="text-center">
              <p className="text-sm text-orange-600">آخر تحديث</p>
              <p className="text-sm font-bold text-orange-900">
                {settings?.updated_at ? 
                  new Date(settings.updated_at).toLocaleDateString('ar-SA') : 
                  'غير محدد'
                }
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="bg-green-50 border-green-200">
        <div className="flex items-start space-x-3 space-x-reverse">
          <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-green-800 mb-3">إرشادات الاستخدام</h4>
            <ul className="text-sm text-green-700 space-y-2">
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>جميع الإعدادات والقوالب محفوظة في قاعدة بيانات Supabase</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>اختبر الخدمة بإرسال رسالة تجريبية قبل الاستخدام الفعلي</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>راقب الرصيد بانتظام لضمان عدم انقطاع الخدمة</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>استخدم القوالب المحفوظة لتوحيد نصوص الرسائل</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>تواصل مع الدعم الفني على واتساب 972594127070 عند الحاجة</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}