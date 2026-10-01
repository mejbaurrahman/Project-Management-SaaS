export type TCreateTaskPayload = {
  title: string;
  description?: string;

  projectId: string;

  sprintId?: string;
  assigneeId?: string;
  parentTaskId?: string;

  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";

  dueDate?: string;
};

export type TUpdateTaskPayload = {
  title?: string;
  description?: string;

  sprintId?: string;
  assigneeId?: string;

  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";

  dueDate?: string;
};

export type TUpdateTaskStatusPayload = {
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
};

export type TTaskQuery = {
  page?: string;
  limit?: string;

  projectId?: string;
  sprintId?: string;
  assigneeId?: string;

  status?: string;
  priority?: string;

  search?: string;

  sortBy?: string;
  sortOrder?: string;
};
