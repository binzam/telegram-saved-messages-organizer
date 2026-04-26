const MessageSkeleton = () => {
  return (
    <div className="bg-[#2b5278] p-5 rounded-[10px_30px_10px_2px] border border-[#2b3e4d] animate-pulse">
      <div className="flex items-center justify-between mb-3 border-b border-[#5f8aac]/20 pb-3">
        <div className="h-3 w-24 bg-[#182533] rounded"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-3/4 bg-[#182533] rounded"></div>
        <div className="h-32 w-full bg-[#182533] rounded-lg"></div>
      </div>
      <div className="mt-4 pt-4 border-t border-[#5f8aac]/20 flex gap-2">
        <div className="h-6 w-12 bg-[#182533] rounded"></div>
        <div className="h-6 w-12 bg-[#182533] rounded"></div>
      </div>
    </div>
  );
};

export default MessageSkeleton;
