import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/common/PageHeader';
import { projectsService } from '../services/projectsService';
import {
  FolderKanban,
  AlertCircle,
  RefreshCw,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  Building2,
  User,
  FileText,
  Paperclip,
} from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsService.getProjects();
      setProjects(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch projects from Supabase');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage client project deliverables, production scopes, and operational milestones."
      >
        <button
          disabled
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-xs cursor-not-allowed"
        >
          <span>Project Actions</span>
        </button>
      </PageHeader>

      {/* Header Controls Bar */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Project Records
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {projects.length} total
          </span>
        </div>
        <button
          onClick={fetchProjects}
          disabled={loading}
          title="Refresh projects"
          aria-label="Refresh projects"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Projects View */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between min-h-[260px] animate-pulse"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="h-5 w-32 rounded bg-slate-200" />
                  <div className="h-5 w-16 rounded bg-slate-100" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-slate-100" />
                  <div className="h-3 w-1/2 rounded bg-slate-50" />
                  <div className="h-3 w-2/3 rounded bg-slate-50" />
                </div>
              </div>
              <div className="h-10 w-full rounded bg-slate-50 mt-4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
            <AlertCircle className="h-8 w-8 text-rose-500" />
            <h3 className="mt-2 text-sm font-semibold text-slate-800">Unable to load projects</h3>
            <p className="mt-1 text-xs text-slate-500">{error}</p>
            <button
              onClick={fetchProjects}
              className="mt-4 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FolderKanban className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-800">No Projects Found</h3>
            <p className="mt-1 text-xs text-slate-400">
              No project records found in the Supabase projects table.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, idx) => (
            <div
              key={project.project_name || idx}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                {/* Header: Project Name & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-slate-900 leading-snug truncate" title={project.project_name || ''}>
                      {project.project_name || 'Untitled Project'}
                    </h3>
                    {project.business_name && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate font-medium">{project.business_name}</span>
                      </div>
                    )}
                    {project.client_name && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{project.client_name}</span>
                      </div>
                    )}
                  </div>
                  {project.status && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 border border-slate-200 whitespace-nowrap">
                      {project.status}
                    </span>
                  )}
                </div>

                {/* Service and Deadline */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  {project.service_required && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-medium text-slate-700 truncate">{project.service_required}</span>
                    </div>
                  )}
                  {project.deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-mono text-slate-500">{project.deadline}</span>
                    </div>
                  )}
                  {project.client_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <a href={`mailto:${project.client_email}`} className="text-indigo-600 hover:underline truncate">
                        {project.client_email}
                      </a>
                    </div>
                  )}
                  {project.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <a href={`tel:${project.phone_number}`} className="hover:text-indigo-600 hover:underline">
                        {project.phone_number}
                      </a>
                    </div>
                  )}
                </div>

                {/* Project Description */}
                {project.project_description && (
                  <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
                    <p className="line-clamp-3" title={project.project_description}>
                      {project.project_description}
                    </p>
                  </div>
                )}

                {/* Special Instructions & Required Assets */}
                {(project.special_instructions || project.required_assets) && (
                  <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
                    {project.special_instructions && (
                      <div className="flex items-start gap-1.5" title={project.special_instructions}>
                        <FileText className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <p className="truncate">
                          <span className="font-medium text-slate-600">Instructions:</span> {project.special_instructions}
                        </p>
                      </div>
                    )}
                    {project.required_assets && (
                      <div className="flex items-start gap-1.5" title={project.required_assets}>
                        <Paperclip className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <p className="truncate">
                          <span className="font-medium text-slate-600">Assets:</span> {project.required_assets}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
