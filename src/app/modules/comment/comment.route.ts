import { Router } from "express";

import { checkAuth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { CommentController } from "./comment.controller.js";
import { CommentValidation } from "./comment.validation.js";

const router = Router();

// Create comment
router.post(
  "/",
  checkAuth(),
  validateRequest(CommentValidation.createCommentValidationSchema),
  CommentController.createComment,
);

// Get comments
router.get("/", checkAuth(), CommentController.getComments);

// Get comment by id
router.get("/:id", checkAuth(), CommentController.getCommentById);

// Update comment
router.patch(
  "/:id",
  checkAuth(),
  validateRequest(CommentValidation.updateCommentValidationSchema),
  CommentController.updateComment,
);

// Soft delete comment
router.delete("/:id", checkAuth(), CommentController.softDeleteComment);

export const CommentRoutes = router;
