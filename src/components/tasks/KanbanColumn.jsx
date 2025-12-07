import { TaskCard } from "./TaskCard.jsx";
import { cn } from "@/lib/utils.js";

const statusStyles = {
  todo: "border-t-muted-foreground/30",
  "in-progress": "border-t-status-in-progress",
  review: "border-t-status-review",
  done: "border-t-status-done",
};

export function KanbanColumn({ status, title, tasks, onDrop }) {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-muted/50");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("bg-muted/50");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-muted/50");
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onDrop(taskId, status);
    }
  };

  return (
    <div
      className={cn(
        "flex-1 min-w-[280px] max-w-[350px] bg-secondary/50 rounded-xl border-t-4 transition-colors",
        statusStyles[status]
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">{title}</h2>
          <span className="text-sm text-muted-foreground bg-background px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className="p-2 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("taskId", task.id);
            }}
          >
            <TaskCard task={task} />
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}
