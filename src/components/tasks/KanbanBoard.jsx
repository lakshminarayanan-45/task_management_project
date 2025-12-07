import { useTaskContext } from "@/context/TaskContext.jsx";
import { KanbanColumn } from "./KanbanColumn.jsx";

const columns = [
  { status: "todo", title: "To Do" },
  { status: "in-progress", title: "In Progress" },
  { status: "review", title: "Review" },
  { status: "done", title: "Done" },
];

export function KanbanBoard({ filteredTasks }) {
  const { tasks, moveTask } = useTaskContext();
  const displayTasks = filteredTasks || tasks;

  const handleDrop = (taskId, newStatus) => {
    moveTask(taskId, newStatus);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <KanbanColumn
          key={column.status}
          status={column.status}
          title={column.title}
          tasks={displayTasks.filter((task) => task.status === column.status)}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
