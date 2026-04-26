import { useParams, Link } from "react-router-dom";
import { useTasks } from "../hooks/task-hooks";

export default function TaskPage() {
  const { messageId } = useParams<{ messageId: string }>();
  const { data, isLoading } = useTasks(messageId!);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e1621] text-[#8fa8ba]">
        Loading tasks...
      </div>
    );
  }

  const message = data?.message;
  const tasks = message?.tasks ?? [];
  return (
    <div className="min-h-screen bg-[#0e1621] p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2b3e4d]">
          <h1 className="text-xl font-bold text-[#f5f5f5]">
            Tasks for this Saved Message
          </h1>
          <Link
            to="/"
            className="text-sm font-medium text-[#5288c1] hover:text-[#73a2d6] transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Message Context Card */}
        <div className="bg-[#182533] border border-[#2b3e4d] rounded-[10px_30px_10px_2px] p-5 shadow-sm mb-8">
          <p className="text-[#f5f5f5] text-sm whitespace-pre-wrap">
            {message?.text || <i className="text-[#8fa8ba]">No message text</i>}
          </p>
          <div className="text-xs text-[#8fa8ba] mt-3">
            {message?.date &&
              new Date(message.date).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#f5f5f5] mb-4">
            Reminders & Tasks ({tasks.length})
          </h2>

          {!tasks || tasks.length === 0 ? (
            <div className="bg-[#182533] border border-[#2b3e4d] rounded-xl p-8 text-center text-[#8fa8ba]">
              No tasks found for this message.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task._id}
                className={`bg-[#2b5278] border border-[#2b3e4d] rounded-xl p-5 shadow-sm transition hover:shadow-md ${
                  task.status === "done" ? "opacity-80" : ""
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <h3
                      className={`text-[#f5f5f5] font-semibold text-lg ${task.status === "done" ? "line-through text-[#8fa8ba]" : ""}`}
                    >
                      {task.title || "Untitled Task"}
                    </h3>

                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        task.status === "done"
                          ? "bg-[#4caf50] text-white"
                          : "bg-[#f4a52e] text-[#0e1621]"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  {task.note && (
                    <p className="text-sm text-[#afdcd9] bg-[#182533] p-3 rounded-lg border border-[#2b3e4d]">
                      {task.note}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-[#8fa8ba] mt-1 pt-3 border-t border-[#2b3e4d]">
                    <div className="flex items-center gap-4">
                      {/* Reminder Date */}
                      <span className="flex items-center gap-1.5 text-[#f5f5f5]">
                        <svg
                          className="w-4 h-4 text-[#5288c1]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {new Date(task.reminderAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>

                      {/* Notified Status Badge */}
                      <span
                        className={`flex items-center gap-1 ${task.isNotified ? "text-[#4caf50]" : "text-[#8fa8ba]"}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${task.isNotified ? "bg-[#4caf50]" : "bg-gray-500"}`}
                        ></span>
                        {task.isNotified ? "Notified" : "Waiting"}
                      </span>
                    </div>

                    {/* Notification Methods */}
                    {task.notifyVia && task.notifyVia.length > 0 && (
                      <span className="flex gap-2">
                        {task.notifyVia.map((method) => (
                          <span
                            key={method}
                            className="bg-[#0e1621] border border-[#2b3e4d] px-2 py-1 rounded text-[10px] uppercase text-[#5288c1]"
                          >
                            {method}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
