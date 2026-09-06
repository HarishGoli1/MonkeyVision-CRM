import { supabase } from '../lib/supabase';

export const onboardingService = {
  /**
   * Fetch all onboarding records using read-only select
   */
  async getOnboarding() {
    const { data, error } = await supabase
      .from('onboarding')
      .select('*');

    if (error) {
      throw error;
    }
    return data || [];
  },

  /**
   * Fetch single onboarding record by client email or business name
   */
  async getOnboardingByClientEmail(email) {
    const { data, error } = await supabase
      .from('onboarding')
      .select('*')
      .eq('client_email', email)
      .maybeSingle();

    if (error) {
      throw error;
    }
    return data;
  },
};
