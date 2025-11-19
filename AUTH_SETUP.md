# Authentication Setup Guide

## 🔐 Two-Level Password Protection

Your app now has **two separate passwords** for maximum privacy:

1. **Viewer Password** - For family/friends to access the site
2. **Admin Password** - For you to manage albums and photos

---

## 👨‍👩‍👧‍👦 Setting Up the Viewer Password

The viewer password protects the entire site. Share this with trusted family and friends.

**Add to your `.env.local`:**
```env
VIEWER_PASSWORD=family123
```

Or generate a hashed password:
```bash
node scripts/hash-password.js YourFamilyPassword
```

**How it works:**
- Anyone visiting your site will see `/enter` page first
- They must enter the viewer password to access albums
- Once authenticated, they can browse all albums for 30 days
- Admin routes still require separate admin login

---

## 🔐 Setting Up Your Admin Password

Your admin authentication now uses **bcrypt password hashing** for enhanced security.

### Option 1: Use a Hashed Password (Recommended)

1. **Generate a bcrypt hash** for your password:
   ```bash
   node scripts/hash-password.js YourSecurePassword123
   ```

2. **Copy the output** (it will look like `$2b$10$xyz...`)

3. **Update your `.env.local`** file:
   ```env
   ADMIN_PASSWORD=$2b$10$abc123...the-hash-from-step-1
   ```

### Option 2: Use Plain Text (Not Recommended)

For quick testing only, you can still use a plain text password:

```env
ADMIN_PASSWORD=mysimplepassword
```

⚠️ **Warning**: The system will show a warning in the console if you use plain text.

---

## 🎯 Security Features Implemented

✅ **Password visibility toggle** - You can now see what you're typing when pasting passwords
✅ **Bcrypt password hashing** - Passwords are securely hashed
✅ **Session tokens** - Unique session IDs instead of static cookies
✅ **Data Access Layer** - Auth verified at multiple levels (not just middleware)
✅ **CSRF protection** - Already implemented for admin operations
✅ **Rate limiting** - 5 failed login attempts per 5 minutes per IP
✅ **Logout functionality** - Sessions can be invalidated server-side

---

## 📝 Complete .env.local Example

```env
# Admin Password (use bcrypt hash for production)
ADMIN_PASSWORD=$2b$10$your_bcrypt_hash_here

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx

# Node Environment
NODE_ENV=production
```

---

## 🚀 Quick Start

1. Install dependencies (already done):
   ```bash
   npm install
   ```

2. Generate your password hash:
   ```bash
   node scripts/hash-password.js YourPassword
   ```

3. Update `.env.local` with the hash

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Visit `/login` and use your password to authenticate

---

## 🔄 Migrating from Plain Text Password

If you're currently using a plain text password:

1. Run the hash script with your current password
2. Replace the plain text in `.env.local` with the hash
3. Restart your dev server
4. Login works exactly the same way!

---

## 🛡️ Security Best Practices

- ✅ Always use bcrypt hashes in production
- ✅ Use strong passwords (12+ characters, mixed case, numbers, symbols)
- ✅ Never commit `.env.local` to git
- ✅ Use the logout button when done to invalidate your session
- ✅ The password input has a show/hide toggle for easy pasting

---

## 🐛 Troubleshooting

**Can't login after updating password?**
- Make sure you copied the entire hash (including `$2b$10$...`)
- Check for extra spaces or line breaks
- Restart your dev server after changing `.env.local`

**Getting "ADMIN_PASSWORD is not configured"?**
- Check that `.env.local` exists in the project root
- Verify the variable name is exactly `ADMIN_PASSWORD`
- Restart the server

**Want to see your password when pasting?**
- Click the eye icon in the password input field
- This feature was added per your request in CLAUDE.md
