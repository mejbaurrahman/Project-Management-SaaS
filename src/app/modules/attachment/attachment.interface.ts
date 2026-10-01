export type TCreateAttachmentPayload = {
  fileName: string;
  fileUrl: string;
  publicId?: string;
  taskId: string;
};

export type TAttachmentQuery = {
  taskId?: string;
  page?: string;
  limit?: string;
};
