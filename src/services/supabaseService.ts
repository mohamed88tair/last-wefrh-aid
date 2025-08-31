import { 
  mockBeneficiaries, 
  mockPackages, 
  mockTasks, 
  mockAlerts, 
  mockActivityLog, 
  mockCouriers,
  mockPackageTemplates,
  mockRoles,
  mockSystemUsers,
  mockPermissions,
  calculateStats,
  type Beneficiary,
  type Package as PackageType,
  type Task,
  type MockAlert, // Changed from Alert to MockAlert
  type MockActivityLog, // Changed from ActivityLog to MockActivityLog
  type Courier,
  type PackageTemplate,
  type Role,
  type SystemUser,
  type Permission
} from '../data/mockData';

import supabase from '../lib/supabaseClient';

const simulateNetworkDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const beneficiariesService = {
  async getAll(): Promise<Beneficiary[]> {
    await simulateNetworkDelay();
    return [...mockBeneficiaries];
  },

  async getAllDetailed(): Promise<Beneficiary[]> {
    await simulateNetworkDelay();
    return [...mockBeneficiaries];
  },

  async search(searchTerm: string): Promise<Beneficiary[]> {
    await simulateNetworkDelay();
    return mockBeneficiaries.filter(b => 
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.nationalId.includes(searchTerm) ||
      b.phone.includes(searchTerm)
    );
  },

  async getById(id: string): Promise<Beneficiary | null> {
    await simulateNetworkDelay();
    return mockBeneficiaries.find(b => b.id === id) || null;
  },

  async getByOrganization(organizationId: string): Promise<Beneficiary[]> {
    await simulateNetworkDelay();
    return mockBeneficiaries.filter(b => b.organizationId === organizationId);
  },

  async getByFamily(familyId: string): Promise<Beneficiary[]> {
    await simulateNetworkDelay();
    return mockBeneficiaries.filter(b => b.familyId === familyId);
  },

  async create(beneficiary: any): Promise<Beneficiary> {
    await simulateNetworkDelay();
    const newBeneficiary: Beneficiary = {
      id: `new-${Date.now()}`,
      name: beneficiary.name,
      fullName: beneficiary.fullName,
      nationalId: beneficiary.nationalId,
      dateOfBirth: beneficiary.dateOfBirth,
      gender: beneficiary.gender,
      phone: beneficiary.phone,
      address: beneficiary.address,
      detailedAddress: beneficiary.detailedAddress,
      location: beneficiary.location || { lat: 31.3469, lng: 34.3029 },
      profession: beneficiary.profession,
      maritalStatus: beneficiary.maritalStatus,
      economicLevel: beneficiary.economicLevel,
      membersCount: beneficiary.membersCount,
      identityStatus: 'pending',
      identityImageUrl: beneficiary.identityImageUrl,
      status: 'active',
      eligibilityStatus: 'under_review',
      lastReceived: new Date().toISOString().split('T')[0],
      totalPackages: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      updatedBy: 'admin'
    };
    
    mockBeneficiaries.unshift(newBeneficiary);
    return newBeneficiary;
  },

  async update(id: string, updates: any): Promise<Beneficiary> {
    await simulateNetworkDelay();
    const index = mockBeneficiaries.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('المستفيد غير موجود');
    }
    
    mockBeneficiaries[index] = {
      ...mockBeneficiaries[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return mockBeneficiaries[index];
  },

  async delete(id: string): Promise<void> {
    await simulateNetworkDelay();
    const index = mockBeneficiaries.findIndex(b => b.id === id);
    if (index !== -1) {
      mockBeneficiaries.splice(index, 1);
    }
  }
};

export const packagesService = {
  async getAll(): Promise<PackageType[]> {
    await simulateNetworkDelay();
    return [...mockPackages];
  },

  async getByBeneficiary(beneficiaryId: string): Promise<PackageType[]> {
    await simulateNetworkDelay();
    return mockPackages.filter(p => p.beneficiaryId === beneficiaryId);
  },

  async create(packageData: any): Promise<PackageType> {
    await simulateNetworkDelay();
    const newPackage: PackageType = {
      id: `pkg-${Date.now()}`,
      name: packageData.name,
      type: packageData.type,
      description: packageData.description,
      value: packageData.value,
      funder: packageData.funder,
      beneficiaryId: packageData.beneficiaryId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      deliveredAt: packageData.deliveredAt,
      expiryDate: packageData.expiryDate
    };
    
    mockPackages.unshift(newPackage);
    return newPackage;
  }
};

export const packageTemplatesService = {
  async getAll(): Promise<PackageTemplate[]> {
    await simulateNetworkDelay();
    return [...mockPackageTemplates];
  },

  async getByOrganization(organizationId: string): Promise<PackageTemplate[]> {
    await simulateNetworkDelay();
    return [...mockPackageTemplates];
  },

  async createWithItems(template: any, items: any[]): Promise<PackageTemplate> {
    await simulateNetworkDelay();
    const newTemplate: PackageTemplate = {
      id: `template-${Date.now()}`,
      name: template.name,
      type: template.type,
      description: template.description,
      contents: items,
      status: 'active',
      createdAt: new Date().toISOString(),
      usageCount: 0,
      totalWeight: items.reduce((sum, item) => sum + (item.weight || 0), 0),
      estimatedCost: template.estimatedCost || 0
    };
    
    mockPackageTemplates.unshift(newTemplate);
    return newTemplate;
  }
};

export const tasksService = {
  async getAll(): Promise<Task[]> {
    await simulateNetworkDelay();
    return [...mockTasks];
  },

  async getByBeneficiary(beneficiaryId: string): Promise<Task[]> {
    await simulateNetworkDelay();
    return mockTasks.filter(t => t.beneficiaryId === beneficiaryId);
  },

  async updateStatus(id: string, status: Task['status'], updates?: any): Promise<Task> {
    await simulateNetworkDelay();
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('المهمة غير موجودة');
    }
    
    mockTasks[index] = {
      ...mockTasks[index],
      status,
      ...updates
    };
    
    return mockTasks[index];
  }
};

export const alertsService = { // Keep as it's used by AdminDashboard
  async getAll(): Promise<MockAlert[]> {
    await simulateNetworkDelay();
    return [...mockAlerts];
  },

  async getUnread(): Promise<MockAlert[]> {
    await simulateNetworkDelay();
    return mockAlerts.filter(a => !a.isRead);
  },

  async markAsRead(id: string): Promise<void> {
    await simulateNetworkDelay();
    const mockAlert = mockAlerts.find(a => a.id === id);
    if (mockAlert) {
      mockAlert.isRead = true;
    }
  }
};

// export const activityLogService = { // Removed as ActivityLogPage is removed
//   async getAll(): Promise<MockActivityLog[]> {
//     await simulateNetworkDelay();
//     return [...mockActivityLog];
//   },

//   async getByBeneficiary(beneficiaryId: string): Promise<MockActivityLog[]> {
//     await simulateNetworkDelay();
//     return mockActivityLog.filter(a => a.beneficiaryId === beneficiaryId);
//   }
// };

export const couriersService = {
  async getAll(): Promise<Courier[]> {
    await simulateNetworkDelay();
    return [...mockCouriers];
  },

  async getAllWithPerformance(): Promise<Courier[]> {
    await simulateNetworkDelay();
    return [...mockCouriers];
  },

  async updateLocation(courierId: string, location: any): Promise<any> {
    await simulateNetworkDelay();
    const courier = mockCouriers.find(c => c.id === courierId);
    if (courier) {
      courier.currentLocation = { lat: location.latitude, lng: location.longitude };
    }
    return { success: true };
  }
};

export const rolesService = {
  async getAll(): Promise<Role[]> {
    await simulateNetworkDelay();
    return [...mockRoles];
  }
};

export const systemUsersService = {
  async getAll(): Promise<SystemUser[]> {
    await simulateNetworkDelay();
    return [...mockSystemUsers];
  }
};

export const permissionsService = {
  async getAll(): Promise<Permission[]> {
    await simulateNetworkDelay();
    return [...mockPermissions];
  }
};

export const statisticsService = {
  async getOverallStats(): Promise<any> {
    await simulateNetworkDelay();
    return calculateStats();
  },

  async getGeographicStats(): Promise<any[]> {
    await simulateNetworkDelay();
    return [
      { area_name: 'خان يونس', total_beneficiaries: 156, delivered_packages: 89, pending_packages: 23, success_rate: 79.5 },
      { area_name: 'غزة', total_beneficiaries: 234, delivered_packages: 187, pending_packages: 34, success_rate: 84.6 },
      { area_name: 'رفح', total_beneficiaries: 98, delivered_packages: 67, pending_packages: 18, success_rate: 78.8 },
      { area_name: 'الوسطى', total_beneficiaries: 123, delivered_packages: 95, pending_packages: 15, success_rate: 86.4 },
      { area_name: 'شمال غزة', total_beneficiaries: 87, delivered_packages: 62, pending_packages: 12, success_rate: 83.8 }
    ];
  },

  async generateComprehensiveReport(startDate?: string, endDate?: string): Promise<any> {
    await simulateNetworkDelay();
    const stats = calculateStats();
    return {
      period: {
        start_date: startDate || '2024-01-01',
        end_date: endDate || new Date().toISOString().split('T')[0]
      },
      beneficiaries: {
        total: stats.totalBeneficiaries,
        verified: Math.floor(stats.totalBeneficiaries * 0.85),
        active: Math.floor(stats.totalBeneficiaries * 0.92)
      },
      packages: {
        total: stats.totalPackages,
        delivered: stats.deliveredPackages,
        pending: stats.totalPackages - stats.deliveredPackages
      },
      performance: {
        delivery_rate: stats.deliveryRate,
        average_delivery_time: 2.3
      },
      geographic_distribution: await this.getGeographicStats()
    };
  }
};

export const systemService = {
  async createAutomaticAlerts(): Promise<void> {
    await simulateNetworkDelay();
  },

  async generateReferralCode(userName: string): Promise<string> {
    await simulateNetworkDelay();
    const initials = userName.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${initials}${randomNum}`;
  },

  async validateReferralCode(code: string): Promise<{ valid: boolean; referrerUserId?: string }> {
    await simulateNetworkDelay();
    const referrer = mockSystemUsers.find(u => u.referralCode === code);
    return {
      valid: !!referrer,
      referrerUserId: referrer?.id
    };
  },

  async calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> {
    await simulateNetworkDelay();
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  async generateTrackingNumber(): Promise<string> {
    await simulateNetworkDelay();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TRK-${date}-${random}`;
  }
};

export const referralService = {
  async getAllReferralCodes(): Promise<SystemUser[]> {
    await simulateNetworkDelay();
    return mockSystemUsers.filter(u => u.referralCode);
  },

  async getReferralCodesByUser(userId: string): Promise<any[]> {
    await simulateNetworkDelay();
    return mockReferralCodes.filter(code => code.referrerUserId === userId);
  },

  async getActiveReferralCode(userId: string): Promise<any | null> {
    await simulateNetworkDelay();
    return mockReferralCodes.find(code => 
      code.referrerUserId === userId && code.status === 'active'
    ) || null;
  },

  async generateNewReferralCode(userId: string, customCode?: string): Promise<string> {
    await simulateNetworkDelay();
    const user = mockSystemUsers.find(u => u.id === userId);
    if (!user) throw new Error('المستخدم غير موجود');
    
    // Mark current active code as expired
    const currentActiveCode = mockReferralCodes.find(c => 
      c.referrerUserId === userId && c.status === 'active'
    );
    if (currentActiveCode) {
      currentActiveCode.status = 'expired';
    }
    
    // Generate new code
    const baseCode = await systemService.generateReferralCode(user.name);
    const uniqueSuffix = Math.random().toString(36).substr(2, 3).toUpperCase();
    const newCode = customCode || `${baseCode}-${uniqueSuffix}`;
    
    // Create new referral code record
    const newReferralCode = {
      id: `code-${Date.now()}`,
      code: newCode,
      referrerUserId: userId,
      status: 'active' as const,
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
    
    mockReferralCodes.push(newReferralCode);
    
    // Update user's current referral code
    user.referralCode = newCode;
    
    return newCode;
  },

  async validateAndUseReferralCode(code: string, beneficiaryId: string): Promise<{ valid: boolean; referrerUserId?: string; transaction?: any }> {
    await simulateNetworkDelay();
    
    // Find the referral code
    const referralCode = mockReferralCodes.find(c => c.code === code && c.status === 'active');
    
    if (!referralCode) {
      return { valid: false };
    }
    
    // Check if expired
    if (referralCode.expiresAt && new Date(referralCode.expiresAt) < new Date()) {
      referralCode.status = 'expired';
      return { valid: false };
    }
    
    // Mark code as used
    referralCode.status = 'used';
    referralCode.usedAt = new Date().toISOString();
    referralCode.beneficiaryId = beneficiaryId;
    
    // Create transaction
    const transaction = {
      id: `trans-${Date.now()}`,
      beneficiaryId,
      referrerUserId: referralCode.referrerUserId,
      referralCodeId: referralCode.id,
      referralCodeUsed: code,
      amount: 5,
      status: 'pending_payment' as const,
      createdAt: new Date().toISOString(),
      notes: 'إحالة جديدة - في انتظار الدفع'
    };
    
    mockReferralTransactions.push(transaction);
    
    // Update referrer's stats
    const referrer = mockSystemUsers.find(u => u.id === referralCode.referrerUserId);
    if (referrer) {
      referrer.totalReferrals = (referrer.totalReferrals || 0) + 1;
      // Note: totalEarnings will be updated when payment is processed
    }
    
    return { 
      valid: true, 
      referrerUserId: referralCode.referrerUserId,
      transaction 
    };
  },

  async getReferrerDailyEarnings(userId: string): Promise<any[]> {
    await simulateNetworkDelay();
    const transactions = mockReferralTransactions.filter(t => t.referrerUserId === userId);
    
    const dailyMap = new Map();
    transactions.forEach(transaction => {
      const date = transaction.createdAt.split('T')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          referralsCount: 0,
          earnings: 0,
          status: 'pending_payment',
          transactions: []
        });
      }
      
      const daily = dailyMap.get(date);
      daily.referralsCount += 1;
      daily.earnings += transaction.amount;
      daily.transactions.push(transaction);
      
      // Determine status
      const allPaid = daily.transactions.every((t: any) => t.status === 'paid_to_referrer');
      const allPending = daily.transactions.every((t: any) => t.status === 'pending_payment');
      
      if (allPaid) {
        daily.status = 'paid_to_referrer';
      } else if (allPending) {
        daily.status = 'pending_payment';
      } else {
        daily.status = 'mixed';
      }
    });
    
    return Array.from(dailyMap.values()).sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  async getAllTransactions(): Promise<any[]> {
    await simulateNetworkDelay();
    return [...mockReferralTransactions];
  },

  async createReferralCode(userId: string, customCode?: string): Promise<string> {
    await simulateNetworkDelay();
    const user = mockSystemUsers.find(u => u.id === userId);
    if (!user) throw new Error('المستخدم غير موجود');
    
    const code = customCode || await systemService.generateReferralCode(user.name);
    user.referralCode = code;
    user.totalReferrals = 0;
    user.totalReferralFees = 0;
    
    return code;
  },

  async processReferralPayment(transactionId: string, notes?: string): Promise<void> {
    await simulateNetworkDelay();
    const transaction = mockReferralTransactions.find(t => t.id === transactionId);
    if (transaction) {
      transaction.status = 'paid_to_referrer';
      transaction.paidAt = new Date().toISOString();
      transaction.notes = notes;
      
      // Update referrer's total earnings
      const referrer = mockSystemUsers.find(u => u.id === transaction.referrerUserId);
      if (referrer) {
        referrer.totalEarnings = (referrer.totalEarnings || 0) + transaction.amount;
      }
    }
  },

  async processReferrerDailyPayment(userId: string, date: string): Promise<void> {
    await simulateNetworkDelay();
    
    // Find all pending transactions for this user on this date
    const dateTransactions = mockReferralTransactions.filter(
      t => t.referrerUserId === userId && 
           t.createdAt.split('T')[0] === date && 
           t.status === 'pending_payment'
    );
    
    // Update all transactions to paid
    dateTransactions.forEach(transaction => {
      transaction.status = 'paid_to_referrer';
      transaction.paidAt = new Date().toISOString();
      transaction.notes = `تم الدفع - تحصيل يوم ${new Date(date).toLocaleDateString('ar-SA')}`;
    });
    
    // Update referrer's total earnings
    const referrer = mockSystemUsers.find(u => u.id === userId);
    if (referrer) {
      const additionalEarnings = dateTransactions.reduce((sum, t) => sum + t.amount, 0);
      referrer.totalReferralFees = (referrer.totalReferralFees || 0) + additionalEarnings;
    }
  },

  async getReferralStats(): Promise<any> {
    await simulateNetworkDelay();
    return {
      totalReferrals: mockReferralTransactions.length,
      totalEarnings: mockReferralTransactions.reduce((sum, t) => sum + t.amount, 0),
      pendingPayments: mockReferralTransactions.filter(t => t.status === 'pending_payment').length,
      paidTransactions: mockReferralTransactions.filter(t => t.status === 'paid_to_referrer').length
    };
  }
};

export const inventoryService = {
  async getByDistributionCenter(centerId: string): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  },

  async getLowStock(): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  }
};

export const categoriesService = {
  async getAllBeneficiaryCategories(): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  }
};

export const notificationsService = {
  async send(notification: any): Promise<any> {
    await simulateNetworkDelay();
    return { success: true };
  },

  async getByUser(userId: string): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  }
};

export const feedbackService = {
  async create(feedback: any): Promise<any> {
    await simulateNetworkDelay();
    return { success: true };
  },

  async getByCourier(courierId: string): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  }
};

export const geographicService = {
  async getAllAreas(): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  },

  async getByType(type: string): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  }
};

export const distributionCentersService = {
  async getAll(): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  },

  async getActive(): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  }
};

export const settingsService = {
  async getSetting(category: string, key: string): Promise<any> {
    await simulateNetworkDelay();
    return null;
  },

  async updateSetting(category: string, key: string, value: string): Promise<any> {
    await simulateNetworkDelay();
    return { success: true };
  },

  async getByCategory(category: string): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  }
};

// SMS Settings Service
export const smsSettingsService = {
  async getSettings(): Promise<any> {
    if (!supabase) {
      // Fallback to mock data when Supabase is not configured
      await simulateNetworkDelay();
      return {
        id: 'mock-sms-1',
        api_key: '',
        sender_name: 'منصة المساعدات',
        is_active: true,
        last_balance_check: null,
        last_balance_amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    const { data, error } = await supabase
      .from('sms_settings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`خطأ في جلب إعدادات SMS: ${error.message}`);
    }

    return data;
  },

  async saveSettings(apiKey: string, senderName: string, userId?: string): Promise<any> {
    if (!supabase) {
      // Fallback to mock data when Supabase is not configured
      await simulateNetworkDelay();
      return {
        id: 'mock-sms-1',
        api_key: apiKey,
        sender_name: senderName,
        is_active: true,
        last_balance_check: null,
        last_balance_amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    // إلغاء تفعيل الإعدادات السابقة
    await supabase
      .from('sms_settings')
      .update({ is_active: false })
      .eq('is_active', true);

    // إدراج إعدادات جديدة
    const { data, error } = await supabase
      .from('sms_settings')
      .insert({
        api_key: apiKey,
        sender_name: senderName
      })
      .select()
      .single();

    if (error) {
      throw new Error(`خطأ في حفظ إعدادات SMS: ${error.message}`);
    }

    return data;
  },

  async updateBalance(balance: number): Promise<void> {
    if (!supabase) {
      // Fallback to mock data when Supabase is not configured
      await simulateNetworkDelay();
      return {
        last_balance_amount: balance,
        last_balance_check: new Date().toISOString()
      };
    }

    const { data, error } = await supabase
      .from('sms_settings')
      .update({
        last_balance_amount: balance,
        last_balance_check: new Date().toISOString()
      })
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      throw new Error(`خطأ في تحديث الرصيد: ${error.message}`);
    }

    return data;
  }
};

// Message Templates Service
export const messageTemplatesService = {
  async getAll(): Promise<any[]> {
    if (!supabase) {
      // Fallback to mock data when Supabase is not configured
      await simulateNetworkDelay();
      return [
        {
          id: 'mock-template-1',
          name: 'رسالة ترحيب',
          content: 'مرحباً {name}، تم تسجيلك بنجاح في منصة المساعدات',
          category: 'welcome',
          variables: ['name'],
          is_active: true,
          usage_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }

    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`خطأ في جلب قوالب الرسائل: ${error.message}`);
    }

    return data || [];
  },

  async getByCategory(category: string): Promise<any[]> {
    if (!supabase) {
      // Fallback to mock data when Supabase is not configured
      await simulateNetworkDelay();
      return [];
    }

    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`خطأ في جلب قوالب الرسائل: ${error.message}`);
    }

    return data || [];
  },

  async create(template: {
    name: string;
    content: string;
    category: string;
    variables?: string[];
  }, userId?: string): Promise<any> {
    if (!supabase) {
      // Fallback to mock data when Supabase is not configured
      await simulateNetworkDelay();
      return {
        id: `mock-template-${Date.now()}`,
        name: template.name,
        content: template.content,
        category: template.category,
        variables: template.variables || [],
        is_active: true,
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    const { data, error } = await supabase
      .from('message_templates')
      .insert({
        name: template.name,
        content: template.content,
        category: template.category,
        variables: template.variables || []
      })
      .select()
      .single();

    if (error) {
      throw new Error(`خطأ في إنشاء قالب الرسالة: ${error.message}`);
    }

    return data;
  },

  async update(id: string, updates: {
    name?: string;
    content?: string;
    category?: string;
    variables?: string[];
  }, userId?: string): Promise<any> {
    if (!supabase) {
      // Fallback to mock data when Supabase is not configured
      await simulateNetworkDelay();
      return {
        id: id,
        ...updates,
        updated_at: new Date().toISOString()
      };
    }

    const { data, error } = await supabase
      .from('message_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`خطأ في تحديث قالب الرسالة: ${error.message}`);
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    if (!supabase) {
      // Fallback to mock data when Supabase is not configured
      await simulateNetworkDelay();
      return;
    }

    // حذف ناعم - تعطيل القالب بدلاً من حذفه
    const { error } = await supabase
      .from('message_templates')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw new Error(`خطأ في حذف قالب الرسالة: ${error.message}`);
    }
  },

  async incrementUsage(id: string): Promise<void> {
    if (!supabase) {
      // Fallback to mock data when Supabase is not configured
      await simulateNetworkDelay();
      return;
    }

    const { error } = await supabase.rpc('increment_template_usage', {
      template_id: id
    });

    if (error) {
      console.warn(`تحذير: فشل في تحديث عداد الاستخدام: ${error.message}`);
    }
  }
};

export const emergencyContactsService = {
  async getByBeneficiary(beneficiaryId: string): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  },

  async create(contact: any): Promise<any> {
    await simulateNetworkDelay();
    return { success: true };
  }
};

// export const reportsService = { // Removed as ComprehensiveReportsPage is removed
//   async generateReport(type: string, parameters: any = {}): Promise<any> {
//     await simulateNetworkDelay();
//     return await statisticsService.generateComprehensiveReport(
//       parameters.start_date,
//       parameters.end_date
//     );
//   }
// };