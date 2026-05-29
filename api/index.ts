import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express, { type RequestHandler } from "express";
import cors from "cors";
import mysql, { type Pool } from "mysql2/promise";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import Stripe from "stripe";
import bcrypt from "bcryptjs";

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
// EMAIL — templates & send helpers (inline for Vercel serverless)
// =====================================================

/** Map Stripe decline codes to user-friendly Spanish messages */
function humanizeStripeDecline(message?: string | null): string {
  if (!message) return "Tu banco rechazó el pago. Intenta con otra tarjeta o contacta a tu banco.";
  const lower = message.toLowerCase();
  if (lower.includes("insufficient_funds") || lower.includes("insufficient funds")) {
    return "Fondos insuficientes en la tarjeta.";
  }
  if (lower.includes("expired_card") || lower.includes("expired")) {
    return "La tarjeta está vencida.";
  }
  if (lower.includes("incorrect_cvc") || lower.includes("cvc")) {
    return "El código de seguridad (CVC) es incorrecto.";
  }
  if (lower.includes("card_declined") || lower.includes("declined")) {
    return "Tu banco rechazó el cargo. Verifica los datos o usa otra tarjeta.";
  }
  if (lower.includes("authentication_required") || lower.includes("3d secure")) {
    return "Tu banco requiere autenticación adicional (3D Secure).";
  }
  return message;
}


/**
 * Bolsa de Café — transactional email HTML templates.
 * Brand palette aligned with tailwind.config.ts (brand-*).
 */

const EMAIL_BRAND = {
  /** brand-950 */
  navyDark: "#152a63",
  /** brand-900 */
  navy: "#1a3578",
  /** brand-800 */
  navyMid: "#1d3c89",
  /** brand-600 */
  navySoft: "#4a5d8a",
  /** brand-100 */
  tint: "#eef1f7",
  /** brand-50 */
  tintLight: "#f7f8fc",
  /** brand-200 */
  border: "#cdd2df",
  text: "#2a2a2a",
  textMuted: "#6d6d6d",
  textLight: "#888888",
  white: "#ffffff",
  bgPage: "#f2f2f2",
  bgFooter: "#f8f8f8",
  danger: "#b91c1c",
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  warning: "#92400e",
  warningBg: "#fffbeb",
  warningBorder: "#fcd34d",
} as const;

const LOGO_URL =
  "https://disruptinglabs.com/data/bolsadecafe/assets/images/logo_white.png";
const SUPPORT_EMAIL = "dihola@bolsadecafe.com";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function frontendUrl(): string {
  return process.env.FRONTEND_URL || "http://localhost:5173";
}

interface EmailLayoutOptions {
  title: string;
  preheader?: string;
  headerTitle: string;
  headerSubtitle?: string;
  badge?: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
}

/** Shared responsive email shell */
function emailLayout(opts: EmailLayoutOptions): string {
  const preheader = opts.preheader
    ? `<span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(opts.preheader)}</span>`
    : "";

  const badge = opts.badge
    ? `<div style="display:inline-block;margin-top:12px;padding:6px 14px;border-radius:100px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.22);">
         <span style="font-size:12px;color:rgba(255,255,255,0.92);font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">${escapeHtml(opts.badge)}</span>
       </div>`
    : "";

  const cta = opts.cta
    ? `<tr>
         <td style="padding:0 32px 36px;text-align:center;">
           <a href="${escapeHtml(opts.cta.href)}" style="display:inline-block;background:linear-gradient(135deg,${EMAIL_BRAND.navy} 0%,${EMAIL_BRAND.navyMid} 100%);color:${EMAIL_BRAND.white};text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:-0.01em;">${escapeHtml(opts.cta.label)}</a>
         </td>
       </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL_BRAND.bgPage};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  ${preheader}
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:${EMAIL_BRAND.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(21,42,99,0.08);border:1px solid ${EMAIL_BRAND.border};">
        <tr>
          <td style="background:linear-gradient(135deg,${EMAIL_BRAND.navyDark} 0%,${EMAIL_BRAND.navyMid} 100%);padding:32px 28px;text-align:center;">
            <img src="${LOGO_URL}" alt="Bolsadecafé" width="160" style="height:auto;max-height:44px;display:block;margin:0 auto;" />
            <h1 style="color:${EMAIL_BRAND.white};margin:16px 0 0;font-size:24px;font-weight:800;letter-spacing:-0.02em;line-height:1.25;">${escapeHtml(opts.headerTitle)}</h1>
            ${opts.headerSubtitle ? `<p style="color:rgba(255,255,255,0.82);margin:8px 0 0;font-size:14px;line-height:1.5;">${escapeHtml(opts.headerSubtitle)}</p>` : ""}
            ${badge}
          </td>
        </tr>
        <tr>
          <td style="padding:32px 28px 24px;color:${EMAIL_BRAND.text};font-size:15px;line-height:1.65;">
            ${opts.bodyHtml}
          </td>
        </tr>
        ${cta}
        <tr>
          <td style="background:${EMAIL_BRAND.bgFooter};padding:24px 28px;text-align:center;border-top:1px solid ${EMAIL_BRAND.border};">
            <p style="margin:0 0 6px;color:${EMAIL_BRAND.textMuted};font-size:13px;">¿Necesitas ayuda?</p>
            <p style="margin:0;font-size:13px;"><a href="mailto:${SUPPORT_EMAIL}" style="color:${EMAIL_BRAND.navyMid};text-decoration:none;font-weight:600;">${SUPPORT_EMAIL}</a></p>
            <p style="margin:14px 0 0;color:${EMAIL_BRAND.textLight};font-size:11px;">© ${new Date().getFullYear()} Bolsa de Café. Todos los derechos reservados.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function infoCard(title: string, rows: { label: string; value: string }[]): string {
  const rowHtml = rows
    .map(
      (r, i) => `<tr>
        <td style="color:${EMAIL_BRAND.textMuted};font-size:13px;padding:10px 0;${i < rows.length - 1 ? `border-bottom:1px solid ${EMAIL_BRAND.border};` : ""}">${escapeHtml(r.label)}</td>
        <td style="color:${EMAIL_BRAND.text};font-size:13px;font-weight:600;text-align:right;padding:10px 0;${i < rows.length - 1 ? `border-bottom:1px solid ${EMAIL_BRAND.border};` : ""}">${r.value}</td>
      </tr>`,
    )
    .join("");

  return `<div style="background:${EMAIL_BRAND.tintLight};border:1px solid ${EMAIL_BRAND.border};border-radius:12px;padding:20px;margin:20px 0;">
    <h2 style="color:${EMAIL_BRAND.navy};margin:0 0 14px;font-size:16px;font-weight:700;">${escapeHtml(title)}</h2>
    <table width="100%" cellpadding="0" cellspacing="0">${rowHtml}</table>
  </div>`;
}

function bulletList(title: string, items: string[]): string {
  const lis = items
    .map(
      (item) =>
        `<li style="margin:0 0 8px;color:${EMAIL_BRAND.navySoft};font-size:14px;line-height:1.5;">${escapeHtml(item)}</li>`,
    )
    .join("");
  return `<div style="background:${EMAIL_BRAND.tint};border:1px solid ${EMAIL_BRAND.border};border-radius:12px;padding:18px 20px;margin:20px 0;">
    <h3 style="color:${EMAIL_BRAND.navy};margin:0 0 10px;font-size:14px;font-weight:700;">${escapeHtml(title)}</h3>
    <ul style="margin:0;padding:0 0 0 18px;">${lis}</ul>
  </div>`;
}

// ─── Template builders ───────────────────────────────────────────────────────

function subscriptionConfirmationEmail(
  userName: string,
  details: {
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
): { subject: string; html: string } {
  const addr = details.address;
  const addressHtml = `${escapeHtml(addr.full_name)}<br>
    ${escapeHtml(addr.street_address)}${addr.street_address_2 ? `<br>${escapeHtml(addr.street_address_2)}` : ""}<br>
    ${escapeHtml(addr.city)}, ${escapeHtml(addr.state)} ${escapeHtml(addr.postal_code)}${addr.phone ? `<br>Tel: ${escapeHtml(addr.phone)}` : ""}`;

  const body = `
    <p style="margin:0 0 12px;font-size:17px;font-weight:600;color:${EMAIL_BRAND.navy};">Hola ${escapeHtml(userName)},</p>
    <p style="margin:0 0 8px;color:${EMAIL_BRAND.textMuted};">Gracias por suscribirte a <strong style="color:${EMAIL_BRAND.text};">Bolsa de Café</strong>. Tu suscripción está activa y pronto recibirás tu primer envío de café de especialidad.</p>
    ${infoCard("Detalles de tu suscripción", [
      { label: "Plan", value: escapeHtml(details.planName) },
      { label: "Cantidad", value: escapeHtml(details.weight) },
      { label: "Molido", value: escapeHtml(details.grindType) },
      { label: "Precio mensual", value: `$${escapeHtml(details.price)} MXN` },
      { label: "Próxima entrega", value: escapeHtml(details.nextDelivery) },
    ])}
    <div style="background:${EMAIL_BRAND.bgFooter};border:1px solid ${EMAIL_BRAND.border};border-radius:12px;padding:18px 20px;margin:20px 0;">
      <h3 style="color:${EMAIL_BRAND.text};margin:0 0 10px;font-size:15px;font-weight:700;">Dirección de entrega</h3>
      <p style="margin:0;color:${EMAIL_BRAND.textMuted};font-size:14px;line-height:1.6;">${addressHtml}</p>
    </div>
    ${bulletList("Incluido en tu plan", [
      "Café 100% mexicano de especialidad",
      "Envío gratis en toda la República",
      "Sin compromiso — cancela cuando quieras",
      "Frescura garantizada — tostado artesanal",
    ])}`;

  return {
    subject: "Tu suscripción a Bolsa de Café está confirmada",
    html: emailLayout({
      title: "Suscripción confirmada",
      preheader: "Tu café está en camino. Revisa los detalles de tu suscripción.",
      headerTitle: "Suscripción confirmada",
      headerSubtitle: "Tu café está en camino",
      bodyHtml: body,
      cta: { label: "Ver mi cuenta", href: frontendUrl() },
    }),
  };
}

function adminNewOrderEmail(details: {
  orderNumber: string;
  userName: string;
  userEmail: string;
  planName: string;
  amount: number;
}): { subject: string; html: string } {
  const adminUrl = `${frontendUrl()}/admin/subscriptions`;
  const body = `
    <p style="margin:0 0 6px;font-size:12px;color:${EMAIL_BRAND.textLight};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Número de orden</p>
    <p style="margin:0 0 20px;font-size:22px;font-weight:800;color:${EMAIL_BRAND.text};letter-spacing:-0.02em;">${escapeHtml(details.orderNumber)}</p>
    ${infoCard("Resumen", [
      { label: "Cliente", value: `${escapeHtml(details.userName)}<br><span style="font-weight:400;color:${EMAIL_BRAND.textMuted};">${escapeHtml(details.userEmail)}</span>` },
      { label: "Plan", value: escapeHtml(details.planName) },
      { label: "Monto", value: `$${details.amount.toFixed(2)} MXN` },
    ])}
    <p style="margin:24px 0 0;text-align:center;"><a href="${adminUrl}" style="display:inline-block;background:linear-gradient(135deg,${EMAIL_BRAND.navyDark},${EMAIL_BRAND.navyMid});color:${EMAIL_BRAND.white};text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;">Ver en el panel</a></p>`;

  return {
    subject: `Nueva orden ${details.orderNumber} — $${details.amount.toFixed(2)} MXN`,
    html: emailLayout({
      title: "Nueva orden",
      preheader: `Nueva orden ${details.orderNumber} de ${details.userName}`,
      headerTitle: "Nueva orden creada",
      headerSubtitle: details.orderNumber,
      badge: "Admin",
      bodyHtml: body,
    }),
  };
}

function verificationEmail(
  firstName: string,
  code: number,
): { subject: string; html: string } {
  const body = `
    <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:${EMAIL_BRAND.navy};">Hola ${escapeHtml(firstName)},</p>
    <p style="margin:0 0 20px;color:${EMAIL_BRAND.textMuted};">Tu código de verificación es:</p>
    <div style="font-size:36px;font-weight:800;color:${EMAIL_BRAND.navy};text-align:center;padding:24px 16px;background:${EMAIL_BRAND.tintLight};border-radius:12px;border:2px solid ${EMAIL_BRAND.border};letter-spacing:8px;margin:0 0 20px;">${code}</div>
    <div style="background:${EMAIL_BRAND.tint};border-left:4px solid ${EMAIL_BRAND.navyMid};padding:14px 16px;border-radius:0 8px 8px 0;margin:0 0 16px;">
      <p style="margin:0;color:${EMAIL_BRAND.textMuted};font-size:13px;"><strong style="color:${EMAIL_BRAND.text};">Validez:</strong> este código expira en <strong>15 minutos</strong>.</p>
    </div>
    <p style="margin:0;color:${EMAIL_BRAND.textLight};font-size:13px;">Si no solicitaste este código, puedes ignorar este correo.</p>`;

  return {
    subject: `${code} es tu código de verificación`,
    html: emailLayout({
      title: "Código de verificación",
      preheader: `Tu código de verificación es ${code}`,
      headerTitle: "Código de verificación",
      headerSubtitle: "Acceso seguro sin contraseña",
      bodyHtml: body,
    }),
  };
}

function shippingEmail(
  userName: string,
  order: {
    orderNumber: string;
    trackingNumber: string;
    shipmentProvider: string;
    estimatedDelivery: string;
    planName: string;
    weight: string;
    coffeeName?: string;
    address: {
      full_name: string;
      street_address: string;
      street_address_2?: string;
      city: string;
      state: string;
      postal_code: string;
    };
  },
): { subject: string; html: string } {
  const rows = [
    { label: "Paquetería", value: escapeHtml(order.shipmentProvider) },
    { label: "Rastreo", value: escapeHtml(order.trackingNumber) },
    { label: "Entrega estimada", value: escapeHtml(order.estimatedDelivery) },
    { label: "Producto", value: `${escapeHtml(order.planName)} (${escapeHtml(order.weight)})` },
  ];
  if (order.coffeeName) {
    rows.push({ label: "Café del envío", value: escapeHtml(order.coffeeName) });
  }

  const addr = order.address;
  const body = `
    <p style="margin:0 0 12px;font-size:17px;font-weight:600;color:${EMAIL_BRAND.navy};">Hola ${escapeHtml(userName)},</p>
    <p style="margin:0 0 8px;color:${EMAIL_BRAND.textMuted};">Tu pedido ha sido enviado y está en camino. Aquí están los detalles:</p>
    ${infoCard("Información de envío", rows)}
    <div style="background:${EMAIL_BRAND.bgFooter};border:1px solid ${EMAIL_BRAND.border};border-radius:12px;padding:18px;margin:20px 0;">
      <h3 style="margin:0 0 8px;font-size:14px;font-weight:700;color:${EMAIL_BRAND.text};">Dirección de entrega</h3>
      <p style="margin:0;color:${EMAIL_BRAND.textMuted};font-size:14px;line-height:1.6;">
        ${escapeHtml(addr.full_name)}<br>
        ${escapeHtml(addr.street_address)}${addr.street_address_2 ? `, ${escapeHtml(addr.street_address_2)}` : ""}<br>
        ${escapeHtml(addr.city)}, ${escapeHtml(addr.state)} ${escapeHtml(addr.postal_code)}
      </p>
    </div>
    <div style="background:${EMAIL_BRAND.warningBg};border:1px solid ${EMAIL_BRAND.warningBorder};border-radius:12px;padding:16px;">
      <p style="margin:0;color:${EMAIL_BRAND.warning};font-size:13px;line-height:1.6;"><strong>Consejo:</strong> muele justo antes de preparar para obtener el máximo frescor y sabor.</p>
    </div>`;

  return {
    subject: `Tu Bolsa de Café está en camino — Orden #${order.orderNumber}`,
    html: emailLayout({
      title: "Pedido en camino",
      preheader: `Tu orden ${order.orderNumber} fue enviada.`,
      headerTitle: "Tu café está en camino",
      headerSubtitle: `Orden #${order.orderNumber}`,
      bodyHtml: body,
      cta: { label: "Ver mi cuenta", href: frontendUrl() },
    }),
  };
}

function deliveryEmail(
  userName: string,
  order: {
    orderNumber: string;
    planName: string;
    weight: string;
    blogPostTitle?: string;
    blogPostSlug?: string;
  },
): { subject: string; html: string } {
  let blogBlock = "";
  if (order.blogPostTitle && order.blogPostSlug) {
    blogBlock = `<div style="background:${EMAIL_BRAND.tintLight};border:1px solid ${EMAIL_BRAND.border};border-radius:12px;padding:18px;margin:20px 0;">
      <h3 style="color:${EMAIL_BRAND.navy};margin:0 0 8px;font-size:15px;font-weight:700;">Conoce más sobre tu café</h3>
      <p style="color:${EMAIL_BRAND.textMuted};font-size:14px;margin:0 0 14px;line-height:1.5;">${escapeHtml(order.blogPostTitle)}</p>
      <a href="${frontendUrl()}/blog/${escapeHtml(order.blogPostSlug)}" style="display:inline-block;background:${EMAIL_BRAND.navyMid};color:${EMAIL_BRAND.white};text-decoration:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;">Leer artículo</a>
    </div>`;
  }

  const body = `
    <p style="margin:0 0 12px;font-size:17px;font-weight:600;color:${EMAIL_BRAND.navy};">Hola ${escapeHtml(userName)},</p>
    <p style="margin:0 0 16px;color:${EMAIL_BRAND.textMuted};">Tu <strong style="color:${EMAIL_BRAND.text};">${escapeHtml(order.planName)} (${escapeHtml(order.weight)})</strong> fue marcado como entregado. Esperamos que disfrutes cada sorbo.</p>
    ${bulletList("Consejos para el mejor café", [
      "Almacena en lugar fresco, seco y alejado de la luz",
      "Muele justo antes de preparar",
      "Usa agua filtrada a 90–96 °C",
      "Disfrútalo dentro de 4 semanas para máxima frescura",
    ])}
    ${blogBlock}
    <p style="margin:16px 0 0;text-align:center;color:${EMAIL_BRAND.textMuted};font-size:13px;">Tu próximo envío ya está siendo preparado con el mismo cuidado.</p>`;

  return {
    subject: `Tu Bolsa de Café llegó — Orden #${order.orderNumber}`,
    html: emailLayout({
      title: "Pedido entregado",
      preheader: `Tu orden ${order.orderNumber} fue entregada.`,
      headerTitle: "Tu café llegó",
      headerSubtitle: `Orden #${order.orderNumber}`,
      bodyHtml: body,
      cta: { label: "Ver mi suscripción", href: frontendUrl() },
    }),
  };
}

function paymentDeclinedCustomerEmail(
  userName: string,
  details: {
    planName: string;
    amount: number;
    failureReason: string;
    isRenewal: boolean;
  },
): { subject: string; html: string } {
  const context = details.isRenewal
    ? "No pudimos procesar el cobro de renovación de tu suscripción mensual."
    : "No pudimos procesar el pago al activar tu suscripción.";

  const body = `
    <p style="margin:0 0 12px;font-size:17px;font-weight:600;color:${EMAIL_BRAND.navy};">Hola ${escapeHtml(userName)},</p>
    <p style="margin:0 0 16px;color:${EMAIL_BRAND.textMuted};">${context} Tu tarjeta fue rechazada o el pago no pudo completarse.</p>
    <div style="background:${EMAIL_BRAND.dangerBg};border:1px solid ${EMAIL_BRAND.dangerBorder};border-radius:12px;padding:18px;margin:0 0 20px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:${EMAIL_BRAND.danger};text-transform:uppercase;letter-spacing:0.05em;">Motivo</p>
      <p style="margin:0;color:${EMAIL_BRAND.text};font-size:14px;line-height:1.5;">${escapeHtml(details.failureReason)}</p>
    </div>
    ${infoCard("Detalles", [
      { label: "Plan", value: escapeHtml(details.planName) },
      { label: "Monto", value: `$${details.amount.toFixed(2)} MXN` },
    ])}
    <p style="margin:0 0 12px;color:${EMAIL_BRAND.textMuted};font-size:14px;">Actualiza tu método de pago para mantener tu suscripción activa y no interrumpir tus envíos.</p>`;

  return {
    subject: details.isRenewal
      ? "Acción requerida: problema con el pago de tu suscripción"
      : "No pudimos procesar el pago de tu suscripción",
    html: emailLayout({
      title: "Pago rechazado",
      preheader: "Actualiza tu método de pago para continuar con tu suscripción.",
      headerTitle: "Pago no procesado",
      headerSubtitle: "Tu tarjeta fue rechazada",
      bodyHtml: body,
      cta: { label: "Actualizar método de pago", href: frontendUrl() },
    }),
  };
}

function paymentDeclinedAdminEmail(details: {
  userName: string;
  userEmail: string;
  planName: string;
  amount: number;
  failureReason: string;
  stripeSubscriptionId?: string;
  isRenewal: boolean;
}): { subject: string; html: string } {
  const adminUrl = `${frontendUrl()}/admin/subscriptions`;
  const body = `
    <p style="margin:0 0 16px;color:${EMAIL_BRAND.textMuted};">${details.isRenewal ? "Falló el cobro de renovación" : "Falló el pago inicial"} de una suscripción. El cliente y el equipo fueron notificados.</p>
    ${infoCard("Detalle del fallo", [
      { label: "Cliente", value: `${escapeHtml(details.userName)}<br><span style="font-weight:400;color:${EMAIL_BRAND.textMuted};">${escapeHtml(details.userEmail)}</span>` },
      { label: "Plan", value: escapeHtml(details.planName) },
      { label: "Monto", value: `$${details.amount.toFixed(2)} MXN` },
      { label: "Motivo", value: escapeHtml(details.failureReason) },
      ...(details.stripeSubscriptionId
        ? [{ label: "Stripe sub", value: escapeHtml(details.stripeSubscriptionId) }]
        : []),
    ])}
    <p style="margin:20px 0 0;text-align:center;"><a href="${adminUrl}" style="display:inline-block;background:linear-gradient(135deg,${EMAIL_BRAND.navyDark},${EMAIL_BRAND.navyMid});color:${EMAIL_BRAND.white};text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;">Ver suscripciones</a></p>`;

  return {
    subject: `Pago rechazado — ${details.userName} ($${details.amount.toFixed(2)} MXN)`,
    html: emailLayout({
      title: "Pago rechazado",
      preheader: `Pago rechazado para ${details.userEmail}`,
      headerTitle: "Pago rechazado",
      headerSubtitle: details.userEmail,
      badge: "Admin",
      bodyHtml: body,
    }),
  };
}



function createResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getFromAddress() {
  return process.env.SMTP_FROM || "Bolsa de Café <dihola@bolsadecafe.com>";
}

async function sendEmail(to: string | string[], subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.error("[Email] RESEND_API_KEY not configured — skipping send");
    return;
  }
  const resend = createResendClient();
  await resend.emails.send({
    from: getFromAddress(),
    to,
    subject,
    html,
  });
}

async function sendSubscriptionConfirmationEmail(
  userEmail: string,
  userName: string,
  details: Parameters<typeof subscriptionConfirmationEmail>[1],
) {
  try {
    const { subject, html } = subscriptionConfirmationEmail(userName, details);
    await sendEmail(userEmail, subject, html);
    console.log(`[Email] Subscription confirmation sent to ${userEmail}`);
  } catch (err) {
    console.error("[Email] Subscription confirmation failed:", err);
  }
}

async function sendAdminNewOrderNotification(
  pool: Pool,
  details: {
    orderNumber: string;
    userName: string;
    userEmail: string;
    planName: string;
    amount: number;
  },
) {
  try {
    if (!process.env.RESEND_API_KEY) return;
    const [admins] = await pool.query<any[]>(
      "SELECT email FROM admins WHERE is_active = 1",
    );
    if (admins.length === 0) return;
    const { subject, html } = adminNewOrderEmail(details);
    await sendEmail(
      admins.map((a) => a.email),
      subject,
      html,
    );
    console.log(
      `[Email] Admin new-order notification sent for ${details.orderNumber}`,
    );
  } catch (err) {
    console.error("[Email] Admin new-order notification failed:", err);
  }
}

async function sendVerificationEmail(
  email: string,
  code: number,
  firstName: string,
) {
  const { subject, html } = verificationEmail(firstName, code);
  await sendEmail(email, subject, html);
  console.log(`[Email] Verification code sent to ${email}`);
}

async function sendShippingEmail(
  userEmail: string,
  userName: string,
  orderDetails: Parameters<typeof shippingEmail>[1],
) {
  try {
    const { subject, html } = shippingEmail(userName, orderDetails);
    await sendEmail(userEmail, subject, html);
    console.log(`[Email] Shipping notification sent to ${userEmail}`);
  } catch (err) {
    console.error("[Email] Shipping notification failed:", err);
  }
}

async function sendDeliveryEmail(
  userEmail: string,
  userName: string,
  orderDetails: Parameters<typeof deliveryEmail>[1],
) {
  try {
    const { subject, html } = deliveryEmail(userName, orderDetails);
    await sendEmail(userEmail, subject, html);
    console.log(`[Email] Delivery notification sent to ${userEmail}`);
  } catch (err) {
    console.error("[Email] Delivery notification failed:", err);
  }
}

async function sendPaymentDeclinedNotifications(
  pool: Pool,
  details: {
    userName: string;
    userEmail: string;
    planName: string;
    amount: number;
    failureReason: string;
    stripeSubscriptionId?: string;
    isRenewal: boolean;
  },
) {
  try {
    if (!process.env.RESEND_API_KEY) return;

    const customer = paymentDeclinedCustomerEmail(details.userName, {
      planName: details.planName,
      amount: details.amount,
      failureReason: details.failureReason,
      isRenewal: details.isRenewal,
    });
    await sendEmail(details.userEmail, customer.subject, customer.html);

    const [admins] = await pool.query<any[]>(
      "SELECT email FROM admins WHERE is_active = 1",
    );
    if (admins.length > 0) {
      const admin = paymentDeclinedAdminEmail(details);
      await sendEmail(
        admins.map((a) => a.email),
        admin.subject,
        admin.html,
      );
    }

    console.log(
      `[Email] Payment declined notifications sent for ${details.userEmail}`,
    );
  } catch (err) {
    console.error("[Email] Payment declined notifications failed:", err);
  }
}



// =====================================================
// ROUTE HANDLERS
// =====================================================
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
        a.full_name as author_name,
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
        a.full_name as author_name,
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
      "SELECT id, stripe_subscription_id, plan_id FROM subscriptions WHERE id = ? AND user_id = ? AND status NOT IN ('cancelled')",
      [subscriptionId, userId],
    );
    if (subs.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Suscripción no encontrada" });
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
      try {
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
      } catch (stripeErr) {
        // Log but don't abort — DB still gets updated
        console.error("Stripe plan update error (non-fatal):", stripeErr);
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
      try {
        await stripe.subscriptions.update(sub.stripe_subscription_id, {
          cancel_at_period_end: true,
        });
      } catch (stripeErr) {
        // Log but don't abort — still mark as cancelled in DB
        console.error("Stripe cancel error (non-fatal):", stripeErr);
      }
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
      .json({ success: false, error: "Error al cancelar la suscripción" });
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
 * Optional query param: ?subscriptionId=sub_xxx
 *   When provided, isDefault reflects the subscription-level default payment
 *   method instead of the customer-level default.
 */
const handleGetPaymentMethods: RequestHandler = async (req, res) => {
  const userId = extractUserId(req, res);
  if (!userId) return;

  const stripeSubscriptionId = (req.query.subscriptionId as string) || null;

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
    const customerDefaultPmId =
      (customer.invoice_settings?.default_payment_method as string) || null;

    // Prefer the subscription-level default when a subscriptionId is given
    let defaultPmId = customerDefaultPmId;
    if (stripeSubscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const subDefaultPmId = sub.default_payment_method as string | null;
        if (subDefaultPmId) defaultPmId = subDefaultPmId;
      } catch {
        // Subscription not found in Stripe — fall back to customer default
      }
    }

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
 * Set a saved payment method as the default.
 * Optional body: { subscriptionId: "sub_xxx" }
 *   When provided, updates the subscription-level default_payment_method AND
 *   the customer-level default so both are in sync.
 */
const handleSetDefaultPaymentMethod: RequestHandler = async (req, res) => {
  const userId = extractUserId(req, res);
  if (!userId) return;

  const paymentMethodId = req.params.id;
  const stripeSubscriptionId: string | undefined = req.body?.subscriptionId;

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

    // Update subscription-level default when subscriptionId is provided
    if (stripeSubscriptionId) {
      await stripe.subscriptions.update(stripeSubscriptionId, {
        default_payment_method: paymentMethodId,
      });
    }

    // Always keep customer-level default in sync
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
      const declineMessage = humanizeStripeDecline(
        paymentIntent?.last_payment_error?.message,
      );
      const amount = parseFloat(plan.price_mxn);

      await sendPaymentDeclinedNotifications(pool, {
        userName: user.full_name,
        userEmail: user.email,
        planName: plan.name,
        amount,
        failureReason: declineMessage,
        stripeSubscriptionId: stripeSubscription.id,
        isRenewal: false,
      });

      try {
        await stripe.subscriptions.cancel(stripeSubscription.id);
      } catch (cancelErr) {
        console.warn(
          "[Subscription] Could not cancel incomplete Stripe subscription:",
          cancelErr,
        );
      }

      return res.status(402).json({
        success: false,
        error: declineMessage,
        code: "card_declined",
      });
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
        if (decoded?.userId) {
          const [rows] = await pool.query<any[]>(
            "SELECT id FROM users WHERE id = ? LIMIT 1",
            [decoded.userId],
          );
          if (rows.length > 0) userId = decoded.userId as number;
        }
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
    const [plansRows, grindRows, stateRows, blogRows] = await Promise.all([
      pool.query<any[]>(
        `SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY price_mxn ASC`,
      ),
      pool.query<any[]>(
        `SELECT * FROM grind_types WHERE is_active = 1 ORDER BY sort_order ASC`,
      ),
      pool.query<any[]>(
        `SELECT * FROM mexico_states WHERE is_active = 1 ORDER BY name ASC`,
      ),
      pool.query<any[]>(
        `SELECT bp.*, a.full_name as author_name, bc.name as category_name
         FROM blog_posts bp
         JOIN admins a ON bp.author_id = a.id
         LEFT JOIN blog_categories bc ON bp.category_id = bc.id
         WHERE bp.status = 'published'
         ORDER BY bp.published_at DESC
         LIMIT 4`,
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
    const blogPosts = blogRows[0] as any[];

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

    res.json({ plans, grindTypes, states, blogPosts, user });
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
    "SELECT id, name FROM subscription_plans WHERE id = ?",
    [sub.plan_id],
  );
  if (planRows.length > 0) {
    await pool.query(
      `INSERT INTO order_items (order_id, plan_id, quantity, unit_price, subtotal)
       VALUES (?, ?, 1, ?, ?)`,
      [orderResult.insertId, planRows[0].id, amount, amount],
    );
  }

  // Fetch user info for admin notification
  const [userRows] = await pool.query<any[]>(
    "SELECT full_name, email FROM users WHERE id = ?",
    [sub.user_id],
  );
  const user = userRows[0] ?? { full_name: "Cliente", email: "" };
  const planName = planRows[0]?.name ?? `Plan #${sub.plan_id}`;

  // Notify all active admins
  await sendAdminNewOrderNotification(pool, {
    orderNumber,
    userName: user.full_name,
    userEmail: user.email,
    planName,
    amount,
  });

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

  const invoiceTag = `[invoice:${invoice.id}]`;
  const [existingFailed] = await pool.query<any[]>(
    `SELECT id FROM payments WHERE failure_reason LIKE ? AND status = 'failed' LIMIT 1`,
    [`%${invoiceTag}%`],
  );
  if (existingFailed.length > 0) {
    console.log(
      `[Webhook] Invoice ${invoice.id} failure already processed, skipping`,
    );
    return;
  }

  await pool.query(
    `UPDATE subscriptions SET status = 'past_due', updated_at = NOW()
     WHERE stripe_subscription_id = ?`,
    [stripeSubscriptionId],
  );

  const [subs] = await pool.query<any[]>(
    `SELECT s.id, s.user_id, u.full_name, u.email, sp.name AS plan_name, sp.price_mxn
     FROM subscriptions s
     JOIN users u ON s.user_id = u.id
     JOIN subscription_plans sp ON s.plan_id = sp.id
     WHERE s.stripe_subscription_id = ?`,
    [stripeSubscriptionId],
  );
  if (subs.length === 0) return;
  const sub = subs[0];

  const failureReasonRaw =
    inv.last_finalization_error?.message ||
    inv.charge?.failure_message ||
    "Payment declined";
  const friendlyReason = humanizeStripeDecline(failureReasonRaw);
  const failureReason = `${friendlyReason} ${invoiceTag}`;
  const amount = (inv.amount_due ?? 0) / 100;

  await pool.query(
    `INSERT INTO payments
       (user_id, subscription_id, stripe_payment_id,
        amount, currency, status, failure_reason)
     VALUES (?, ?, ?, ?, 'MXN', 'failed', ?)`,
    [
      sub.user_id,
      sub.id,
      (inv.payment_intent as string) ?? null,
      amount,
      failureReason,
    ],
  );

  await sendPaymentDeclinedNotifications(pool, {
    userName: sub.full_name,
    userEmail: sub.email,
    planName: sub.plan_name,
    amount,
    failureReason: friendlyReason,
    stripeSubscriptionId,
    isRenewal: true,
  });

  console.log(`[Webhook] Payment failed for subscription ${sub.id}`);
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
// ADMIN HELPERS
// =====================================================

/** Extract admin ID from Bearer JWT for admin-protected routes */
function extractAdminId(req: any, res: any): number | null {
  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader?.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ success: false, error: "No session token provided" });
    return null;
  }
  try {
    const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET) as any;
    if (decoded.userType !== "admin") {
      res.status(401).json({ success: false, error: "Invalid session type" });
      return null;
    }
    return decoded.adminId as number;
  } catch {
    res
      .status(401)
      .json({ success: false, error: "Invalid or expired session" });
    return null;
  }
}


// =====================================================
// ADMIN ROUTE HANDLERS
// =====================================================

/**
 * POST /api/admin/auth/send-code
 * Send OTP verification code to admin email (passwordless)
 */
const handleAdminSendCode: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email requerido" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [admins] = await pool.query<any[]>(
      "SELECT * FROM admins WHERE email = ? AND is_active = 1",
      [normalizedEmail],
    );

    if (admins.length === 0) {
      // Return generic error to avoid email enumeration
      return res.status(404).json({
        success: false,
        error: "No existe una cuenta de administrador con ese correo",
      });
    }

    const admin = admins[0];
    const code = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      "UPDATE admins SET otp_code = ?, otp_expires_at = ? WHERE id = ?",
      [code, expiresAt, admin.id],
    );

    await sendVerificationEmail(
      normalizedEmail,
      code,
      (admin.full_name || "Admin").split(" ")[0],
    );

    res.json({
      success: true,
      message: "Código de acceso enviado",
      debug_code: process.env.NODE_ENV === "development" ? code : undefined,
    });
  } catch (error) {
    console.error("Admin send-code error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al enviar el código" });
  }
};

/**
 * POST /api/admin/auth/verify-code
 * Verify OTP and return admin session token
 */
const handleAdminVerifyCode: RequestHandler = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res
        .status(400)
        .json({ success: false, error: "Email y código requeridos" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [admins] = await pool.query<any[]>(
      "SELECT * FROM admins WHERE email = ? AND is_active = 1 AND otp_code = ? AND otp_expires_at > NOW()",
      [normalizedEmail, parseInt(code)],
    );

    if (admins.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: "Código inválido o expirado" });
    }

    const admin = admins[0];

    // Clear OTP after use
    await pool.query(
      "UPDATE admins SET otp_code = NULL, otp_expires_at = NULL, last_login = NOW() WHERE id = ?",
      [admin.id],
    );

    const sessionToken = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        userType: "admin",
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      success: true,
      sessionToken,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        avatar_url: admin.avatar_url,
        bio: admin.bio,
      },
    });
  } catch (error) {
    console.error("Admin verify-code error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al verificar el código" });
  }
};

/**
 * GET /api/admin/auth/validate
 */
const handleAdminValidate: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;
  try {
    const [admins] = await pool.query<any[]>(
      "SELECT id, username, email, full_name, role, avatar_url, bio FROM admins WHERE id = ? AND is_active = 1",
      [adminId],
    );
    if (admins.length === 0) {
      return res.status(401).json({ success: false, error: "Admin not found" });
    }
    res.json({ success: true, admin: admins[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: "Validation error" });
  }
};

/**
 * POST /api/admin/auth/logout
 */
const handleAdminLogout: RequestHandler = (_req, res) => {
  res.json({ success: true });
};

/**
 * GET /api/admin/dashboard
 * Returns aggregate metrics for the admin dashboard
 */
const handleAdminDashboard: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;
  try {
    const [
      [totalSubs],
      [activeSubs],
      [revenueData],
      [monthlyRevRow],
      [pipelineOrders],
      [monthOrders],
      [newClients],
      revenueByMonthRows,
    ] = await Promise.all([
      pool.query<any[]>("SELECT COUNT(*) as count FROM subscriptions"),
      pool.query<any[]>(
        "SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'",
      ),
      pool.query<any[]>(
        "SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE status = 'succeeded'",
      ),
      pool.query<any[]>(
        "SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE status = 'succeeded' AND MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())",
      ),
      pool.query<any[]>(
        "SELECT COUNT(*) as count FROM orders WHERE status IN ('processing','shipped')",
      ),
      pool.query<any[]>(
        "SELECT COUNT(*) as count FROM orders WHERE MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())",
      ),
      pool.query<any[]>(
        "SELECT COUNT(*) as count FROM users WHERE MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())",
      ),
      pool.query<any[]>(
        `SELECT DATE_FORMAT(created_at,'%Y-%m') as month, COALESCE(SUM(amount),0) as revenue, COUNT(*) as orders FROM payments WHERE status='succeeded' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) GROUP BY DATE_FORMAT(created_at,'%Y-%m') ORDER BY month ASC`,
      ),
    ]);

    res.json({
      totalSubscribers: totalSubs[0]?.count ?? 0,
      activeSubscriptions: activeSubs[0]?.count ?? 0,
      totalRevenue: parseFloat(revenueData[0]?.total ?? 0),
      monthlyRevenue: parseFloat(monthlyRevRow[0]?.total ?? 0),
      ordersInPipeline: pipelineOrders[0]?.count ?? 0,
      ordersThisMonth: monthOrders[0]?.count ?? 0,
      newClientsThisMonth: newClients[0]?.count ?? 0,
      revenueByMonth: (revenueByMonthRows[0] as any[]).map((r: any) => ({
        month: r.month,
        revenue: parseFloat(r.revenue),
        orders: r.orders,
      })),
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ success: false, error: "Error al cargar métricas" });
  }
};

/**
 * GET /api/admin/orders
 * Returns all active pipeline orders (processing, shipped, delivered recent)
 */
const handleAdminOrders: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;
  try {
    const [rows] = await pool.query<any[]>(
      `SELECT
         o.id, o.order_number, o.status, o.total_amount, o.created_at,
         o.shipped_at, o.delivered_at, o.tracking_number,
         o.shipment_provider, o.estimated_delivery, o.notes,
         o.subscription_id, o.coffee_catalog_id,
         o.shipping_label_cost, o.supply_cost,
         u.id as user_id, u.email as user_email, u.full_name as user_full_name, u.phone as user_phone,
         sp.name as plan_name, sp.weight as plan_weight,
         gt.name as grind_type_name,
         a.full_name as address_full_name, a.street_address as address_street,
         a.street_address_2 as address_street2, a.city as address_city,
         ms.name as address_state, a.postal_code as address_postal_code, a.phone as address_phone,
         cc.name as coffee_catalog_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN subscriptions s ON o.subscription_id = s.id
       LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
       LEFT JOIN grind_types gt ON s.grind_type_id = gt.id
       LEFT JOIN addresses a ON o.shipping_address_id = a.id
       LEFT JOIN mexico_states ms ON a.state_id = ms.id
       LEFT JOIN coffee_catalog cc ON o.coffee_catalog_id = cc.id
       WHERE o.status IN ('processing','shipped','delivered')
       ORDER BY o.created_at DESC
       LIMIT 200`,
    );

    const orders = rows.map((r) => ({
      id: r.id,
      orderNumber: r.order_number,
      status: r.status,
      totalAmount: parseFloat(r.total_amount),
      createdAt: r.created_at,
      shippedAt: r.shipped_at,
      deliveredAt: r.delivered_at,
      trackingNumber: r.tracking_number,
      shipmentProvider: r.shipment_provider,
      estimatedDelivery: r.estimated_delivery,
      notes: r.notes,
      subscriptionId: r.subscription_id,
      coffeeCatalogId: r.coffee_catalog_id,
      coffeeCatalogName: r.coffee_catalog_name,
      shippingLabelCost:
        r.shipping_label_cost != null
          ? parseFloat(r.shipping_label_cost)
          : null,
      supplyCost: r.supply_cost != null ? parseFloat(r.supply_cost) : null,
      userId: r.user_id,
      userEmail: r.user_email,
      userFullName: r.user_full_name,
      userPhone: r.user_phone,
      planName: r.plan_name,
      planWeight: r.plan_weight,
      grindTypeName: r.grind_type_name,
      addressFullName: r.address_full_name,
      addressStreet: r.address_street,
      addressStreet2: r.address_street2,
      addressCity: r.address_city,
      addressState: r.address_state,
      addressPostalCode: r.address_postal_code,
      addressPhone: r.address_phone,
    }));

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Admin orders error:", error);
    res.status(500).json({ success: false, error: "Error al cargar órdenes" });
  }
};

/**
 * PUT /api/admin/orders/:id/ship
 * Move order to 'shipped' status
 */
const handleAdminShipOrder: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;

  const orderId = parseInt(req.params.id);
  const {
    trackingNumber,
    shipmentProvider,
    estimatedDelivery,
    coffeeCatalogId,
    shippingLabelCost,
    supplyCost,
  } = req.body;

  if (!trackingNumber || !shipmentProvider || !estimatedDelivery) {
    return res.status(400).json({
      success: false,
      error:
        "trackingNumber, shipmentProvider y estimatedDelivery son requeridos",
    });
  }

  try {
    const [orders] = await pool.query<any[]>(
      `SELECT o.*, u.email as user_email, u.full_name as user_full_name,
              sp.name as plan_name, sp.weight as plan_weight,
              a.full_name as addr_name, a.street_address, a.street_address_2,
              a.city, ms.name as state_name, a.postal_code
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN subscriptions s ON o.subscription_id = s.id
       LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
       LEFT JOIN addresses a ON o.shipping_address_id = a.id
       LEFT JOIN mexico_states ms ON a.state_id = ms.id
       WHERE o.id = ? AND o.status = 'processing'`,
      [orderId],
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Orden no encontrada o no en estado procesando",
      });
    }

    const order = orders[0];

    await pool.query(
      `UPDATE orders SET status='shipped', tracking_number=?, shipment_provider=?, estimated_delivery=?, coffee_catalog_id=?, shipping_label_cost=?, supply_cost=?, shipped_at=NOW(), updated_at=NOW() WHERE id=?`,
      [
        trackingNumber,
        shipmentProvider,
        estimatedDelivery,
        coffeeCatalogId ?? null,
        shippingLabelCost != null ? Number(shippingLabelCost) : null,
        supplyCost != null ? Number(supplyCost) : null,
        orderId,
      ],
    );

    // Log admin action
    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, resource_type, resource_id, details) VALUES (?, 'ship_order', 'order', ?, ?)`,
      [
        adminId,
        orderId,
        JSON.stringify({
          trackingNumber,
          shipmentProvider,
          estimatedDelivery,
          coffeeCatalogId: coffeeCatalogId ?? null,
          shippingLabelCost: shippingLabelCost ?? null,
          supplyCost: supplyCost ?? null,
        }),
      ],
    );

    // Lookup coffee name if provided
    let coffeeCatalogName: string | undefined;
    if (coffeeCatalogId) {
      const [coffeeRows] = await pool.query<any[]>(
        `SELECT name FROM coffee_catalog WHERE id = ?`,
        [coffeeCatalogId],
      );
      coffeeCatalogName = (coffeeRows as any[])[0]?.name;
    }

    // Send email notification
    const estimatedDateFormatted = new Date(
      estimatedDelivery,
    ).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    await sendShippingEmail(
      order.user_email,
      order.user_full_name.split(" ")[0],
      {
        orderNumber: order.order_number,
        trackingNumber,
        shipmentProvider,
        estimatedDelivery: estimatedDateFormatted,
        planName: order.plan_name || "Café de Especialidad",
        weight: order.plan_weight || "",
        coffeeName: coffeeCatalogName,
        address: {
          full_name: order.addr_name || order.user_full_name,
          street_address: order.street_address || "",
          street_address_2: order.street_address_2,
          city: order.city || "",
          state: order.state_name || "",
          postal_code: order.postal_code || "",
        },
      },
    );

    // Fetch updated order
    const [updatedRows] = await pool.query<any[]>(
      `SELECT o.id, o.order_number, o.status, o.total_amount, o.created_at, o.shipped_at, o.delivered_at, o.tracking_number, o.shipment_provider, o.estimated_delivery, o.notes, o.subscription_id, o.coffee_catalog_id, o.shipping_label_cost, o.supply_cost, u.id as user_id, u.email as user_email, u.full_name as user_full_name, u.phone as user_phone, sp.name as plan_name, sp.weight as plan_weight, gt.name as grind_type_name, a.full_name as address_full_name, a.street_address as address_street, a.street_address_2 as address_street2, a.city as address_city, ms.name as address_state, a.postal_code as address_postal_code, a.phone as address_phone, cc.name as coffee_catalog_name FROM orders o JOIN users u ON o.user_id = u.id LEFT JOIN subscriptions s ON o.subscription_id = s.id LEFT JOIN subscription_plans sp ON s.plan_id = sp.id LEFT JOIN grind_types gt ON s.grind_type_id = gt.id LEFT JOIN addresses a ON o.shipping_address_id = a.id LEFT JOIN mexico_states ms ON a.state_id = ms.id LEFT JOIN coffee_catalog cc ON o.coffee_catalog_id = cc.id WHERE o.id = ?`,
      [orderId],
    );

    const r = updatedRows[0];
    res.json({
      success: true,
      order: {
        id: r.id,
        orderNumber: r.order_number,
        status: r.status,
        totalAmount: parseFloat(r.total_amount),
        createdAt: r.created_at,
        shippedAt: r.shipped_at,
        deliveredAt: r.delivered_at,
        trackingNumber: r.tracking_number,
        shipmentProvider: r.shipment_provider,
        estimatedDelivery: r.estimated_delivery,
        notes: r.notes,
        subscriptionId: r.subscription_id,
        coffeeCatalogId: r.coffee_catalog_id,
        coffeeCatalogName: r.coffee_catalog_name,
        shippingLabelCost:
          r.shipping_label_cost != null
            ? parseFloat(r.shipping_label_cost)
            : null,
        supplyCost: r.supply_cost != null ? parseFloat(r.supply_cost) : null,
        userId: r.user_id,
        userEmail: r.user_email,
        userFullName: r.user_full_name,
        userPhone: r.user_phone,
        planName: r.plan_name,
        planWeight: r.plan_weight,
        grindTypeName: r.grind_type_name,
        addressFullName: r.address_full_name,
        addressStreet: r.address_street,
        addressStreet2: r.address_street2,
        addressCity: r.address_city,
        addressState: r.address_state,
        addressPostalCode: r.address_postal_code,
        addressPhone: r.address_phone,
      },
    });
  } catch (error) {
    console.error("Admin ship order error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al actualizar orden" });
  }
};

/**
 * PUT /api/admin/orders/:id/deliver
 * Move order to 'delivered' status, optional blog post
 */
const handleAdminDeliverOrder: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;

  const orderId = parseInt(req.params.id);
  const { blogPostTitle, blogPostContent } = req.body;

  try {
    const [orders] = await pool.query<any[]>(
      `SELECT o.*, u.email as user_email, u.full_name as user_full_name, sp.name as plan_name, sp.weight as plan_weight FROM orders o JOIN users u ON o.user_id = u.id LEFT JOIN subscriptions s ON o.subscription_id = s.id LEFT JOIN subscription_plans sp ON s.plan_id = sp.id WHERE o.id = ? AND o.status = 'shipped'`,
      [orderId],
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Orden no encontrada o no en estado enviado",
      });
    }

    const order = orders[0];

    await pool.query(
      `UPDATE orders SET status='delivered', delivered_at=NOW(), updated_at=NOW() WHERE id=?`,
      [orderId],
    );

    // Create optional blog post
    let blogPostSlug: string | undefined;
    if (blogPostTitle && blogPostContent) {
      const slug = blogPostTitle
        .toLowerCase()
        .replace(/[áàäâ]/g, "a")
        .replace(/[éèëê]/g, "e")
        .replace(/[íìïî]/g, "i")
        .replace(/[óòöô]/g, "o")
        .replace(/[úùüû]/g, "u")
        .replace(/ñ/g, "n")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 100);
      const uniqueSlug = `${slug}-${Date.now()}`;
      await pool.query(
        `INSERT INTO blog_posts (title, slug, content, author_id, status, published_at) VALUES (?, ?, ?, ?, 'published', NOW())`,
        [blogPostTitle, uniqueSlug, blogPostContent, adminId],
      );
      blogPostSlug = uniqueSlug;
    }

    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, resource_type, resource_id, details) VALUES (?, 'deliver_order', 'order', ?, ?)`,
      [
        adminId,
        orderId,
        JSON.stringify({ blogPostTitle: blogPostTitle || null }),
      ],
    );

    await sendDeliveryEmail(
      order.user_email,
      order.user_full_name.split(" ")[0],
      {
        orderNumber: order.order_number,
        planName: order.plan_name || "Café de Especialidad",
        weight: order.plan_weight || "",
        blogPostTitle: blogPostTitle || undefined,
        blogPostSlug,
      },
    );

    // Fetch updated order
    const [updatedRows] = await pool.query<any[]>(
      `SELECT o.id, o.order_number, o.status, o.total_amount, o.created_at, o.shipped_at, o.delivered_at, o.tracking_number, o.shipment_provider, o.estimated_delivery, o.notes, o.subscription_id, u.id as user_id, u.email as user_email, u.full_name as user_full_name, u.phone as user_phone, sp.name as plan_name, sp.weight as plan_weight, gt.name as grind_type_name, a.full_name as address_full_name, a.street_address as address_street, a.street_address_2 as address_street2, a.city as address_city, ms.name as address_state, a.postal_code as address_postal_code, a.phone as address_phone FROM orders o JOIN users u ON o.user_id = u.id LEFT JOIN subscriptions s ON o.subscription_id = s.id LEFT JOIN subscription_plans sp ON s.plan_id = sp.id LEFT JOIN grind_types gt ON s.grind_type_id = gt.id LEFT JOIN addresses a ON o.shipping_address_id = a.id LEFT JOIN mexico_states ms ON a.state_id = ms.id WHERE o.id = ?`,
      [orderId],
    );

    const r = updatedRows[0];
    res.json({
      success: true,
      order: {
        id: r.id,
        orderNumber: r.order_number,
        status: r.status,
        totalAmount: parseFloat(r.total_amount),
        createdAt: r.created_at,
        shippedAt: r.shipped_at,
        deliveredAt: r.delivered_at,
        trackingNumber: r.tracking_number,
        shipmentProvider: r.shipment_provider,
        estimatedDelivery: r.estimated_delivery,
        notes: r.notes,
        subscriptionId: r.subscription_id,
        userId: r.user_id,
        userEmail: r.user_email,
        userFullName: r.user_full_name,
        userPhone: r.user_phone,
        planName: r.plan_name,
        planWeight: r.plan_weight,
        grindTypeName: r.grind_type_name,
        addressFullName: r.address_full_name,
        addressStreet: r.address_street,
        addressStreet2: r.address_street2,
        addressCity: r.address_city,
        addressState: r.address_state,
        addressPostalCode: r.address_postal_code,
        addressPhone: r.address_phone,
      },
    });
  } catch (error) {
    console.error("Admin deliver order error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al actualizar orden" });
  }
};

/**
 * GET /api/admin/clients
 * Returns all users with subscription/order summary
 */
const handleAdminClients: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;
  try {
    const [rows] = await pool.query<any[]>(
      `SELECT
         u.id, u.email, u.full_name, u.phone, u.stripe_customer_id,
         u.email_verified, u.is_active, u.created_at, u.updated_at,
         s.status as subscription_status,
         sp.name as plan_name,
         COALESCE(o_stats.total_orders, 0) as total_orders,
         COALESCE(o_stats.total_spent, 0) as total_spent
       FROM users u
       LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
       LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
       LEFT JOIN (
         SELECT user_id, COUNT(*) as total_orders, SUM(total_amount) as total_spent
         FROM orders WHERE status NOT IN ('cancelled','refunded')
         GROUP BY user_id
       ) o_stats ON u.id = o_stats.user_id
       ORDER BY u.created_at DESC
       LIMIT 500`,
    );

    res.json({ success: true, clients: rows });
  } catch (error) {
    console.error("Admin clients error:", error);
    res.status(500).json({ success: false, error: "Error al cargar clientes" });
  }
};

/**
 * GET /api/admin/settings
 */
const handleAdminGetSettings: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;
  try {
    const [admins] = await pool.query<any[]>(
      "SELECT id, username, email, full_name, role, avatar_url, bio FROM admins WHERE id = ?",
      [adminId],
    );
    if (admins.length === 0)
      return res.status(404).json({ success: false, error: "Admin not found" });
    res.json({ success: true, admin: admins[0] });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error al obtener configuración" });
  }
};

/**
 * PUT /api/admin/settings
 */
const handleAdminUpdateSettings: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;

  const { full_name, email, bio, currentPassword, newPassword } = req.body;
  if (!full_name || !email) {
    return res
      .status(400)
      .json({ success: false, error: "Nombre y email son requeridos" });
  }

  try {
    const [admins] = await pool.query<any[]>(
      "SELECT * FROM admins WHERE id = ?",
      [adminId],
    );
    if (admins.length === 0)
      return res.status(404).json({ success: false, error: "Admin not found" });
    const admin = admins[0];

    if (newPassword) {
      if (!currentPassword)
        return res
          .status(400)
          .json({ success: false, error: "Contraseña actual requerida" });
      const passwordMatch = await bcrypt.compare(
        currentPassword,
        admin.password_hash,
      );
      if (!passwordMatch)
        return res
          .status(400)
          .json({ success: false, error: "Contraseña actual incorrecta" });
      const newHash = await bcrypt.hash(newPassword, 10);
      await pool.query(
        "UPDATE admins SET full_name=?, email=?, bio=?, password_hash=?, updated_at=NOW() WHERE id=?",
        [full_name, email, bio || null, newHash, adminId],
      );
    } else {
      await pool.query(
        "UPDATE admins SET full_name=?, email=?, bio=?, updated_at=NOW() WHERE id=?",
        [full_name, email, bio || null, adminId],
      );
    }

    const [updated] = await pool.query<any[]>(
      "SELECT id, username, email, full_name, role, avatar_url, bio FROM admins WHERE id = ?",
      [adminId],
    );
    res.json({ success: true, admin: updated[0] });
  } catch (error) {
    console.error("Admin settings error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al guardar configuración" });
  }
};

/**
 * GET /api/admin/people — list all admins (super_admin only)
 */
const handleAdminGetPeople: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;
  try {
    const [requester] = await pool.query<any[]>(
      "SELECT role FROM admins WHERE id = ?",
      [adminId],
    );
    if (!requester.length || requester[0].role !== "super_admin") {
      return res.status(403).json({ success: false, error: "Acceso denegado" });
    }
    const [people] = await pool.query<any[]>(
      "SELECT id, username, email, full_name, role, is_active, avatar_url, bio, last_login, created_at FROM admins ORDER BY created_at ASC",
    );
    res.json({ success: true, people });
  } catch (error) {
    console.error("Admin people error:", error);
    res.status(500).json({ success: false, error: "Error al obtener equipo" });
  }
};

/**
 * POST /api/admin/people — create admin (super_admin only)
 */
const handleAdminCreatePerson: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;
  try {
    const [requester] = await pool.query<any[]>(
      "SELECT role FROM admins WHERE id = ?",
      [adminId],
    );
    if (!requester.length || requester[0].role !== "super_admin") {
      return res.status(403).json({ success: false, error: "Acceso denegado" });
    }

    const { username, email, full_name, role, bio } = req.body;
    if (!username || !email || !full_name || !role) {
      return res
        .status(400)
        .json({ success: false, error: "Todos los campos son requeridos" });
    }
    if (!["super_admin", "admin", "support"].includes(role)) {
      return res.status(400).json({ success: false, error: "Rol inválido" });
    }

    const [existing] = await pool.query<any[]>(
      "SELECT id FROM admins WHERE email = ? OR username = ?",
      [email, username],
    );
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ success: false, error: "Email o usuario ya existe" });
    }

    // OTP-only system — placeholder hash
    const placeholderHash = await bcrypt.hash(`otp-only-${Date.now()}`, 10);

    const [result] = await pool.query<any>(
      "INSERT INTO admins (username, email, full_name, role, bio, password_hash, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())",
      [username, email, full_name, role, bio || null, placeholderHash],
    );

    const [created] = await pool.query<any[]>(
      "SELECT id, username, email, full_name, role, is_active, avatar_url, bio, last_login, created_at FROM admins WHERE id = ?",
      [result.insertId],
    );
    res.json({ success: true, person: created[0] });
  } catch (error) {
    console.error("Admin create person error:", error);
    res.status(500).json({ success: false, error: "Error al crear miembro" });
  }
};

/**
 * PUT /api/admin/people/:id — update admin (super_admin only)
 */
const handleAdminUpdatePerson: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;
  try {
    const [requester] = await pool.query<any[]>(
      "SELECT role FROM admins WHERE id = ?",
      [adminId],
    );
    if (!requester.length || requester[0].role !== "super_admin") {
      return res.status(403).json({ success: false, error: "Acceso denegado" });
    }

    const targetId = parseInt(req.params.id, 10);
    const { username, email, full_name, role, is_active, bio } = req.body;

    if (!username || !email || !full_name || !role) {
      return res
        .status(400)
        .json({ success: false, error: "Todos los campos son requeridos" });
    }
    if (!["super_admin", "admin", "support"].includes(role)) {
      return res.status(400).json({ success: false, error: "Rol inválido" });
    }

    const [target] = await pool.query<any[]>(
      "SELECT role FROM admins WHERE id = ?",
      [targetId],
    );
    if (!target.length) {
      return res
        .status(404)
        .json({ success: false, error: "Miembro no encontrado" });
    }

    // Prevent removing last super_admin
    if (target[0].role === "super_admin" && role !== "super_admin") {
      const [supers] = await pool.query<any[]>(
        "SELECT COUNT(*) as cnt FROM admins WHERE role = 'super_admin' AND is_active = 1",
      );
      if (supers[0].cnt <= 1) {
        return res.status(400).json({
          success: false,
          error: "No se puede cambiar el rol del único super_admin activo",
        });
      }
    }

    await pool.query(
      "UPDATE admins SET username=?, email=?, full_name=?, role=?, is_active=?, bio=?, updated_at=NOW() WHERE id=?",
      [
        username,
        email,
        full_name,
        role,
        is_active ? 1 : 0,
        bio || null,
        targetId,
      ],
    );

    const [updated] = await pool.query<any[]>(
      "SELECT id, username, email, full_name, role, is_active, avatar_url, bio, last_login, created_at FROM admins WHERE id = ?",
      [targetId],
    );
    res.json({ success: true, person: updated[0] });
  } catch (error) {
    console.error("Admin update person error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al actualizar miembro" });
  }
};

/**
 * DELETE /api/admin/people/:id — deactivate admin (super_admin only)
 */
const handleAdminDeactivatePerson: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;
  try {
    const [requester] = await pool.query<any[]>(
      "SELECT role FROM admins WHERE id = ?",
      [adminId],
    );
    if (!requester.length || requester[0].role !== "super_admin") {
      return res.status(403).json({ success: false, error: "Acceso denegado" });
    }

    const targetId = parseInt(req.params.id, 10);

    if (adminId === targetId) {
      return res
        .status(400)
        .json({ success: false, error: "No puedes desactivarte a ti mismo" });
    }

    const [target] = await pool.query<any[]>(
      "SELECT role FROM admins WHERE id = ?",
      [targetId],
    );
    if (!target.length) {
      return res
        .status(404)
        .json({ success: false, error: "Miembro no encontrado" });
    }

    if (target[0].role === "super_admin") {
      const [supers] = await pool.query<any[]>(
        "SELECT COUNT(*) as cnt FROM admins WHERE role = 'super_admin' AND is_active = 1",
      );
      if (supers[0].cnt <= 1) {
        return res.status(400).json({
          success: false,
          error: "No se puede desactivar al único super_admin activo",
        });
      }
    }

    await pool.query(
      "UPDATE admins SET is_active = 0, updated_at = NOW() WHERE id = ?",
      [targetId],
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Admin deactivate person error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al desactivar miembro" });
  }
};

// =====================================================
// COFFEE CATALOG HANDLERS
// =====================================================

/**
 * GET /api/admin/coffee-catalog
 * List all coffee catalog entries (active + inactive)
 */
const handleAdminGetCoffeeCatalog: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;
  try {
    const [rows] = await pool.query<any[]>(
      `SELECT cc.id, cc.name, cc.provider, cc.origin, cc.coffee_type, cc.variety,
              cc.process, cc.roast_level, cc.altitude_min, cc.altitude_max,
              cc.tasting_notes, cc.description, cc.image_url, cc.is_active,
              cc.created_by_admin_id, cc.created_at, cc.updated_at
       FROM coffee_catalog cc
       ORDER BY cc.is_active DESC, cc.name ASC`,
    );
    const coffees = rows.map((r) => ({
      id: r.id,
      name: r.name,
      provider: r.provider,
      origin: r.origin,
      coffeeType: r.coffee_type,
      variety: r.variety,
      process: r.process,
      roastLevel: r.roast_level,
      altitudeMin: r.altitude_min,
      altitudeMax: r.altitude_max,
      tastingNotes: r.tasting_notes,
      description: r.description,
      imageUrl: r.image_url,
      isActive: !!r.is_active,
      createdByAdminId: r.created_by_admin_id,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
    res.json({ success: true, coffees });
  } catch (error) {
    console.error("Get coffee catalog error:", error);
    res.status(500).json({ success: false, error: "Error al cargar catálogo" });
  }
};

/**
 * POST /api/admin/coffee-catalog
 * Create a new coffee catalog entry
 */
const handleAdminCreateCoffee: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;

  const {
    name,
    provider,
    origin,
    coffeeType,
    variety,
    process,
    roastLevel,
    altitudeMin,
    altitudeMax,
    tastingNotes,
    description,
    imageUrl,
  } = req.body;

  if (!name || !provider) {
    return res
      .status(400)
      .json({ success: false, error: "name y provider son requeridos" });
  }

  try {
    const [result] = await pool.query<any>(
      `INSERT INTO coffee_catalog
         (name, provider, origin, coffee_type, variety, process, roast_level,
          altitude_min, altitude_max, tasting_notes, description, image_url,
          is_active, created_by_admin_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        name,
        provider,
        origin ?? null,
        coffeeType ?? null,
        variety ?? null,
        process ?? null,
        roastLevel ?? "medium",
        altitudeMin ?? null,
        altitudeMax ?? null,
        tastingNotes ?? null,
        description ?? null,
        imageUrl ?? null,
        adminId,
      ],
    );

    const insertId = result.insertId;

    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, resource_type, resource_id, details) VALUES (?, 'create_coffee', 'coffee_catalog', ?, ?)`,
      [adminId, insertId, JSON.stringify({ name, provider })],
    );

    const [rows] = await pool.query<any[]>(
      `SELECT * FROM coffee_catalog WHERE id = ?`,
      [insertId],
    );
    const r = rows[0];
    res.status(201).json({
      success: true,
      coffee: {
        id: r.id,
        name: r.name,
        provider: r.provider,
        origin: r.origin,
        coffeeType: r.coffee_type,
        variety: r.variety,
        process: r.process,
        roastLevel: r.roast_level,
        altitudeMin: r.altitude_min,
        altitudeMax: r.altitude_max,
        tastingNotes: r.tasting_notes,
        description: r.description,
        imageUrl: r.image_url,
        isActive: !!r.is_active,
        createdByAdminId: r.created_by_admin_id,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      },
    });
  } catch (error) {
    console.error("Create coffee error:", error);
    res.status(500).json({ success: false, error: "Error al crear el café" });
  }
};

/**
 * PUT /api/admin/coffee-catalog/:id
 * Update a coffee catalog entry
 */
const handleAdminUpdateCoffee: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;

  const id = parseInt(req.params.id);
  const {
    name,
    provider,
    origin,
    coffeeType,
    variety,
    process,
    roastLevel,
    altitudeMin,
    altitudeMax,
    tastingNotes,
    description,
    imageUrl,
    isActive,
  } = req.body;

  if (!name || !provider) {
    return res
      .status(400)
      .json({ success: false, error: "name y provider son requeridos" });
  }

  try {
    await pool.query(
      `UPDATE coffee_catalog SET
         name=?, provider=?, origin=?, coffee_type=?, variety=?, process=?,
         roast_level=?, altitude_min=?, altitude_max=?, tasting_notes=?,
         description=?, image_url=?, is_active=?, updated_at=NOW()
       WHERE id=?`,
      [
        name,
        provider,
        origin ?? null,
        coffeeType ?? null,
        variety ?? null,
        process ?? null,
        roastLevel ?? "medium",
        altitudeMin ?? null,
        altitudeMax ?? null,
        tastingNotes ?? null,
        description ?? null,
        imageUrl ?? null,
        isActive !== undefined ? (isActive ? 1 : 0) : 1,
        id,
      ],
    );

    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, resource_type, resource_id, details) VALUES (?, 'update_coffee', 'coffee_catalog', ?, ?)`,
      [adminId, id, JSON.stringify({ name, provider })],
    );

    const [rows] = await pool.query<any[]>(
      `SELECT * FROM coffee_catalog WHERE id = ?`,
      [id],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Café no encontrado" });
    }
    const r = rows[0];
    res.json({
      success: true,
      coffee: {
        id: r.id,
        name: r.name,
        provider: r.provider,
        origin: r.origin,
        coffeeType: r.coffee_type,
        variety: r.variety,
        process: r.process,
        roastLevel: r.roast_level,
        altitudeMin: r.altitude_min,
        altitudeMax: r.altitude_max,
        tastingNotes: r.tasting_notes,
        description: r.description,
        imageUrl: r.image_url,
        isActive: !!r.is_active,
        createdByAdminId: r.created_by_admin_id,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      },
    });
  } catch (error) {
    console.error("Update coffee error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al actualizar el café" });
  }
};

/**
 * DELETE /api/admin/coffee-catalog/:id
 * Soft-delete (deactivate) a coffee catalog entry
 */
const handleAdminDeleteCoffee: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;

  const id = parseInt(req.params.id);

  try {
    await pool.query(
      `UPDATE coffee_catalog SET is_active=0, updated_at=NOW() WHERE id=?`,
      [id],
    );

    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, resource_type, resource_id, details) VALUES (?, 'deactivate_coffee', 'coffee_catalog', ?, ?)`,
      [adminId, id, JSON.stringify({ deactivated: true })],
    );

    res.json({ success: true, message: "Café desactivado correctamente" });
  } catch (error) {
    console.error("Delete coffee error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al desactivar el café" });
  }
};

// ─── Admin Blog Handlers ──────────────────────────────────────────────────────

function mapBlogRow(r: any): object {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
    content: r.content,
    featuredImage: r.featured_image,
    authorId: r.author_id,
    authorName: r.author_name,
    categoryId: r.category_id,
    categoryName: r.category_name,
    status: r.status,
    publishedAt: r.published_at,
    views: r.views ?? 0,
    metaTitle: r.meta_title,
    metaDescription: r.meta_description,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/**
 * GET /api/admin/blog/posts
 * List all blog posts (all statuses) for admin
 */
const handleAdminGetBlogPosts: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;

  const status = req.query.status as string | undefined;
  try {
    const params: any[] = [];
    let where = "";
    if (status && ["draft", "published", "archived"].includes(status)) {
      where = "WHERE bp.status = ?";
      params.push(status);
    }

    const [rows] = await pool.query<any[]>(
      `SELECT bp.id, bp.title, bp.slug, bp.excerpt, bp.featured_image,
              bp.author_id, a.full_name AS author_name,
              bp.category_id, bc.name AS category_name,
              bp.status, bp.published_at, bp.views,
              bp.meta_title, bp.meta_description,
              bp.content, bp.created_at, bp.updated_at
       FROM blog_posts bp
       LEFT JOIN admins a ON bp.author_id = a.id
       LEFT JOIN blog_categories bc ON bp.category_id = bc.id
       ${where}
       ORDER BY bp.created_at DESC
       LIMIT 200`,
      params,
    );

    res.json({
      success: true,
      posts: rows.map(mapBlogRow),
      total: rows.length,
    });
  } catch (error) {
    console.error("Admin get blog posts error:", error);
    res.status(500).json({ success: false, error: "Error al cargar posts" });
  }
};

/**
 * GET /api/admin/blog/posts/:id
 * Get single blog post by ID for editing
 */
const handleAdminGetBlogPost: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;

  const id = parseInt(req.params.id);
  try {
    const [rows] = await pool.query<any[]>(
      `SELECT bp.id, bp.title, bp.slug, bp.excerpt, bp.featured_image,
              bp.author_id, a.full_name AS author_name,
              bp.category_id, bc.name AS category_name,
              bp.status, bp.published_at, bp.views,
              bp.meta_title, bp.meta_description,
              bp.content, bp.created_at, bp.updated_at
       FROM blog_posts bp
       LEFT JOIN admins a ON bp.author_id = a.id
       LEFT JOIN blog_categories bc ON bp.category_id = bc.id
       WHERE bp.id = ?`,
      [id],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Post no encontrado" });
    }
    res.json({ success: true, post: mapBlogRow(rows[0]) });
  } catch (error) {
    console.error("Admin get blog post error:", error);
    res.status(500).json({ success: false, error: "Error al cargar post" });
  }
};

/**
 * POST /api/admin/blog/posts
 * Create a new blog post
 */
const handleAdminCreateBlogPost: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;

  const {
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    categoryId,
    status,
    publishedAt,
    metaTitle,
    metaDescription,
  } = req.body;

  if (!title || !slug) {
    return res
      .status(400)
      .json({ success: false, error: "title y slug son requeridos" });
  }

  const finalStatus = status || "draft";
  const finalPublishedAt =
    finalStatus === "published" && !publishedAt
      ? new Date().toISOString().slice(0, 19).replace("T", " ")
      : publishedAt
        ? new Date(publishedAt).toISOString().slice(0, 19).replace("T", " ")
        : null;

  try {
    const [result] = await pool.query<any>(
      `INSERT INTO blog_posts
         (title, slug, excerpt, content, featured_image, author_id, category_id,
          status, published_at, meta_title, meta_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        excerpt ?? null,
        content ?? "",
        featuredImage ?? null,
        adminId,
        categoryId ?? null,
        finalStatus,
        finalPublishedAt,
        metaTitle ?? null,
        metaDescription ?? null,
      ],
    );

    const insertId = result.insertId;

    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, resource_type, resource_id, details)
       VALUES (?, 'create_blog_post', 'blog_post', ?, ?)`,
      [adminId, insertId, JSON.stringify({ title, slug, status: finalStatus })],
    );

    const [rows] = await pool.query<any[]>(
      `SELECT bp.*, a.full_name AS author_name, bc.name AS category_name
       FROM blog_posts bp
       LEFT JOIN admins a ON bp.author_id = a.id
       LEFT JOIN blog_categories bc ON bp.category_id = bc.id
       WHERE bp.id = ?`,
      [insertId],
    );
    res.status(201).json({ success: true, post: mapBlogRow(rows[0]) });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ success: false, error: "Ya existe un post con ese slug" });
    }
    console.error("Admin create blog post error:", error);
    res.status(500).json({ success: false, error: "Error al crear el post" });
  }
};

/**
 * PUT /api/admin/blog/posts/:id
 * Update an existing blog post
 */
const handleAdminUpdateBlogPost: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;

  const id = parseInt(req.params.id);
  const {
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    categoryId,
    status,
    publishedAt,
    metaTitle,
    metaDescription,
  } = req.body;

  if (!title || !slug) {
    return res
      .status(400)
      .json({ success: false, error: "title y slug son requeridos" });
  }

  const finalStatus = status || "draft";
  let finalPublishedAt: string | null = null;
  if (finalStatus === "published") {
    finalPublishedAt = publishedAt
      ? new Date(publishedAt).toISOString().slice(0, 19).replace("T", " ")
      : new Date().toISOString().slice(0, 19).replace("T", " ");
  } else if (publishedAt) {
    finalPublishedAt = new Date(publishedAt)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
  }

  try {
    await pool.query(
      `UPDATE blog_posts SET
         title=?, slug=?, excerpt=?, content=?, featured_image=?,
         category_id=?, status=?, published_at=?,
         meta_title=?, meta_description=?, updated_at=NOW()
       WHERE id=?`,
      [
        title,
        slug,
        excerpt ?? null,
        content ?? "",
        featuredImage ?? null,
        categoryId ?? null,
        finalStatus,
        finalPublishedAt,
        metaTitle ?? null,
        metaDescription ?? null,
        id,
      ],
    );

    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, resource_type, resource_id, details)
       VALUES (?, 'update_blog_post', 'blog_post', ?, ?)`,
      [adminId, id, JSON.stringify({ title, slug, status: finalStatus })],
    );

    const [rows] = await pool.query<any[]>(
      `SELECT bp.*, a.full_name AS author_name, bc.name AS category_name
       FROM blog_posts bp
       LEFT JOIN admins a ON bp.author_id = a.id
       LEFT JOIN blog_categories bc ON bp.category_id = bc.id
       WHERE bp.id = ?`,
      [id],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Post no encontrado" });
    }
    res.json({ success: true, post: mapBlogRow(rows[0]) });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ success: false, error: "Ya existe un post con ese slug" });
    }
    console.error("Admin update blog post error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al actualizar el post" });
  }
};

/**
 * DELETE /api/admin/blog/posts/:id
 * Archive (soft-delete) a blog post
 */
const handleAdminDeleteBlogPost: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;

  const id = parseInt(req.params.id);
  try {
    await pool.query(
      `UPDATE blog_posts SET status='archived', updated_at=NOW() WHERE id=?`,
      [id],
    );
    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, resource_type, resource_id, details)
       VALUES (?, 'archive_blog_post', 'blog_post', ?, ?)`,
      [adminId, id, JSON.stringify({ archived: true })],
    );
    res.json({ success: true, message: "Post archivado correctamente" });
  } catch (error) {
    console.error("Admin delete blog post error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al archivar el post" });
  }
};

/**
 * GET /api/admin/subscriptions
 * List all subscriptions with user and plan details
 */
const handleAdminGetSubscriptions: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;
  try {
    const [rows] = await pool.query<any[]>(
      `SELECT
         s.id, s.user_id, s.plan_id, s.grind_type_id,
         s.stripe_subscription_id, s.status,
         s.current_period_start, s.current_period_end,
         s.cancel_at_period_end, s.cancelled_at, s.notes,
         s.created_at,
         u.email AS user_email, u.full_name AS user_full_name,
         sp.name AS plan_name, sp.weight AS plan_weight, sp.price_mxn AS plan_price,
         gt.name AS grind_type_name,
         a.street_address AS shipping_address,
         a.city AS shipping_city,
         ms.name AS shipping_state
       FROM subscriptions s
       JOIN users u ON s.user_id = u.id
       JOIN subscription_plans sp ON s.plan_id = sp.id
       JOIN grind_types gt ON s.grind_type_id = gt.id
       LEFT JOIN addresses a ON s.shipping_address_id = a.id
       LEFT JOIN mexico_states ms ON a.state_id = ms.id
       ORDER BY s.created_at DESC
       LIMIT 500`,
    );

    const subscriptions = rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      userEmail: r.user_email,
      userFullName: r.user_full_name,
      planId: r.plan_id,
      planName: r.plan_name,
      planWeight: r.plan_weight,
      planPrice: parseFloat(r.plan_price ?? 0),
      grindTypeName: r.grind_type_name,
      status: r.status,
      stripeSubscriptionId: r.stripe_subscription_id,
      currentPeriodStart: r.current_period_start,
      currentPeriodEnd: r.current_period_end,
      cancelAtPeriodEnd: !!r.cancel_at_period_end,
      cancelledAt: r.cancelled_at,
      notes: r.notes,
      createdAt: r.created_at,
      shippingAddress: r.shipping_address,
      shippingCity: r.shipping_city,
      shippingState: r.shipping_state,
    }));

    res.json({ success: true, subscriptions });
  } catch (error) {
    console.error("Admin subscriptions error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al cargar suscripciones" });
  }
};

/**
 * PUT /api/admin/subscriptions/:id
 * Admin override: update status and/or notes. Optionally cancel on Stripe.
 */
const handleAdminUpdateSubscription: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;
  const subId = parseInt(req.params.id, 10);
  if (isNaN(subId))
    return res.status(400).json({ success: false, error: "ID inválido" });

  const { status, notes, cancelOnStripe } = req.body as {
    status?: string;
    notes?: string;
    cancelOnStripe?: boolean;
  };

  try {
    const [rows] = await pool.query<any[]>(
      "SELECT id, stripe_subscription_id, status FROM subscriptions WHERE id = ?",
      [subId],
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, error: "Suscripción no encontrada" });

    const sub = rows[0];

    if (cancelOnStripe && sub.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(sub.stripe_subscription_id);
      } catch (stripeErr: any) {
        console.error(
          "Stripe cancel error (admin override):",
          stripeErr.message,
        );
      }
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (status) {
      updates.push("status = ?");
      values.push(status);
      if (status === "cancelled") {
        updates.push("cancelled_at = NOW()");
        updates.push("cancel_at_period_end = 0");
      }
    }
    if (notes !== undefined) {
      updates.push("notes = ?");
      values.push(notes);
    }

    if (updates.length === 0)
      return res
        .status(400)
        .json({ success: false, error: "Nada que actualizar" });

    values.push(subId);
    await pool.query(
      `UPDATE subscriptions SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    res.json({
      success: true,
      message: "Suscripción actualizada correctamente",
    });
  } catch (error) {
    console.error("Admin update subscription error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al actualizar suscripción" });
  }
};

/**
 * GET /api/admin/blog/categories
 * List all blog categories
 */
const handleAdminGetBlogCategories: RequestHandler = async (req, res) => {
  const adminId = extractAdminId(req, res);
  if (!adminId) return;

  try {
    const [rows] = await pool.query<any[]>(
      `SELECT id, name, slug, description, sort_order, is_active
       FROM blog_categories
       ORDER BY sort_order ASC, name ASC`,
    );
    const categories = rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      sortOrder: r.sort_order,
      isActive: !!r.is_active,
    }));
    res.json({ success: true, categories });
  } catch (error) {
    console.error("Admin get blog categories error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al cargar categorías" });
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

  // ── Admin routes ──────────────────────────────────────────────────
  app.post("/api/admin/auth/send-code", handleAdminSendCode);
  app.post("/api/admin/auth/verify-code", handleAdminVerifyCode);
  app.get("/api/admin/auth/validate", handleAdminValidate);
  app.post("/api/admin/auth/logout", handleAdminLogout);
  app.get("/api/admin/dashboard", handleAdminDashboard);
  app.get("/api/admin/orders", handleAdminOrders);
  app.put("/api/admin/orders/:id/ship", handleAdminShipOrder as RequestHandler);
  app.put(
    "/api/admin/orders/:id/deliver",
    handleAdminDeliverOrder as RequestHandler,
  );
  app.get("/api/admin/clients", handleAdminClients);
  app.get("/api/admin/settings", handleAdminGetSettings);
  app.put("/api/admin/settings", handleAdminUpdateSettings);
  app.get("/api/admin/people", handleAdminGetPeople);
  app.post("/api/admin/people", handleAdminCreatePerson);
  app.put("/api/admin/people/:id", handleAdminUpdatePerson);
  app.delete("/api/admin/people/:id", handleAdminDeactivatePerson);

  // ── Admin coffee catalog routes ───────────────────────────────────────────
  app.get("/api/admin/coffee-catalog", handleAdminGetCoffeeCatalog);
  app.post("/api/admin/coffee-catalog", handleAdminCreateCoffee);
  app.put(
    "/api/admin/coffee-catalog/:id",
    handleAdminUpdateCoffee as RequestHandler,
  );
  app.delete(
    "/api/admin/coffee-catalog/:id",
    handleAdminDeleteCoffee as RequestHandler,
  );

  // ── Admin blog routes ─────────────────────────────────────────────────────
  app.get("/api/admin/blog/posts", handleAdminGetBlogPosts);
  app.get(
    "/api/admin/blog/posts/:id",
    handleAdminGetBlogPost as RequestHandler,
  );
  app.post("/api/admin/blog/posts", handleAdminCreateBlogPost);
  app.put(
    "/api/admin/blog/posts/:id",
    handleAdminUpdateBlogPost as RequestHandler,
  );
  app.delete(
    "/api/admin/blog/posts/:id",
    handleAdminDeleteBlogPost as RequestHandler,
  );
  app.get("/api/admin/blog/categories", handleAdminGetBlogCategories);
  app.get("/api/admin/subscriptions", handleAdminGetSubscriptions);
  app.put(
    "/api/admin/subscriptions/:id",
    handleAdminUpdateSubscription as RequestHandler,
  );

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
