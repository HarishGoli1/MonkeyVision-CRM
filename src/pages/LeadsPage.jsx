import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { leadsService } from '../services/leadsService';
import { Users, Search, AlertCircle, RefreshCw } from 'lucide-react';

const APPROVED_COLUMNS = [
  'Lead ID',
  'Name',
  'Email',
  'Phone',
  'Company',
  'Service',
  'Category',
  'Customer Message',
  'Source',
  'Status',
  'Created Date'
];

export default function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leadsService.getLeads();
      setLeads(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch leads from Supabase');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime())
        ? String(dateString)
        : d.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
    } catch {
      return String(dateString);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (lead.name && lead.name.toLowerCase().includes(q)) ||
      (lead.company && lead.company.toLowerCase().includes(q)) ||
      (lead.email && lead.email.toLowerCase().includes(q)) ||
      (lead.service && lead.service.toLowerCase().includes(q)) ||
      (lead.lead_id && String(lead.lead_id).toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Inbound inquiries and lead capture records. Click any lead to view full details."
      >
        <button
          disabled
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-xs cursor-not-allowed"
        >
          <span>Lead Actions</span>
        </button>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-2">
            Lead Records
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {leads.length} total
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads..."
              className="rounded-lg border border-slate-200 bg-slate-50 py-1 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={fetchLeads}
            disabled={loading}
            title="Refresh leads"
            aria-label="Refresh leads"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                {APPROVED_COLUMNS.map((col) => (
                  <th key={col} className="px-5 py-3.5 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={APPROVED_COLUMNS.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
                      <p className="mt-3 text-sm font-medium text-slate-600">Loading leads from Supabase...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={APPROVED_COLUMNS.length} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-rose-500" />
                      <h3 className="mt-2 text-sm font-semibold text-slate-800">Unable to load leads</h3>
                      <p className="mt-1 text-xs text-slate-500">{error}</p>
                      <button
                        onClick={fetchLeads}
                        className="mt-4 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={APPROVED_COLUMNS.length} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Users className="h-6 w-6" />
                      </div>
                      <h3 className="mt-3 text-sm font-semibold text-slate-800">No Leads Found</h3>
                      <p className="mt-1 text-xs text-slate-400">
                        {searchQuery
                          ? 'No lead records match your search criteria.'
                          : 'No lead records found in the Supabase leads table.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.lead_id || lead.id}
                    onClick={() => lead.lead_id && navigate(`/leads/${encodeURIComponent(lead.lead_id)}`)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition group"
                    title="Click to view lead details"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs font-medium text-indigo-600 group-hover:underline">
                      {lead.lead_id || '--'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-900 group-hover:text-indigo-900">
                      {lead.name || '--'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600">
                      {lead.email ? (
                        <a
                          href={`mailto:${lead.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-indigo-600 hover:underline"
                        >
                          {lead.email}
                        </a>
                      ) : (
                        '--'
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600">
                      {lead.phone ? (
                        <a
                          href={`tel:${lead.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-indigo-600 hover:underline"
                        >
                          {lead.phone}
                        </a>
                      ) : (
                        '--'
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-700">
                      {lead.company || '--'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-700">
                      {lead.service || '--'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600">
                      {lead.category ? (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          {lead.category.trim()}
                        </span>
                      ) : (
                        '--'
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 max-w-xs truncate" title={lead.customer_message || ''}>
                      {lead.customer_message || '--'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">
                      {lead.source || '--'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                      {lead.status ? (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 border border-slate-200">
                          {lead.status}
                        </span>
                      ) : (
                        '--'
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500 font-mono">
                      {formatDate(lead.created_date)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
