import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils.js";
import { format } from "date-fns";
import { useTaskContext } from "@/context/TaskContext.jsx";

const priorityConfig = {
  low: { label: "Low", className: "bg-priority-low/10 text-priority-low border-priority-low/20" },
  medium: { label: "Medium", className: "bg-priority-medium/10 text-priority-medium border-priority-medium/20" },
  high: { label: "High", className: "bg-priority-high/10 text-priority-high border-priority-high/20" },
};

export function TaskCard({ task }) {
  const { setSelectedTask } = useTaskContext();
  const priority = priorityConfig[task.priority];

  return (
    <Card
      onClick={() => setSelectedTask(task)}
      className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 animate-fade-in bg-card"
    >
      {/* Priority & Tags */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge variant="outline" className={cn("text-xs", priority.className)}>
          {priority.label}
        </Badge>
        {task.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Title */}
      <h3 className="font-medium text-card-foreground mb-2 line-clamp-2">
        {task.title}
      </h3>

      {/* Description preview */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {task.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(task.dueDate), "MMM d")}
          </span>
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {task.comments.length}
            </span>
          )}
          {task.attachments.length > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              {task.attachments.length}
            </span>
          )}
        </div>
        <Avatar className="h-6 w-6">
          <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
          <AvatarFallback className="text-xs">{task.assignee.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
    </Card>
  );
}
