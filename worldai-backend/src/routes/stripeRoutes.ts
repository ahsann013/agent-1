import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import StripeController from "../controllers/stripeController.js";
const router = express.Router();

// Webhook route (no auth - Stripe sends its own signature)
router.post("/webhook", StripeController.handleWebhook);
// All other routes require authentication
router.get("/products", StripeController.getProducts);
router.use(authMiddleware);

// CRUD routes
router.post("/products", StripeController.createProduct);
router.put("/products/:id", StripeController.updateProduct);
router.post("/create-checkout-session", StripeController.createCheckoutSession);
router.get("/transactions", StripeController.getTransactions);
router.patch(
  "/products/:id/toggle-status",
  StripeController.toggleProductStatus
);
router.get("/sub/:customerId", StripeController.getSubscription);
router.get("/success", StripeController.handleSuccessfulPayment);
router.post(
  "/sub/:subscriptionId/cancel",
  StripeController.handleSubscriptionCancelled
);
router.post("/add-free-credits", StripeController.addFreeMonthlyCredits);

export default router;
