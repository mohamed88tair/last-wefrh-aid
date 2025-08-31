import React, { useState } from 'react';
import { Users, Gift, DollarSign, TrendingUp, CheckCircle, Clock, AlertTriangle, Search, Filter, Plus, Eye, Edit, Download, RefreshCw, Star, Award, UserPlus, CreditCard, Activity, BarChart3, Phone, Mail, Copy, Check } from 'lucide-react';
import { 
  mockSystemUsers, 
  mockBeneficiaries, 
  mockReferralTransactions,
  mockReferralCodes,
  type SystemUser, 
  type Beneficiary, 
  type ReferralTransaction,
  type ReferralCode
} from '../../data/mockData';
import { useErrorLogger } from '../../utils/errorLogger';
import { Button, Card, Input, Badge, Modal } from '../ui';
import ReferrerProfileModal from '../ReferrerProfileModal';

export default function ReferralManagementPage() {
  const { logInfo, logError } = useErrorLogger();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add-code' | 'edit-code' | 'view-transaction' | 'pay-referrer'>('add-code');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showReferrerProfile, setShowReferrerProfile] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState<SystemUser | null>(null);

  // Form states
  const [newCodeForm, setNewCodeForm] = useState({
    userId: '',
    customCode: '',
    isActive: true
  });

  const [paymentForm, setPaymentForm] = useState({
    transactionId: '',
    amount: 5,
    notes: ''
  });

  const tabs = [
    { id: 'overview', name: 'نظرة عامة', icon: BarChart3 },
    { id: 'codes', name: 'رموز الإحالة', icon: Gift },
    { id: 'transactions', name: 'المعاملات', icon: CreditCard },
    { id: 'statistics', name: 'الإحصائيات', icon: TrendingUp },
  ];

  // Get referral statistics
  const totalReferrals = mockReferralTransactions.length;
  const totalReferralFees = mockReferralTransactions.reduce((sum, t) => sum + t.amount, 0);
  const pendingPayments = mockReferralTransactions.filter(t => t.status === 'pending_payment').length;
  const paidTransactions = mockReferralTransactions.filter(t => t.status === 'paid_to_referrer').length;

  // Get users with referral codes
  const usersWithCodes = mockSystemUsers.filter(user => user.referralCode);

  // Filter functions
  const filteredUsers = usersWithCodes.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.referralCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = mockReferralTransactions.filter(transaction => {
    const referrer = mockSystemUsers.find(u => u.id === transaction.referrerUserId);
    const beneficiary = mockBeneficiaries.find(b => b.id === transaction.beneficiaryId);
    
    const matchesSearch = referrer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beneficiary?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.referralCodeUsed.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleGenerateCode = () => {
    if (!newCodeForm.userId) {
      alert('يرجى اختيار المستخدم');
      return;
    }

    const user = mockSystemUsers.find(u => u.id === newCodeForm.userId);
    if (!user) {
      alert('المستخدم غير موجود');
      return;
    }

    // Generate or use custom code
    const code = newCodeForm.customCode || generateReferralCode(user.name);
    
    // Update user with referral code (simulation)
    const userIndex = mockSystemUsers.findIndex(u => u.id === newCodeForm.userId);
    if (userIndex !== -1) {
      mockSystemUsers[userIndex].referralCode = code;
      mockSystemUsers[userIndex].totalReferrals = 0;
      mockSystemUsers[userIndex].totalEarnings = 0;
    }

    logInfo(`تم إنشاء رمز إحالة جديد: ${code} للمستخدم: ${user.name}`, 'ReferralManagementPage');
    alert(`تم إنشاء رمز الإحالة بنجاح!\nالرمز: ${code}\nالمستخدم: ${user.name}`);
    
    setShowModal(false);
    setNewCodeForm({ userId: '', customCode: '', isActive: true });
  };

  const handlePayReferrer = (transaction: ReferralTransaction) => {
    setSelectedItem(transaction);
    setModalType('pay-referrer');
    setPaymentForm({
      transactionId: transaction.id,
      amount: transaction.amount,
      notes: ''
    });
    setShowModal(true);
  };

  const handleViewReferrer = (user: SystemUser) => {
    setSelectedReferrer(user);
    setShowReferrerProfile(true);
  };

  const handleGenerateNewCodeForReferrer = (userId: string) => {
    const user = mockSystemUsers.find(u => u.id === userId);
    if (!user) return;

    // Generate new code
    const newCode = generateReferralCode(user.name) + '-' + Math.random().toString(36).substr(2, 3).toUpperCase();
    
    // Mark current active code as used/expired (simulation)
    const currentActiveCode = mockReferralCodes.find(c => c.referrerUserId === userId && c.status === 'active');
    if (currentActiveCode) {
      currentActiveCode.status = 'expired';
    }
    
    // Create new active code
    const newReferralCode: ReferralCode = {
      id: `code-${Date.now()}`,
      code: newCode,
      referrerUserId: userId,
      status: 'active',
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Expires in 7 days
    };
    
    mockReferralCodes.push(newReferralCode);
    
    // Update user's current referral code
    const userIndex = mockSystemUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      mockSystemUsers[userIndex].referralCode = newCode;
    }
    
    logInfo(`تم إنشاء رمز إحالة جديد: ${newCode} للموظف: ${user.name}`, 'ReferralManagementPage');
  };

  const handleCollectPaymentForReferrer = (userId: string, date: string) => {
    // Update all pending transactions for this user on this date
    const dateTransactions = mockReferralTransactions.filter(
      t => t.referrerUserId === userId && 
           t.createdAt.split('T')[0] === date && 
           t.status === 'pending_payment'
    );
    
    dateTransactions.forEach(transaction => {
      transaction.status = 'paid_to_referrer';
      transaction.paidAt = new Date().toISOString();
      transaction.notes = `تم الدفع - تحصيل يوم ${new Date(date).toLocaleDateString('ar-SA')}`;
    });
    
    // Update user's total earnings
    const userIndex = mockSystemUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      const additionalEarnings = dateTransactions.reduce((sum, t) => sum + t.amount, 0);
      mockSystemUsers[userIndex].totalEarnings = (mockSystemUsers[userIndex].totalEarnings || 0) + additionalEarnings;
    }
    
    logInfo(`تم تحصيل أرباح يوم ${date} للموظف: ${userId}`, 'ReferralManagementPage');
  };

  const executePayment = () => {
    if (!selectedItem) return;

    // Update transaction status (simulation)
    const transactionIndex = mockReferralTransactions.findIndex(t => t.id === selectedItem.id);
    if (transactionIndex !== -1) {
      mockReferralTransactions[transactionIndex].status = 'paid_to_referrer';
      mockReferralTransactions[transactionIndex].paidAt = new Date().toISOString();
      mockReferralTransactions[transactionIndex].notes = paymentForm.notes;
    }

    // Update referrer earnings
    const referrerIndex = mockSystemUsers.findIndex(u => u.id === selectedItem.referrerUserId);
    if (referrerIndex !== -1) {
      mockSystemUsers[referrerIndex].totalEarnings = (mockSystemUsers[referrerIndex].totalEarnings || 0) + paymentForm.amount;
    }

    const referrer = mockSystemUsers.find(u => u.id === selectedItem.referrerUserId);
    logInfo(`تم دفع ${paymentForm.amount} شيكل للمحيل: ${referrer?.name}`, 'ReferralManagementPage');
    alert(`تم تأكيد الدفع بنجاح!\nالمبلغ: ${paymentForm.amount} شيكل\nالمحيل: ${referrer?.name}`);
    
    setShowModal(false);
    setSelectedItem(null);
  };

  const copyReferralCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const generateReferralCode = (userName: string): string => {
    const initials = userName.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${initials}${randomNum}`;
  };

  const getReferrerName = (userId: string): string => {
    const user = mockSystemUsers.find(u => u.id === userId);
    return user ? user.name : 'غير محدد';
  };

  const getBeneficiaryName = (beneficiaryId: string): string => {
    const beneficiary = mockBeneficiaries.find(b => b.id === beneficiaryId);
    return beneficiary ? beneficiary.name : 'غير محدد';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid_to_referrer': return 'bg-green-100 text-green-800';
      case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid_to_referrer': return 'تم الدفع';
      case 'pending_payment': return 'في انتظار الدفع';
      case 'cancelled': return 'ملغي';
      default: return 'غير محدد';
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Source Indicator */}
      <Card className="bg-blue-50 border-blue-200" padding="sm">
        <div className="flex items-center space-x-2 space-x-reverse text-blue-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">
            نظام الإحالة محمل - {usersWithCodes.length} رمز إحالة، {totalReferrals} معاملة
          </span>
        </div>
      </Card>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Gift className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">نظام الإحالة</h2>
            <p className="text-gray-600 mt-1">إدارة رموز الإحالة ومتابعة المدفوعات</p>
          </div>
        </div>
        <div className="flex space-x-3 space-x-reverse">
          <Button variant="success" icon={Download} iconPosition="right">
            تصدير التقرير
          </Button>
          <Button 
            variant="primary" 
            icon={Plus} 
            iconPosition="right"
            onClick={() => {
              setModalType('add-code');
              setShowModal(true);
            }}
          >
            إضافة رمز إحالة
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">إجمالي الإحالات</p>
                  <p className="text-3xl font-bold text-gray-900">{totalReferrals}</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-2xl">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">إجمالي الأرباح</p>
                  <p className="text-3xl font-bold text-gray-900">{totalReferralFees}</p>
                  <p className="text-sm text-gray-500">شيكل</p>
                </div>
                <div className="bg-green-100 p-4 rounded-2xl">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">في انتظار الدفع</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingPayments}</p>
                  <p className="text-sm text-yellow-600">معاملة</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-2xl">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">تم الدفع</p>
                  <p className="text-3xl font-bold text-gray-900">{paidTransactions}</p>
                  <p className="text-sm text-green-600">معاملة</p>
                </div>
                <div className="bg-purple-100 p-4 rounded-2xl">
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Top Referrers */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-6">أفضل المحيلين</h3>
            <div className="space-y-4">
              {usersWithCodes
                .sort((a, b) => (b.totalReferrals || 0) - (a.totalReferrals || 0))
                .slice(0, 5)
                .map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">رقم الهوية: {user.nationalId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{user.totalReferrals || 0}</p>
                    <p className="text-sm text-gray-600">إحالة</p>
                    <p className="text-sm text-red-600 font-medium">{user.totalReferralFees || 0} ₪</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      )}

      {/* Referral Codes Tab */}
      {activeTab === 'codes' && (
        <div className="space-y-6">
          {/* Search and Actions */}
          <div className="flex items-center justify-between">
            <Input
              type="text"
              icon={Search}
              iconPosition="right"
              placeholder="البحث في رموز الإحالة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-96"
            />
            <Button 
              variant="primary" 
              icon={Plus} 
              iconPosition="right"
              onClick={() => {
                setModalType('add-code');
                setShowModal(true);
              }}
            >
              إضافة رمز إحالة جديد
            </Button>
          </div>

          {/* Referral Codes Table */}
          <Card padding="none" className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">رموز الإحالة ({filteredUsers.length})</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المستخدم
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رمز الإحالة
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      عدد الإحالات
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      إجمالي الأرباح
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg ml-4">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <code className="bg-gray-100 px-3 py-1 rounded-lg font-mono text-sm font-bold text-blue-600">
                            {user.referralCode}
                          </code>
                          <button
                            onClick={() => copyReferralCode(user.referralCode!)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded"
                            title="نسخ الرمز"
                          >
                            {copiedCode === user.referralCode ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.totalReferrals || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-medium text-red-600">{user.totalReferralFees || 0} ₪</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.status === 'active' ? 'success' : 'error'} size="sm">
                          {user.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 space-x-reverse">
                          <button 
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors" 
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors" 
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => window.open(`tel:${user.phone}`)}
                            className="text-orange-600 hover:text-orange-900 p-2 rounded-lg hover:bg-orange-50 transition-colors" 
                            title="اتصال"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <Input
              type="text"
              icon={Search}
              iconPosition="right"
              placeholder="البحث في المعاملات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending_payment">في انتظار الدفع</option>
                <option value="paid_to_referrer">تم الدفع</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <Card padding="none" className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">معاملات الإحالة ({filteredTransactions.length})</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المستفيد الجديد
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المحيل
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رمز الإحالة
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المبلغ
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التاريخ
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getBeneficiaryName(transaction.beneficiaryId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getReferrerName(transaction.referrerUserId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm text-blue-600">
                          {transaction.referralCodeUsed}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-green-600">{transaction.amount} ₪</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.createdAt).toLocaleDateString('en-CA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={
                            transaction.status === 'paid_to_referrer' ? 'success' :
                            transaction.status === 'pending_payment' ? 'warning' : 'error'
                          }
                        >
                          {getStatusText(transaction.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 space-x-reverse">
                          {transaction.status === 'pending_payment' && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handlePayReferrer(transaction)}
                            >
                              دفع للمحيل
                            </Button>
                          )}
                          <button 
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors" 
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Monthly Referral Trends */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-6">اتجاهات الإحالة الشهرية</h3>
              <div className="space-y-4">
                {['ديسمبر', 'نوفمبر', 'أكتوبر', 'سبتمبر', 'أغسطس'].map((month, index) => {
                  const referrals = Math.floor(Math.random() * 10) + 5;
                  const earnings = referrals * 5;
                  
                  return (
                    <div key={month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{month}</span>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{referrals}</p>
                        <p className="text-sm text-green-600">{earnings} ₪</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Payment Status Overview */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-6">حالة المدفوعات</h3>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">تم الدفع</span>
                    <span className="text-2xl font-bold text-green-900">{paidTransactions}</span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {mockReferralTransactions.filter(t => t.status === 'paid_to_referrer').reduce((sum, t) => sum + t.amount, 0)} ₪ إجمالي
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-700">في انتظار الدفع</span>
                    <span className="text-2xl font-bold text-yellow-900">{pendingPayments}</span>
                  </div>
                  <div className="text-xs text-yellow-600 mt-1">
                    {mockReferralTransactions.filter(t => t.status === 'pending_payment').reduce((sum, t) => sum + t.amount, 0)} ₪ مستحق
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Modal for Add Code / Pay Referrer */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalType === 'add-code' ? 'إضافة رمز إحالة جديد' :
            modalType === 'pay-referrer' ? 'دفع للمحيل' :
            'تفاصيل'
          }
          size="md"
        >
          <div className="p-6">
            {/* Add Referral Code Form */}
            {modalType === 'add-code' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اختيار المستخدم</label>
                  <select
                    value={newCodeForm.userId}
                    onChange={(e) => setNewCodeForm({...newCodeForm, userId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">اختر المستخدم</option>
                    {mockSystemUsers.filter(u => !u.referralCode).map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.email}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="رمز الإحالة المخصص (اختياري)"
                  type="text"
                  value={newCodeForm.customCode}
                  onChange={(e) => setNewCodeForm({...newCodeForm, customCode: e.target.value.toUpperCase()})}
                  placeholder="مثال: MT564 (سيتم إنشاء رمز تلقائي إذا ترك فارغاً)"
                />

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">معلومات مهمة:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• كل إحالة ناجحة تعني 5 شيكل للمحيل</li>
                    <li>• رمز الإحالة يجب أن يكون فريد</li>
                    <li>• المستخدم يمكنه مشاركة رمزه مع المستفيدين الجدد</li>
                  </ul>
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button variant="primary" onClick={handleGenerateCode}>
                    إنشاء رمز الإحالة
                  </Button>
                </div>
              </div>
            )}

            {/* Pay Referrer Form */}
            {modalType === 'pay-referrer' && selectedItem && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3">تفاصيل المعاملة</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">المحيل:</span>
                      <span className="font-medium text-gray-900 mr-2">
                        {getReferrerName(selectedItem.referrerUserId)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">المستفيد:</span>
                      <span className="font-medium text-gray-900 mr-2">
                        {getBeneficiaryName(selectedItem.beneficiaryId)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">رمز الإحالة:</span>
                      <code className="font-mono text-blue-600 mr-2">{selectedItem.referralCodeUsed}</code>
                    </div>
                    <div>
                      <span className="text-gray-600">تاريخ الإحالة:</span>
                      <span className="font-medium text-gray-900 mr-2">
                        {new Date(selectedItem.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                </div>

                <Input
                  label="المبلغ المستحق (شيكل)"
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value) || 5})}
                  disabled
                />

                <Input
                  label="ملاحظات الدفع"
                  type="textarea"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  placeholder="ملاحظات حول عملية الدفع..."
                  rows={3}
                />

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button variant="success" onClick={executePayment}>
                    تأكيد الدفع ({paymentForm.amount} ₪)
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Referrer Profile Modal */}
      {showReferrerProfile && selectedReferrer && (
        <ReferrerProfileModal
          referrer={selectedReferrer}
          onClose={() => {
            setShowReferrerProfile(false);
            setSelectedReferrer(null);
          }}
          onGenerateNewCode={handleGenerateNewCodeForReferrer}
          onCollectPayment={handleCollectPaymentForReferrer}
        />
      )}

      {/* Instructions */}
      <Card className="bg-green-50 border-green-200">
        <div className="flex items-start space-x-3 space-x-reverse">
          <Gift className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-green-800 mb-3">كيف يعمل نظام الإحالة</h4>
            <ul className="text-sm text-green-700 space-y-2">
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>كل مستخدم يحصل على رمز إحالة فريد يمكنه مشاركته</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>عند تسجيل مستفيد جديد برمز إحالة، يتحمل المحيل رسوم الإحالة (5 ₪)</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>المحيل يصبح مديون بـ 5 ₪ مقابل كل إحالة ناجحة ويجب عليه دفعها</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>المدير يتابع جميع الرسوم المستحقة ويقوم بتحصيلها من المحيلين</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}