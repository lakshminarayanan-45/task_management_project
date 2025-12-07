import { useState } from "react";
import { useTaskContext } from "@/context/TaskContext.jsx";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle, Clock, AlertCircle, ListTodo, LayoutGrid, List, Search, CalendarDays } from "lucide-react";
import { TaskListModal } from "@/components/dashboard/TaskListModal.jsx";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal.jsx";
import { format, isSameDay, parseISO, startOfToday, isBefore } from "date-fns";

const statusConfig = {
  todo: { label: "To Do", className: "bg-muted text-muted-foreground" },
  "in-progress": { label: "In Progress", className: "bg-status-in-progress text-status-in-progress-foreground" },
  review: { label: "Review", className: "bg-status-review text-status-review-foreground" },
  done: { label: "Done", className: "bg-status-done text-status-done-foreground" },
};

export default function Dashboard() {
  const { tasks, setSelectedTask, currentUser } = useTaskContext();
  const [viewMode, setViewMode] = useState("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTasks, setModalTasks] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const today = startOfToday();

  const baseTasks = currentUser.role === "employee" 
    ? tasks.filter((task) => task.assignee.id === currentUser.id)
    : tasks;

  const filteredTasks = baseTasks.filter((task) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query) || task.assignee.name.toLowerCase().includes(query);
  });

  const openTaskModal = (taskList, title) => {
    setModalTasks(taskList);
    setModalTitle(title);
    setModalOpen(true);
  };

  const stats = [
    { title: "Total Tasks", value: filteredTasks.length, icon: ListTodo, color: "text-primary", bg: "bg-primary/10", tasks: filteredTasks },
    { title: "In Progress", value: filteredTasks.filter((t) => t.status === "in-progress").length, icon: Clock, color: "text-status-in-progress", bg: "bg-status-in-progress/10", tasks: filteredTasks.filter((t) => t.status === "in-progress") },
    { title: "In Review", value: filteredTasks.filter((t) => t.status === "review").length, icon: AlertCircle, color: "text-status-review", bg: "bg-status-review/10", tasks: filteredTasks.filter((t) => t.status === "review") },
    { title: "Completed", value: filteredTasks.filter((t) => t.status === "done").length, icon: CheckCircle, color: "text-status-done", bg: "bg-status-done/10", tasks: filteredTasks.filter((t) => t.status === "done") },
  ];

  // Tasks for selected date
  const tasksForSelectedDate = filteredTasks.filter((task) => isSameDay(parseISO(task.dueDate), selectedDate));

  // Get dates that have tasks for highlighting
  const taskDates = filteredTasks.map((task) => parseISO(task.dueDate));

  // Custom modifier for highlighting task dates
  const modifiers = {
    hasTask: taskDates,
  };

  const modifiersStyles = {
    hasTask: {
      backgroundColor: "hsl(var(--primary) / 0.2)",
      borderRadius: "50%",
      fontWeight: "bold",
    },
  };

  // Disable past dates
  const disabledDays = { before: today };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{currentUser.role === "employee" ? "Your task overview" : "Overview of your tasks"}</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-full sm:w-48 md:w-64" />
          </div>
          <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-muted/30">
            <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="h-8 w-8 p-0"><LayoutGrid className="h-4 w-4" /></Button>
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="h-8 w-8 p-0"><List className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <div className={viewMode === "grid" ? "grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6" : "flex flex-col gap-3"}>
        {stats.map((stat) => (
          <Card key={stat.title} className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1" onClick={() => openTaskModal(stat.tasks, stat.title)}>
            <CardContent className={viewMode === "grid" ? "p-4 md:p-6" : "p-4 flex items-center gap-4"}>
              {viewMode === "grid" ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 md:p-3 rounded-xl ${stat.bg}`}><stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} /></div>
                    <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
                  </div>
                  <p className={`text-3xl md:text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                </>
              ) : (
                <>
                  <div className={`p-3 rounded-xl ${stat.bg}`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div>
                  <div className="flex-1"><p className="text-sm text-muted-foreground">{stat.title}</p></div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-primary" />Recent Activity</h3>
            <div className="space-y-3">
              {filteredTasks.slice(0, 5).map((task) => (
                <div key={task.id} onClick={() => setSelectedTask(task)} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 cursor-pointer hover:bg-muted/60 transition-all">
                  <Avatar className="h-9 w-9"><AvatarImage src={task.assignee.avatar} /><AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0"><p className="font-medium truncate text-sm">{task.title}</p><p className="text-xs text-muted-foreground">Assigned to {task.assignee.name}</p></div>
                  <Badge className={`${statusConfig[task.status].className} text-xs`}>{statusConfig[task.status].label}</Badge>
                </div>
              ))}
              {filteredTasks.length === 0 && <p className="text-center text-muted-foreground py-8">No tasks found</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" />Calendar View</h3>
            <Calendar 
              mode="single" 
              selected={selectedDate} 
              onSelect={(date) => date && setSelectedDate(date)} 
              className="rounded-md border w-full pointer-events-auto"
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              disabled={disabledDays}
              fromDate={today}
            />
            <div className="mt-4">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Tasks due on {format(selectedDate, "MMM d, yyyy")}:
              </p>
              {tasksForSelectedDate.length === 0 ? (
                <p className="text-xs text-muted-foreground">No tasks due on this date</p>
              ) : (
                <div className="space-y-2">
                  {tasksForSelectedDate.map((task) => (
                    <div key={task.id} onClick={() => setSelectedTask(task)} className="p-2 rounded-lg bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 text-sm truncate flex items-center gap-2">
                      <Clock className="h-3 w-3 text-primary shrink-0" />
                      {task.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <TaskListModal open={modalOpen} onOpenChange={setModalOpen} tasks={modalTasks} title={modalTitle} />
      <TaskDetailModal />
    </div>
  );
}