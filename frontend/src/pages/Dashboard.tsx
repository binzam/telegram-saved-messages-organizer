import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import MessageCard from "../components/Message/MessageCard";
import { DashboardHeader } from "../components/Dashboard/DashboardHeader";
import { useMessages, useTagMessage } from "../hooks/message-hooks";
import type { FilterState, Message } from "../types";
import { groupMessages } from "../utils/group-messages";

const MessageSkeleton = () => (
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
export default function Dashboard() {
  const [filters, setFilters] = useState<FilterState>({
    filter: "",
    mediaType: "all",
    sortOrder: "desc",
  });
  const [currentDate, setCurrentDate] = useState<string | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useMessages(filters);
  const tagMutation = useTagMessage();

  const observer = useRef<IntersectionObserver | null>(null);

  // Flatten the infinite query pages into a single array
  const allMessages = useMemo(() => {
    return data?.pages.flatMap((page) => page.messages) || [];
  }, [data]);

  const displayItems = useMemo(() => groupMessages(allMessages), [allMessages]);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  // Timeline Scroll Spy
  useEffect(() => {
    const timelineObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
          const dateStr = (visibleEntries[0].target as HTMLElement).dataset
            .date;
          if (dateStr) setCurrentDate(dateStr);
        }
      },
      { rootMargin: "-15% 0px -80% 0px" },
    );

    const elements = document.querySelectorAll(".message-item-wrapper");
    elements.forEach((el) => timelineObserver.observe(el));
    return () => timelineObserver.disconnect();
  }, [allMessages]);

  return (
    <div className="min-h-screen bg-[#0e1621] text-[#f5f5f5] flex justify-center">
      <div className="hidden lg:block w-64 shrink-0 relative">
        <div className="sticky top-32 ml-12 h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
          <div className="absolute left-1.75 top-0 bottom-0 w-0.5 bg-[#2b3e4d]"></div>
          <div className="absolute left-0 top-0 w-4 h-4 bg-[#5288c1] rounded-full border-4 border-[#0e1621]" />
          <div className="pt-0 pl-8">
            <p className="text-xs font-bold text-[#8fa8ba] uppercase">
              Viewing
            </p>
            <p className="text-lg font-bold text-[#f5f5f5]">
              {currentDate
                ? new Date(currentDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "..."}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl p-4 md:p-8">
        <DashboardHeader filters={filters} setFilters={setFilters} />

        {status === "error" && (
          <div className="p-4 mb-6 text-[#ff6b6b] bg-[#2b1515] border border-[#ff6b6b] rounded-lg">
            {error?.message}
          </div>
        )}

        <div className="space-y-6">
          {status === "pending" && (
            <>
              <MessageSkeleton />
              <MessageSkeleton />
              <MessageSkeleton />
            </>
          )}
          {status === "success" &&
            displayItems.map((node, index) => {
              const isLast = index === displayItems.length - 1;
              const nodeDate = node.isGroup
                ? node.items[0].date
                : node.item.date;

              return (
                <div
                  key={node.key}
                  ref={isLast ? lastElementRef : null}
                  className="message-item-wrapper"
                  data-date={nodeDate}
                >
                  {node.isGroup ? (
                    <div className="bg-[#2b5278] p-4 rounded-xl shadow-sm border border-[#2b3e4d] ">
                      <div className="flex mb-3 border-b border-[#2b3e4d] pb-3">
                        <span className="text-xs text-[#8fa8ba]">
                          {new Date(node.items[0].date).toLocaleString(
                            undefined,
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            },
                          )}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-[#f5f5f5] mb-3 uppercase">
                        Album ({node.items.length})
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {node.items.map((m: Message) => (
                          <MessageCard
                            key={m.messageId}
                            message={m}
                            onAddTags={(tags) =>
                              tagMutation.mutate({
                                messageId: m.messageId,
                                tags,
                              })
                            }
                            isAlbumItem
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <MessageCard
                      message={node.item}
                      onAddTags={(tags) =>
                        tagMutation.mutate({
                          messageId: node.item.messageId,
                          tags,
                        })
                      }
                    />
                  )}
                </div>
              );
            })}
        </div>

        {isFetchingNextPage && (
          <div className="text-center py-8 text-[#8fa8ba]">Loading more...</div>
        )}
        {!isFetchingNextPage && !hasNextPage && allMessages.length > 0 && (
          <div className="text-center py-8 text-[#8fa8ba]">
            No more messages
          </div>
        )}
      </div>
    </div>
  );
}
