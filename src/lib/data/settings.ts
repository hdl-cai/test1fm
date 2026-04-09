import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { toDataLayerError } from './errors';

export type OrgSettings = Database['public']['Tables']['org_settings']['Row'];
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type NotificationPreference = {
  id: string;
  user_id: string;
  org_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  daily_report_reminder_times: string[];
  disabled_event_types: string[];
  updated_at: string;
};

export type VaccinationTemplate = Database['public']['Tables']['vaccination_schedule_templates']['Row'];
export type VaccinationTemplateItem = Database['public']['Tables']['vaccination_template_items']['Row'];
export type EpefIncentiveBracket = Database['public']['Tables']['epef_incentive_brackets']['Row'];

/**
 * Fetch organization details
 */
export async function fetchOrganization(orgId: string) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (error) throw error;
    return data as Organization;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch organization details.', 'settings.fetchOrganization');
  }
}

/**
 * Update organization details
 */
export async function updateOrganization(orgId: string, updates: Partial<Organization>) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', orgId)
      .select()
      .single();

    if (error) throw error;
    return data as Organization;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to update organization details.', 'settings.updateOrganization');
  }
}

/**
 * Update organization settings
 */
export async function updateOrgSettings(orgId: string, updates: Partial<OrgSettings>) {
  try {
    const { data, error } = await supabase
      .from('org_settings')
      .update(updates)
      .eq('org_id', orgId)
      .select()
      .single();

    if (error) throw error;
    return data as OrgSettings;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to update organization settings.', 'settings.updateOrgSettings');
  }
}

/**
 * Fetch notification preferences for current user
 */
export async function fetchNotificationPreferences(userId: string, orgId: string): Promise<NotificationPreference> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .maybeSingle();

    if (error) throw error;
    
    if (!data) {
      // Row doesn't exist, create default
      return await createDefaultNotificationPreferences(userId, orgId);
    }

    return data as unknown as NotificationPreference;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch notification preferences.', 'settings.fetchNotificationPreferences');
  }
}

/**
 * Create default notification preferences
 */
export async function createDefaultNotificationPreferences(userId: string, orgId: string): Promise<NotificationPreference> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: userId,
        org_id: orgId,
        email_enabled: true,
        push_enabled: false,
        daily_report_reminder_times: ['18:00', '21:00']
      })
      .select()
      .single();

    if (error) throw error;
    return data as unknown as NotificationPreference;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to create default notification preferences.', 'settings.createDefaultNotificationPreferences');
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(userId: string, updates: Partial<NotificationPreference>): Promise<NotificationPreference> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as NotificationPreference;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to update notification preferences.', 'settings.updateNotificationPreferences');
  }
}

/**
 * Fetch vaccination templates for organization
 */
export async function fetchVaccinationTemplates(orgId: string) {
  try {
    const { data, error } = await supabase
      .from('vaccination_schedule_templates')
      .select('*, items:vaccination_template_items(*)')
      .or(`org_id.eq.${orgId},is_system_default.eq.true`)
      .order('is_system_default', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch vaccination templates.', 'settings.fetchVaccinationTemplates');
  }
}

/**
 * Update a vaccination template
 */
export async function updateVaccinationTemplate(templateId: string, updates: Partial<VaccinationTemplate>) {
  try {
    const { data, error } = await supabase
      .from('vaccination_schedule_templates')
      .update(updates)
      .eq('id', templateId)
      .select()
      .single();

    if (error) throw error;
    return data as VaccinationTemplate;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to update vaccination template.', 'settings.updateVaccinationTemplate');
  }
}

/**
 * Create a new vaccination template
 */
export async function createVaccinationTemplate(orgId: string, name: string, description?: string) {
  try {
    const { data, error } = await supabase
      .from('vaccination_schedule_templates')
      .insert({
        org_id: orgId,
        name,
        description,
        is_system_default: false
      })
      .select()
      .single();

    if (error) throw error;
    return data as VaccinationTemplate;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to create vaccination template.', 'settings.createVaccinationTemplate');
  }
}

/**
 * Delete a vaccination template
 */
export async function deleteVaccinationTemplate(templateId: string) {
  try {
    const { error } = await supabase
      .from('vaccination_schedule_templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to delete vaccination template.', 'settings.deleteVaccinationTemplate');
  }
}

/**
 * Sync template items (delete and re-insert)
 */
export async function syncTemplateItems(templateId: string, items: any[]) {
  try {
    // Start with a delete (simplest way to handle re-ordering and deletions)
    const { error: deleteError } = await supabase
        .from('vaccination_template_items')
        .delete()
        .eq('template_id', templateId);
        
    if (deleteError) throw deleteError;

    if (items.length === 0) return [];

    // Re-insert new set of items
        const { data, error: insertError } = await supabase
        .from('vaccination_template_items')
        .insert(items.map(item => ({ 
          template_id: templateId,
          vaccine_name: item.vaccine_name,
          target_age_days: item.target_age_days || item.day_of_life,
          admin_method: item.admin_method || item.method,
          is_optional: item.is_optional !== undefined ? item.is_optional : !item.is_mandatory,
          notes: item.notes,
          sequence_order: item.sequence_order
        })))
        .select();

    if (insertError) throw insertError;
    return data as VaccinationTemplateItem[];
  } catch (error) {
    throw toDataLayerError(error, 'Failed to sync vaccination items.', 'settings.syncTemplateItems');
  }
}

/**
 * Reset organization template to BAI standard
 */
export async function resetToBaiStandard(orgId: string) {
    try {
        // 1. Fetch system default template
        const { data: systemTemplate, error: fetchError } = await supabase
            .from('vaccination_schedule_templates')
            .select('*, items:vaccination_template_items(*)')
            .eq('is_system_default', true)
            .maybeSingle();

        if (fetchError) throw fetchError;
        if (!systemTemplate) throw new Error('System default template not found.');

        // 2. Fetch or create organization template
        const { data: orgTemplate } = await supabase
            .from('vaccination_schedule_templates')
            .select('*')
            .eq('org_id', orgId)
            .eq('is_system_default', false)
            .maybeSingle();

        let templateToUpdate = orgTemplate;
        if (!templateToUpdate) {
            // Create org template if missing
            templateToUpdate = await createVaccinationTemplate(orgId, 'Standard Broiler Protocol', 'Cloned from BAI Standard');
        }

        if (!templateToUpdate) throw new Error('Could not resolve organization template.');

        // 3. Sync items from system default to org template
        const newItems = (systemTemplate.items as any[]).map(item => ({
            target_age_days: item.target_age_days,
            vaccine_name: item.vaccine_name,
            admin_method: item.admin_method,
            is_optional: item.is_optional,
            notes: item.notes,
            sequence_order: item.sequence_order
        }));

        await syncTemplateItems(templateToUpdate.id, newItems);

        return templateToUpdate;
    } catch (error) {
        throw toDataLayerError(error, 'Failed to reset to BAI standard.', 'settings.resetToBaiStandard');
    }
}

/**
 * Fetch EPEF incentive brackets
 */
export async function fetchEpefBrackets(orgId: string) {
  try {
    const { data, error } = await supabase
      .from('epef_incentive_brackets')
      .select('*')
      .eq('org_id', orgId)
      .order('min_epef', { ascending: true });

    if (error) throw error;
    return data as EpefIncentiveBracket[];
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch EPEF brackets.', 'settings.fetchEpefBrackets');
  }
}

/**
 * Update EPEF incentive brackets
 */
export async function updateEpefBrackets(orgId: string, brackets: any[]) {
  try {
    // For simplicity, delete and re-insert in v2, or update individual rows
    // Here we'll upsert based on ID if provided, otherwise assume new
    const { data, error } = await supabase
      .from('epef_incentive_brackets')
      .upsert(brackets.map(b => ({ ...b, org_id: orgId })))
      .select();

    if (error) throw error;
    return data as EpefIncentiveBracket[];
  } catch (error) {
    throw toDataLayerError(error, 'Failed to update EPEF brackets.', 'settings.updateEpefBrackets');
  }
}

/**
 * Delete an EPEF bracket
 */
export async function deleteEpefBracket(bracketId: string) {
  try {
    const { error } = await supabase
      .from('epef_incentive_brackets')
      .delete()
      .eq('id', bracketId);

    if (error) throw error;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to delete EPEF bracket.', 'settings.deleteEpefBracket');
  }
}
