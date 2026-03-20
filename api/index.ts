import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express, { type RequestHandler } from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import Stripe from "stripe";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl:
    process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

// =====================================================
// EMAIL HELPER
// =====================================================

/** Shared SMTP transporter — uses the same HostGator credentials for all emails */
function createMailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "mail.bolsadecafe.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: process.env.SMTP_SECURE !== "false", // default true (SSL on 465)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // allow self-signed certs on shared hosting
    },
  });
}

/**
 * Send subscription confirmation email
 */
async function sendSubscriptionConfirmationEmail(
  userEmail: string,
  userName: string,
  subscriptionDetails: {
    planName: string;
    weight: string;
    price: string;
    grindType: string;
    nextDelivery: string;
    address: {
      full_name: string;
      street_address: string;
      street_address_2?: string;
      city: string;
      state: string;
      postal_code: string;
      phone?: string;
    };
  },
): Promise<void> {
  try {
    const transporter = createMailTransporter();

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error(
        "❌ SMTP credentials not configured — skipping confirmation email",
      );
      return;
    }

    await transporter.verify();

    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Suscripción Confirmada!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #fef9f5 0%, #fff 100%); padding: 40px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #152a63 0%, #1d3c89 100%); padding: 36px 30px; text-align: center;">
            <img src="https://disruptinglabs.com/data/bolsadecafe/assets/images/logo_white.png" alt="Bolsadecafé" style="height: 44px; width: auto; display: block; margin: 0 auto 14px auto;" />
            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">¡Suscripción Confirmada!</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 15px;">Tu café está en camino</p>
          </td>
        </tr>

        <!-- Welcome Message -->
        <tr>
          <td style="padding: 40px 30px 20px;">
            <p style="font-size: 18px; color: #1a1a1a; margin: 0 0 10px 0; line-height: 1.6;">¡Hola ${userName}! 👋</p>
            <p style="font-size: 16px; color: #666; margin: 0; line-height: 1.6;">Gracias por suscribirte a <strong>Bolsa de Café</strong>. Tu suscripción ha sido activada exitosamente y pronto recibirás tu primer envío de café de especialidad.</p>
          </td>
        </tr>

        <!-- Subscription Details -->
        <tr>
          <td style="padding: 0 30px 20px;">
            <div style="background: linear-gradient(135deg, #f7f8fc 0%, #eef1f8 100%); border: 2px solid #c8d0e8; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
              <h2 style="color: #1a3578; margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">📦 Detalles de tu Suscripción</h2>
              
              <table width="100%" cellpadding="8" cellspacing="0">
                <tr>
                  <td style="color: #666; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #c8d0e8;">Plan:</td>
                  <td style="color: #1a1a1a; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0; border-bottom: 1px solid #c8d0e8;">${subscriptionDetails.planName}</td>
                </tr>
                <tr>
                  <td style="color: #666; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #c8d0e8;">Cantidad:</td>
                  <td style="color: #1a1a1a; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0; border-bottom: 1px solid #c8d0e8;">${subscriptionDetails.weight}</td>
                </tr>
                <tr>
                  <td style="color: #666; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #c8d0e8;">Molido:</td>
                  <td style="color: #1a1a1a; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0; border-bottom: 1px solid #c8d0e8;">${subscriptionDetails.grindType}</td>
                </tr>
                <tr>
                  <td style="color: #666; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #c8d0e8;">Precio Mensual:</td>
                  <td style="color: #1a3578; font-size: 18px; font-weight: 700; text-align: right; padding: 8px 0; border-bottom: 1px solid #c8d0e8;">$${subscriptionDetails.price} MXN</td>
                </tr>
                <tr>
                  <td style="color: #666; font-size: 14px; padding: 8px 0;">Próxima entrega:</td>
                  <td style="color: #1a1a1a; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${subscriptionDetails.nextDelivery}</td>
                </tr>
              </table>
            </div>

            <!-- Delivery Address -->
            <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px;">
              <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">🚚 Dirección de Entrega</h2>
              <p style="margin: 0; color: #1a1a1a; font-size: 15px; line-height: 1.6; font-weight: 600;">${subscriptionDetails.address.full_name}</p>
              <p style="margin: 8px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                ${subscriptionDetails.address.street_address}<br>
                ${subscriptionDetails.address.street_address_2 ? subscriptionDetails.address.street_address_2 + "<br>" : ""}
                ${subscriptionDetails.address.city}, ${subscriptionDetails.address.state} ${subscriptionDetails.address.postal_code}<br>
                ${subscriptionDetails.address.phone ? "Tel: " + subscriptionDetails.address.phone : ""}
              </p>
            </div>
          </td>
        </tr>

        <!-- Benefits -->
        <tr>
          <td style="padding: 0 30px 30px;">
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #86efac; border-radius: 12px; padding: 20px;">
              <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 16px; font-weight: 700;">✓ Beneficios Incluidos</h3>
              <ul style="margin: 0; padding: 0 0 0 20px; color: #15803d; font-size: 14px; line-height: 2;">
                <li>Café 100% mexicano de especialidad</li>
                <li>Envío gratis en toda la República</li>
                <li>Sin compromiso - cancela cuando quieras</li>
                <li>Frescura garantizada - tostado artesanal</li>
              </ul>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding: 0 30px 40px; text-align: center;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" style="display: inline-block; background: linear-gradient(135deg, #1a3578 0%, #1d3c89 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(26, 53, 120, 0.25);">Ver Mi Cuenta</a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">¿Tienes preguntas? Estamos aquí para ayudarte</p>
            <p style="margin: 0; color: #1a3578; font-size: 14px; font-weight: 600;">
              <a href="mailto:hola@bolsadecafe.com" style="color: #1a3578; text-decoration: none;">hola@bolsadecafe.com</a>
            </p>
            <p style="margin: 16px 0 0 0; color: #999; font-size: 12px;">© 2026 Bolsa de Café. Todos los derechos reservados.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    await transporter.sendMail({
      from:
        process.env.SMTP_FROM || `"Bolsa de Café" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: "☕ ¡Tu suscripción a Bolsa de Café está confirmada!",
      html: htmlTemplate,
    });

    console.log(`✅ Subscription confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending subscription confirmation email:", error);
    // Don't throw error - email failure shouldn't block subscription creation
  }
}

/**
 * Send verification email with code
 */
async function sendVerificationEmail(
  email: string,
  code: number,
  firstName: string,
): Promise<void> {
  try {
    console.log("📧 Sending verification email");
    console.log("   Email:", email);
    console.log("   Name:", firstName);

    const transporter = createMailTransporter();

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error("❌ SMTP credentials not configured!");
      return;
    }

    await transporter.verify();

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f2f2f2;
            padding: 20px;
            margin: 0;
          }
          .container { 
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px 30px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #152a63 0%, #1d3c89 100%);
            color: #f2f2f2;
            padding: 30px 20px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 30px;
          }
          .header img {
            height: 40px;
            width: auto;
            margin-bottom: 10px;
            display: block;
            margin-left: auto;
            margin-right: auto;
          }
          .header p {
            margin: 0;
            font-size: 16px;
            opacity: 0.85;
          }
          .content {
            color: #545454;
            line-height: 1.6;
          }
          .greeting {
            font-size: 20px;
            color: #1a3578;
            margin: 0 0 20px 0;
            font-weight: 500;
          }
          .code { 
            font-size: 42px;
            font-weight: bold;
            color: #1a3578;
            text-align: center;
            padding: 30px 20px;
            background: linear-gradient(135deg, #eef1f8 0%, #f7f8fc 100%);
            border-radius: 8px;
            margin: 30px 0;
            letter-spacing: 10px;
            border: 2px solid #c8d0e8;
          }
          .info {
            background-color: #f7f8fc;
            padding: 15px 20px;
            border-radius: 6px;
            border-left: 4px solid #1d3c89;
            margin: 20px 0;
          }
          .info p {
            margin: 0;
            color: #545454;
            font-size: 14px;
          }
          .footer { 
            color: #808080;
            font-size: 13px;
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #d0dae6;
          }
          .footer strong {
            color: #1a3578;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://disruptinglabs.com/data/bolsadecafe/assets/images/logo_white.png" alt="Bolsadecafé" />
            <p>Código de Verificación</p>
          </div>
          <div class="content">
            <p class="greeting">Hola ${firstName},</p>
            <p>Tu código de verificación es:</p>
            <div class="code">${code}</div>
            <div class="info">
              <p><strong>⏱️ Validez:</strong> Este código expirará en <strong>15 minutos</strong></p>
            </div>
            <p style="margin-top: 20px; font-size: 14px;">Si no solicitaste este código, puedes ignorar este correo de forma segura.</p>
          </div>
          <div class="footer">
            <p><strong>Bolsa de Café</strong> - Café de calidad a tu puerta</p>
            <p style="margin-top: 8px;">© ${new Date().getFullYear()} Bolsa de Café. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from:
        process.env.SMTP_FROM || `"Bolsa de Café" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `${code} es tu código de verificación`,
      html: emailBody,
    });

    console.log("✅ Verification email sent successfully!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}

// =====================================================
// ROUTE HANDLERS
// =====================================================

/**
 * GET /api/ping
 * Health check endpoint with database connection test
 */
const handlePing: RequestHandler = async (_req, res) => {
  try {
    // Test database connection
    await pool.query("SELECT 1");
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({
      message: ping,
      database: "connected",
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      message: "pong",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/plans
 * Get all active subscription plans from database with features
 */
const handleGetPlans: RequestHandler = async (_req, res) => {
  try {
    // Fetch plans
    const [plans] = await pool.query<any[]>(
      `SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY price_mxn ASC`,
    );

    // Fetch features for each plan
    const plansWithFeatures = await Promise.all(
      plans.map(async (plan) => {
        const [features] = await pool.query<any[]>(
          `SELECT feature_text FROM plan_features 
           WHERE plan_id = ? AND is_active = 1 
           ORDER BY sort_order ASC`,
          [plan.id],
        );

        return {
          ...plan,
          features: features.map((f) => f.feature_text),
        };
      }),
    );

    console.log("[API] Fetched plans with features:", plansWithFeatures);
    res.json({ plans: plansWithFeatures });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({
      error: "Failed to fetch subscription plans",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/grind-types
 * Get all active grind types from database
 */
const handleGetGrindTypes: RequestHandler = async (_req, res) => {
  try {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM grind_types WHERE is_active = 1 ORDER BY sort_order ASC`,
    );
    res.json({ grindTypes: rows });
  } catch (error) {
    console.error("Error fetching grind types:", error);
    res.status(500).json({
      error: "Failed to fetch grind types",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/states
 * Get all active Mexico states from database
 */
const handleGetStates: RequestHandler = async (_req, res) => {
  try {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM mexico_states WHERE is_active = 1 ORDER BY name ASC`,
    );
    res.json({ states: rows });
  } catch (error) {
    console.error("Error fetching states:", error);
    res.status(500).json({
      error: "Failed to fetch states",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/auth/send-code
 * Send verification code to user email
 */
const handleSendCode: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const [users] = await pool.query<any[]>(
      "SELECT * FROM users WHERE email = ? AND is_active = 1",
      [normalizedEmail],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        message: "user_not_found",
      });
    }

    const user = users[0];

    // Delete old sessions for this email
    await pool.query("DELETE FROM user_sessions WHERE email = ?", [
      normalizedEmail,
    ]);

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000);

    // Create new session with 15-minute expiry
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await pool.query(
      `INSERT INTO user_sessions (user_id, email, verification_code, is_active, expires_at) 
       VALUES (?, ?, ?, TRUE, ?)`,
      [user.id, normalizedEmail, code, expiresAt],
    );

    // Send email with code
    await sendVerificationEmail(
      normalizedEmail,
      code,
      user.full_name.split(" ")[0],
    );

    res.json({
      success: true,
      message: "Verification code sent to your email",
      debug_code: process.env.NODE_ENV === "development" ? code : undefined,
    });
  } catch (error) {
    console.error("Error sending verification code:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send verification code",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/auth/verify-code
 * Verify code and create user session
 */
const handleVerifyCode: RequestHandler = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: "Email and code are required",
      });
    }

    // Check if user exists
    const [users] = await pool.query<any[]>(
      "SELECT * FROM users WHERE email = ? AND is_active = 1",
      [email],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const user = users[0];

    // Check if code is valid
    const [sessions] = await pool.query<any[]>(
      `SELECT * FROM user_sessions 
       WHERE user_id = ? AND verification_code = ? AND is_active = TRUE 
       AND expires_at > NOW()`,
      [user.id, parseInt(code)],
    );

    if (sessions.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired verification code",
      });
    }

    // Generate session token (JWT)
    const sessionToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        userType: "user",
      },
      JWT_SECRET,
      { expiresIn: "30d" },
    );

    // Mark email as verified
    await pool.query("UPDATE users SET email_verified = 1 WHERE id = ?", [
      user.id,
    ]);

    // Deactivate used session
    await pool.query(
      "UPDATE user_sessions SET is_active = FALSE WHERE id = ?",
      [sessions[0].id],
    );

    trackVisit(req, "auth_success", "/");

    res.json({
      success: true,
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        email_verified: true,
      },
    });
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify code",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/auth/register
 * Register new user and send verification code
 */
const handleRegister: RequestHandler = async (req, res) => {
  try {
    const { email, full_name, phone } = req.body;

    if (!email || !full_name || !phone) {
      return res.status(400).json({
        success: false,
        error: "Email, full name, and phone are required",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const [existingUsers] = await pool.query<any[]>(
      "SELECT * FROM users WHERE email = ?",
      [normalizedEmail],
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Create new user
    const [result] = await pool.query<any>(
      `INSERT INTO users (email, full_name, phone, email_verified, is_active) 
       VALUES (?, ?, ?, 0, 1)`,
      [normalizedEmail, full_name, phone],
    );

    const userId = result.insertId;

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000);

    // Create new session with 15-minute expiry
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await pool.query(
      `INSERT INTO user_sessions (user_id, email, verification_code, is_active, expires_at) 
       VALUES (?, ?, ?, TRUE, ?)`,
      [userId, normalizedEmail, code, expiresAt],
    );

    // Send email with code
    await sendVerificationEmail(normalizedEmail, code, full_name.split(" ")[0]);

    res.json({
      success: true,
      message: "User registered. Verification code sent to your email.",
      debug_code: process.env.NODE_ENV === "development" ? code : undefined,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to register user",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/auth/validate
 * Validate user session token
 */
const handleValidateSession: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No session token provided",
      });
    }

    const sessionToken = authHeader.substring(7);

    try {
      const decoded = jwt.verify(sessionToken, JWT_SECRET) as any;

      if (decoded.userType !== "user") {
        return res.status(401).json({
          success: false,
          error: "Invalid session type",
        });
      }

      // Get user details
      const [users] = await pool.query<any[]>(
        "SELECT * FROM users WHERE id = ? AND is_active = 1",
        [decoded.userId],
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          error: "User not found or inactive",
        });
      }

      const user = users[0];

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          email_verified: Boolean(user.email_verified),
        },
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired session",
      });
    }
  } catch (error) {
    console.error("Error validating session:", error);
    res.status(500).json({
      success: false,
      error: "Failed to validate session",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/auth/logout
 * Logout user and invalidate sessions
 */
const handleLogout: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(200).json({ success: true });
    }

    const sessionToken = authHeader.substring(7);

    try {
      const decoded = jwt.verify(sessionToken, JWT_SECRET) as any;

      if (decoded.userId) {
        // Delete all sessions for this user
        await pool.query("DELETE FROM user_sessions WHERE user_id = ?", [
          decoded.userId,
        ]);
      }
    } catch (error) {
      // Token already invalid, no problem
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({
      success: false,
      error: "Failed to logout",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/blog/posts
 * Get all published blog posts with pagination
 */
const handleGetBlogPosts: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.perPage as string) || 10;
    const offset = (page - 1) * perPage;

    // Get total count
    const [countRows] = await pool.query<any[]>(
      `SELECT COUNT(*) as total FROM blog_posts WHERE status = 'published'`,
    );
    const total = countRows[0].total;

    // Get posts with author info
    const [posts] = await pool.query<any[]>(
      `SELECT 
        bp.*,
        a.name as author_name,
        a.email as author_email
       FROM blog_posts bp
       JOIN admins a ON bp.author_id = a.id
       WHERE bp.status = 'published'
       ORDER BY bp.published_at DESC
       LIMIT ? OFFSET ?`,
      [perPage, offset],
    );

    res.json({
      posts,
      total,
      page,
      perPage,
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({
      error: "Failed to fetch blog posts",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/blog/posts/:slug
 * Get single blog post by slug
 */
const handleGetBlogPostBySlug: RequestHandler = async (req, res) => {
  try {
    const { slug } = req.params;

    const [posts] = await pool.query<any[]>(
      `SELECT 
        bp.*,
        a.name as author_name,
        a.email as author_email
       FROM blog_posts bp
       JOIN admins a ON bp.author_id = a.id
       WHERE bp.slug = ? AND bp.status = 'published'`,
      [slug],
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ post: posts[0] });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    res.status(500).json({
      error: "Failed to fetch blog post",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/business-inquiries
 * Submit business inquiry contact form
 */
const handleCreateBusinessInquiry: RequestHandler = async (req, res) => {
  try {
    const {
      company_name,
      contact_name,
      email,
      phone,
      monthly_consumption,
      employees_count,
      current_supplier,
      message,
    } = req.body;

    // Validation
    if (!company_name || !contact_name || !email || !phone) {
      return res.status(400).json({
        error:
          "Los campos company_name, contact_name, email y phone son requeridos",
      });
    }

    if (!monthly_consumption || !employees_count) {
      return res.status(400).json({
        error:
          "Los campos monthly_consumption y employees_count son requeridos",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Email inválido",
      });
    }

    // Insert into database
    const [result] = await pool.query<any>(
      `INSERT INTO business_inquiries (
        company_name,
        contact_name,
        email,
        phone,
        monthly_consumption,
        employees_count,
        current_supplier,
        message,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        company_name,
        contact_name,
        email,
        phone,
        monthly_consumption,
        employees_count,
        current_supplier || null,
        message || null,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Solicitud de negocio recibida exitosamente",
      inquiry_id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating business inquiry:", error);
    res.status(500).json({
      error: "Error al procesar la solicitud",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/help/contact
 * Submit a Centro de Ayuda contact form
 */
const handleSubmitContact: RequestHandler = async (req, res) => {
  try {
    const { name, email, topic, subject, message } = req.body;

    // Validation
    if (!name || !email || !topic || !subject || !message) {
      return res.status(400).json({
        error:
          "Los campos name, email, topic, subject y message son requeridos",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    const validTopics = [
      "suscripcion",
      "pagos",
      "envios",
      "cuenta",
      "producto",
      "otro",
    ];
    if (!validTopics.includes(topic)) {
      return res.status(400).json({ error: "Tema no válido" });
    }

    if (message.length > 2000) {
      return res
        .status(400)
        .json({ error: "El mensaje no puede superar 2000 caracteres" });
    }

    const [result] = await pool.query<any>(
      `INSERT INTO contact_submissions (name, email, topic, subject, message, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        topic,
        subject.trim(),
        message.trim(),
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Tu mensaje fue enviado. Te responderemos pronto.",
      submissionId: result.insertId,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return res.status(500).json({
      error: "Error al enviar el mensaje",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/demo
 * Demo endpoint
 */
const handleDemo: RequestHandler = (_req, res) => {
  res.status(200).json({
    message: "Hello from Bolsa de Café API",
  });
};

// =====================================================
// USER DASHBOARD ENDPOINTS
// =====================================================

/** Helper: extract userId from Bearer JWT, returns null on failure */
function extractUserId(req: any, res: any): number | null {
  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader?.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ success: false, error: "No session token provided" });
    return null;
  }
  try {
    const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET) as any;
    if (decoded.userType !== "user") {
      res.status(401).json({ success: false, error: "Invalid session type" });
      return null;
    }
    return decoded.userId as number;
  } catch {
    res
      .status(401)
      .json({ success: false, error: "Invalid or expired session" });
    return null;
  }
}

/**
 * GET /api/user/subscription
 * Returns the authenticated user's active subscription with plan, grind type, and address.
 */
const handleGetMySubscription: RequestHandler = async (req, res) => {
  const userId = extractUserId(req, res);
  if (!userId) return;

  try {
    const [rows] = await pool.query<any[]>(
      `SELECT
        s.id, s.status, s.stripe_subscription_id,
        s.current_period_start, s.current_period_end,
        s.cancel_at_period_end, s.cancelled_at, s.created_at,
        sp.id AS plan_id, sp.name AS plan_name, sp.weight AS plan_weight, sp.price_mxn AS plan_price,
        gt.id AS grind_type_id, gt.name AS grind_type_name,
        a.id AS addr_id, a.full_name AS addr_full_name,
        a.street_address, a.street_address_2,
        a.apartment_number, a.delivery_instructions,
        a.city, ms.name AS state, a.state_id,
        a.postal_code, a.phone AS addr_phone
       FROM subscriptions s
       JOIN subscription_plans sp ON s.plan_id = sp.id
       JOIN grind_types gt ON s.grind_type_id = gt.id
       LEFT JOIN addresses a ON s.shipping_address_id = a.id
       LEFT JOIN mexico_states ms ON a.state_id = ms.id
       WHERE s.user_id = ? AND s.status NOT IN ('cancelled')
       ORDER BY s.created_at DESC`,
      [userId],
    );

    if (rows.length === 0) {
      return res.json({ success: true, subscriptions: [] });
    }

    const mapRow = (r: any) => ({
      id: r.id,
      status: r.status,
      planId: r.plan_id,
      planName: r.plan_name,
      planWeight: r.plan_weight,
      planPrice: Number(r.plan_price),
      grindTypeId: r.grind_type_id,
      grindTypeName: r.grind_type_name,
      stripeSubscriptionId: r.stripe_subscription_id,
      currentPeriodStart: r.current_period_start,
      currentPeriodEnd: r.current_period_end,
      cancelAtPeriodEnd: Boolean(r.cancel_at_period_end),
      cancelledAt: r.cancelled_at,
      createdAt: r.created_at,
      shippingAddress: r.addr_id
        ? {
            id: r.addr_id,
            fullName: r.addr_full_name,
            streetAddress: r.street_address,
            streetAddress2: r.street_address_2,
            apartmentNumber: r.apartment_number,
            deliveryInstructions: r.delivery_instructions,
            city: r.city,
            state: r.state,
            stateId: r.state_id,
            postalCode: r.postal_code,
            phone: r.addr_phone,
          }
        : null,
    });

    return res.json({
      success: true,
      subscriptions: rows.map(mapRow),
    });
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch subscription" });
  }
};

/**
 * PUT /api/user/subscription/address
 * Update shipping address for a subscription.
 */
const handleUpdateSubscriptionAddress: RequestHandler = async (req, res) => {
  const userId = extractUserId(req, res);
  if (!userId) return;

  const {
    subscriptionId,
    fullName,
    streetAddress,
    streetAddress2,
    apartmentNumber,
    deliveryInstructions,
    city,
    stateId,
    postalCode,
    phone,
  } = req.body;

  if (
    !subscriptionId ||
    !fullName ||
    !streetAddress ||
    !city ||
    !stateId ||
    !postalCode
  ) {
    return res
      .status(400)
      .json({ success: false, error: "Missing required address fields" });
  }

  try {
    // Verify subscription belongs to user
    const [subs] = await pool.query<any[]>(
      "SELECT id, shipping_address_id FROM subscriptions WHERE id = ? AND user_id = ?",
      [subscriptionId, userId],
    );
    if (subs.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Subscription not found" });
    }

    const sub = subs[0];

    if (sub.shipping_address_id) {
      // Update existing address
      await pool.query(
        `UPDATE addresses SET full_name=?, street_address=?, street_address_2=?,
         apartment_number=?, delivery_instructions=?,
         city=?, state_id=?, postal_code=?, phone=?, updated_at=NOW()
         WHERE id=? AND user_id=?`,
        [
          fullName,
          streetAddress,
          streetAddress2 || null,
          apartmentNumber || null,
          deliveryInstructions || null,
          city,
          stateId,
          postalCode,
          phone || null,
          sub.shipping_address_id,
          userId,
        ],
      );
    } else {
      // Create new address and link to subscription
      const [result] = await pool.query<any>(
        `INSERT INTO addresses (user_id, address_type, full_name, street_address, street_address_2, apartment_number, delivery_instructions, city, state_id, postal_code, phone, is_default)
         VALUES (?, 'shipping', ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          userId,
          fullName,
          streetAddress,
          streetAddress2 || null,
          apartmentNumber || null,
          deliveryInstructions || null,
          city,
          stateId,
          postalCode,
          phone || null,
        ],
      );
      await pool.query(
        "UPDATE subscriptions SET shipping_address_id=? WHERE id=?",
        [result.insertId, subscriptionId],
      );
    }

    res.json({ success: true, message: "Dirección actualizada correctamente" });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ success: false, error: "Failed to update address" });
  }
};

/**
 * PUT /api/user/subscription/contact
 * Update delivery contact name on the shipping address.
 */
const handleUpdateDeliveryContact: RequestHandler = async (req, res) => {
  const userId = extractUserId(req, res);
  if (!userId) return;

  const { subscriptionId, fullName } = req.body;

  if (!subscriptionId || !fullName?.trim()) {
    return res
      .status(400)
      .json({ success: false, error: "Missing subscriptionId or fullName" });
  }

  try {
    const [subs] = await pool.query<any[]>(
      "SELECT shipping_address_id FROM subscriptions WHERE id = ? AND user_id = ?",
      [subscriptionId, userId],
    );
    if (subs.length === 0 || !subs[0].shipping_address_id) {
      return res
        .status(404)
        .json({ success: false, error: "Subscription or address not found" });
    }

    await pool.query(
      "UPDATE addresses SET full_name=?, updated_at=NOW() WHERE id=? AND user_id=?",
      [fullName.trim(), subs[0].shipping_address_id, userId],
    );

    res.json({ success: true, message: "Persona de entrega actualizada" });
  } catch (error) {
    console.error("Error updating delivery contact:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update delivery contact" });
  }
};

/**
 * PUT /api/user/subscription/plan
 * Upgrade or change plan on an active Stripe subscription.
 */
const handleUpgradeSubscriptionPlan: RequestHandler = async (req, res) => {
  const userId = extractUserId(req, res);
  if (!userId) return;

  const { subscriptionId, newPlanId } = req.body;

  if (!subscriptionId || !newPlanId) {
    return res.status(400).json({
      success: false,
      error: "subscriptionId and newPlanId are required",
    });
  }

  try {
    // Verify subscription belongs to user and get stripe id
    const [subs] = await pool.query<any[]>(
      "SELECT id, stripe_subscription_id, plan_id FROM subscriptions WHERE id = ? AND user_id = ? AND status = 'active'",
      [subscriptionId, userId],
    );
    if (subs.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Active subscription not found" });
    }

    const sub = subs[0];

    // Get new plan stripe price id
    const env = process.env.NODE_ENV;
    const priceField =
      env === "production" ? "stripe_price_id_prod" : "stripe_price_id_test";
    const [plans] = await pool.query<any[]>(
      `SELECT id, ${priceField} AS stripe_price_id FROM subscription_plans WHERE id = ? AND is_active = 1`,
      [newPlanId],
    );
    if (plans.length === 0) {
      return res.status(404).json({ success: false, error: "Plan not found" });
    }

    const newPlan = plans[0];

    if (
      sub.stripe_subscription_id &&
      sub.stripe_subscription_id.startsWith("sub_") &&
      newPlan.stripe_price_id
    ) {
      // Update in Stripe (only if this is a real Stripe Subscription, not a PaymentIntent)
      const stripeSub = await stripe.subscriptions.retrieve(
        sub.stripe_subscription_id,
      );
      const itemId = (stripeSub as any).items.data[0]?.id;
      if (itemId) {
        await stripe.subscriptions.update(sub.stripe_subscription_id, {
          items: [{ id: itemId, price: newPlan.stripe_price_id }],
          proration_behavior: "create_prorations",
        });
      }
    }

    // Update DB
    await pool.query(
      "UPDATE subscriptions SET plan_id=?, updated_at=NOW() WHERE id=? AND user_id=?",
      [newPlanId, subscriptionId, userId],
    );

    res.json({ success: true, message: "Plan actualizado correctamente" });
  } catch (error) {
    console.error("Error upgrading plan:", error);
    res.status(500).json({ success: false, error: "Failed to update plan" });
  }
};

/**
 * POST /api/user/subscription/cancel
 * Cancel a subscription at period end. Requires confirmation phrase.
 */
const handleCancelSubscription: RequestHandler = async (req, res) => {
  const userId = extractUserId(req, res);
  if (!userId) return;

  const { subscriptionId, confirmPhrase } = req.body;

  if (confirmPhrase !== "CANCELAR MI SUSCRIPCIÓN") {
    return res
      .status(400)
      .json({ success: false, error: "Frase de confirmación incorrecta" });
  }

  try {
    const [subs] = await pool.query<any[]>(
      "SELECT id, stripe_subscription_id, current_period_end FROM subscriptions WHERE id = ? AND user_id = ? AND status NOT IN ('cancelled')",
      [subscriptionId, userId],
    );
    if (subs.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Subscription not found" });
    }

    const sub = subs[0];

    if (sub.stripe_subscription_id) {
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
    }

    await pool.query(
      "UPDATE subscriptions SET cancel_at_period_end=1, cancelled_at=NOW(), updated_at=NOW() WHERE id=?",
      [subscriptionId],
    );

    res.json({
      success: true,
      message: "Tu suscripción se cancelará al finalizar el período actual",
      cancelAtPeriodEnd: true,
      currentPeriodEnd: sub.current_period_end,
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to cancel subscription" });
  }
};

/**
 * POST /api/user/billing-portal
 * Create Stripe billing portal session for payment method management.
 */
const handleBillingPortal: RequestHandler = async (req, res) => {
  const userId = extractUserId(req, res);
  if (!userId) return;

  try {
    const [users] = await pool.query<any[]>(
      "SELECT stripe_customer_id FROM users WHERE id = ? AND is_active = 1",
      [userId],
    );

    if (users.length === 0 || !users[0].stripe_customer_id) {
      return res.status(400).json({
        success: false,
        error: "No Stripe customer linked to this account",
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: users[0].stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/`,
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to open billing portal" });
  }
};

/**
 * POST /api/create-checkout-session
 * Create Stripe checkout session for subscription
 */
const handleCreateCheckoutSession: RequestHandler = async (req, res) => {
  try {
    const { planId, email, grindType } = req.body;

    if (!planId || !email) {
      return res.status(400).json({ error: "planId and email are required" });
    }

    // Fetch plan from database
    const [plans] = await pool.query<any[]>(
      `SELECT * FROM subscription_plans WHERE id = ? AND is_active = 1`,
      [planId],
    );

    if (plans.length === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const plan = plans[0];

    // TODO: Implement Stripe checkout session creation
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [{
    //     price: plan.stripe_price_id,
    //     quantity: 1,
    //   }],
    //   mode: 'subscription',
    //   success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    //   customer_email: email,
    //   metadata: {
    //     planId: plan.id,
    //     grindType: grindType || '',
    //   },
    // });

    res.json({
      message: "Checkout session endpoint ready for Stripe integration",
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        weight: plan.weight,
      },
      email,
      grindType,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({
      error: "Failed to create checkout session",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// =====================================================
// PAYMENT METHODS — Setup, List, Default, Remove
// =====================================================

/**
 * POST /api/payment-methods/setup
 * Creates a Stripe SetupIntent so the client can save a card without charging.
 */
const handleCreateSetupIntent: RequestHandler = async (req, res) => {
  const userId = extractUserId(req, res);
  if (!userId) return;

  try {
    const [users] = await pool.query<any[]>(
      "SELECT * FROM users WHERE id = ? AND is_active = 1",
      [userId],
    );
    if (users.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const user = users[0];

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.stripe_customer_id;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: { userId: user.id.toString() },
      });
      stripeCustomerId = customer.id;
      await pool.query("UPDATE users SET stripe_customer_id = ? WHERE id = ?", [
        stripeCustomerId,
        user.id,
      ]);
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      usage: "off_session",
    });

    res.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error("Error creating setup intent:", error);
    res.status(500).json({ error: "Error al crear configuración de pago" });
  }
};

/**
 * GET /api/payment-methods
 * List all saved payment methods for the authenticated user.
 */
const handleGetPaymentMethods: RequestHandler = async (req, res) => {
  const userId = extractUserId(req, res);
  if (!userId) return;

  try {
    const [users] = await pool.query<any[]>(
      "SELECT stripe_customer_id FROM users WHERE id = ?",
      [userId],
    );
    if (users.length === 0 || !users[0].stripe_customer_id) {
      return res.json({ paymentMethods: [], defaultPaymentMethodId: null });
    }

    const customerId = users[0].stripe_customer_id;
    const customer = (await stripe.customers.retrieve(
      customerId,
    )) as Stripe.Customer;
    const defaultPmId =
      (customer.invoice_settings?.default_payment_method as string) || null;

    const pmList = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    const paymentMethods = pmList.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand || "",
      last4: pm.card?.last4 || "",
      expMonth: pm.card?.exp_month || 0,
      expYear: pm.card?.exp_year || 0,
      isDefault: pm.id === defaultPmId,
    }));

    res.json({ paymentMethods, defaultPaymentMethodId: defaultPmId });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({ error: "Error al obtener métodos de pago" });
  }
};

/**
 * POST /api/payment-methods/:id/default
 * Set a saved payment method as the customer default.
 */
const handleSetDefaultPaymentMethod: RequestHandler = async (req, res) => {
  const userId = extractUserId(req, res);
  if (!userId) return;

  const paymentMethodId = req.params.id;

  try {
    const [users] = await pool.query<any[]>(
      "SELECT stripe_customer_id FROM users WHERE id = ?",
      [userId],
    );
    if (users.length === 0 || !users[0].stripe_customer_id) {
      return res.status(400).json({ error: "No Stripe customer found" });
    }

    // Verify ownership
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (pm.customer !== users[0].stripe_customer_id) {
      return res
        .status(403)
        .json({ error: "Payment method does not belong to this customer" });
    }

    await stripe.customers.update(users[0].stripe_customer_id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error setting default payment method:", error);
    res
      .status(500)
      .json({ error: "Error al configurar método de pago predeterminado" });
  }
};

/**
 * DELETE /api/payment-methods/:id
 * Detach a saved payment method from the customer.
 */
const handleRemovePaymentMethod: RequestHandler = async (req, res) => {
  const userId = extractUserId(req, res);
  if (!userId) return;

  const paymentMethodId = req.params.id;

  try {
    const [users] = await pool.query<any[]>(
      "SELECT stripe_customer_id FROM users WHERE id = ?",
      [userId],
    );
    if (users.length === 0 || !users[0].stripe_customer_id) {
      return res.status(400).json({ error: "No Stripe customer found" });
    }

    // Verify ownership before detaching
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (pm.customer !== users[0].stripe_customer_id) {
      return res
        .status(403)
        .json({ error: "Payment method does not belong to this customer" });
    }

    await stripe.paymentMethods.detach(paymentMethodId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error removing payment method:", error);
    res.status(500).json({ error: "Error al eliminar método de pago" });
  }
};

/**
 * POST /api/create-payment-intent
 * Creates a Stripe PaymentIntent for subscription
 */
const handleCreatePaymentIntent: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No session token provided",
      });
    }

    const sessionToken = authHeader.substring(7);
    const decoded = jwt.verify(sessionToken, JWT_SECRET) as any;

    if (decoded.userType !== "user") {
      return res.status(401).json({
        success: false,
        error: "Invalid session type",
      });
    }

    const { planId, address } = req.body;

    if (!planId) {
      return res.status(400).json({ error: "planId es requerido" });
    }

    // Get user info
    const [users] = await pool.query<any[]>(
      "SELECT * FROM users WHERE id = ?",
      [decoded.userId],
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const user = users[0];

    // Store address if provided (we'll link it to subscription later)
    let addressId = null;
    if (address) {
      // Check if address already exists
      const [existingAddresses] = await pool.query<any[]>(
        `SELECT id FROM addresses 
         WHERE user_id = ? 
           AND street_address = ? 
           AND city = ? 
           AND state_id = ? 
           AND postal_code = ?
         LIMIT 1`,
        [
          user.id,
          address.street_address,
          address.city,
          address.state_id,
          address.postal_code,
        ],
      );

      if (existingAddresses.length > 0) {
        addressId = existingAddresses[0].id;
        console.log("Using existing address:", addressId);
      } else {
        // Create new address
        const [addressResult] = await pool.query<any>(
          `INSERT INTO addresses (
            user_id, full_name, street_address, street_address_2,
            apartment_number, delivery_instructions,
            city, state_id, postal_code, phone, country, is_default
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.id,
            address.full_name,
            address.street_address,
            address.street_address_2,
            address.apartment_number || null,
            address.delivery_instructions || null,
            address.city,
            parseInt(address.state_id),
            address.postal_code,
            address.phone,
            address.country || "MX",
            address.is_default || 0,
          ],
        );
        addressId = addressResult.insertId;
        console.log("Created new address:", addressId);
      }
    }

    // Determine environment - check if using test or production Stripe key
    const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_");
    const priceIdColumn = isTestMode
      ? "stripe_price_id_test"
      : "stripe_price_id_prod";

    // Fetch plan from database with appropriate price ID
    const [plans] = await pool.query<any[]>(
      `SELECT *, ${priceIdColumn} as stripe_price_id FROM subscription_plans WHERE plan_id = ? AND is_active = 1`,
      [planId],
    );

    if (plans.length === 0) {
      return res.status(404).json({ error: "Plan no encontrado" });
    }

    const plan = plans[0];

    if (!plan.stripe_price_id) {
      return res.status(400).json({
        error: `Stripe Price ID no configurado para el entorno ${isTestMode ? "test" : "producción"}`,
      });
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          userId: user.id.toString(),
        },
      });
      stripeCustomerId = customer.id;

      // Save customer ID to database
      await pool.query("UPDATE users SET stripe_customer_id = ? WHERE id = ?", [
        stripeCustomerId,
        user.id,
      ]);
    }

    const amount = Math.round(parseFloat(plan.price_mxn) * 100); // Convert to cents

    // Create PaymentIntent linked to customer
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "mxn",
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      setup_future_usage: "off_session",
      automatic_payment_methods: { enabled: false },
      metadata: {
        planId: plan.plan_id,
        planName: plan.name,
        stripePriceId: plan.stripe_price_id,
        userId: user.id.toString(),
        addressId: addressId ? addressId.toString() : "",
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      error: "Error al crear intención de pago",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/subscriptions
 * Save card as default PM and create a real Stripe Subscription.
 * Accepts: { paymentMethodId, planId, grindTypeId?, address? }
 */
const handleCreateSubscription: RequestHandler = async (req, res) => {
  const userId = extractUserId(req, res);
  if (!userId) return;

  const { paymentMethodId, planId, grindTypeId, address } = req.body;

  if (!paymentMethodId || !planId) {
    return res.status(400).json({
      success: false,
      error: "paymentMethodId and planId are required",
    });
  }

  try {
    const [users] = await pool.query<any[]>(
      "SELECT * FROM users WHERE id = ? AND is_active = 1",
      [userId],
    );
    if (users.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const user = users[0];

    if (!user.stripe_customer_id) {
      return res
        .status(400)
        .json({ error: "No Stripe customer linked to this account" });
    }

    // Verify PM belongs to this customer
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (pm.customer !== user.stripe_customer_id) {
      return res
        .status(403)
        .json({ error: "Payment method does not belong to this customer" });
    }

    // Set as default payment method on customer
    await stripe.customers.update(user.stripe_customer_id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // ── Handle address ──────────────────────────────────────────────────
    let shippingAddressId: number | null = null;
    if (address) {
      const [existingAddresses] = await pool.query<any[]>(
        `SELECT id FROM addresses 
         WHERE user_id = ? AND street_address = ? AND city = ? AND state_id = ? AND postal_code = ?
         LIMIT 1`,
        [
          userId,
          address.street_address,
          address.city,
          address.state_id,
          address.postal_code,
        ],
      );

      if (existingAddresses.length > 0) {
        shippingAddressId = existingAddresses[0].id;
      } else {
        const [addressResult] = await pool.query<any>(
          `INSERT INTO addresses (user_id, full_name, street_address, street_address_2,
            apartment_number, delivery_instructions, city, state_id, postal_code, country, phone, is_default)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            address.full_name,
            address.street_address,
            address.street_address_2 || null,
            address.apartment_number || null,
            address.delivery_instructions || null,
            address.city,
            parseInt(address.state_id),
            address.postal_code,
            address.country || "MX",
            address.phone || null,
            address.is_default || 0,
          ],
        );
        shippingAddressId = addressResult.insertId;
      }
    }

    // ── Resolve plan ────────────────────────────────────────────────────
    const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_");
    const priceIdColumn = isTestMode
      ? "stripe_price_id_test"
      : "stripe_price_id_prod";

    const [plans] = await pool.query<any[]>(
      `SELECT *, ${priceIdColumn} as stripe_price_id FROM subscription_plans WHERE plan_id = ? AND is_active = 1`,
      [planId],
    );
    if (plans.length === 0) {
      return res.status(404).json({ error: "Plan no encontrado" });
    }
    const plan = plans[0];

    if (!plan.stripe_price_id) {
      return res.status(400).json({
        error: `Stripe Price ID no configurado para el entorno ${isTestMode ? "test" : "producción"}`,
      });
    }

    // ── Prevent duplicate active subscriptions ───────────────────────
    const [existingActive] = await pool.query<any[]>(
      "SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active'",
      [userId],
    );
    if (existingActive.length > 0) {
      return res
        .status(400)
        .json({ success: false, error: "Ya tienes una suscripción activa" });
    }

    // ── Create Stripe Subscription ───────────────────────────────────
    const stripeSubscription = await stripe.subscriptions.create({
      customer: user.stripe_customer_id,
      items: [{ price: plan.stripe_price_id }],
      default_payment_method: paymentMethodId,
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    });

    // Handle 3DS / requires_action
    const latestInvoice = stripeSubscription.latest_invoice as any;
    const paymentIntent =
      latestInvoice?.payment_intent as Stripe.PaymentIntent | null;

    if (
      stripeSubscription.status === "incomplete" &&
      paymentIntent?.status === "requires_action"
    ) {
      return res.json({
        success: false,
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        stripeSubscriptionId: stripeSubscription.id,
      });
    }

    if (
      stripeSubscription.status !== "active" &&
      stripeSubscription.status !== "trialing"
    ) {
      return res
        .status(400)
        .json({ success: false, error: "No se pudo confirmar el pago" });
    }

    // ── Resolve grind type ───────────────────────────────────────────
    let actualGrindTypeId: number | null = null;
    if (grindTypeId) {
      const [grindRows] = await pool.query<any[]>(
        "SELECT id FROM grind_types WHERE code = ?",
        [grindTypeId],
      );
      if (grindRows.length > 0) actualGrindTypeId = grindRows[0].id;
    }

    // ── Get plan DB id ────────────────────────────────────────────────
    const [planRows] = await pool.query<any[]>(
      "SELECT id FROM subscription_plans WHERE plan_id = ?",
      [planId],
    );
    const actualPlanId = planRows[0].id;

    // ── Insert subscription record ───────────────────────────────────
    const sub = stripeSubscription as any;
    const periodStart = new Date(
      (sub.current_period_start ?? Date.now() / 1000) * 1000,
    );
    const periodEnd = new Date(
      (sub.current_period_end ?? Date.now() / 1000 + 2592000) * 1000,
    );

    const [result] = await pool.query<any>(
      `INSERT INTO subscriptions
         (user_id, plan_id, grind_type_id, shipping_address_id, stripe_subscription_id,
          status, current_period_start, current_period_end, cancel_at_period_end, cancelled_at)
       VALUES (?, ?, ?, ?, ?, 'active', ?, ?, 0, NULL)`,
      [
        userId,
        actualPlanId,
        actualGrindTypeId,
        shippingAddressId,
        stripeSubscription.id,
        periodStart,
        periodEnd,
      ],
    );

    const subscriptionId = result.insertId;

    // ── Create initial order + payment record ─────────────────────────
    // We do this here (not only in the webhook) to avoid a race condition:
    // the invoice.payment_succeeded webhook can arrive before this function
    // finishes, find no subscription row, and silently skip order creation.
    // The unique stripe_invoice_id constraint makes the webhook idempotent
    // if it arrives later and tries to insert the same invoice again.
    const invoiceId = latestInvoice?.id as string | null;
    const invoicePaymentIntentId =
      (latestInvoice?.payment_intent as Stripe.PaymentIntent)?.id ??
      (latestInvoice?.payment_intent as string) ??
      null;
    const invoiceAmountPaid =
      ((latestInvoice?.amount_paid as number) ?? 0) / 100;

    const orderNumber = `BDC-${Date.now()}-${subscriptionId}`;
    const [orderResult] = await pool.query<any>(
      `INSERT INTO orders
         (user_id, subscription_id, order_number, stripe_payment_intent_id,
          stripe_invoice_id, total_amount, currency, status,
          shipping_address_id, grind_type_id)
       VALUES (?, ?, ?, ?, ?, ?, 'MXN', 'processing', ?, ?)`,
      [
        userId,
        subscriptionId,
        orderNumber,
        invoicePaymentIntentId,
        invoiceId,
        invoiceAmountPaid,
        shippingAddressId ?? null,
        actualGrindTypeId ?? null,
      ],
    );

    await pool.query(
      `INSERT INTO order_items (order_id, plan_id, quantity, unit_price, subtotal)
       VALUES (?, ?, 1, ?, ?)`,
      [
        orderResult.insertId,
        actualPlanId,
        invoiceAmountPaid,
        invoiceAmountPaid,
      ],
    );

    await pool.query(
      `INSERT INTO payments
         (user_id, order_id, subscription_id, stripe_payment_id,
          amount, currency, status, payment_method)
       VALUES (?, ?, ?, ?, ?, 'MXN', 'succeeded', 'card')`,
      [
        userId,
        orderResult.insertId,
        subscriptionId,
        invoicePaymentIntentId,
        invoiceAmountPaid,
      ],
    );

    console.log(
      `[Subscription] ✅ Order ${orderNumber} created (invoice: ${invoiceId})`,
    );

    // ── Fetch full details for email ─────────────────────────────────
    const [subscriptions] = await pool.query<any[]>(
      `SELECT s.*,
              u.email, u.full_name,
              sp.name as plan_name, sp.weight, sp.price_mxn,
              gt.name as grind_type_name,
              ms.name as state_name,
              a.full_name as address_full_name, a.street_address, a.street_address_2,
              a.city, a.postal_code, a.phone as address_phone
       FROM subscriptions s
       JOIN users u ON s.user_id = u.id
       JOIN subscription_plans sp ON s.plan_id = sp.id
       LEFT JOIN grind_types gt ON s.grind_type_id = gt.id
       LEFT JOIN addresses a ON s.shipping_address_id = a.id
       LEFT JOIN mexico_states ms ON a.state_id = ms.id
       WHERE s.id = ?`,
      [subscriptionId],
    );

    const subscription = subscriptions[0];

    // Send confirmation email
    if (subscription.shipping_address_id) {
      const nextDeliveryDate = new Date(subscription.current_period_end);
      const formattedDate = nextDeliveryDate.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      await sendSubscriptionConfirmationEmail(
        subscription.email,
        subscription.full_name,
        {
          planName: subscription.plan_name,
          weight: subscription.weight,
          price: parseFloat(subscription.price_mxn).toFixed(2),
          grindType: subscription.grind_type_name || "Grano Entero",
          nextDelivery: formattedDate,
          address: {
            full_name: subscription.address_full_name,
            street_address: subscription.street_address,
            street_address_2: subscription.street_address_2,
            city: subscription.city,
            state: subscription.state_name,
            postal_code: subscription.postal_code,
            phone: subscription.address_phone,
          },
        },
      );
    }

    trackVisit(req, "subscription_complete", "/subscription-wizard", {
      plan_id: planId,
    });

    res.json({ success: true, subscription });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create subscription",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// =====================================================
// VISITOR TRACKING
// =====================================================

/** Detect broad device category from user-agent string */
function detectDevice(ua: string): "desktop" | "mobile" | "tablet" | "unknown" {
  if (!ua) return "unknown";
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua))
    return "mobile";
  return "desktop";
}

/** Detect browser name from user-agent string */
function detectBrowser(ua: string): string {
  if (!ua) return "Unknown";
  if (/edge|edg/i.test(ua)) return "Edge";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  if (/opera|opr/i.test(ua)) return "Opera";
  return "Other";
}

/** Detect OS from user-agent string */
function detectOS(ua: string): string {
  if (!ua) return "Unknown";
  if (/windows/i.test(ua)) return "Windows";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/android/i.test(ua)) return "Android";
  if (/macintosh|mac os/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Other";
}

/** Extract real client IP respecting proxies/CDNs */
function extractClientIP(req: express.Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    // x-forwarded-for may contain comma-separated IPs; first is the client
    return (Array.isArray(forwarded) ? forwarded[0] : forwarded)
      .split(",")[0]
      .trim();
  }
  return (
    (req.headers["cf-connecting-ip"] as string) ||
    req.socket.remoteAddress ||
    ""
  );
}

type TrackEventType =
  | "page_view"
  | "click"
  | "scroll"
  | "form_submit"
  | "subscription_start"
  | "subscription_complete"
  | "auth_open"
  | "auth_success"
  | "plan_select"
  | "checkout_start"
  | "checkout_complete"
  | "payment_method_added"
  | "payment_method_removed";

/**
 * Fire-and-forget helper — inserts a visitor event row.
 * Called from within existing API handlers instead of a dedicated endpoint.
 * Session ID is read from the X-Session-ID header sent by the axios interceptor.
 * Never throws — tracking errors must never break the main request.
 */
async function trackVisit(
  req: express.Request,
  eventType: TrackEventType,
  page: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || "anonymous";

    let userId: number | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET) as any;
        if (decoded?.userId) userId = decoded.userId as number;
      } catch {
        // expired / invalid token — anonymous
      }
    }

    const ua = (req.headers["user-agent"] as string) || "";
    const ip = extractClientIP(req);
    const countryCode =
      (req.headers["cf-ipcountry"] as string) ||
      (req.headers["x-country-code"] as string) ||
      null;
    const referrer =
      (req.headers["referer"] as string) ||
      (req.headers["referrer"] as string) ||
      null;

    await pool.query(
      `INSERT INTO visitor_events
         (session_id, user_id, event_type, page, referrer,
          ip_address, user_agent, device_type, browser, os,
          country_code, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId.substring(0, 64),
        userId,
        eventType,
        page.substring(0, 500),
        referrer ? referrer.substring(0, 500) : null,
        ip || null,
        ua || null,
        detectDevice(ua),
        detectBrowser(ua),
        detectOS(ua),
        countryCode,
        metadata ? JSON.stringify(metadata) : null,
      ],
    );
  } catch (err) {
    console.error("[trackVisit] Non-fatal tracking error:", err);
  }
}

// =====================================================
// CONSOLIDATED HOME ENDPOINT
// =====================================================

/**
 * GET /api/home
 * Single endpoint for the initial app load.
 * Returns plans + grind types + states in one round-trip.
 * Auth-optional: if a valid Bearer token is present the user object
 * is included so the client can skip a separate validate call.
 */
const handleGetHome: RequestHandler = async (req, res) => {
  try {
    // Run the three "catalogue" queries in parallel
    const [plansRows, grindRows, stateRows] = await Promise.all([
      pool.query<any[]>(
        `SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY price_mxn ASC`,
      ),
      pool.query<any[]>(
        `SELECT * FROM grind_types WHERE is_active = 1 ORDER BY sort_order ASC`,
      ),
      pool.query<any[]>(
        `SELECT * FROM mexico_states WHERE is_active = 1 ORDER BY name ASC`,
      ),
    ]);

    // Attach features to plans
    const plans = await Promise.all(
      (plansRows[0] as any[]).map(async (plan) => {
        const [features] = await pool.query<any[]>(
          `SELECT feature_text FROM plan_features
           WHERE plan_id = ? AND is_active = 1
           ORDER BY sort_order ASC`,
          [plan.id],
        );
        return { ...plan, features: features.map((f) => f.feature_text) };
      }),
    );

    const grindTypes = grindRows[0] as any[];
    const states = stateRows[0] as any[];

    // Auth-optional: try to return user data if a valid token is provided
    let user: Record<string, unknown> | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET) as any;

        if (decoded?.userType === "user") {
          const [users] = await pool.query<any[]>(
            "SELECT * FROM users WHERE id = ? AND is_active = 1",
            [decoded.userId],
          );
          if (users.length > 0) {
            const u = users[0];
            user = {
              id: u.id,
              email: u.email,
              full_name: u.full_name,
              phone: u.phone,
              email_verified: Boolean(u.email_verified),
            };
          }
        }
      } catch {
        // expired / invalid token → return null user, not an error
      }
    }

    // Track the page load (fire-and-forget)
    trackVisit(req, "page_view", "/");

    res.json({ plans, grindTypes, states, user });
  } catch (error) {
    console.error("[home] Error:", error);
    res.status(500).json({
      error: "Failed to load home data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// =====================================================
// STRIPE WEBHOOK SUB-HANDLERS
// =====================================================

/**
 * invoice.payment_succeeded
 * Fires on the initial charge AND every monthly renewal.
 * Creates an order + payment record and syncs subscription period dates.
 */
async function processInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
): Promise<void> {
  const inv = invoice as any;
  const stripeSubscriptionId = inv.subscription as string | null;
  if (!stripeSubscriptionId) return; // one-off charge, not a subscription

  // Find our internal subscription row
  const [subs] = await pool.query<any[]>(
    "SELECT * FROM subscriptions WHERE stripe_subscription_id = ?",
    [stripeSubscriptionId],
  );
  if (subs.length === 0) {
    console.log(
      `[Webhook] Subscription not found in DB: ${stripeSubscriptionId}`,
    );
    return;
  }
  const sub = subs[0];

  // Idempotency — skip if we already processed this exact invoice
  const [existingOrders] = await pool.query<any[]>(
    "SELECT id FROM orders WHERE stripe_invoice_id = ?",
    [invoice.id],
  );
  if (existingOrders.length > 0) {
    console.log(`[Webhook] Invoice ${invoice.id} already processed, skipping`);
    return;
  }

  // Sync subscription period dates and reset status to active
  await pool.query(
    `UPDATE subscriptions
     SET status = 'active',
         current_period_start = FROM_UNIXTIME(?),
         current_period_end   = FROM_UNIXTIME(?),
         updated_at = NOW()
     WHERE id = ?`,
    [
      inv.period_start ?? Math.floor(Date.now() / 1000),
      inv.period_end ?? Math.floor(Date.now() / 1000) + 2592000,
      sub.id,
    ],
  );

  // Create order record
  const orderNumber = `BDC-${Date.now()}-${sub.id}`;
  const amount = (inv.amount_paid ?? 0) / 100; // Stripe stores cents
  const [orderResult] = await pool.query<any>(
    `INSERT INTO orders
       (user_id, subscription_id, order_number, stripe_payment_intent_id,
        stripe_invoice_id, total_amount, currency, status,
        shipping_address_id, grind_type_id)
     VALUES (?, ?, ?, ?, ?, ?, 'MXN', 'processing', ?, ?)`,
    [
      sub.user_id,
      sub.id,
      orderNumber,
      (inv.payment_intent as string) ?? null,
      inv.id,
      amount,
      sub.shipping_address_id ?? null,
      sub.grind_type_id ?? null,
    ],
  );

  // Create payment record
  await pool.query(
    `INSERT INTO payments
       (user_id, order_id, subscription_id, stripe_payment_id,
        amount, currency, status, payment_method)
     VALUES (?, ?, ?, ?, ?, 'MXN', 'succeeded', 'card')`,
    [
      sub.user_id,
      orderResult.insertId,
      sub.id,
      (inv.payment_intent as string) ?? null,
      amount,
    ],
  );

  // Create order item for the plan
  const [planRows] = await pool.query<any[]>(
    "SELECT id FROM subscription_plans WHERE id = ?",
    [sub.plan_id],
  );
  if (planRows.length > 0) {
    await pool.query(
      `INSERT INTO order_items (order_id, plan_id, quantity, unit_price, subtotal)
       VALUES (?, ?, 1, ?, ?)`,
      [orderResult.insertId, planRows[0].id, amount, amount],
    );
  }

  console.log(
    `[Webhook] ✅ Order ${orderNumber} created for subscription ${sub.id}`,
  );
}

/**
 * invoice.payment_failed
 * Fires when a renewal charge is declined.
 * Sets subscription to past_due and records the failed payment.
 */
async function processInvoicePaymentFailed(
  invoice: Stripe.Invoice,
): Promise<void> {
  const inv = invoice as any;
  const stripeSubscriptionId = inv.subscription as string | null;
  if (!stripeSubscriptionId) return;

  await pool.query(
    `UPDATE subscriptions SET status = 'past_due', updated_at = NOW()
     WHERE stripe_subscription_id = ?`,
    [stripeSubscriptionId],
  );

  const [subs] = await pool.query<any[]>(
    "SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = ?",
    [stripeSubscriptionId],
  );
  if (subs.length === 0) return;
  const sub = subs[0];

  const failureReason =
    inv.last_finalization_error?.message || "Payment declined";

  await pool.query(
    `INSERT INTO payments
       (user_id, subscription_id, stripe_payment_id,
        amount, currency, status, failure_reason)
     VALUES (?, ?, ?, ?, 'MXN', 'failed', ?)`,
    [
      sub.user_id,
      sub.id,
      (inv.payment_intent as string) ?? null,
      (inv.amount_due ?? 0) / 100,
      failureReason,
    ],
  );

  console.log(`[Webhook] ❌ Payment failed for subscription ${sub.id}`);
}

/**
 * customer.subscription.updated
 * Fires whenever Stripe changes subscription status or renews the period.
 * Keeps our DB status and period dates in sync.
 */
async function processSubscriptionUpdated(
  subscription: Stripe.Subscription,
): Promise<void> {
  const sub = subscription as any;
  // Stripe uses "canceled" (one 'l'), our DB uses "cancelled"
  const status =
    subscription.status === "canceled" ? "cancelled" : subscription.status;

  await pool.query(
    `UPDATE subscriptions
     SET status = ?,
         current_period_start = FROM_UNIXTIME(?),
         current_period_end   = FROM_UNIXTIME(?),
         cancel_at_period_end = ?,
         updated_at = NOW()
     WHERE stripe_subscription_id = ?`,
    [
      status,
      sub.current_period_start,
      sub.current_period_end,
      subscription.cancel_at_period_end ? 1 : 0,
      subscription.id,
    ],
  );

  console.log(`[Webhook] Subscription ${subscription.id} updated → ${status}`);
}

/**
 * customer.subscription.deleted
 * Fires when a subscription is fully cancelled (period has ended or immediate cancel).
 */
async function processSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  await pool.query(
    `UPDATE subscriptions
     SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
     WHERE stripe_subscription_id = ?`,
    [subscription.id],
  );

  console.log(`[Webhook] Subscription ${subscription.id} deleted/cancelled`);
}

/**
 * POST /api/webhook
 * Stripe webhook — receives real-time subscription and payment events.
 * IMPORTANT: registered BEFORE express.json() so the body stays as a raw
 * Buffer for Stripe signature verification.
 */
const handleWebhook: RequestHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Webhook] STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig as string,
      webhookSecret,
    );
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return res
      .status(400)
      .json({ error: `Webhook signature error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case "invoice.payment_succeeded":
        await processInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice,
        );
        break;
      case "invoice.payment_failed":
        await processInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.updated":
        await processSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;
      case "customer.subscription.deleted":
        await processSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;
      default:
        // Ignore unhandled event types
        break;
    }
    res.json({ received: true });
  } catch (error) {
    // Return 500 so Stripe retries on transient DB errors
    console.error("[Webhook] Processing error:", error);
    res.status(500).json({ error: "Internal webhook processing error" });
  }
};

// =====================================================
// SERVER INITIALIZATION
// =====================================================

/**
 * Create Express server with all routes configured
 */
function createServer() {
  console.log("Creating Express server for Vercel...");

  const app = express();

  // Webhook MUST be registered BEFORE the global express.json() middleware.
  // Stripe signature verification requires the raw request body (a Buffer).
  // If express.json() runs first, the body becomes a parsed JS object and
  // stripe.webhooks.constructEvent() will throw a signature mismatch error.
  app.post(
    "/api/webhook",
    express.raw({ type: "application/json" }),
    handleWebhook,
  );

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Log requests
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // ==================== CONFIGURE API ROUTES ====================

  // Health & ping
  app.get("/api/ping", handlePing);

  // Consolidated home (plans + grind-types + states + optional user)
  app.get("/api/home", handleGetHome);

  // Subscription & products
  app.get("/api/plans", handleGetPlans);
  app.get("/api/grind-types", handleGetGrindTypes);
  app.get("/api/states", handleGetStates);

  // Authentication routes
  app.post("/api/auth/send-code", handleSendCode);
  app.post("/api/auth/verify-code", handleVerifyCode);
  app.post("/api/auth/register", handleRegister);
  app.get("/api/auth/validate", handleValidateSession);
  app.post("/api/auth/logout", handleLogout);

  // Business inquiries
  app.post("/api/business-inquiries", handleCreateBusinessInquiry);

  // Help Center
  app.post("/api/help/contact", handleSubmitContact);

  // User dashboard (authenticated)
  app.get("/api/user/subscription", handleGetMySubscription);
  app.put("/api/user/subscription/address", handleUpdateSubscriptionAddress);
  app.put("/api/user/subscription/contact", handleUpdateDeliveryContact);
  app.put("/api/user/subscription/plan", handleUpgradeSubscriptionPlan);
  app.post("/api/user/subscription/cancel", handleCancelSubscription);
  app.post("/api/user/billing-portal", handleBillingPortal);

  // Blog
  app.get("/api/blog/posts", handleGetBlogPosts);
  app.get("/api/blog/posts/:slug", handleGetBlogPostBySlug);

  // Checkout & payments
  app.post("/api/create-checkout-session", handleCreateCheckoutSession);
  app.post(
    "/api/create-payment-intent",
    handleCreatePaymentIntent as RequestHandler,
  );
  // Payment methods (save-card flow)
  app.post("/api/payment-methods/setup", handleCreateSetupIntent);
  app.get("/api/payment-methods", handleGetPaymentMethods);
  app.post(
    "/api/payment-methods/:id/default",
    handleSetDefaultPaymentMethod as RequestHandler,
  );
  app.delete(
    "/api/payment-methods/:id",
    handleRemovePaymentMethod as RequestHandler,
  );
  app.post("/api/subscriptions", handleCreateSubscription);

  // Demo
  app.get("/api/demo", handleDemo);

  // 404 handler - only for API routes
  app.use("/api", (_req, res) => {
    res.status(404).json({
      success: false,
      message: "API endpoint not found",
    });
  });

  // Error handler
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error("Express error:", err);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message,
      });
    },
  );

  return app;
}

// Singleton app instance for Vercel
let app: express.Application | null = null;

function getApp() {
  if (!app) {
    console.log("Initializing Express app for serverless...");
    app = createServer();
  }
  return app;
}

// Export createServer for development use
export { createServer };

// Export handler for Vercel serverless
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const expressApp = getApp();
    expressApp(req as any, res as any);
  } catch (error) {
    console.error("API Handler Error:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: {
          code: "500",
          message: "A server error has occurred",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }
};
