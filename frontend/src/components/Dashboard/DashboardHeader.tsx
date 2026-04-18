import React from "react";
import type { FilterState } from "../../types";
import { useLogout } from "../../hooks/auth-hooks";

interface Props {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const DashboardHeader = ({ filters, setFilters }: Props) => {
  const logoutMutation = useLogout();
  const handleLogout = (wipe: boolean) => {
    const message = wipe
      ? "Are you sure? This will log you out and DELETE all cached messages."
      : "Are you sure you want to logout?";

    if (window.confirm(message)) {
      logoutMutation.mutate(wipe);
    }
  };
  return (
    <div className="sticky top-0 z-10 bg-slate-100 pt-4 pb-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Saved Messages
        </h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by tag..."
            value={filters.filter}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, filter: e.target.value }))
            }
            className="w-full sm:w-72 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            {/* Standard Logout */}
            <button
              onClick={() => handleLogout(false)}
              disabled={logoutMutation.isPending}
              className="px-3 py-2 bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>

            {/* Logout & Wipe */}
            <button
              onClick={() => handleLogout(true)}
              disabled={logoutMutation.isPending}
              title="Logout and delete all message data from database"
              className="px-3 py-2 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
            >
              Logout & Wipe
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 py-3 border-y border-slate-200">
        <select
          value={filters.mediaType}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, mediaType: e.target.value }))
          }
          className="bg-white border border-slate-300 text-sm rounded-md px-3 py-1.5"
        >
          <option value="all">All Media</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="link">Links</option>
        </select>
        <select
          value={filters.sortOrder}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              sortOrder: e.target.value as "asc" | "desc",
            }))
          }
          className="bg-white border border-slate-300 text-sm rounded-md px-3 py-1.5 ml-auto"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>
    </div>
  );
};
