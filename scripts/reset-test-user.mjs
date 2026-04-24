#!/usr/bin/env node
/**
 * reset-test-user.mjs
 *
 * Cleans a test user completely for testing purposes:
 *   1. Cancels their active Stripe subscription(s) (if any)
 *   2. Deletes the Stripe customer (removes all payment methods & history)
 *   3. Deletes the DB row from `users` — CASCADE removes:
 *        subscriptions, orders, order_items, payments, addresses, user_sessions
 *      SET NULL is applied on:
 *        visitor_events.user_id, blog_comments.user_id
 *
 * Usage:
 *   node scripts/reset-test-user.mjs <email>
 *   node scripts/reset-test-user.mjs --all   ← wipes EVERY user (dangerous!)
 *
 * Reads credentials from .env in the project root.
 */

import "dotenv/config";
import mysql from "mysql2/promise";
import Stripe from "stripe";

// ── Config ────────────────────────────────────────────────────────────────────
const DB_CONFIG = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : false,
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-03-31.basil",
});

// ── Helpers ───────────────────────────────────────────────────────────────────
async function resetUser(db, user) {
  const tag = `[${user.email} | id=${user.id}]`;
  console.log(`\n🧪 ${tag} ──────────────────────────────`);

  // 1. Cancel & delete Stripe subscription
  console.log(`  💳 Stripe…`);
  if (user.stripe_customer_id) {
    try {
      const subs = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: "all",
        limit: 10,
      });
      for (const sub of subs.data) {
        if (["active", "trialing", "past_due"].includes(sub.status)) {
          await stripe.subscriptions.cancel(sub.id, { prorate: false });
          console.log(`     ✅ Subscription canceled: ${sub.id}`);
        } else {
          console.log(
            `     ⏭️  Subscription ${sub.id} already ${sub.status}, skipping`,
          );
        }
      }
      await stripe.customers.del(user.stripe_customer_id);
      console.log(`     ✅ Customer deleted: ${user.stripe_customer_id}`);
    } catch (err) {
      if (err.code === "resource_missing") {
        console.log(`     ⚠️  Customer not found in Stripe, skipping`);
      } else {
        console.warn(`     ❌ Stripe error: ${err.message}`);
      }
    }
  } else {
    console.log(`     ➖ No Stripe customer on record`);
  }

  // 2. Delete from DB
  //    CASCADE: subscriptions, orders (→ order_items), payments, addresses, user_sessions
  //    SET NULL: visitor_events.user_id, blog_comments.user_id
  console.log(`  🗄️  Database…`);
  const [result] = await db.execute("DELETE FROM users WHERE id = ?", [
    user.id,
  ]);
  console.log(
    `     ✅ User + all related rows deleted (affected: ${result.affectedRows})`,
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const arg = process.argv[2];

if (!arg) {
  console.error(
    "Usage:\n  node scripts/reset-test-user.mjs <email>\n  node scripts/reset-test-user.mjs --all",
  );
  process.exit(1);
}

const db = await mysql.createConnection(DB_CONFIG);

try {
  let users;

  if (arg === "--all") {
    console.warn(
      "🚨 WARNING: --all flag will delete EVERY user in the database!",
    );
    console.warn("   ⏳ Press Ctrl+C within 5 seconds to abort…");
    await new Promise((r) => setTimeout(r, 5000));
    const [rows] = await db.execute(
      "SELECT id, email, stripe_customer_id FROM users",
    );
    users = rows;
  } else {
    const [rows] = await db.execute(
      "SELECT id, email, stripe_customer_id FROM users WHERE email = ?",
      [arg],
    );
    if (rows.length === 0) {
      console.error(`No user found with email: ${arg}`);
      process.exit(1);
    }
    users = rows;
  }

  console.log(`\n🔄 Resetting ${users.length} user(s)…`);

  for (const user of users) {
    await resetUser(db, user);
  }

  console.log("\n🎉 All done!\n");
} finally {
  await db.end();
}
