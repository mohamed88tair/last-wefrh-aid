import React, { useState } from 'react';
import { X, User, Phone, Mail, Gift, TrendingUp, DollarSign, Calendar, CheckCircle, Clock, AlertTriangle, RefreshCw, Eye, Plus, Star, Activity, BarChart3, CreditCard } from 'lucide-react';
import { 
  type SystemUser, 
  type ReferralTransaction, 
  type ReferralCode,
  mockReferralTransactions, 
  mockReferralCodes,
  mockBeneficiaries 
} from '../data/mockData';
import { useErrorLogger } from '../utils/errorLogger';
import { Button, Card, Badge, Modal } from './ui';

interface ReferrerProfileModalProps {
  referrer: SystemUser;
  onClose: () => void;
  onGenerateNewCode?: (userId: string) => void;
  onCollectPayment?: (userId: string, date: string) => void;
}

interface DailyEarnings {
  date: string;
  referralsCount: number;
  earnings: number;
  status: 'pending_payment' | 'paid_to_referrer' | 'mixed';
  transactions: ReferralTransaction[];
}

export default function ReferrerProfileModal({
  referrer,
  onClose,
  onGenerateNewCode,
  onCollectPayment
}: ReferrerProfileModalProps) {
  const { logInfo, logError } = useErrorLogger();
  const [activeTab, setActiveTab] = useState('overview');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Get referrer's referral codes
  const referrerCodes = mockReferralCodes.filter(code => code.referrerUserId === referrer.id);
  const activeCode = referrerCodes.find(code => code.status === 'active');
  const usedCodes = referrerCodes.filter(code => code.status === 'used');

  // Get referrer's transactions
  const referrerTransactions = mockReferralTransactions.filter(
    transaction => transaction.referrerUserId === referrer.id
  );

  // Calculate daily earnings
  const getDailyEarnings = (): DailyEarnings[] => {
    const dailyMap = new Map<string, DailyEarnings>();

    referrerTransactions.forEach(transaction => {
      const date = transaction.createdAt.split('T')[0]; // Get date part only
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          referralsCount: 0,
          earnings: 0,
          status: 'pending_payment',
          transactions: []
        });
      }

      const daily = dailyMap.get(date)!;
      daily.referralsCount += 1;
      daily.earnings += transaction.amount;
      daily.transactions.push(transaction);

      // Determine status
      const allPaid = daily.transactions.every(t => t.status === 'paid_to_referrer');
      const allPending = daily.transactions.every(t => t.status === 'pending_payment');
      
      if (allPaid) {
        daily.status = 'paid_to_referrer';
      } else if (allPending) {
        daily.status = 'pending_payment';
      } else {
        daily.status = 'mixed';
      }
    });

    return Array.from(dailyMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const dailyEarnings = getDailyEarnings();

  // Statistics
  const totalReferrals = referrerTransactions.length;
  const totalReferralFees = referrerTransactions.reduce((sum, t) => sum + t.amount, 0);
  const pendingFees = referrerTransactions
    .filter(t => t.status === 'pending_payment')
    .reduce((sum, t) => sum + t.amount, 0);
  const paidFees = referrerTransactions
    .filter(t => t.status === 'paid_to_referrer')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleGenerateNewCode = () => {
    if (onGenerateNewCode) {
      onGenerateNewCode(referrer.id);
      setNotification({
        message: 'تم إنشاء رمز إحالة جديد بنجاح',
        type: 'success'
      });
      setTimeout(() => setNotification(null), 3000);
      logInfo(`تم إنشاء رمز إحالة جديد للموظف: ${referrer.name}`, 'ReferrerProfileModal');
    }
  };

  const handleCollectDailyPayment = (date: string) => {
    if (onCollectPayment) {
      onCollectPayment(referrer.id, date);
      setNotification({
        message: `تم تأكيد تحصيل أرباح يوم ${new Date(date).toLocaleDateString('ar-SA')}`,
        type: 'success'
      });
      setTimeout(() => setNotification(null), 3000);
      logInfo(`تم تحصيل أرباح يوم ${date} للموظف: ${referrer.name}`, 'ReferrerProfileModal');
    }
  };

  const getBeneficiaryName = (beneficiaryId: string): string => {
    const beneficiary = mockBeneficiaries.find(b => b.id === beneficiaryId);
    return beneficiary ? beneficiary.name : 'غير محدد';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid_to_referrer': return 'bg-green-100 text-green-800';
      case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
      case 'mixed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid_to_referrer': return 'تم الدفع';
      case 'pending_payment': return 'في انتظار الدفع';
      case 'mixed': return 'مختلط';
      default: return 'غير محدد';
    }
  };

  const getCodeStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCodeStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'used': return 'مستخدم';
      case 'expired': return 'منتهي الصلاحية';
      case 'cancelled': return 'ملغى';
      default: return 'غير محدد';
    }
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

  const tabs = [
    { id: 'overview', name: 'نظرة عامة', icon: BarChart3 },
    { id: 'daily', name: 'الرصيد اليومي', icon: Calendar },
    { id: 'codes', name: 'رموز الإحالة', icon: Gift },
    { id: 'transactions', name: 'سجل المعاملات', icon: CreditCard }
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`بيانات المحيل: ${referrer.name}`}
      size="xl"
    >
      <div className="p-6">
        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 space-x-reverse ${getNotificationClasses(notification.type)}`}>
            {getNotificationIcon(notification.type)}
            <span className="font-medium">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header with referrer summary */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 space-x-reverse">
              <div className="bg-blue-100 p-3 rounded-xl">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{referrer.name}</h2>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">البريد:</span>
                    <span className="font-medium text-gray-900">{referrer.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">الهاتف:</span>
                    <span className="font-medium text-gray-900">{referrer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">رقم الهوية:</span>
                    <span className="font-medium text-gray-900">{referrer.nationalId}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">آخر دخول:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(referrer.lastLogin).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick stats */}
            <div className="text-right">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{totalReferrals}</p>
                  <p className="text-sm text-gray-600">إجمالي الإحالات</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{totalReferralFees}</p>
                  <p className="text-sm text-gray-600">إجمالي الرسوم المستحقة (₪)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-3 space-x-reverse mb-6">
          <Button
            variant="primary"
            icon={Plus}
            iconPosition="right"
            onClick={handleGenerateNewCode}
            disabled={!activeCode || activeCode.status !== 'active'}
          >
            إنشاء رمز إحالة جديد
          </Button>
          
          <Button
            variant="secondary"
            icon={Phone}
            iconPosition="right"
            onClick={() => window.open(`tel:${referrer.phone}`)}
          >
            اتصال بالموظف
          </Button>

          <Button
            variant="secondary"
            icon={Mail}
            iconPosition="right"
            onClick={() => window.open(`mailto:${referrer.email}`)}
          >
            إرسال بريد إلكتروني
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8 space-x-reverse">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 space-x-reverse px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4 ml-2" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50">
                <div className="text-center">
                  <div className="bg-blue-100 p-3 rounded-xl mb-2">
                    <TrendingUp className="w-6 h-6 text-blue-600 mx-auto" />
                  </div>
                  <p className="text-sm text-blue-600">إجمالي الإحالات</p>
                  <p className="text-2xl font-bold text-blue-900">{totalReferrals}</p>
                </div>
              </Card>

              <Card className="bg-green-50">
                <div className="text-center">
                  <div className="bg-green-100 p-3 rounded-xl mb-2">
                    <DollarSign className="w-6 h-6 text-green-600 mx-auto" />
                  </div>
                  <p className="text-sm text-red-600">إجمالي الرسوم المستحقة</p>
                  <p className="text-2xl font-bold text-red-900">{totalReferralFees} ₪</p>
                </div>
              </Card>

              <Card className="bg-yellow-50">
                <div className="text-center">
                  <div className="bg-yellow-100 p-3 rounded-xl mb-2">
                    <Clock className="w-6 h-6 text-yellow-600 mx-auto" />
                  </div>
                  <p className="text-sm text-yellow-600">رسوم معلقة</p>
                  <p className="text-2xl font-bold text-yellow-900">{pendingFees} ₪</p>
                </div>
              </Card>

              <Card className="bg-purple-50">
                <div className="text-center">
                  <div className="bg-purple-100 p-3 rounded-xl mb-2">
                    <CheckCircle className="w-6 h-6 text-purple-600 mx-auto" />
                  </div>
                  <p className="text-sm text-purple-600">رسوم مدفوعة</p>
                  <p className="text-2xl font-bold text-purple-900">{paidFees} ₪</p>
                </div>
              </Card>
            </div>

            {/* Current Active Code */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">الرمز النشط الحالي</h3>
              {activeCode ? (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3 space-x-reverse mb-2">
                        <Gift className="w-5 h-5 text-green-600" />
                        <code className="text-lg font-mono font-bold text-green-800">
                          {activeCode.code}
                        </code>
                        <Badge variant="success" size="sm">
                          {getCodeStatusText(activeCode.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-green-700">
                        <p>تم الإنشاء: {new Date(activeCode.generatedAt).toLocaleString('en-CA')}</p>
                        {activeCode.expiresAt && (
                          <p>ينتهي في: {new Date(activeCode.expiresAt).toLocaleString('en-CA')}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      icon={Plus}
                      iconPosition="right"
                      onClick={handleGenerateNewCode}
                    >
                      إنشاء رمز جديد
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
                  <Gift className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">لا يوجد رمز إحالة نشط حالياً</p>
                  <Button
                    variant="primary"
                    icon={Plus}
                    iconPosition="right"
                    onClick={handleGenerateNewCode}
                  >
                    إنشاء رمز إحالة جديد
                  </Button>
                </div>
              )}
            </Card>

            {/* Recent Activity */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">آخر النشاطات</h3>
              <div className="space-y-3">
                {referrerTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.status === 'paid_to_referrer' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {transaction.status === 'paid_to_referrer' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          إحالة: {getBeneficiaryName(transaction.beneficiaryId)}
                        </p>
                        <p className="text-sm text-gray-600">
                          رمز: {transaction.referralCodeUsed}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{transaction.amount} ₪</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'daily' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">الرصيد اليومي</h3>
              <div className="text-sm text-gray-600">
                إجمالي الأيام: {dailyEarnings.length}
              </div>
            </div>

            {dailyEarnings.length > 0 ? (
              <div className="space-y-4">
                {dailyEarnings.map((daily) => (
                  <Card key={daily.date} className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="bg-blue-100 p-3 rounded-xl">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {new Date(daily.date).toLocaleDateString('ar-SA', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h4>
                          <div className="flex items-center space-x-4 space-x-reverse text-sm mt-1">
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-600">{daily.referralsCount} إحالة</span>
                            </div>
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="text-gray-600">{daily.earnings} ₪ رسوم</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Badge 
                          variant={
                            daily.status === 'paid_to_referrer' ? 'success' :
                            daily.status === 'pending_payment' ? 'warning' : 'info'
                          }
                        >
                          {getStatusText(daily.status)}
                        </Badge>
                        
                        {daily.status === 'pending_payment' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleCollectDailyPayment(daily.date)}
                          >
                            تحصيل الرسوم
                          </Button>
                        )}
                        
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Eye}
                          onClick={() => {
                            alert(`تفاصيل يوم ${new Date(daily.date).toLocaleDateString('ar-SA')}:\n\n` +
                                  `عدد الإحالات: ${daily.referralsCount}\n` +
                                  `الأرباح: ${daily.earnings} ₪\n` +
                                  `الحالة: ${getStatusText(daily.status)}\n\n` +
                                  `المعاملات:\n${daily.transactions.map(t => 
                                    `- ${getBeneficiaryName(t.beneficiaryId)} (${t.referralCodeUsed}): ${t.amount} ₪`
                                  ).join('\n')}`);
                          }}
                        >
                          التفاصيل
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">لا توجد إحالات بعد</p>
                  <p className="text-sm mt-2">لم يقم هذا الموظف بأي إحالات حتى الآن</p>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'codes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">سجل رموز الإحالة</h3>
              <div className="text-sm text-gray-600">
                إجمالي الرموز: {referrerCodes.length}
              </div>
            </div>

            <div className="space-y-4">
              {referrerCodes.length > 0 ? (
                referrerCodes.map((code) => (
                  <Card key={code.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          code.status === 'active' ? 'bg-green-100' :
                          code.status === 'used' ? 'bg-blue-100' :
                          code.status === 'expired' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          <Gift className={`w-5 h-5 ${
                            code.status === 'active' ? 'text-green-600' :
                            code.status === 'used' ? 'text-blue-600' :
                            code.status === 'expired' ? 'text-red-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <code className="text-lg font-mono font-bold text-gray-900">
                              {code.code}
                            </code>
                            <Badge 
                              variant={
                                code.status === 'active' ? 'success' :
                                code.status === 'used' ? 'info' :
                                code.status === 'expired' ? 'error' : 'neutral'
                              }
                              size="sm"
                            >
                              {getCodeStatusText(code.status)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <p>تم الإنشاء: {new Date(code.generatedAt).toLocaleString('en-CA')}</p>
                            {code.usedAt && (
                              <p>تم الاستخدام: {new Date(code.usedAt).toLocaleString('en-CA')}</p>
                            )}
                            {code.expiresAt && (
                              <p>ينتهي في: {new Date(code.expiresAt).toLocaleString('en-CA')}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {code.status === 'used' && code.beneficiaryId && (
                          <div>
                            <p className="font-medium text-gray-900">
                              {getBeneficiaryName(code.beneficiaryId)}
                            </p>
                            <p className="text-sm text-gray-600">المستفيد الذي استخدم الرمز</p>
                          </div>
                        )}
                        {code.status === 'active' && (
                          <div>
                            <p className="font-medium text-green-600">جاهز للاستخدام</p>
                            <p className="text-sm text-gray-600">يمكن مشاركته مع المستفيدين</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12">
                  <div className="text-center text-gray-500">
                    <Gift className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">لا توجد رموز إحالة</p>
                    <p className="text-sm mt-2">لم يتم إنشاء أي رموز إحالة لهذا الموظف بعد</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">سجل المعاملات</h3>
              <div className="text-sm text-gray-600">
                إجمالي المعاملات: {referrerTransactions.length}
              </div>
            </div>

            {referrerTransactions.length > 0 ? (
              <Card padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          التاريخ
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المستفيد
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          رمز الإحالة
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المبلغ
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          تاريخ الدفع
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {referrerTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.createdAt).toLocaleDateString('en-CA')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getBeneficiaryName(transaction.beneficiaryId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm text-blue-600">
                              {transaction.referralCodeUsed}
                            </code>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {transaction.amount} ₪
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={
                                transaction.status === 'paid_to_referrer' ? 'success' :
                                transaction.status === 'pending_payment' ? 'warning' : 'error'
                              }
                              size="sm"
                            >
                              {getStatusText(transaction.status)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.paidAt ? 
                              new Date(transaction.paidAt).toLocaleDateString('en-CA') : 
                              'لم يتم الدفع بعد'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <Card className="p-12">
                <div className="text-center text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">لا توجد معاملات</p>
                  <p className="text-sm mt-2">لم يتم تسجيل أي معاملات إحالة لهذا الموظف بعد</p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 space-x-reverse pt-6 border-t border-gray-200 mt-6">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            إغلاق
          </Button>
        </div>
      </div>
    </Modal>
  );
}