import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { globalErrorHandler } from "./app/middleware/globalErrorHandler.js";
import { notFound } from "./app/middleware/notFound.js";
import { AuthRoutes } from "./app/modules/auth/auth.route.js";
import { UserRoutes } from "./app/modules/user/user.route.js";

const app: Application = express();

// parsers
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

// security
app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", UserRoutes);
// health check
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "TaskFlow API is running",
    data: {
      status: "OK",
    },
  });
});

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to TaskFlow Project Management SaaS API",
    data: null,
  });
});

// must stay after all routes
app.use(notFound);

app.use(globalErrorHandler);

export default app;
