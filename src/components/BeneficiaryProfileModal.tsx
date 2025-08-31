import React, { useState } from 'react';
import { X, User, Phone, MapPin, Calendar, Users, Briefcase, Heart, DollarSign, Package, Clock, CheckCircle, AlertTriangle, Edit, Send, UserPlus, Gift, FileText, Camera } from 'lucide-react';
import { type Beneficiary } from '../data/mockData';
import { mockSystemUsers } from '../data/mockData';
import { getPackagesByBeneficiary } from '../data/mockData';
import { Modal, Button, Badge } from './ui';

interface BeneficiaryProfileModalProps {
  beneficiary: Beneficiary;
  onClose: () => void;
  onNavigateToIndividualSend?: (beneficiaryId: string) => void;
  onEditBeneficiary?: (beneficiary: Beneficiary) => void;
  onApproveIdentity?: (beneficiaryId: string, beneficiaryName: string) => void;
  onRejectIdentity?: (beneficiaryId: string, beneficiaryName: string) => void;
  onRequestReupload?: (beneficiaryId: string, beneficiaryName: string) => void;
}

export default function BeneficiaryProfileModal({
  beneficiary,
  onClose,
  onNavigateToIndividualSend,
  onEditBeneficiary,
  onApproveIdentity,
  onRejectIdentity,
  onRequestReupload
}: BeneficiaryProfileModalProps) {
  const [activeTab, setActiveTab] = useState('info');

  const beneficiaryPackages = getPackagesByBeneficiary(beneficiary.id);

  const tabs = [
    { id: 'info', name: 'المعلومات الأساسية', icon: User },
    { id: 'packages', name: 'سجل الطرود', icon: Package },
    { id: 'verification-files', name: 'ملفات التوثيق', icon: FileText },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIdentityStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEligibilityStatusColor = (status: string) => {
    switch (status) {
      case 'eligible': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaritalStatusText = (status: string) => {
    switch (status) {
      case 'single': return 'أعزب';
      case 'married': return 'متزوج';
      case 'divorced': return 'مطلق';
      case 'widowed': return 'أرمل';
      default: return 'غير محدد';
    }
  };

  const getEconomicLevelText = (level: string) => {
    switch (level) {
      case 'very_poor': return 'فقير جداً';
      case 'poor': return 'فقير';
      case 'moderate': return 'متوسط';
      case 'good': return 'ميسور';
      default: return 'غير محدد';
    }
  };

  const getPackageStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in_delivery': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPackageStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'تم التسليم';
      case 'in_delivery': return 'قيد التوصيل';
      case 'pending': return 'في الانتظار';
      case 'failed': return 'فشل التسليم';
      default: return 'غير محدد';
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`ملف المستفيد: ${beneficiary.name}`}
      size="xl"
    >
      <div className="p-6">
        {/* Header with beneficiary summary */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 space-x-reverse">
              <div className="bg-blue-100 p-3 rounded-xl">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{beneficiary.name}</h2>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">رقم الهوية:</span>
                    <span className="font-medium text-gray-900">{beneficiary.nationalId}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">الهاتف:</span>
                    <span className="font-medium text-gray-900">{beneficiary.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">المنطقة:</span>
                    <span className="font-medium text-gray-900">{beneficiary.detailedAddress.district}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">إجمالي الطرود:</span>
                    <span className="font-medium text-gray-900">{beneficiary.totalPackages}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status badges */}
            <div className="flex flex-col space-y-2">
              <Badge 
                variant={
                  beneficiary.identityStatus === 'verified' ? 'success' :
                  beneficiary.identityStatus === 'pending' ? 'warning' : 'error'
                }
              >
                {beneficiary.identityStatus === 'verified' ? 'موثق' :
                 beneficiary.identityStatus === 'pending' ? 'بانتظار التوثيق' : 'مرفوض التوثيق'}
              </Badge>
              <Badge 
                variant={
                  beneficiary.status === 'active' ? 'success' :
                  beneficiary.status === 'pending' ? 'warning' : 'error'
                }
              >
                {beneficiary.status === 'active' ? 'نشط' :
                 beneficiary.status === 'pending' ? 'معلق' : 'متوقف'}
              </Badge>
              <Badge 
                variant={
                  beneficiary.eligibilityStatus === 'eligible' ? 'success' :
                  beneficiary.eligibilityStatus === 'under_review' ? 'warning' : 'error'
                }
              >
                {beneficiary.eligibilityStatus === 'eligible' ? 'مؤهل' :
                 beneficiary.eligibilityStatus === 'under_review' ? 'تحت المراجعة' : 'غير مؤهل'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-3 space-x-reverse mb-6">
          {onEditBeneficiary && (
            <Button
              variant="secondary"
              icon={Edit}
              iconPosition="right"
              onClick={() => onEditBeneficiary(beneficiary)}
            >
              تعديل البيانات
            </Button>
          )}
          
          {onNavigateToIndividualSend && (
            <Button
              variant="primary"
              icon={Send}
              iconPosition="right"
              onClick={() => onNavigateToIndividualSend(beneficiary.id)}
            >
              إرسال طرد فردي
            </Button>
          )}

          {/* Identity verification actions */}
          {beneficiary.identityStatus === 'pending' && (
            <>
              {onApproveIdentity && (
                <Button
                  variant="success"
                  icon={CheckCircle}
                  iconPosition="right"
                  onClick={() => onApproveIdentity(beneficiary.id, beneficiary.name)}
                >
                  اعتماد الهوية
                </Button>
              )}
              
              {onRejectIdentity && (
                <Button
                  variant="danger"
                  icon={AlertTriangle}
                  iconPosition="right"
                  onClick={() => onRejectIdentity(beneficiary.id, beneficiary.name)}
                >
                  رفض الهوية
                </Button>
              )}
              
              {onRequestReupload && (
                <Button
                  variant="warning"
                  icon={UserPlus}
                  iconPosition="right"
                  onClick={() => onRequestReupload(beneficiary.id, beneficiary.name)}
                >
                  طلب إعادة الرفع
                </Button>
              )}
            </>
          )}
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
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 ml-2 text-blue-600" />
                المعلومات الشخصية
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                    <p className="text-gray-900 font-medium">{beneficiary.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label>
                    <p className="text-gray-900">{new Date(beneficiary.dateOfBirth).toLocaleDateString('en-CA')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
                    <p className="text-gray-900">{beneficiary.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المهنة</label>
                    <p className="text-gray-900">{beneficiary.profession}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحالة الاجتماعية</label>
                    <p className="text-gray-900">{getMaritalStatusText(beneficiary.maritalStatus)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عدد أفراد الأسرة</label>
                    <p className="text-gray-900">{beneficiary.membersCount} شخص</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 ml-2 text-green-600" />
                معلومات العنوان
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المحافظة</label>
                    <p className="text-gray-900">{beneficiary.detailedAddress.governorate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
                    <p className="text-gray-900">{beneficiary.detailedAddress.city}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحي</label>
                    <p className="text-gray-900">{beneficiary.detailedAddress.district}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الشارع</label>
                    <p className="text-gray-900">{beneficiary.detailedAddress.street || 'غير محدد'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">معلومات إضافية</label>
                    <p className="text-gray-900">{beneficiary.detailedAddress.additionalInfo || 'غير محدد'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العنوان الكامل</label>
                    <p className="text-gray-900">{beneficiary.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Economic Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 ml-2 text-purple-600" />
                المعلومات الاقتصادية والاجتماعية
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المستوى الاقتصادي</label>
                  <p className="text-gray-900">{getEconomicLevelText(beneficiary.economicLevel)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">آخر استلام</label>
                  <p className="text-gray-900">{new Date(beneficiary.lastReceived).toLocaleDateString('en-CA')}</p>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 ml-2 text-gray-600" />
                معلومات النظام
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600">تاريخ التسجيل:</span>
                    <span className="font-medium text-gray-900 mr-2">
                      {new Date(beneficiary.createdAt).toLocaleDateString('en-CA')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">آخر تحديث:</span>
                    <span className="font-medium text-gray-900 mr-2">
                      {new Date(beneficiary.updatedAt).toLocaleDateString('en-CA')}
                    </span>
                  </div>
                  {beneficiary.referredByCode && (
                    <div>
                      <span className="text-gray-600">رمز الإحالة:</span>
                      <code className="font-mono text-blue-600 mr-2 bg-blue-100 px-2 py-1 rounded text-xs">
                        {beneficiary.referredByCode}
                      </code>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600">أضيف بواسطة:</span>
                    <span className="font-medium text-gray-900 mr-2">{beneficiary.createdBy}</span>
                  </div>
                  <div>
                    <div>
                      <span className="text-gray-600">المحيل:</span>
                      <span className="font-medium text-gray-900 mr-2">
                        {(() => {
                          const referrer = mockSystemUsers.find(u => u.id === beneficiary.referrerUserId);
                          return referrer ? referrer.name : 'غير محدد';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">سجل الطرود</h3>
              <div className="text-sm text-gray-600">
                إجمالي: {beneficiaryPackages.length} طرد
              </div>
            </div>

            {beneficiaryPackages.length > 0 ? (
              <div className="space-y-4">
                {beneficiaryPackages.map((pkg) => (
                  <div key={pkg.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                          <p className="text-sm text-gray-600">{pkg.type}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          pkg.status === 'delivered' ? 'success' :
                          pkg.status === 'in_delivery' ? 'info' :
                          pkg.status === 'pending' ? 'warning' : 'error'
                        }
                      >
                        {getPackageStatusText(pkg.status)}
                      </Badge>
                    </div>
                    
                    {pkg.deliveredAt && (
                      <div className="mt-3 bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2 space-x-reverse text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            تم التسليم في: {new Date(pkg.deliveredAt).toLocaleDateString('en-CA')}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {pkg.expiryDate && (
                      <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-2 space-x-reverse text-yellow-700">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            تاريخ انتهاء الصلاحية: {new Date(pkg.expiryDate).toLocaleDateString('en-CA')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">لا توجد طرود مسجلة</p>
                <p className="text-sm mt-2">لم يستلم هذا المستفيد أي طرود بعد</p>
                {onNavigateToIndividualSend && (
                  <Button
                    variant="primary"
                    icon={Send}
                    iconPosition="right"
                    onClick={() => onNavigateToIndividualSend(beneficiary.id)}
                    className="mt-4"
                  >
                    إرسال أول طرد
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'verification-files' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Camera className="w-5 h-5 ml-2 text-blue-600" />
                صورة الهوية مع السيلفي
              </h3>
              {beneficiary.identityImageUrl ? (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={beneficiary.identityImageUrl} alt="ID with Selfie" className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                  <p>صورة الهوية مع السيلفي غير متوفرة في البيانات الوهمية</p>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 ml-2 text-green-600" />
                صورة الهوية (الأمامية)
              </h3>
              {beneficiary.identityImageUrl ? (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={beneficiary.identityImageUrl} alt="Front ID" className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                  <p>صورة الهوية الأمامية غير متوفرة في البيانات الوهمية</p>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 ml-2 text-orange-600" />
                صورة الهوية (الخلفية)
              </h3>
              {beneficiary.identityImageUrl ? ( // Using identityImageUrl as a placeholder for now
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={beneficiary.identityImageUrl} alt="Back ID" className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                  <p>صورة الهوية الخلفية غير متوفرة في البيانات الوهمية</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
              <p>
                <span className="font-medium">ملاحظة:</span> في هذا النظام التجريبي، يتم استخدام نفس الصورة (identityImageUrl) لتمثيل جميع صور التوثيق. في نظام حقيقي، ستكون هناك حقول منفصلة لكل صورة.
              </p>
            </div>
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