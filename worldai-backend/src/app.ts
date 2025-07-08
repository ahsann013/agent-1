import express, { Request, Response, Router } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import openaiRoutes from "./routes/openaiRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import apiSettingsRoutes from "./routes/apiSettingsRoutes.js";
import llmRoutes from "./routes/llmRoutes.js";
import promptRoutes from "./routes/promptRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import usageRoutes from "./routes/usageRoutes.js";
import userSettingsRoutes from "./routes/userSettingsRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import servicePricingRoutes from "./routes/servicePricing.js";
import adminRoutes from "./routes/adminRoutes.js";
import UserController from "./controllers/userController.js";
import creditRoutes from "./routes/creditRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import cron from "cron";
import StripeController from "./controllers/stripeController.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up cron job to add free credits on the first day of every month
const monthlyCreditsJob = new cron.CronJob("0 0 1 * *", async () => {
  console.log("Running monthly free credits cron job...");
  try {
    const updatedUsers = await StripeController.addFreeMonthlyCredits();
    console.log(`Successfully added free credits to ${updatedUsers} users`);
  } catch (error) {
    console.error("Error in monthly free credits cron job:", error);
  }
});

// Start the cron job
monthlyCreditsJob.start();

app.use(cors()); // Enable CORS for cross-origin requests

app.use("/api/v1/stripe/webhook", express.raw({ type: "application/json" }));
// fixing "413 Request Entity Too Large" errors
app.use(express.json({ limit: "10mb" }));
app.use(
  express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 })
);

app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Swagger configuration

const v1Router: Router = express.Router();

// Define routes for user and authentication management
v1Router.get("/", (req: Request, res: Response) => {
  res.send({ Hello: "World" });
});
v1Router.use("/auth", authRoutes);
v1Router.use("/ai-models", llmRoutes);
v1Router.use("/openai", openaiRoutes);
v1Router.use("/users", userRoutes);
v1Router.use("/api-settings", apiSettingsRoutes);
v1Router.use("/prompts", promptRoutes);
v1Router.use("/chat", chatRoutes);
v1Router.use("/settings", userSettingsRoutes);
v1Router.use("/usage", usageRoutes);
v1Router.use("/stripe", stripeRoutes);
v1Router.use("/credits", creditRoutes);
v1Router.use("/contact", UserController.sendContactEmail);
v1Router.use("/service-pricing", servicePricingRoutes);
v1Router.use("/admin", adminRoutes);

app.use("/api/v1", v1Router);

export default app;
