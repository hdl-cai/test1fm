import { create } from 'zustand';
import {
  fetchOrganization as fetchOrgData,
  updateOrganization as updateOrgData,
  updateOrgSettings as updateOrgSettingsData,
  fetchNotificationPreferences as fetchNotificationPrefsData,
  updateNotificationPreferences as updateNotificationPrefsData,
  fetchEpefBrackets as fetchEpefBracketsData,
  updateEpefBrackets as updateEpefBracketsData,
  deleteEpefBracket as deleteEpefBracketData,
  fetchVaccinationTemplates as fetchVaccinationTemplatesData,
  updateVaccinationTemplate as updateVaccinationTemplateData,
  createVaccinationTemplate as createVaccinationTemplateData,
  deleteVaccinationTemplate as deleteVaccinationTemplateData,
  syncTemplateItems as syncTemplateItemsData,
  resetToBaiStandard as resetToBaiStandardData,
  type Organization,
  type OrgSettings,
  type NotificationPreference,
  type EpefIncentiveBracket,
  type VaccinationTemplate
} from '@/lib/data/settings';
import { getErrorMessage } from '@/lib/data/errors';

export interface SettingsState {
  // Data
  organization: Organization | null;
  orgSettings: OrgSettings | null;
  notificationPreferences: NotificationPreference | null;
  epefBrackets: EpefIncentiveBracket[];
  
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchOrgSettings: (orgId: string, userId: string) => Promise<void>;
  updateOrganization: (orgId: string, updates: Partial<Organization>) => Promise<void>;
  updateOrgSettings: (orgId: string, updates: Partial<OrgSettings>) => Promise<void>;
  updateNotificationPreferences: (userId: string, updates: Partial<NotificationPreference>) => Promise<void>;
  
  // EPEF Brackets actions
  fetchEpefBrackets: (orgId: string) => Promise<void>;
  updateEpefBrackets: (orgId: string, brackets: Partial<EpefIncentiveBracket>[]) => Promise<void>;
  deleteEpefBracket: (bracketId: string) => Promise<void>;
  
  // Vaccination Protocol actions
  vaccinationTemplates: any[]; // Using any[] for now as it includes joined items
  fetchVaccinationTemplates: (orgId: string) => Promise<void>;
  updateVaccinationTemplate: (templateId: string, updates: Partial<VaccinationTemplate>) => Promise<void>;
  createVaccinationTemplate: (orgId: string, name: string, description?: string) => Promise<void>;
  deleteVaccinationTemplate: (templateId: string) => Promise<void>;
  syncTemplateItems: (templateId: string, items: any[]) => Promise<void>;
  resetToBaiStandard: (orgId: string) => Promise<void>;
  
  clearError: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  // Initial state
  organization: null,
  orgSettings: null,
  notificationPreferences: null,
  epefBrackets: [],
  vaccinationTemplates: [],
  isLoading: false,
  error: null,
  
  // Actions
  fetchOrgSettings: async (orgId, userId) => {
    set({ isLoading: true, error: null });
    try {
      const [org, settings, prefs] = await Promise.all([
        fetchOrgData(orgId),
        // Org settings are usually already loaded in Profile store - potentially optimize
        // but fetching again ensures fresh data
        supabase_direct_fetch_settings(orgId), 
        fetchNotificationPrefsData(userId, orgId)
      ]);
      set({ 
        organization: org, 
        orgSettings: settings, 
        notificationPreferences: prefs,
        isLoading: false 
      });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to fetch settings.'), isLoading: false });
    }
  },

  updateOrganization: async (orgId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const org = await updateOrgData(orgId, updates);
      set({ organization: org, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to update organization.'), isLoading: false });
      throw err;
    }
  },

  updateOrgSettings: async (orgId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const settings = await updateOrgSettingsData(orgId, updates);
      set({ orgSettings: settings, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to update settings.'), isLoading: false });
      throw err;
    }
  },

  updateNotificationPreferences: async (userId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const prefs = await updateNotificationPrefsData(userId, updates);
      set({ notificationPreferences: prefs, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to update notification preferences.'), isLoading: false });
      throw err;
    }
  },

  fetchEpefBrackets: async (orgId) => {
    set({ isLoading: true, error: null });
    try {
      const brackets = await fetchEpefBracketsData(orgId);
      set({ epefBrackets: brackets, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to fetch incentive brackets.'), isLoading: false });
    }
  },

  updateEpefBrackets: async (orgId, brackets) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateEpefBracketsData(orgId, brackets);
      set({ epefBrackets: updated, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to update incentive brackets.'), isLoading: false });
      throw err;
    }
  },

  deleteEpefBracket: async (bracketId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteEpefBracketData(bracketId);
      set((state) => ({
        epefBrackets: state.epefBrackets.filter(b => b.id !== bracketId),
        isLoading: false
      }));
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to delete incentive bracket.'), isLoading: false });
      throw err;
    }
  },

  fetchVaccinationTemplates: async (orgId) => {
    set({ isLoading: true, error: null });
    try {
      const templates = await fetchVaccinationTemplatesData(orgId);
      set({ vaccinationTemplates: templates, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to fetch vaccination protocols.'), isLoading: false });
    }
  },

  updateVaccinationTemplate: async (templateId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateVaccinationTemplateData(templateId, updates);
      set((state) => ({
        vaccinationTemplates: state.vaccinationTemplates.map(t => t.id === templateId ? { ...t, ...updated } : t),
        isLoading: false
      }));
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to update vaccination protocol.'), isLoading: false });
      throw err;
    }
  },

  createVaccinationTemplate: async (orgId, name, description) => {
    set({ isLoading: true, error: null });
    try {
      const created = await createVaccinationTemplateData(orgId, name, description);
      set((state) => ({
        vaccinationTemplates: [created, ...state.vaccinationTemplates],
        isLoading: false
      }));
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to create vaccination protocol.'), isLoading: false });
      throw err;
    }
  },

  deleteVaccinationTemplate: async (templateId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteVaccinationTemplateData(templateId);
      set((state) => ({
        vaccinationTemplates: state.vaccinationTemplates.filter(t => t.id !== templateId),
        isLoading: false
      }));
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to delete vaccination protocol.'), isLoading: false });
      throw err;
    }
  },

  syncTemplateItems: async (templateId, items) => {
    set({ isLoading: true, error: null });
    try {
      const updatedItems = await syncTemplateItemsData(templateId, items);
      set((state) => ({
        vaccinationTemplates: state.vaccinationTemplates.map(t => 
            t.id === templateId ? { ...t, items: updatedItems } : t
        ),
        isLoading: false
      }));
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to sync vaccination protocol items.'), isLoading: false });
      throw err;
    }
  },

  resetToBaiStandard: async (orgId) => {
    set({ isLoading: true, error: null });
    try {
      await resetToBaiStandardData(orgId);
      const templates = await fetchVaccinationTemplatesData(orgId);
      set({ vaccinationTemplates: templates, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to reset to BAI standard.'), isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null })
}));

// Helper since profile.ts loadProfileContext already does some of this
async function supabase_direct_fetch_settings(orgId: string) {
    const { supabase } = await import('@/lib/supabase');
    const { data, error } = await supabase
      .from('org_settings')
      .select('*')
      .eq('org_id', orgId)
      .single();
    if (error) throw error;
    return data as OrgSettings;
}
