import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';

export default function Header({ onOpenSidebar }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Placeholder */}
        <div className="relative hidden sm:block w-72 md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            disabled
            placeholder="Search CRM (leads, projects, tasks)..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications Icon Placeholder */}
        <button
          disabled
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-not-allowed"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600" />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* User Profile Placeholder */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-600">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-sm font-semibold text-slate-800 leading-tight">CRM Workspace</span>
            <span className="text-xs text-slate-400">Team Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
