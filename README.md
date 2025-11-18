# 🎀 Ludovica's Little Moments

A beautiful, password-protected photo album application built with Next.js 16, designed to share precious moments from a child's life.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4)

## ✨ Features

- 📸 **Album Management**: Create and organize photo albums
- 🔐 **Secure Admin Panel**: Password-protected dashboard
- 🖼️ **Image Upload**: Multi-file upload with validation
- 🎨 **Beautiful UI**: Responsive design with Tailwind CSS
- ☁️ **Cloud Storage**: Vercel Blob for reliable file storage
- 🛡️ **Security Features**:
  - CSRF protection on all mutations
  - Rate limiting on login attempts
  - Data Access Layer authentication
  - File upload validation (type, size)
  - HttpOnly cookies for sessions

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- A Vercel account (for blob storage)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/HelyeFab/ludo.git
cd ludo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:

```env
ADMIN_PASSWORD=your_secure_password_here
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx
NODE_ENV=development
```

#### Getting your Vercel Blob Token:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** → **Blob**
3. Create a new Blob store (if you don't have one)
4. Copy the `BLOB_READ_WRITE_TOKEN`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Access Admin Panel

1. Navigate to `/admin` or click the "Admin" button in the header
2. Enter your `ADMIN_PASSWORD`
3. Start creating albums and uploading photos!

## 📦 Deployment on Vercel

### Option 1: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import your GitHub repository
3. Configure environment variables:
   - `ADMIN_PASSWORD`
   - `BLOB_READ_WRITE_TOKEN`
   - `NODE_ENV=production`
4. Click **Deploy**

### Post-Deployment Setup

After deployment, make sure to:

1. ✅ Set all environment variables in Vercel dashboard
2. ✅ Test the health endpoint: `https://your-app.vercel.app/api/health`
3. ✅ Create your first album in the admin panel
4. ✅ Upload some photos

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Storage**: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Fonts**: Geist Sans & Geist Mono

## 📁 Project Structure

```
ludo/
├── src/
│   ├── app/
│   │   ├── admin/              # Admin dashboard pages
│   │   ├── albums/             # Public album pages
│   │   ├── api/                # API routes
│   │   │   ├── admin/          # Admin API endpoints
│   │   │   └── auth/           # Authentication endpoints
│   │   ├── login/              # Login page
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Homepage
│   ├── components/
│   │   └── admin/              # Admin components
│   └── lib/
│       ├── albums.ts           # Album/photo data access
│       ├── auth.ts             # Authentication utilities
│       ├── csrf.ts             # CSRF protection
│       └── validation.ts       # Input validation
├── middleware.ts               # Route protection
├── .env.example                # Environment variables template
└── README.md
```

## 🔒 Security Features

### Multi-Layer Authentication

Following 2025 best practices, authentication is checked at multiple levels:

1. **Middleware**: Initial route protection
2. **API Routes**: Request-level auth checks
3. **Data Access Layer**: Function-level verification

### File Upload Security

- ✅ File type validation (images only)
- ✅ File size limits (10MB max)
- ✅ Filename sanitization
- ✅ Maximum 20 files per upload
- ✅ Random blob path suffixes

### CSRF Protection

All state-changing operations are protected with CSRF tokens:

- Album creation
- Photo uploads
- Requires valid token from `/api/admin/csrf`

### Rate Limiting

Login endpoint includes rate limiting:
- Max 5 attempts per 5 minutes per IP
- Automatic reset after time window

## 🎨 Customization

### Changing Colors

Edit `src/app/globals.css` and modify the Tailwind color classes in components. The app uses a rose/pink theme by default.

### Modifying Album Fields

To add new fields to albums:

1. Update the `Album` type in `src/lib/albums.ts`
2. Update the form in `src/components/admin/AdminDashboard.tsx`
3. Update the API route in `src/app/api/admin/albums/route.ts`

## 📝 API Endpoints

### Public Endpoints

- `GET /` - Homepage (lists all albums)
- `GET /albums/[slug]` - View album and photos
- `GET /api/health` - Health check

### Authentication

- `POST /api/auth/login` - Admin login

### Admin Endpoints (Protected)

- `GET /api/admin/csrf` - Get CSRF token
- `POST /api/admin/albums` - Create album
- `POST /api/admin/albums/[id]/photos` - Upload photos

## 🐛 Troubleshooting

### "ADMIN_PASSWORD is not configured" error

Make sure you've set the `ADMIN_PASSWORD` environment variable in:
- `.env.local` for local development
- Vercel dashboard for production

### Blob upload fails

1. Verify your `BLOB_READ_WRITE_TOKEN` is correct
2. Check that your Vercel Blob store is active
3. Ensure file size is under 10MB

### CSRF token errors

This usually happens when:
- Cookies are blocked
- Session expired
- Browser privacy settings too strict

**Solution**: Refresh the page to get a new token

## 📄 License

MIT License - feel free to use this project for your own photo albums!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💝 Acknowledgments

Built with love for Ludovica's story ✨

---

Made with [Claude Code](https://claude.com/claude-code) 🤖
