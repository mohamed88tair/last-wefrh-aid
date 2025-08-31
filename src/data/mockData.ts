// Mock Database - سيتم استبدالها بقاعدة بيانات حقيقية لاحقاً
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin';
}

export interface Beneficiary {
  id: string;
  name: string;
  fullName: string;
  nationalId: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  phone: string;
  address: string;
  detailedAddress: {
    governorate: string;
    city: string;
    district: string;
    street: string;
    additionalInfo: string;
  };
  location: { lat: number; lng: number };
  profession: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  economicLevel: 'very_poor' | 'poor' | 'moderate' | 'good';
  membersCount: number;
  identityStatus: 'verified' | 'pending' | 'rejected';
  identityImageUrl?: string;
  status: 'active' | 'pending' | 'suspended';
  eligibilityStatus: 'eligible' | 'under_review' | 'rejected';
  lastReceived: string;
  totalPackages: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  referredByCode?: string;
  referrerUserId?: string;
}

export interface ReferralTransaction {
  id: string;
  beneficiaryId: string;
  referrerUserId: string;
  referralCodeId: string;
  referralCodeUsed: string;
  amount: number;
  status: 'pending_payment' | 'paid_to_referrer' | 'cancelled';
  createdAt: string;
  paidAt?: string;
  notes?: string;
}

export interface ReferralCode {
  id: string;
  code: string;
  referrerUserId: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  generatedAt: string;
  usedAt?: string;
  beneficiaryId?: string;
  expiresAt?: string;
}

export interface PackageTemplate {
  id: string;
  name: string;
  type: 'food' | 'medical' | 'clothing' | 'hygiene' | 'emergency';
  description: string;
  contents: PackageItem[];
  status: 'active' | 'draft' | 'inactive';
  createdAt: string;
  usageCount: number;
  totalWeight: number;
  estimatedCost: number;
}

export interface PackageItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  weight: number;
  notes?: string;
}

export interface Request {
  id: string;
  beneficiaryId: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  approvedDate?: string;
  rejectedDate?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  priority: 'low' | 'medium' | 'high';
  notes: string;
}

export interface Document {
  id: string;
  beneficiaryId: string;
  type: 'national_id' | 'family_card' | 'address_proof' | 'income_certificate' | 'medical_report' | 'other';
  name: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadDate: string;
  verifiedDate?: string;
  rejectedDate?: string;
  verifiedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  fileUrl: string;
  notes: string;
}

export interface Package {
  id: string;
  name: string;
  type: string;
  description: string;
  value: number;
  funder: string;
  beneficiaryId?: string;
  status: 'pending' | 'assigned' | 'in_delivery' | 'delivered' | 'failed';
  createdAt: string;
  deliveredAt?: string;
  expiryDate?: string;
}

export interface Courier {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'busy' | 'offline';
  rating: number;
  completedTasks: number;
  currentLocation?: { lat: number; lng: number };
  isHumanitarianApproved: boolean;
}

export interface Task {
  id: string;
  packageId: string;
  beneficiaryId: string;
  courierId?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'delivered' | 'failed' | 'rescheduled';
  createdAt: string;
  scheduledAt?: string;
  deliveredAt?: string;
  deliveryLocation?: { lat: number; lng: number };
  notes?: string;
  courierNotes?: string;
  deliveryProofImageUrl?: string;
  digitalSignatureImageUrl?: string;
  estimatedArrivalTime?: string;
  remainingDistance?: number;
  photoUrl?: string;
  failureReason?: string;
}

export interface MockActivityLog {
  id: string;
  action: string;
  user: string;
  role: string;
  timestamp: string;
  type: 'create' | 'verify' | 'approve' | 'update' | 'deliver' | 'review';
  beneficiaryId?: string;
  details?: string;
}

export interface MockAlert {
  id: string;
  type: 'delayed' | 'failed' | 'expired' | 'urgent';
  title: string;
  description: string;
  relatedId: string;
  relatedType: 'package' | 'beneficiary' | 'task';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'read' | 'write' | 'delete' | 'approve' | 'manage';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationalId: string;
  roleId: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
  referralCode?: string;
  totalReferrals?: number;
  totalReferralFees?: number;
}

// Define UUIDs for main entities
const beneficiary1Id = uuidv4();
const beneficiary2Id = uuidv4();
const beneficiary3Id = uuidv4();
const beneficiary4Id = uuidv4();
const beneficiary5Id = uuidv4();
const beneficiary6Id = uuidv4();
const beneficiary7Id = uuidv4();

const package1Id = uuidv4();
const package2Id = uuidv4();
const package3Id = uuidv4();

const courier1Id = uuidv4();
const courier2Id = uuidv4();
const courier3Id = uuidv4();

const task1Id = uuidv4();
const task2Id = uuidv4();
const task3Id = uuidv4();

const alert1Id = uuidv4();
const alert2Id = uuidv4();
const alert3Id = uuidv4();

const activity1Id = uuidv4();
const activity2Id = uuidv4();
const activity3Id = uuidv4();
const activity4Id = uuidv4();
const activity5Id = uuidv4();

const perm1Id = uuidv4();
const perm2Id = uuidv4();
const perm3Id = uuidv4();
const perm4Id = uuidv4();
const perm5Id = uuidv4();
const perm6Id = uuidv4();
const perm7Id = uuidv4();
const perm8Id = uuidv4();
const perm9Id = uuidv4();
const perm10Id = uuidv4();
const perm11Id = uuidv4();
const perm12Id = uuidv4();
const perm13Id = uuidv4();

const roleAdminId = uuidv4();
const roleMonitorId = uuidv4();
const roleCourierId = uuidv4();
const roleReviewerId = uuidv4();

const userAdminId = uuidv4();
const userCourierId = uuidv4();

// Referral Code IDs
const refCode1Id = uuidv4();
const refCode2Id = uuidv4();
const refCode3Id = uuidv4();
const refCode4Id = uuidv4();
const refCode5Id = uuidv4();
const refCode6Id = uuidv4();

// Mock Package Templates Data
export const mockPackageTemplates: PackageTemplate[] = [
  {
    id: uuidv4(),
    name: 'طرد رمضان كريم 2024',
    type: 'food',
    description: 'طرد غذائي شامل لشهر رمضان المبارك',
    contents: [
      { id: uuidv4(), name: 'أرز بسمتي', quantity: 5, unit: 'كيلو', weight: 5 },
      { id: uuidv4(), name: 'زيت زيتون', quantity: 1, unit: 'لتر', weight: 1 },
      { id: uuidv4(), name: 'سكر أبيض', quantity: 2, unit: 'كيلو', weight: 2 },
      { id: uuidv4(), name: 'طحين', quantity: 3, unit: 'كيلو', weight: 3 },
      { id: uuidv4(), name: 'عدس أحمر', quantity: 1, unit: 'كيلو', weight: 1 },
      { id: uuidv4(), name: 'تونة معلبة', quantity: 6, unit: 'علبة', weight: 1.2 },
      { id: uuidv4(), name: 'معجون طماطم', quantity: 3, unit: 'علبة', weight: 0.6 },
      { id: uuidv4(), name: 'حليب مجفف', quantity: 2, unit: 'علبة', weight: 0.8 }
    ],
    status: 'active',
    createdAt: '2024-01-10',
    usageCount: 247,
    totalWeight: 14.6,
    estimatedCost: 50
  },
  {
    id: uuidv4(),
    name: 'طرد الشتاء الدافئ',
    type: 'clothing',
    description: 'طرد ملابس شتوية للعائلات',
    contents: [
      { id: uuidv4(), name: 'بطانية صوف', quantity: 2, unit: 'قطعة', weight: 3 },
      { id: uuidv4(), name: 'جاكيت شتوي للكبار', quantity: 2, unit: 'قطعة', weight: 1.5 },
      { id: uuidv4(), name: 'جاكيت شتوي للأطفال', quantity: 3, unit: 'قطعة', weight: 0.8 },
      { id: uuidv4(), name: 'جوارب صوفية', quantity: 6, unit: 'زوج', weight: 0.3 },
      { id: uuidv4(), name: 'قبعة صوفية', quantity: 4, unit: 'قطعة', weight: 0.2 },
      { id: uuidv4(), name: 'قفازات', quantity: 4, unit: 'زوج', weight: 0.1 }
    ],
    status: 'active',
    createdAt: '2024-01-08',
    usageCount: 156,
    totalWeight: 5.9,
    estimatedCost: 75
  },
  {
    id: uuidv4(),
    name: 'طرد الإسعافات الأولية',
    type: 'medical',
    description: 'طرد طبي للإسعافات الأولية',
    contents: [
      { id: uuidv4(), name: 'ضمادات طبية', quantity: 10, unit: 'قطعة', weight: 0.5 },
      { id: uuidv4(), name: 'مطهر جروح', quantity: 2, unit: 'زجاجة', weight: 0.4 },
      { id: uuidv4(), name: 'مسكنات', quantity: 2, unit: 'علبة', weight: 0.2 },
      { id: uuidv4(), name: 'خافض حرارة', quantity: 1, unit: 'علبة', weight: 0.1 },
      { id: uuidv4(), name: 'شاش طبي', quantity: 5, unit: 'لفة', weight: 0.3 }
    ],
    status: 'draft',
    createdAt: '2024-01-12',
    usageCount: 0,
    totalWeight: 1.5,
    estimatedCost: 30
  }
];

export const mockBeneficiaries: Beneficiary[] = [
  {
    id: beneficiary1Id,
    name: 'محمد خالد أبو عامر',
    fullName: 'محمد خالد عبدالله أبو عامر',
    nationalId: '900123456',
    dateOfBirth: '1985-03-15',
    gender: 'male',
    phone: '0591234567',
    address: 'خان يونس - الكتيبة - شارع الشهداء',
    detailedAddress: {
      governorate: 'خان يونس',
      city: 'خان يونس',
      district: 'الكتيبة',
      street: 'شارع الشهداء',
      additionalInfo: 'بجانب مسجد الكتيبة الكبير'
    },
    location: { lat: 31.3469, lng: 34.3029 },
    profession: 'عامل بناء',
    maritalStatus: 'married',
    economicLevel: 'poor',
    membersCount: 6,
    identityStatus: 'verified',
    identityImageUrl: 'https://example.com/id1.jpg',
    status: 'active',
    eligibilityStatus: 'eligible',
    lastReceived: '2024-12-20',
    totalPackages: 5,
    notes: 'مستفيد منتظم، يحتاج مساعدة شهرية',
    createdAt: '2024-01-15',
    updatedAt: '2024-12-20',
    createdBy: 'admin',
    updatedBy: 'admin',
    referredByCode: 'MT564',
    referrerUserId: userCourierId
  },
  {
    id: beneficiary2Id,
    name: 'فاطمة أحمد الفرا',
    fullName: 'فاطمة أحمد محمد الفرا',
    nationalId: '900234567',
    dateOfBirth: '1978-07-22',
    gender: 'female',
    phone: '0592345678',
    address: 'غزة - الشجاعية - شارع الوحدة',
    detailedAddress: {
      governorate: 'غزة',
      city: 'غزة',
      district: 'الشجاعية',
      street: 'شارع الوحدة',
      additionalInfo: 'بجانب مدرسة الشجاعية الابتدائية'
    },
    location: { lat: 31.3200, lng: 34.3500 },
    profession: 'ربة منزل',
    maritalStatus: 'widowed',
    economicLevel: 'poor',
    membersCount: 4,
    identityStatus: 'verified',
    status: 'active',
    eligibilityStatus: 'eligible',
    lastReceived: '2024-12-17',
    totalPackages: 3,
    notes: 'أرملة مع أطفال، تحتاج دعم شهري',
    createdAt: '2024-02-01',
    updatedAt: '2024-12-17',
    createdBy: 'admin',
    updatedBy: 'admin',
    referredByCode: 'AD001',
    referrerUserId: userAdminId
  },
  {
    id: beneficiary3Id,
    name: 'خالد سالم النجار',
    fullName: 'خالد سالم محمد النجار',
    nationalId: '900345678',
    dateOfBirth: '1990-11-10',
    gender: 'male',
    phone: '0593456789',
    address: 'رفح - البرازيل - شارع الشهداء',
    detailedAddress: {
      governorate: 'رفح',
      city: 'رفح',
      district: 'البرازيل',
      street: 'شارع الشهداء',
      additionalInfo: 'قرب الحدود المصرية'
    },
    location: { lat: 31.2950, lng: 34.2400 },
    profession: 'صياد',
    maritalStatus: 'married',
    economicLevel: 'poor',
    membersCount: 5,
    identityStatus: 'verified',
    status: 'active',
    eligibilityStatus: 'eligible',
    lastReceived: '2024-12-21',
    totalPackages: 2,
    notes: 'صياد متضرر من الأوضاع الأمنية',
    createdAt: '2024-01-10',
    updatedAt: '2024-12-21',
    createdBy: 'admin',
    updatedBy: 'admin',
    referredByCode: 'SR002-XYZ',
    referrerUserId: uuidv4()
  },
  {
    id: beneficiary4Id,
    name: 'مريم عبدالله الشوا',
    fullName: 'مريم عبدالله حسن الشوا',
    nationalId: '900456789',
    dateOfBirth: '1995-05-18',
    gender: 'female',
    phone: '0594567890',
    address: 'الوسطى - دير البلح - شارع الاستقلال',
    detailedAddress: {
      governorate: 'الوسطى',
      city: 'دير البلح',
      district: 'دير البلح الشرقية',
      street: 'شارع الاستقلال',
      additionalInfo: 'بجانب مستشفى شهداء الأقصى'
    },
    location: { lat: 31.4200, lng: 34.3500 },
    profession: 'معلمة',
    maritalStatus: 'divorced',
    economicLevel: 'moderate',
    membersCount: 3,
    identityStatus: 'pending',
    status: 'pending',
    eligibilityStatus: 'under_review',
    lastReceived: '2024-11-30',
    totalPackages: 1,
    notes: 'معلمة مطلقة مع أطفال',
    createdAt: '2024-03-01',
    updatedAt: '2024-12-01',
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: beneficiary5Id,
    name: 'أحمد عبدالله النجار',
    fullName: 'أحمد عبدالله سليم النجار',
    nationalId: '900567890',
    dateOfBirth: '1982-09-30',
    gender: 'male',
    phone: '0595678901',
    address: 'خان يونس - القرارة - شارع فلسطين',
    detailedAddress: {
      governorate: 'خان يونس',
      city: 'القرارة',
      district: 'القرارة الشرقية',
      street: 'شارع فلسطين',
      additionalInfo: 'بجانب مسجد القرارة الكبير'
    },
    location: { lat: 31.3000, lng: 34.3600 },
    profession: 'سائق تاكسي',
    maritalStatus: 'married',
    economicLevel: 'poor',
    membersCount: 5,
    identityStatus: 'verified',
    status: 'active',
    eligibilityStatus: 'eligible',
    lastReceived: '2024-12-19',
    totalPackages: 8,
    notes: 'سائق تاكسي متضرر من ارتفاع أسعار الوقود',
    createdAt: '2024-01-08',
    updatedAt: '2024-12-19',
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: beneficiary6Id,
    name: 'نورا إبراهيم الحلو',
    fullName: 'نورا إبراهيم عبدالرحمن الحلو',
    nationalId: '900678901',
    dateOfBirth: '1988-12-05',
    gender: 'female',
    phone: '0596789012',
    address: 'شمال غزة - بيت لاهيا - شارع الصمود',
    detailedAddress: {
      governorate: 'شمال غزة',
      city: 'بيت لاهيا',
      district: 'بيت لاهيا الشرقية',
      street: 'شارع الصمود',
      additionalInfo: 'منطقة حدودية شمالية'
    },
    location: { lat: 31.5500, lng: 34.5000 },
    profession: 'خياطة',
    maritalStatus: 'single',
    economicLevel: 'poor',
    membersCount: 2,
    identityStatus: 'verified',
    status: 'active',
    eligibilityStatus: 'eligible',
    lastReceived: '2024-12-19',
    totalPackages: 3,
    notes: 'خياطة ماهرة تعول والدتها المسنة',
    createdAt: '2024-03-01',
    updatedAt: '2024-12-19',
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: beneficiary7Id,
    name: 'يوسف حسن البرغوثي',
    fullName: 'يوسف حسن محمد البرغوثي',
    nationalId: '900789012',
    dateOfBirth: '1992-08-12',
    gender: 'male',
    phone: '0597890123',
    address: 'خان يونس - الفخاري - شارع الأقصى',
    detailedAddress: {
      governorate: 'خان يونس',
      city: 'الفخاري',
      district: 'الفخاري الشرقية',
      street: 'شارع الأقصى',
      additionalInfo: 'منطقة الحدود الشرقية'
    },
    location: { lat: 31.2950, lng: 34.3700 },
    profession: 'عاطل عن العمل',
    maritalStatus: 'single',
    economicLevel: 'very_poor',
    membersCount: 1,
    identityStatus: 'pending',
    status: 'pending',
    eligibilityStatus: 'under_review',
    lastReceived: '2024-11-30',
    totalPackages: 1,
    notes: 'شاب عاطل عن العمل يحتاج دعم عاجل',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01',
    createdBy: 'admin',
    updatedBy: 'admin'
  }
];

export const mockPackages: Package[] = [
  {
    id: package1Id,
    name: 'طرد مواد غذائية أساسية',
    type: 'مواد غذائية',
    description: 'أرز، سكر، زيت، معلبات، تمر',
    value: 50,
    funder: 'الأونروا',
    beneficiaryId: beneficiary1Id,
    status: 'delivered',
    createdAt: '2024-12-20',
    deliveredAt: '2024-12-20',
    expiryDate: '2024-12-30'
  },
  {
    id: package2Id,
    name: 'طرد ملابس شتوية',
    type: 'ملابس',
    description: 'معاطف، بطانيات، ملابس داخلية',
    value: 75,
    funder: 'الهلال الأحمر الفلسطيني',
    beneficiaryId: beneficiary2Id,
    status: 'in_delivery',
    createdAt: '2024-12-19'
  },
  {
    id: package3Id,
    name: 'طرد أدوية أساسية',
    type: 'أدوية',
    description: 'مسكنات، أدوية ضغط، فيتامينات',
    value: 30,
    funder: 'منظمة الصحة العالمية',
    beneficiaryId: beneficiary3Id,
    status: 'pending',
    createdAt: '2024-12-18',
    expiryDate: '2025-06-18'
  }
];

export const mockCouriers: Courier[] = [
  {
    id: courier1Id,
    name: 'محمد علي أبو عامر',
    phone: '0591234567',
    email: 'mohammed@courier.com',
    status: 'active',
    rating: 4.8,
    completedTasks: 156,
    currentLocation: { lat: 31.3469, lng: 34.3029 },
    isHumanitarianApproved: true
  },
  {
    id: courier2Id,
    name: 'أحمد خالد الفرا',
    phone: '0592345678',
    email: 'ahmed@courier.com',
    status: 'busy',
    rating: 4.6,
    completedTasks: 89,
    currentLocation: { lat: 31.3200, lng: 34.3500 },
    isHumanitarianApproved: true
  },
  {
    id: courier3Id,
    name: 'سالم محمد النجار',
    phone: '0593456789',
    email: 'salem@courier.com',
    status: 'offline',
    rating: 4.9,
    completedTasks: 234,
    currentLocation: { lat: 31.3100, lng: 34.3800 },
    isHumanitarianApproved: true
  }
];

export const mockTasks: Task[] = [
  {
    id: task1Id,
    packageId: package1Id,
    beneficiaryId: beneficiary1Id,
    courierId: courier1Id,
    status: 'delivered',
    createdAt: '2024-12-20',
    scheduledAt: '2024-12-20',
    deliveredAt: '2024-12-20',
    deliveryLocation: { lat: 31.5017, lng: 34.4668 },
    notes: 'تم التسليم بنجاح للمستفيد',
    courierNotes: 'المستفيد كان متواجداً في المنزل، تم التسليم مباشرة',
    deliveryProofImageUrl: 'https://example.com/delivery_proof1.jpg',
    digitalSignatureImageUrl: 'https://example.com/signature1.jpg'
  },
  {
    id: task2Id,
    packageId: package2Id,
    beneficiaryId: beneficiary2Id,
    courierId: courier2Id,
    status: 'in_progress',
    createdAt: '2024-12-19',
    scheduledAt: '2024-12-21',
    estimatedArrivalTime: '2024-12-21T14:30:00',
    remainingDistance: 2.5,
    notes: 'في الطريق للتسليم'
  },
  {
    id: task3Id,
    packageId: package3Id,
    beneficiaryId: beneficiary3Id,
    status: 'pending',
    createdAt: '2024-12-18',
    notes: 'في انتظار تعيين مندوب'
  }
];

export const mockAlerts: MockAlert[] = [
  {
    id: alert1Id,
    type: 'delayed',
    title: 'طرود متأخرة في قطاع غزة',
    description: '23 طرد في منطقة الشجاعية لم يتم تسليمها',
    relatedId: package2Id,
    relatedType: 'package',
    priority: 'critical',
    isRead: false,
    createdAt: '2024-12-21'
  },
  {
    id: alert2Id,
    type: 'failed',
    title: 'فشل في التسليم',
    description: '5 طرود تحتاج تحديث عنوان',
    relatedId: task3Id,
    relatedType: 'task',
    priority: 'high',
    isRead: false,
    createdAt: '2024-12-20'
  },
  {
    id: alert3Id,
    type: 'expired',
    title: 'طرود قاربت على الانتهاء',
    description: '12 طرد تنتهي صلاحيتها خلال 3 أيام',
    relatedId: package1Id,
    relatedType: 'package',
    priority: 'medium',
    isRead: true,
    createdAt: '2024-12-19'
  }
];

// Mock Activity Log
export const mockActivityLog: MockActivityLog[] = [
  {
    id: activity1Id,
    action: 'تم تسليم طرد مواد غذائية',
    user: 'محمد علي أبو عامر',
    role: 'مندوب',
    timestamp: '2024-12-21T10:30:00',
    type: 'deliver',
    beneficiaryId: beneficiary1Id,
    details: 'تم التسليم بنجاح مع توثيق بالصورة'
  },
  {
    id: activity2Id,
    action: 'تحديث بيانات المستفيد',
    user: 'فاطمة أحمد المشرفة',
    role: 'مشرف',
    timestamp: '2024-12-20T14:15:00',
    type: 'update',
    beneficiaryId: beneficiary1Id,
    details: 'تم تحديث رقم الهاتف والعنوان'
  },
  {
    id: activity3Id,
    action: 'التحقق من الهوية',
    user: 'أحمد محمد الإدمن',
    role: 'مدير',
    timestamp: '2024-12-19T09:45:00',
    type: 'verify',
    beneficiaryId: beneficiary1Id,
    details: 'تم قبول وثائق الهوية والموافقة'
  },
  {
    id: activity4Id,
    action: 'إضافة مستفيد جديد',
    user: 'سارة المنسقة',
    role: 'منسق',
    timestamp: '2024-12-18T11:20:00',
    type: 'create',
    beneficiaryId: beneficiary2Id,
    details: 'تم تسجيل المستفيد في النظام'
  },
  {
    id: activity5Id,
    action: 'فشل في التسليم',
    user: 'خالد المندوب',
    role: 'مندوب',
    timestamp: '2024-12-17T16:30:00',
    type: 'deliver',
    beneficiaryId: beneficiary3Id,
    details: 'العنوان غير صحيح، يحتاج تحديث'
  }
];

// Permissions Data
export const mockPermissions: Permission[] = [
  { id: perm1Id, name: 'قراءة جميع البيانات', description: 'عرض جميع البيانات في النظام', category: 'read' },
  { id: perm2Id, name: 'تعديل جميع البيانات', description: 'تعديل أي بيانات في النظام', category: 'write' },
  { id: perm3Id, name: 'حذف البيانات', description: 'حذف البيانات من النظام', category: 'delete' },
  { id: perm4Id, name: 'إدارة المستخدمين', description: 'إضافة وتعديل المستخدمين', category: 'manage' },
  { id: perm5Id, name: 'إدارة الأدوار', description: 'إنشاء وتعديل الأدوار', category: 'manage' },
  { id: perm6Id, name: 'عرض التقارير', description: 'الوصول للتقارير والإحصائيات', category: 'read' },
  { id: perm7Id, name: 'عرض المستفيدين', description: 'عرض قائمة المستفيدين', category: 'read' },
  { id: perm8Id, name: 'إدارة المستفيدين', description: 'إضافة وتعديل المستفيدين', category: 'write' },
  { id: perm9Id, name: 'عرض الطلبات', description: 'عرض طلبات المساعدة', category: 'read' },
  { id: perm10Id, name: 'موافقة الطلبات', description: 'الموافقة على طلبات المساعدة', category: 'approve' },
  { id: perm11Id, name: 'رفض الطلبات', description: 'رفض طلبات المساعدة', category: 'approve' },
  { id: perm12Id, name: 'عرض التسليمات', description: 'عرض حالة التسليمات', category: 'read' },
  { id: perm13Id, name: 'تحديث حالة التسليم', description: 'تحديث حالة تسليم الطرود', category: 'write' }
];

export const mockRoles: Role[] = [
  {
    id: roleAdminId,
    name: 'مدير النظام',
    description: 'صلاحيات كاملة على جميع أجزاء النظام',
    permissions: [perm1Id, perm2Id, perm3Id, perm4Id, perm5Id, perm6Id],
    userCount: 2,
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: roleMonitorId,
    name: 'موظف المراقبة',
    description: 'متابعة الأنشطة والتقارير',
    permissions: [perm1Id, perm6Id, perm12Id], // قراءة جميع البيانات، عرض التقارير، عرض التسليمات
    userCount: 0,
    isActive: true,
    createdAt: '2024-01-12'
  },
  {
    id: roleCourierId,
    name: 'مندوب التوزيع',
    description: 'تحديث حالة التسليمات والتوزيع',
    permissions: [perm12Id, perm13Id, perm7Id],
    userCount: 15,
    isActive: true,
    createdAt: '2024-01-10'
  },
  {
    id: roleReviewerId,
    name: 'مراجع الطلبات',
    description: 'مراجعة وموافقة طلبات المساعدة',
    permissions: [perm9Id, perm10Id, perm11Id, perm7Id],
    userCount: 5,
    isActive: true,
    createdAt: '2024-01-15'
  }
];

export const mockSystemUsers: SystemUser[] = [
  {
    id: userAdminId,
    name: 'أحمد محمد الإدمن',
    email: 'admin@humanitarian.ps',
    phone: '0501234567',
    nationalId: '900111222',
    roleId: roleAdminId,
    status: 'active',
    lastLogin: '2024-12-21',
    createdAt: '2024-01-01',
    referralCode: 'AD001-ABC',
    totalReferrals: 12,
    totalReferralFees: 60
  },
  {
    id: uuidv4(), // New user ID for reviewer
    name: 'سارة مراجع الطلبات',
    email: 'reviewer@humanitarian.ps',
    phone: '0594445555',
    nationalId: '900222333',
    roleId: roleReviewerId,
    status: 'active',
    lastLogin: '2024-12-21',
    createdAt: '2024-01-15',
    referralCode: 'SR002-XYZ',
    totalReferrals: 8,
    totalReferralFees: 40
  },
  {
    id: uuidv4(), // New user ID for monitor
    name: 'خالد موظف المراقبة',
    email: 'monitor@humanitarian.ps',
    phone: '0596667777',
    nationalId: '900333444',
    roleId: roleMonitorId,
    status: 'active',
    lastLogin: '2024-12-21',
    createdAt: '2024-01-16',
    referralCode: 'KM003-DEF',
    totalReferrals: 5,
    totalReferralFees: 25
  },
  {
    id: userCourierId,
    name: 'محمد علي المندوب',
    email: 'courier@humanitarian.ps',
    phone: '0567891234',
    nationalId: '900444555',
    roleId: roleCourierId,
    status: 'active',
    lastLogin: '2024-12-21',
    createdAt: '2024-01-10',
    referralCode: 'MT564-GHI',
    totalReferrals: 15,
    totalReferralFees: 75
  }
];

// Mock Referral Codes Data
export const mockReferralCodes: ReferralCode[] = [
  // Active codes (current codes for each user)
  {
    id: refCode1Id,
    code: 'AD001-ABC',
    referrerUserId: userAdminId,
    status: 'active',
    generatedAt: '2024-12-20T10:00:00Z',
    expiresAt: '2024-12-27T23:59:59Z'
  },
  {
    id: refCode2Id,
    code: 'SR002-XYZ',
    referrerUserId: mockSystemUsers[1].id,
    status: 'active',
    generatedAt: '2024-12-21T09:30:00Z',
    expiresAt: '2024-12-28T23:59:59Z'
  },
  {
    id: refCode3Id,
    code: 'KM003-DEF',
    referrerUserId: mockSystemUsers[2].id,
    status: 'active',
    generatedAt: '2024-12-21T11:15:00Z',
    expiresAt: '2024-12-28T23:59:59Z'
  },
  {
    id: refCode4Id,
    code: 'MT564-GHI',
    referrerUserId: userCourierId,
    status: 'active',
    generatedAt: '2024-12-21T08:45:00Z',
    expiresAt: '2024-12-28T23:59:59Z'
  },
  // Used codes (previous codes that were used)
  {
    id: refCode5Id,
    code: 'MT564',
    referrerUserId: userCourierId,
    status: 'used',
    generatedAt: '2024-01-15T10:00:00Z',
    usedAt: '2024-01-15T14:30:00Z',
    beneficiaryId: beneficiary1Id
  },
  {
    id: refCode6Id,
    code: 'AD001',
    referrerUserId: userAdminId,
    status: 'used',
    generatedAt: '2024-02-01T09:00:00Z',
    usedAt: '2024-02-01T11:20:00Z',
    beneficiaryId: beneficiary2Id
  }
];

// Mock Referral Transactions Data
export const mockReferralTransactions: ReferralTransaction[] = [
  {
    id: uuidv4(),
    beneficiaryId: beneficiary1Id,
    referrerUserId: userCourierId,
    referralCodeId: refCode5Id,
    referralCodeUsed: 'MT564',
    amount: 5,
    status: 'paid_to_referrer',
    createdAt: '2024-01-15',
    paidAt: '2024-01-16',
    notes: 'تم الدفع للمحيل محمد علي'
  },
  {
    id: uuidv4(),
    beneficiaryId: beneficiary2Id,
    referrerUserId: userAdminId,
    referralCodeId: refCode6Id,
    referralCodeUsed: 'AD001',
    amount: 5,
    status: 'pending_payment',
    createdAt: '2024-02-01',
    notes: 'في انتظار الدفع للمحيل أحمد محمد'
  },
  {
    id: uuidv4(),
    beneficiaryId: beneficiary3Id,
    referrerUserId: uuidv4(),
    referralCodeId: uuidv4(),
    referralCodeUsed: 'SR002',
    amount: 5,
    status: 'paid_to_referrer',
    createdAt: '2024-01-10',
    paidAt: '2024-01-12',
    notes: 'تم الدفع للمحيل سارة مراجع'
  },
  // Additional mock transactions for daily tracking
  {
    id: uuidv4(),
    beneficiaryId: uuidv4(),
    referrerUserId: userCourierId,
    referralCodeId: uuidv4(),
    referralCodeUsed: 'MT564-OLD1',
    amount: 5,
    status: 'paid_to_referrer',
    createdAt: '2024-12-19',
    paidAt: '2024-12-20',
    notes: 'تم الدفع - إحالة يوم 19 ديسمبر'
  },
  {
    id: uuidv4(),
    beneficiaryId: uuidv4(),
    referrerUserId: userCourierId,
    referralCodeId: uuidv4(),
    referralCodeUsed: 'MT564-OLD2',
    amount: 5,
    status: 'paid_to_referrer',
    createdAt: '2024-12-20',
    paidAt: '2024-12-21',
    notes: 'تم الدفع - إحالة يوم 20 ديسمبر'
  },
  {
    id: uuidv4(),
    beneficiaryId: uuidv4(),
    referrerUserId: userAdminId,
    referralCodeId: uuidv4(),
    referralCodeUsed: 'AD001-OLD1',
    amount: 5,
    status: 'pending_payment',
    createdAt: '2024-12-21',
    notes: 'في انتظار الدفع - إحالة يوم 21 ديسمبر'
  }
];

// Legacy export for backward compatibility
export const beneficiaries = mockBeneficiaries;

export const getPackagesByBeneficiary = (beneficiaryId: string): Package[] => {
  return mockPackages.filter(p => p.beneficiaryId === beneficiaryId);
};

export const getTasksByStatus = (status: Task['status']): Task[] => { // Keep as it's used by TestSupabasePage
  return mockTasks.filter(t => t.status === status);
};

export const getUnreadAlerts = (): MockAlert[] => { // Keep as it's used by AdminDashboard
  return mockAlerts.filter(a => !a.isRead);
};

export const getCriticalAlerts = (): MockAlert[] => { // Keep as it's used by AdminDashboard
  return mockAlerts.filter(a => a.priority === 'critical' && !a.isRead);
};

export const getTemplateById = (id: string): PackageTemplate | undefined => {
  return mockPackageTemplates.find(template => template.id === id);
};

// Statistics calculations
export const calculateStats = () => {
  const totalBeneficiaries = mockBeneficiaries.length;
  const verifiedBeneficiaries = mockBeneficiaries.filter(b => b.identityStatus === 'verified').length;
  const totalPackages = mockPackages.length;
  const deliveredPackages = mockPackages.filter(p => p.status === 'delivered').length;
  const activeTasks = mockTasks.filter(t => ['pending', 'assigned', 'in_progress'].includes(t.status)).length;
  const criticalAlerts = getCriticalAlerts().length;
  
  return {
    totalBeneficiaries,
    verifiedBeneficiaries,
    totalPackages,
    deliveredPackages,
    activeTasks,
    criticalAlerts,
    deliveryRate: totalPackages > 0 ? Math.round((deliveredPackages / totalPackages) * 100) : 0
  };
};