export type TCreateCommentPayload = {
  content: string;
  taskId: string;
};

export type TUpdateCommentPayload = {
  content: string;
};

export type TCommentQuery = {
  taskId?: string;
  page?: string;
  limit?: string;
};
