interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0e1621]/80 backdrop-blur-sm transition-opacity">
      {/* Modal Container */}
      <div
        className="bg-[#182533] border border-[#2b3e4d] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-[#f5f5f5] mb-2">{title}</h3>
          <p className="text-sm text-[#8fa8ba] leading-relaxed">{message}</p>
        </div>

        {/* Footer / Actions */}
        <div className="bg-[#0e1621]/50 px-6 py-4 border-t border-[#2b3e4d] flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-transparent text-[#8fa8ba] border border-[#2b3e4d] hover:text-[#f5f5f5] hover:border-[#5f8aac]/50 rounded-lg text-sm font-medium transition-colors"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              isDanger
                ? "bg-[#2b1515] text-[#ff6b6b] border-[#ff6b6b]/30 hover:bg-[#ff6b6b]/10 hover:border-[#ff6b6b]/60"
                : "bg-[#2b5278] text-[#f5f5f5] border-[#5288c1]/30 hover:bg-[#5288c1]/80 hover:border-[#5288c1]"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
