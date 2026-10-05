import { Router } from "express";

import { checkAuth } from "../../middleware/checkAuth.js";
import { validateQuery } from "../../middleware/validateQuery.js";

import { ActivityLogController } from "./activityLog.controller.js";
import { ActivityLogValidation } from "./activityLog.validation.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

router.get(
  "/",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  validateQuery(ActivityLogValidation.getActivityLogsValidationSchema),
  ActivityLogController.getActivityLogs,
);

router.get(
  "/:id",
  checkAuth(UserRole.MEMBER, UserRole.ADMIN, UserRole.MANAGER),
  ActivityLogController.getActivityLogById,
);

export const ActivityLogRoutes = router;
