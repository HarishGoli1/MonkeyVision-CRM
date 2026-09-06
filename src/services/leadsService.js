import { supabase } from '../lib/supabase';

export const leadsService = {
  /**
   * Fetch all leads using read-only select
   */
  async getLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_date', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  },

  /**
   * Fetch single lead by ID
   */
  async getLeadById(leadId) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('lead_id', leadId)
      .single();

    if (error) {
      throw error;
    }
    return data;
  },
};
