import React, { useState } from "react";
import type { FilterState } from "../../types";
import { useLogout } from "../../hooks/auth-hooks";
import { ConfirmModal } from "../UI/ConfirmModal";

interface Props {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const DashboardHeader = ({ filters, setFilters }: Props) => {
  const logoutMutation = useLogout();
  // State to manage our custom modal
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    isWipe: boolean;
  }>({
    isOpen: false,
    isWipe: false,
  });

  const handleLogoutClick = (wipe: boolean) => {
    setModalState({ isOpen: true, isWipe: wipe });
  };

  const confirmLogout = () => {
    logoutMutation.mutate(modalState.isWipe);
    setModalState({ isOpen: false, isWipe: false });
  };

  const cancelLogout = () => {
    setModalState({ isOpen: false, isWipe: false });
  };
  return (
    <>
      <div className="sticky top-0 z-10 bg-[#0e1621]/95 backdrop-blur-sm pt-4 pb-4 mb-6 border-b border-[#2b3e4d]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-[#f5f5f5]">
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
              className="w-full sm:w-72 px-4 py-2 bg-[#182533] text-[#f5f5f5] placeholder-[#8fa8ba] border border-[#2b3e4d] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5288c1] transition-all"
            />
            <div className="flex gap-2 shrink-0">
              {/* Standard Logout */}
              <button
                onClick={() => handleLogoutClick(false)}
                disabled={logoutMutation.isPending}
                className="px-3 py-2 bg-[#182533] text-[#8fa8ba] border border-[#2b3e4d] hover:text-[#f5f5f5] hover:border-[#5288c1] rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Logout
              </button>

              {/* Logout & Wipe */}
              <button
                onClick={() => handleLogoutClick(true)}
                disabled={logoutMutation.isPending}
                title="Logout and delete all message data from database"
                className="px-3 py-2 bg-[#2b1515] text-[#ff6b6b] border border-[#ff6b6b]/30 hover:bg-[#ff6b6b]/10 hover:border-[#ff6b6b]/60 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Logout & Wipe
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <select
            value={filters.mediaType}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, mediaType: e.target.value }))
            }
            className="bg-[#182533] border border-[#2b3e4d] text-[#f5f5f5] text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-[#5288c1] cursor-pointer hover:border-[#5f8aac]/50 transition-colors"
          >
            <option value="all">All Media</option>
            <option value="text">Text</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audios</option>
            <option value="document">Documents</option>
            <option value="link">Links</option>
            <option value="other">Others</option>
          </select>
        </div>
      </div>
      <ConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.isWipe ? "Logout & Wipe Cache" : "Confirm Logout"}
        message={
          modalState.isWipe
            ? "Are you sure? This will log you out and permanently DELETE all cached messages on this device. This action cannot be undone."
            : "Are you sure you want to log out of your current session?"
        }
        confirmText={modalState.isWipe ? "Yes, Wipe & Logout" : "Logout"}
        isDanger={modalState.isWipe}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </>
  );
};
