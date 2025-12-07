import { useTaskContext } from "@/context/TaskContext.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Edit2, Trash2, Paperclip, MessageSquare, User, Flag, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils.js";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast.js";

const priorityConfig = {
  low: { label: "Low", className: "bg-priority-low/10 text-priority-low" },
  medium: { label: "Medium", className: "bg-priority-medium/10 text-priority-medium" },
  high: { label: "High", className: "bg-priority-high/10 text-priority-high" },
};

const statusConfig = {
  todo: { label: "To Do", className: "bg-muted text-muted-foreground" },
  "in-progress": { label: "In Progress", className: "bg-status-in-progress text-status-in-progress-foreground" },
  review: { label: "Review", className: "bg-status-review text-status-review-foreground" },
  done: { label: "Done", className: "bg-status-done text-status-done-foreground" },
};

export function TaskDetailModal() {
  const { selectedTask, setSelectedTask, updateTask, deleteTask, canEditTask, canDeleteTask, currentUser } = useTaskContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    status: "",
    priority: "",
  });
  const [newAttachments, setNewAttachments] = useState([]);
  const fileInputRef = useRef(null);

  if (!selectedTask) return null;

  const canEdit = canEditTask(selectedTask);
  const canDelete = canDeleteTask(selectedTask);
  const isEmployee = currentUser.role === "employee";

  const handleStartEdit = () => {
    setEditData({
      title: selectedTask.title,
      description: selectedTask.description,
      status: selectedTask.status,
      priority: selectedTask.priority,
    });
    setNewAttachments([...selectedTask.attachments]);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateTask(selectedTask.id, { 
      ...editData, 
      attachments: newAttachments 
    });
    setIsEditing(false);
    toast({
      title: "Task updated",
      description: "Your changes have been saved.",
    });
  };

  const handleDelete = () => {
    deleteTask(selectedTask.id);
    setSelectedTask(null);
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map(f => f.name);
      setNewAttachments(prev => [...prev, ...fileNames]);
      toast({
        title: "Files added",
        description: `${fileNames.length} file(s) attached to the task.`,
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index) => {
    setNewAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const priority = priorityConfig[selectedTask.priority];
  const status = statusConfig[selectedTask.status];

  return (
    <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="text-xl font-semibold"
                />
              ) : (
                <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
              )}
            </div>
            <div className="flex items-center gap-2">
              {canEdit && !isEditing && (
                <Button variant="outline" size="sm" onClick={handleStartEdit}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status & Priority */}
          <div className="flex items-center gap-3 flex-wrap">
            {isEditing ? (
              <>
                <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v })}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={editData.priority} onValueChange={(v) => setEditData({ ...editData, priority: v })}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <Badge className={cn(status.className)}>{status.label}</Badge>
                <Badge variant="outline" className={cn(priority.className)}>
                  <Flag className="h-3 w-3 mr-1" />
                  {priority.label} Priority
                </Badge>
              </>
            )}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {selectedTask.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Description
            </h4>
            {isEditing ? (
              <Textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={4}
              />
            ) : (
              <p className="text-muted-foreground">{selectedTask.description}</p>
            )}
          </div>

          {/* File Upload for Employees (in edit mode) */}
          {isEditing && isEmployee && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Files
              </h4>
              <div className="space-y-3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload files</p>
                  <p className="text-xs text-muted-foreground mt-1">Any file type supported</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {newAttachments.length > 0 && (
                  <div className="space-y-2">
                    {newAttachments.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50 text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{file}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 shrink-0"
                          onClick={() => removeAttachment(i)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save Changes</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          )}

          <Separator />

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Assignee
              </h4>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedTask.assignee.avatar} />
                  <AvatarFallback>{selectedTask.assignee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{selectedTask.assignee.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{selectedTask.assignee.role}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Created by
              </h4>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedTask.createdBy.avatar} />
                  <AvatarFallback>{selectedTask.createdBy.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{selectedTask.createdBy.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{selectedTask.createdBy.role}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date
              </h4>
              <p className="text-sm">{format(new Date(selectedTask.dueDate), "MMMM d, yyyy")}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Created
              </h4>
              <p className="text-sm">{format(new Date(selectedTask.createdAt), "MMMM d, yyyy")}</p>
            </div>
          </div>

          {/* Attachments */}
          {!isEditing && selectedTask.attachments.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Attachments ({selectedTask.attachments.length})
                </h4>
                <div className="space-y-2">
                  {selectedTask.attachments.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm"
                    >
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Comments */}
          {selectedTask.comments.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments ({selectedTask.comments.length})
                </h4>
                <div className="space-y-4">
                  {selectedTask.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user.avatar} />
                        <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{comment.user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
