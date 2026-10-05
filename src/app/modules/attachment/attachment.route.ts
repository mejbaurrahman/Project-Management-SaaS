import { Router } from "express";

import { checkAuth } from "../../middleware/checkAuth.js";
import { upload } from "../../middleware/upload.js";

import { AttachmentController } from "./attachment.controller.js";

const router = Router();

router.post(
  "/",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  upload.array("files", 10),
  AttachmentController.createAttachments,
);

router.get(
  "/",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  AttachmentController.getAttachments,
);

router.get(
  "/:id",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  AttachmentController.getAttachmentById,
);

router.delete(
  "/:id",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  AttachmentController.softDeleteAttachment,
);

export const AttachmentRoutes = router;
