import { Router } from "express";

import { checkAuth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { CommentController } from "./comment.controller.js";
import { CommentValidation } from "./comment.validation.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

// Create comment
router.post(
  "/",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(CommentValidation.createCommentValidationSchema),
  CommentController.createComment,
);

// Get comments
router.get(
  "/",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  CommentController.getComments,
);

// Get comment by id
router.get(
  "/:id",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  CommentController.getCommentById,
);

// Update comment
router.patch(
  "/:id",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(CommentValidation.updateCommentValidationSchema),
  CommentController.updateComment,
);

// Soft delete comment
router.delete(
  "/:id",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  CommentController.softDeleteComment,
);

export const CommentRoutes = router;
