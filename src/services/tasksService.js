import { supabase } from '../lib/supabase';

export const tasksService = {
  /**
   * Fetch all project tasks using read-only select
   * @param {string} [projectName] - Optional project name filter
   */
  async getProjectTasks(projectName = null) {
    let query = supabase
      .from('project_tasks')
      .select('*');

    if (projectName) {
      query = query.eq('project_name', projectName);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }
    return data || [];
  },
};
