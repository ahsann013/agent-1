import Stripe from "stripe";
import { ApiSetting, User, sequelize } from "../models/index.js";
import dotenv from "dotenv";
import { Op } from "sequelize";

dotenv.config();

class StripeController {
  static async initializeStripe() {
    try {
      const settings = await ApiSetting.findOne({
        where: { serviceName: "Stripe" },
      });

      if (!settings) {
        throw new Error("Stripe settings not found in database");
      }

      return new Stripe(settings.apiKey);
    } catch (error) {
      throw error;
    }
  }

  // Get available products
  static async getProducts(req, res) {
    try {
      const stripe = await StripeController.initializeStripe();
      // Fetch products from Stripe directly to ensure latest data
      const stripeProducts = await stripe.products.list({
        limit: 20,
        expand: ["data.default_price"],
      });

      // Format products for frontend using consistent property names from Stripe
      const products = stripeProducts.data.map((product) => {
        const price = product.default_price;

        // Parse features from metadata if available
        let features = [];
        let featured = false;

        if (product.metadata) {
          if (product.metadata.features) {
            try {
              features = JSON.parse(product.metadata.features);
            } catch (e) {
              console.error("Error parsing features:", e);
            }
          }

          if (product.metadata.featured) {
            featured = product.metadata.featured === "true";
          }
        }

        // Return standardized product object with Stripe property names
        return {
          id: product.id, // Main product ID from Stripe
          priceId: price ? price.id : null, // Price ID from Stripe
          name: product.name,
          description: product.description || "",
          unitAmount: price ? price.unit_amount : 0, // Stripe's property name
          unitAmountDecimal: price ? price.unit_amount / 100 : 0, // For display
          currency: price ? price.currency : "usd",
          recurring: price && price.recurring ? true : false,
          interval: price && price.recurring ? price.recurring.interval : null,
          features, // Custom property from metadata
          featured, // Custom property from metadata
          active: product.active,
          images: product.images,
          credits: product.credits,
          metadata: product.metadata,
        };
      });

      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Create a Stripe product with price
  static async createProduct(req, res) {
    try {
      const stripe = await StripeController.initializeStripe();
      const {
        name,
        description,
        credits = 0, // Default to 0 if not provided
        unitAmount, // Match Stripe naming convention
        currency = "usd",
        interval = "month",
        features = [],
        featured = false,
        metadata = {},
      } = req.body;

      // Validate required fields
      if (!name || unitAmount === undefined) {
        return res
          .status(400)
          .json({ error: "Name and unit amount are required" });
      }

      // Prepare metadata for Stripe
      const stripeMetadata = {
        ...metadata,
        features: JSON.stringify(features),
        featured: featured.toString(),
        credits: credits,
      };

      // Create a product in Stripe
      const product = await stripe.products.create({
        name,
        description: description || "",
        active: true,
        metadata: stripeMetadata,
      });

      // Create a price for the product
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(unitAmount * 100), // Convert to cents
        currency,
        recurring: unitAmount >= 0 ? { interval } : null, // Only add recurring if price > 0
      });

      // Set as default price
      await stripe.products.update(product.id, {
        default_price: price.id,
      });

      // Fetch the complete product with price data
      const updatedProduct = await stripe.products.retrieve(product.id, {
        expand: ["default_price"],
      });

      // Return response with consistent property names
      const response = {
        id: updatedProduct.id,
        priceId: price.id,
        name: updatedProduct.name,
        description: updatedProduct.description || "",
        unitAmount: price.unit_amount,
        unitAmountDecimal: price.unit_amount / 100,
        currency: price.currency,
        recurring: price.recurring ? true : false,
        interval: price.recurring ? price.recurring.interval : null,
        features,
        credits,
        featured,
        active: updatedProduct.active,
        images: updatedProduct.images,
        metadata: updatedProduct.metadata,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Update an existing Stripe product
  static async updateProduct(req, res) {
    try {
      const stripe = await StripeController.initializeStripe();
      const { id } = req.params; // Use Stripe's product ID convention
      const {
        name,
        description,
        unitAmount, // Match Stripe naming convention
        currency = "usd",
        interval = "month",
        features = [],
        credits,
        featured = false,
        active = true,
        metadata = {},
      } = req.body;

      // Validate product ID
      if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      // Prepare metadata for Stripe
      const stripeMetadata = {
        ...metadata,
        credits: credits,
        features: JSON.stringify(features),
        featured: featured.toString(),
      };

      // Update product in Stripe
      const product = await stripe.products.update(id, {
        name,
        description: description || "",
        active,
        metadata: stripeMetadata,
      });

      // If unitAmount is provided, create a new price
      let price = null;
      if (unitAmount !== undefined) {
        price = await stripe.prices.create({
          product: id,
          unit_amount: Math.round(unitAmount * 100), // Convert to cents
          currency,
          recurring: unitAmount > 0 ? { interval } : null,
        });

        // Set as default price
        await stripe.products.update(id, {
          default_price: price.id,
        });
      }

      // Fetch the updated product with price data
      const updatedProduct = await stripe.products.retrieve(id, {
        expand: ["default_price"],
      });

      const defaultPrice = updatedProduct.default_price;

      // Return response with consistent property names
      const response = {
        id: updatedProduct.id,
        priceId: price ? price.id : defaultPrice ? defaultPrice.id : null,
        name: updatedProduct.name,
        description: updatedProduct.description || "",
        unitAmount: price
          ? price.unit_amount
          : defaultPrice
          ? defaultPrice.unit_amount
          : 0,
        unitAmountDecimal: price
          ? price.unit_amount / 100
          : defaultPrice
          ? defaultPrice.unit_amount / 100
          : 0,
        currency: price
          ? price.currency
          : defaultPrice
          ? defaultPrice.currency
          : "usd",
        recurring: price
          ? !!price.recurring
          : defaultPrice
          ? !!defaultPrice.recurring
          : false,
        interval:
          price && price.recurring
            ? price.recurring.interval
            : defaultPrice && defaultPrice.recurring
            ? defaultPrice.recurring.interval
            : null,
        features,
        featured,
        active: updatedProduct.active,
        images: updatedProduct.images,
        metadata: updatedProduct.metadata,
      };

      res.json(response);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getSubscription(req, res) {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const customerId = user.stripeCustomerId;

    try {
      const stripe = await StripeController.initializeStripe();
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
      });

      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];
        const productId = subscription.items.data[0].price.product;
        res.json({ subscriptions, productId });
      } else {
        res.status(404).json({ message: "No subscription found" });
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Create a checkout session
  static async createCheckoutSession(req, res) {
    try {
      const userId = req.user.id;
      const { priceId } = req.body;

      // Get user information
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const stripe = await StripeController.initializeStripe();

      // Check if the user already has a Stripe customer ID
      let customerId = user.stripeCustomerId;

      if (customerId) {
        // Check if user already has an active subscription
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
        });

        if (subscriptions.data.length > 0) {
          return res.status(400).json({
            error:
              "You already have an active subscription. Please cancel your current plan before subscribing to a new one.",
          });
        }
      } else {
        // Create a new customer if one doesn't exist
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
        });
        customerId = customer.id;
        await user.update({ stripeCustomerId: customerId });
      }

      // Validate priceId by checking if it exists in Stripe
      try {
        const price = await stripe.prices.retrieve(priceId);
        if (!price || !price.active) {
          return res
            .status(400)
            .json({ error: "Invalid or inactive price ID" });
        }

        // Get product details
        const product = await stripe.products.retrieve(price.product);

        if (!product.active) {
          return res.status(400).json({ error: "Product is inactive" });
        }

        // Create Stripe session
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price: price.id,
              quantity: 1,
            },
          ],
          mode: price.recurring ? "subscription" : "payment",
          success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_URL}/products`,
          customer: customerId,
          metadata: {
            userId: user.id,
            credits: product.metadata?.credits || 0,
            productId: product.id,
          },
        });

        if (session) {
          await user.update({ sessionId: session.id });
        }

        res.json({ url: session.url });
      } catch (error) {
        return res.status(400).json({ error: "Invalid price ID" });
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Handle Stripe webhook
  static async handleWebhook(req, res) {
    const signature = req.headers["stripe-signature"];
    const stripe = await StripeController.initializeStripe();
    let eventObject;
    try {
      const rawBody = req.body;

      const settings = await ApiSetting.findOne({
        where: { serviceName: "Stripe" },
      });

      if (!settings) {
        throw new Error("Stripe settings not found in database");
      }

      eventObject = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        settings.webhookSecret
      );
    } catch (err) {
      console.error("Webhook error:", err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (eventObject.type) {
      case "checkout.session.completed":
        await StripeController.handleCheckoutSessionCompletedWebhook(
          eventObject
        );
        break;
      case "invoice.payment_succeeded":
        await StripeController.handleInvoicePaymentSucceededWebhook(
          eventObject
        );
        break;
      default:
        console.log(`Unhandled event type ${eventObject.type}`);
    }

    res.json({ received: true });
  }

  static async handleCheckoutSessionCompletedWebhook(eventObject) {
    try {
      const stripe = await StripeController.initializeStripe();

      const session = eventObject.data.object;
      const userId = session.metadata.userId;

      if (!userId) {
        console.error("Missing user ID in session metadata");
        return;
      }

      const creditsToAdd = parseInt(session.metadata?.credits || 0);

      const user = await User.findByPk(userId);
      if (!user) {
        console.error("User not found:", userId);
        return;
      }

      user.credits += creditsToAdd;
      user.type = "pro";
      user.sessionId = session.id;
      await user.save();

      console.log(
        `Payment successful for user ${userId}, added ${creditsToAdd} credits`
      );
    } catch (error) {
      console.error(
        "Error handling checkout session completed webhook:",
        error
      );
    }
  }

  static async handleInvoicePaymentSucceededWebhook(eventObject) {
    try {
      const stripe = await StripeController.initializeStripe();

      const invoice = eventObject.data.object;
      const customerId = invoice.customer;

      // Get the subscription to find the product
      const subscriptionId = invoice.subscription;
      if (!subscriptionId) {
        console.error("No subscription found in invoice:", invoice.id);
        return;
      }

      // Retrieve the subscription with expanded product data
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["items.data.plan.product", "customer"],
      });

      const product = subscription.items.data[0].plan.product;

      if (!product) {
        console.error("Product not found in subscription:", subscriptionId);
        return;
      }
      // Get the credits amount from product metadata
      const creditsToAdd = parseInt(product.metadata?.credits || 0, 10);

      if (!creditsToAdd) {
        console.log("No credits to add for product:", product.id);
        return;
      }

      const user = await User.findOne({
        where: { stripeCustomerId: customerId },
      });

      if (!user) {
        console.error("User not found:", customerId);
        return;
      }
      if (user.sessionId) {
        user.sessionId = null;
        await user.save();
        return;
      }

      user.credits += creditsToAdd;
      user.type = "pro";
      await user.save();

      console.log(
        `User ${user.id} upgraded to pro and added ${creditsToAdd} credits after schedule completion`
      );
    } catch (error) {
      console.error(
        "Error handling subscription schedule completed webhook:",
        error
      );
    }
  }

  static async handleSuccessfulPayment(req, res) {
    try {
      const stripe = await StripeController.initializeStripe();

      // Handle being called from API endpoint (with req and res)
      const { session_id } = req.query;

      if (!session_id) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      const session = await stripe.checkout.sessions.retrieve(session_id);
      const paymentDetails = await stripe.checkout.sessions.listLineItems(
        session_id
      );
      const userId = session.metadata.userId;
      const productId = session.metadata.productId;

      // Get product details
      const product = await stripe.products.retrieve(productId);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Get the credits amount, either from product metadata or session metadata
      const creditsToAdd = parseInt(
        product.metadata?.credits || session.metadata?.credits || 0,
        10
      );

      res.json({
        message: "Payment successful",
        paymentDetails,
        creditsAdded: creditsToAdd,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          images: product.images,
          metadata: product.metadata,
        },
        receiptUrl: session.receipt_url,
        userId,
        productId,
      });
    } catch (error) {
      console.error("Error handling successful payment:", error);
      if (res) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
  // Handle subscription cancellation
  static async handleSubscriptionCancelled(req, res) {
    try {
      const stripe = await StripeController.initializeStripe();

      // Handle being called from a webhook
      if (!res && req) {
        const subscription = req; // In this case, req is the subscription object

        try {
          if (!subscription) {
            console.error("No subscription provided to webhook handler");
            return;
          }

          // Find the customer
          const customer = await stripe.customers.retrieve(
            subscription.customer
          );

          // Find user by Stripe customer ID
          const user = await User.findOne({
            where: { stripeCustomerId: subscription.customer },
          });

          if (user) {
            await user.update({ type: "normal" });
            console.log(
              `User ${user.id} downgraded to normal after subscription cancellation`
            );
          } else if (customer.email) {
            // Try to find by email as fallback
            const updatedCount = await User.update(
              { type: "normal" },
              { where: { email: customer.email } }
            );
            console.log(
              `${updatedCount[0]} users downgraded by email ${customer.email} after subscription cancellation`
            );
          } else {
            console.error(
              `Could not find user for subscription ${subscription.id}, customer ${subscription.customer}`
            );
          }

          return;
        } catch (error) {
          console.error(
            "Error handling webhook subscription cancellation:",
            error
          );
          return;
        }
      }

      // Handle being called from API endpoint
      const { subscriptionId } = req.params;

      if (!subscriptionId) {
        return res.status(400).json({ error: "Subscription ID is required" });
      }

      // Retrieve the subscription
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      // Cancel the subscription
      const cancelledSubscription = await stripe.subscriptions.cancel(
        subscriptionId
      );

      // Find the customer
      const customer = await stripe.customers.retrieve(subscription.customer);

      // Find user by Stripe customer ID
      const user = await User.findOne({
        where: { stripeCustomerId: subscription.customer },
      });

      if (user) {
        await user.update({ type: "normal" });
      } else {
        // Try to find by email as fallback
        await User.update(
          { type: "normal" },
          { where: { email: customer.email } }
        );
      }

      // Send success response
      res.json({
        message: "Subscription cancelled successfully",
        subscription: {
          id: cancelledSubscription.id,
          status: cancelledSubscription.status,
          cancelAt: cancelledSubscription.cancel_at,
          customerId: cancelledSubscription.customer,
        },
      });
    } catch (error) {
      console.error("Error handling subscription cancellation:", error);
      if (res) {
        res.status(500).json({
          error: "Failed to cancel subscription",
          details: error.message,
        });
      }
    }
  }

  // Create customer and add balance in one API
  static async createCustomerWithBalance(req, res) {
    try {
      const stripe = await StripeController.initializeStripe();

      const { email, name, amount, currency = "usd" } = req.body;

      if (!email || !amount) {
        return res.status(400).json({ error: "Email and amount are required" });
      }

      // Create customer
      const customer = await stripe.customers.create({
        email,
        name,
        description: "Customer created via API",
      });

      // Add balance
      const balanceTransaction =
        await stripe.customers.createBalanceTransaction(customer.id, {
          amount: Math.round(amount * 100), // Convert to cents
          currency,
        });

      // Update or create user with Stripe customer ID
      const [user, created] = await User.findOrCreate({
        where: { email },
        defaults: {
          email,
          name,
          username: email.split("@")[0],
          stripeCustomerId: customer.id,
          role: "user",
          credits: amount,
          isActive: true,
        },
      });

      if (!created) {
        await user.update({
          stripeCustomerId: customer.id,
          credits: user.credits + amount,
        });
      }

      res.json({
        customer,
        balanceTransaction,
        user: {
          id: user.id,
          email: user.email,
          credits: user.credits,
        },
      });
    } catch (error) {
      console.error("Error creating customer with balance:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getTransactions(req, res) {
    try {
      const stripe = await StripeController.initializeStripe();

      const transactions = await stripe.charges.list();

      // Process transactions to include user information where customer ID exists
      const processedTransactions = await Promise.all(
        transactions.data.map(async (transaction) => {
          // If transaction has a customer ID, find the corresponding user
          if (transaction.customer) {
            const user = await User.findOne({
              where: { stripeCustomerId: transaction.customer },
              attributes: ["id", "email", "name", "username"], // Include only necessary fields
            });

            if (user) {
              // Add user info to the transaction
              return {
                ...transaction,
                user: user.toJSON(),
              };
            }
          }
          // Return original transaction if no customer ID or user not found
          return transaction;
        })
      );

      // If called with res parameter, send response
      if (res) {
        return res.json(processedTransactions);
      }

      // If called without res parameter, return the data
      return processedTransactions;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      if (res) {
        return res.status(500).json({ error: error.message });
      }
      throw error;
    }
  }

  // Toggle product active status
  static async toggleProductStatus(req, res) {
    try {
      const stripe = await StripeController.initializeStripe();

      const { id } = req.params;

      // Validate product ID
      if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      // First, get the current product
      const product = await stripe.products.retrieve(id);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Toggle the active status
      const updatedProduct = await stripe.products.update(id, {
        active: !product.active,
      });

      // Fetch the complete updated product with price data
      const productWithPrice = await stripe.products.retrieve(id, {
        expand: ["default_price"],
      });

      const defaultPrice = productWithPrice.default_price;

      // Parse features from metadata if available
      let features = [];
      let featured = false;

      if (productWithPrice.metadata) {
        if (productWithPrice.metadata.features) {
          try {
            features = JSON.parse(productWithPrice.metadata.features);
          } catch (e) {
            console.error("Error parsing features:", e);
          }
        }

        if (productWithPrice.metadata.featured) {
          featured = productWithPrice.metadata.featured === "true";
        }
      }

      // Return standardized response
      const response = {
        id: productWithPrice.id,
        priceId: defaultPrice ? defaultPrice.id : null,
        name: productWithPrice.name,
        description: productWithPrice.description || "",
        unitAmount: defaultPrice ? defaultPrice.unit_amount : 0,
        unitAmountDecimal: defaultPrice ? defaultPrice.unit_amount / 100 : 0,
        currency: defaultPrice ? defaultPrice.currency : "usd",
        recurring: defaultPrice && defaultPrice.recurring ? true : false,
        interval:
          defaultPrice && defaultPrice.recurring
            ? defaultPrice.recurring.interval
            : null,
        features,
        featured,
        active: productWithPrice.active,
        images: productWithPrice.images,
        metadata: productWithPrice.metadata,
      };

      res.json(response);
    } catch (error) {
      console.error("Error toggling product status:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Handle subscription renewal - add credits to user's account when subscription renews
  static async handleSubscriptionRenewal(invoice) {
    try {
      const stripe = await StripeController.initializeStripe();

      if (!invoice || invoice.status !== "paid" || !invoice.subscription) {
        return;
      }

      // Only process subscription invoices
      if (invoice.billing_reason !== "subscription_cycle") {
        return;
      }

      const subscriptionId = invoice.subscription;
      const customerId = invoice.customer;

      // Get the subscription to find the product
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["items.data.price.product"],
      });

      if (!subscription || subscription.items.data.length === 0) {
        console.error("Subscription not found or no items:", subscriptionId);
        return;
      }

      // Get the product from the subscription
      const product = subscription.items.data[0].price.product;

      if (!product) {
        console.error("Product not found in subscription:", subscriptionId);
        return;
      }

      // Get the credits amount from product metadata
      const creditsToAdd = parseInt(product.metadata?.credits || 0, 10);

      if (!creditsToAdd) {
        console.log("No credits to add for product:", product.id);
        return;
      }

      // Find user by Stripe customer ID
      const user = await User.findOne({
        where: { stripeCustomerId: customerId },
      });

      if (!user) {
        console.error("User not found for customer:", customerId);
        return;
      }

      // Add credits to user
      await user.update({
        credits: sequelize.literal(`credits + ${creditsToAdd}`),
      });

      console.log(
        `Added ${creditsToAdd} credits to user ${user.id} for subscription renewal`
      );
    } catch (error) {
      console.error("Error handling subscription renewal:", error);
    }
  }

  // Handle payment failure
  static async handlePaymentFailed(invoice) {
    try {
      if (!invoice || !invoice.subscription || !invoice.customer) {
        return;
      }
      const stripe = await StripeController.initializeStripe();

      const subscriptionId = invoice.subscription;
      const customerId = invoice.customer;
      const attemptCount = invoice.attempt_count;

      // Find user by Stripe customer ID
      const user = await User.findOne({
        where: { stripeCustomerId: customerId },
      });

      if (!user) {
        console.error("User not found for customer:", customerId);
        return;
      }

      // Get the subscription to check its status and details
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // Log payment failure for monitoring
      console.log(
        `Payment failed for subscription ${subscriptionId}, user ${user.id}, attempt ${attemptCount}`
      );

      // If this is a final attempt failure (based on Stripe retry settings)
      // You might want to take additional actions based on your business logic
      if (subscription.status === "past_due" && attemptCount >= 3) {
        // You could update user status, send alerts, or take other actions
        // For example, you could temporarily adjust user access:

        // await user.update({
        //     paymentWarning: true,
        //     paymentFailedAt: new Date()
        // });

        // Send notification to user (implement your notification system)
        console.log(`Final payment attempt failed for user ${user.id}`);
      }
    } catch (error) {
      console.error("Error handling payment failure:", error);
    }
  }

  // Add free monthly credits to active users
  static async addFreeMonthlyCredits() {
    try {
      // Find users who have logged in within the last month
      const currentMonth = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(currentMonth.getMonth() - 1);
      console.log("Checking for users who logged in after:", oneMonthAgo);

      const activeUsers = await User.findAll({
        where: {
          lastLogin: {
            [Op.gt]: oneMonthAgo, // Changed from Op.lt to Op.gt to find users who logged in AFTER one month ago
          },
          type: "normal", // Only add credits to normal users
          isActive: true,
          isEmailVerified: true,
        },
      });

      console.log(
        `Found ${activeUsers.length} active users who logged in within the last month`
      );

      // Add credits to each active user
      for (const user of activeUsers) {
        await user.update({
          credits: sequelize.literal(`credits + 50`),
        });
        console.log(
          `Added 50 credits to user ${user.id} (last login: ${user.lastLogin})`
        );
      }

      return activeUsers.length;
    } catch (error) {
      console.error("Error adding free monthly credits:", error);
      throw error;
    }
  }

  // Get total revenue
  static async getTotalRevenue() {
    try {
      const stripe = await StripeController.initializeStripe();
      const charges = await stripe.charges.list({
        limit: 100,
        status: "succeeded",
      });

      const totalRevenue = charges.data.reduce((sum, charge) => {
        return sum + charge.amount / 100; // Convert from cents to dollars
      }, 0);

      return totalRevenue;
    } catch (error) {
      console.error("Error calculating total revenue:", error);
      return 0;
    }
  }

  // Get monthly revenue
  static async getMonthlyRevenue() {
    try {
      const stripe = await StripeController.initializeStripe();
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const charges = await stripe.charges.list({
        limit: 100,
        status: "succeeded",
        created: {
          gte: Math.floor(startOfMonth.getTime() / 1000),
        },
      });

      const monthlyRevenue = charges.data.reduce((sum, charge) => {
        return sum + charge.amount / 100; // Convert from cents to dollars
      }, 0);

      return monthlyRevenue;
    } catch (error) {
      console.error("Error calculating monthly revenue:", error);
      return 0;
    }
  }
}

export default StripeController;
