import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { leadsService } from '../services/leadsService';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  Tag,
  Briefcase,
  MessageSquare,
  Globe,
  AlertCircle,
  RefreshCw,
  User,
} from 'lucide-react';

export default function LeadDetailsPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const fetchLead = useCallback(async () => {
    if (!leadId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const data = await leadsService.getLeadById(leadId);
      if (!data) {
        setNotFound(true);
      } else {
        setLead(data);
      }
    } catch (err) {
      // Supabase PGRST116 means no rows returned by .single()
      if (err.code === 'PGRST116') {
        setNotFound(true);
      } else {
        setError(err.message || 'Failed to load lead details from Supabase');
      }
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime())
        ? String(dateString)
        : d.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
    } catch {
      return String(dateString);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
        <p className="mt-3 text-sm font-medium text-slate-600">Loading lead details...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div>
        <button
          onClick={() => navigate('/leads')}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Leads</span>
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <User className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-900">Lead Not Found</h3>
            <p className="mt-1 text-xs text-slate-500">
              No record found matching Lead ID <span className="font-mono font-medium text-slate-700">"{leadId}"</span> in Supabase.
            </p>
            <button
              onClick={() => navigate('/leads')}
              className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 transition"
            >
              Return to Leads
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <button
          onClick={() => navigate('/leads')}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Leads</span>
        </button>

        <div className="rounded-xl border border-rose-200 bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
            <AlertCircle className="h-8 w-8 text-rose-500" />
            <h3 className="mt-2 text-base font-semibold text-slate-900">Unable to load lead</h3>
            <p className="mt-1 text-xs text-slate-500">{error}</p>
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={fetchLead}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 transition"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/leads')}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Back to Leads
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Navigation & Actions Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate('/leads')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Leads</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLead}
            title="Refresh lead data"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Header Profile Card */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-lg">
              {lead.name ? lead.name.charAt(0).toUpperCase() : 'L'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {lead.name || 'Unnamed Lead'}
                </h1>
                {lead.status && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-700 border border-slate-200">
                    {lead.status}
                  </span>
                )}
              </div>
              <p className="mt-1 font-mono text-xs text-slate-500">
                Lead ID: <span className="font-semibold text-slate-700">{lead.lead_id || '--'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>Received: {formatDate(lead.created_date)}</span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Contact & Service Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact Details Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Full Name</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{lead.name || '--'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 flex-shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Company</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{lead.company || '--'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Email Address</p>
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-sm font-semibold text-indigo-600 hover:underline mt-0.5 inline-block break-all"
                    >
                      {lead.email}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400 mt-0.5">--</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 flex-shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Phone Number</p>
                  {lead.phone ? (
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-sm font-semibold text-emerald-700 hover:underline mt-0.5 inline-block"
                    >
                      {lead.phone}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400 mt-0.5">--</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Message Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-slate-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Customer Message
              </h2>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/75 p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {lead.customer_message || (
                <span className="italic text-slate-400">No message provided by client.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Service, Category, Source, Status Details */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
              Lead Specifications
            </h2>

            <div>
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                <Briefcase className="h-3.5 w-3.5" />
                <span>Service Required</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 mt-1">
                {lead.service || '--'}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                <Tag className="h-3.5 w-3.5" />
                <span>Category</span>
              </div>
              <div className="mt-1">
                {lead.category ? (
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {lead.category.trim()}
                  </span>
                ) : (
                  <p className="text-sm text-slate-400">--</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                <Globe className="h-3.5 w-3.5" />
                <span>Source</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 mt-1">
                {lead.source || '--'}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>Created Date</span>
              </div>
              <p className="text-xs font-mono text-slate-600 mt-1">
                {formatDate(lead.created_date)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
