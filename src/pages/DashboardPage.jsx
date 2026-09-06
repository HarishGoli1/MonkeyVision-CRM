import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/common/PageHeader';
import PlaceholderCard from '../components/common/PlaceholderCard';
import { leadsService } from '../services/leadsService';
import { onboardingService } from '../services/onboardingService';
import { projectsService } from '../services/projectsService';
import { tasksService } from '../services/tasksService';
import {
  Users,
  UserCheck,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Clock,
  AlertCircle,
  RefreshCw,
  Calendar,
} from 'lucide-react';

function MetricValue({ loading, error, value, label = 'records', barColor }) {
  if (loading) {
    return (
      <div className="mt-1">
        <div className="h-8 w-16 rounded bg-slate-200 animate-pulse" />
        <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full w-0 rounded-full" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center gap-1.5 mt-1">
        <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
        <span className="text-xs text-rose-500 truncate">Failed to load</span>
      </div>
    );
  }
  return (
    <>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-800">{value ?? 0}</span>
        <span className="text-xs text-slate-400">{value === 0 ? 'no records' : label}</span>
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: value > 0 ? '70%' : '0%' }}
        />
      </div>
    </>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState({
    leads: [],
    onboarding: [],
    projects: [],
    tasks: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [leads, onboarding, projects, tasks] = await Promise.all([
        leadsService.getLeads().catch((e) => { console.error(e); return []; }),
        onboardingService.getOnboarding().catch((e) => { console.error(e); return []; }),
        projectsService.getProjects().catch((e) => { console.error(e); return []; }),
        tasksService.getProjectTasks().catch((e) => { console.error(e); return []; }),
      ]);

      setData({
        leads: leads || [],
        onboarding: onboarding || [],
        projects: projects || [],
        tasks: tasks || [],
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard records from Supabase');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Derived counts
  const totalLeads = data.leads.length;
  const onboardingCount = data.onboarding.length;
  const activeProjects = data.projects.length;
  const totalTasks = data.tasks.length;

  // Task status counts based ONLY on existing database values
  const pendingTasks = data.tasks.filter((t) => t.status?.toLowerCase().trim() === 'pending').length;
  const inProgressTasks = data.tasks.filter((t) => t.status?.toLowerCase().trim() === 'in progress').length;
  const completedTasks = data.tasks.filter((t) => t.status?.toLowerCase().trim() === 'completed').length;

  // Recent records derived directly from existing live data (leads with created_date)
  const recentLeads = [...data.leads].slice(0, 4);

  const formatShortDate = (dateStr) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? String(dateStr).split('T')[0]
        : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return String(dateStr);
    }
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="High-level operational overview and performance indicators for MonkeyVision CRM."
      >
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          title="Refresh Dashboard data"
          aria-label="Refresh Dashboard data"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 shadow-xs transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </PageHeader>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-center shadow-xs">
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-500" />
            <span className="text-xs font-medium text-rose-700">{error}</span>
            <button
              onClick={fetchDashboardData}
              className="ml-3 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PlaceholderCard
          title="Total Leads"
          subtitle="Pipeline summary metric"
          icon={Users}
          badgeText="Metric"
        >
          <MetricValue
            loading={loading}
            error={error}
            value={totalLeads}
            label="leads"
            barColor="bg-indigo-300"
          />
        </PlaceholderCard>

        <PlaceholderCard
          title="Onboarding Records"
          subtitle="Client onboarding status"
          icon={UserCheck}
          badgeText="Metric"
        >
          <MetricValue
            loading={loading}
            error={error}
            value={onboardingCount}
            label="records"
            barColor="bg-blue-300"
          />
        </PlaceholderCard>

        <PlaceholderCard
          title="Active Projects"
          subtitle="Active operational jobs"
          icon={FolderKanban}
          badgeText="Metric"
        >
          <MetricValue
            loading={loading}
            error={error}
            value={activeProjects}
            label="projects"
            barColor="bg-emerald-300"
          />
        </PlaceholderCard>

        <PlaceholderCard
          title="Total Tasks"
          subtitle="Scheduled work items"
          icon={CheckSquare}
          badgeText="Metric"
        >
          <MetricValue
            loading={loading}
            error={error}
            value={totalTasks}
            label="tasks"
            barColor="bg-amber-300"
          />
        </PlaceholderCard>
      </div>

      {/* Main Operational Overview Sections */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Operational Pipeline Overview */}
        <div className="lg:col-span-2">
          <PlaceholderCard
            title="Operational Pipeline Overview"
            subtitle="Live summary across workflow stages"
            icon={BarChart3}
            heightClass="min-h-[320px]"
          >
            {loading ? (
              <div className="flex h-56 flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50/50 p-6 text-center">
                <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
                <p className="mt-2 text-xs text-slate-500">Loading pipeline overview...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 4 Core Stages Bar */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
                  <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                    <p className="text-[11px] font-medium text-slate-500">Phase 1: Leads</p>
                    <p className="text-xl font-bold text-slate-800 mt-1">{totalLeads}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Total Inbound</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                    <p className="text-[11px] font-medium text-slate-500">Phase 2: Onboarding</p>
                    <p className="text-xl font-bold text-slate-800 mt-1">{onboardingCount}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Active Queue</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                    <p className="text-[11px] font-medium text-slate-500">Phase 3: Projects</p>
                    <p className="text-xl font-bold text-slate-800 mt-1">{activeProjects}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Under Production</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                    <p className="text-[11px] font-medium text-slate-500">Phase 3: Tasks</p>
                    <p className="text-xl font-bold text-slate-800 mt-1">{totalTasks}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tracked Deliverables</p>
                  </div>
                </div>

                {/* Task Status Breakdown Section */}
                <div className="rounded-lg border border-slate-100 bg-white p-4">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
                    Project Tasks Status Distribution
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-md bg-amber-50/60 border border-amber-100 p-2.5">
                      <p className="text-xs font-medium text-amber-700">Pending</p>
                      <p className="text-lg font-bold text-amber-800 mt-0.5">{pendingTasks}</p>
                    </div>
                    <div className="rounded-md bg-blue-50/60 border border-blue-100 p-2.5">
                      <p className="text-xs font-medium text-blue-700">In Progress</p>
                      <p className="text-lg font-bold text-blue-800 mt-0.5">{inProgressTasks}</p>
                    </div>
                    <div className="rounded-md bg-emerald-50/60 border border-emerald-100 p-2.5">
                      <p className="text-xs font-medium text-emerald-700">Completed</p>
                      <p className="text-lg font-bold text-emerald-800 mt-0.5">{completedTasks}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </PlaceholderCard>
        </div>

        {/* Live Recent Records */}
        <div>
          <PlaceholderCard
            title="Recent Inbound Leads"
            subtitle="Latest received customer records"
            icon={Clock}
            heightClass="min-h-[320px]"
          >
            {loading ? (
              <div className="flex h-56 flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50/50 p-6 text-center">
                <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
                <p className="mt-2 text-xs text-slate-500">Loading recent records...</p>
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                <Clock className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No Recent Records</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  Inbound leads will populate here as records are received.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentLeads.map((item, idx) => (
                  <div key={item.lead_id || idx} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {item.name || 'Unnamed Lead'}
                        </p>
                        {item.company && (
                          <p className="text-[11px] text-slate-500 truncate">{item.company}</p>
                        )}
                      </div>
                      {item.status && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 whitespace-nowrap border border-slate-200">
                          {item.status}
                        </span>
                      )}
                    </div>
                    {item.created_date && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <Calendar className="h-3 w-3" />
                        <span>{formatShortDate(item.created_date)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </PlaceholderCard>
        </div>
      </div>
    </div>
  );
}
