import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/common/PageHeader';
import { onboardingService } from '../services/onboardingService';
import { UserCheck, AlertCircle, RefreshCw } from 'lucide-react';

export default function OnboardingPage() {
  const [onboardingList, setOnboardingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const stages = [
    { title: 'Intake & Agreements', desc: 'Initial paperwork & scopes' },
    { title: 'Workspace Configuration', desc: 'Account & tool setup' },
    { title: 'Review & Training', desc: 'Client walkthroughs' },
    { title: 'Live Handover', desc: 'Final launch & signoff' }
  ];

  const fetchOnboarding = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await onboardingService.getOnboarding();
      setOnboardingList(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch onboarding records from Supabase');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOnboarding();
  }, [fetchOnboarding]);

  return (
    <div>
      <PageHeader
        title="Onboarding"
        description="Track client setup workflows, milestone sign-offs, and activation procedures."
      >
        <button
          disabled
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-xs cursor-not-allowed"
        >
          <span>Onboarding Actions</span>
        </button>
      </PageHeader>

      {/* Process Milestones Tracker */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
          Onboarding Process Milestones
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {stages.map((stage, idx) => (
            <div
              key={stage.title}
              className="relative rounded-lg border border-slate-200 bg-slate-50/75 p-4"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {idx + 1}
                </span>
                <span className="text-sm font-semibold text-slate-800">{stage.title}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{stage.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Onboarding List / Queue */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-800">Active Onboarding Queue</h3>
            <p className="text-xs text-slate-400 mt-0.5">Live client onboarding records from Supabase</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {onboardingList.length} records
            </span>
            <button
              onClick={fetchOnboarding}
              disabled={loading}
              title="Refresh onboarding records"
              aria-label="Refresh onboarding records"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              <RefreshCw className={`h-3 w-3 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
            <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
            <p className="mt-3 text-sm font-medium text-slate-600">Loading onboarding records from Supabase...</p>
          </div>
        ) : error ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-8 w-8 text-rose-500" />
            <h4 className="mt-2 text-sm font-semibold text-slate-800">Unable to load onboarding records</h4>
            <p className="mt-1 text-xs text-slate-500">{error}</p>
            <button
              onClick={fetchOnboarding}
              className="mt-4 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
            >
              Try Again
            </button>
          </div>
        ) : onboardingList.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 my-6 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <UserCheck className="h-6 w-6" />
            </div>
            <h4 className="mt-3 text-sm font-semibold text-slate-800">No Onboarding Records Found</h4>
            <p className="mt-1 text-xs text-slate-400 max-w-sm">
              No client onboarding submissions found in the Supabase onboarding table.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Client Name</th>
                  <th className="px-4 py-3 whitespace-nowrap">Business Name</th>
                  <th className="px-4 py-3 whitespace-nowrap">Email</th>
                  <th className="px-4 py-3 whitespace-nowrap">Phone</th>
                  <th className="px-4 py-3 whitespace-nowrap">Service Required</th>
                  <th className="px-4 py-3 whitespace-nowrap">Deadline</th>
                  <th className="px-4 py-3">Project Description</th>
                  <th className="px-4 py-3">Special Instructions</th>
                  <th className="px-4 py-3">Required Assets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {onboardingList.map((item, idx) => (
                  <tr key={item.client_email || idx} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-900">
                      {item.client_name || '--'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-700">
                      {item.business_name || '--'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                      {item.client_email ? (
                        <a href={`mailto:${item.client_email}`} className="text-indigo-600 hover:underline">
                          {item.client_email}
                        </a>
                      ) : (
                        '--'
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                      {item.phone_number ? (
                        <a href={`tel:${item.phone_number}`} className="hover:text-indigo-600 hover:underline">
                          {item.phone_number}
                        </a>
                      ) : (
                        '--'
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-700">
                      {item.service_required || '--'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500 font-mono">
                      {item.deadline || '--'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 max-w-xs truncate" title={item.project_description || ''}>
                      {item.project_description || '--'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 max-w-xs truncate" title={item.special_instructions || ''}>
                      {item.special_instructions || '--'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 max-w-xs truncate" title={item.required_assets || ''}>
                      {item.required_assets || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
