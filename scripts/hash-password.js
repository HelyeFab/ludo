#!/usr/bin/env node

/**
 * Script to hash a password using bcrypt
 * Usage: node scripts/hash-password.js <password>
 */

const bcrypt = require("bcrypt");

const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/hash-password.js <password>");
  process.exit(1);
}

const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error hashing password:", err);
    process.exit(1);
  }

  console.log("\n✅ Password hashed successfully!\n");
  console.log("Add this to your .env.local file:");
  console.log(`ADMIN_PASSWORD=${hash}`);
  console.log("\nNote: The hash starts with $2b$ which indicates it's a bcrypt hash.");
});
