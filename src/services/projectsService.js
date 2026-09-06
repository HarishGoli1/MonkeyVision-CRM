import { supabase } from '../lib/supabase';

export const projectsService = {
  /**
   * Fetch all projects using read-only select
   */
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*');

    if (error) {
      throw error;
    }
    return data || [];
  },

  /**
   * Fetch single project by project name or identifier
   */
  async getProjectByName(projectName) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('project_name', projectName)
      .maybeSingle();

    if (error) {
      throw error;
    }
    return data;
  },
};
