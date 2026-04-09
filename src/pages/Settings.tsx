import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { DesktopOnlyGuard } from '@/components/shared/DesktopOnlyGuard';
import { PageTitle } from '@/components/ui/page-title';
import { Icon } from '@/hooks/useIcon';
import { Loader2 } from 'lucide-react';

import { AppearanceSection } from '@/components/settings/AppearanceSection';

import { HealthSection } from '@/components/settings/HealthSection';

// Subcomponents
import { ProfileSection } from '@/components/settings/ProfileSection';
import { AccountSection } from '@/components/settings/AccountSection';
import { GeneralOrgSection } from '@/components/settings/GeneralOrgSection';
import { NotificationPrefsSection } from '@/components/settings/NotificationPrefsSection';
import { OrgNotificationsSection } from '@/components/settings/OrgNotificationsSection';
import { PerformanceSection } from '@/components/settings/PerformanceSection';
import { MarketPricesSection } from '@/components/settings/MarketPricesSection';
import { SensorsSection } from '@/components/settings/SensorsSection';


// For V2: Using a central settings page with sidebar navigation
export default function Settings() {
  const { user } = useAuthStore();
  const { 
    fetchOrgSettings, 
    isLoading, 
    organization,
  } = useSettingsStore();

  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    if (user?.orgId && user?.id) {
      fetchOrgSettings(user.orgId, user.id);
    }
  }, [user, fetchOrgSettings]);

  // roles in UserRole: 'admin' | 'owner' | 'grower' | 'technician' | 'personnel' | 'farm_admin' | 'vet'
  const isAdmin = user?.role === 'admin' || user?.role === 'owner' || user?.role === 'farm_admin';

  const sections = [
    { id: 'profile', label: 'Profile', icon: 'UserIcon', group: 'personal' },
    { id: 'account', label: 'Account', icon: 'LockIcon', group: 'personal' },
    { id: 'appearance', label: 'Appearance', icon: 'SunIcon', group: 'personal' },
    { id: 'notifications', label: 'Notifications', icon: 'Notification01Icon', group: 'personal' },
    { id: 'general-org', label: 'General Info', icon: 'FactoryIcon', group: 'organization', adminOnly: true },
    { id: 'org-notifications', label: 'Notifications', icon: 'Notification01Icon', group: 'organization', adminOnly: true },
    { id: 'performance', label: 'Performance', icon: 'AnalyticsIcon', group: 'organization', adminOnly: true },
    { id: 'health', label: 'Health Protocol', icon: 'MedicalFileIcon', group: 'organization', adminOnly: true },
    { id: 'market', label: 'Market Prices', icon: 'MoneyIcon', group: 'organization', adminOnly: true },
    { id: 'sensors', label: 'Sensors', icon: 'SensorIcon', group: 'organization', adminOnly: true },
    { id: 'billing', label: 'Plans & Billing', icon: 'MoneyIcon', group: 'organization', adminOnly: true },
  ];

  if (isLoading && !organization) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'account':
        return <AccountSection />;
      case 'appearance':
        return <AppearanceSection />;
      case 'notifications':
        return <NotificationPrefsSection />;
      case 'general-org':
        return <GeneralOrgSection />;
      case 'org-notifications':
        return <OrgNotificationsSection />;
      case 'performance':
        return <PerformanceSection />;
      case 'health':
        return <HealthSection />;
      case 'market':
        return <MarketPricesSection />;
      case 'sensors':
        return <SensorsSection />;
      case 'billing':
        return <div className="space-y-6">
          <h2 className="text-2xl font-bold">Plans & Billing</h2>
          <p className="text-muted-foreground italic">FlockMate v2 Individual — (Stubbed)</p>
          <div className="p-12 bg-muted/30 border border-border rounded-3xl flex flex-col items-center justify-center text-center">
            <Icon name="FactoryIcon" size={48} className="text-primary mb-4" />
            <h3 className="text-lg font-bold mb-2">Manage Subscription</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Subscription management is currently disabled in the v2 preview. Please contact us to upgrade or change your plan.
            </p>
            <a href="mailto:support@flockmate.tech" className="mt-6 text-primary font-bold hover:underline">
              Contact Sales
            </a>
          </div>
        </div>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <PageTitle>Settings</PageTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your personal profile and organization-wide preferences.
        </p>
      </div>
      
      <DesktopOnlyGuard message="The full Settings panel works best on a desktop browser.">
      <SettingsLayout
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        sections={sections}
        isAdmin={isAdmin}
      >
        {renderSection()}
      </SettingsLayout>
      </DesktopOnlyGuard>
    </div>
  );
}
