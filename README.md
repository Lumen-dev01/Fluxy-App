# FLUXY 🚀
### Your work, organized. Your productivity, amplified.

A **production-ready SaaS productivity platform** built with React, Tailwind CSS, and Supabase.

---

## ✅ What's Built

- 🔐 **Authentication** — Email/password + Google OAuth + Email verification
- 📊 **Dashboard** — Live stats, tasks, projects, productivity chart, AI panel, focus timer
- 📁 **Projects** — Create, manage, grid/list views, progress tracking
- ✅ **Tasks** — Kanban board, priority badges, due dates, assign members
- 📅 **Calendar** — Monthly view, task scheduling
- 📈 **Analytics** — Charts, productivity trends, stats
- 👥 **Team** — Member management, pending invitations
- 🔔 **Notifications** — Real-time via Supabase
- 📤 **File Uploads** — Supabase Storage with progress bar
- 💳 **Billing** — Basic/Pro plan system
- ⚙️ **Settings** — Profile, avatar upload, notifications, security, billing
- 🎨 **Dark/Light Mode** — Persisted in localStorage
- 📧 **Invitation System** — Real email via Supabase Edge Function + Resend

---

## 🔧 Setup Guide (Step by Step)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize (~2 minutes)
3. Go to **Settings → API**
4. Copy your **Project URL** and **anon key**

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Run the Database Schema

1. Open your Supabase dashboard
2. Click **SQL Editor** → **New Query**
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click **Run**

This creates all tables, relationships, and security policies.

### Step 4: Set Up Google OAuth (Optional)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → **APIs & Services → Credentials**
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add authorized redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
5. Copy Client ID and Secret
6. In Supabase: **Authentication → Providers → Google** → paste credentials

### Step 5: Deploy the Edge Function (for email invitations)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the invitation email function
supabase functions deploy send-invitation

# Set required secrets
supabase secrets set RESEND_API_KEY=your_resend_key
supabase secrets set SITE_URL=https://your-domain.com
```

Get a free API key at [resend.com](https://resend.com).

### Step 6: Run the App
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🚀 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 📁 Project Structure

```
fluxy/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable: Avatar, Modal, Logo, etc.
│   │   ├── layout/          # Sidebar, Topbar
│   │   ├── tasks/           # CreateTaskModal
│   │   ├── team/            # InviteModal
│   │   └── notifications/   # NotificationDropdown
│   ├── context/
│   │   ├── AuthContext.jsx  # Authentication state
│   │   └── ThemeContext.jsx # Dark/light mode
│   ├── hooks/               # Custom React hooks
│   ├── layout/
│   │   └── AppLayout.jsx    # App shell (sidebar + topbar)
│   ├── lib/
│   │   └── supabase.js      # Supabase client
│   ├── pages/
│   │   ├── auth/            # Login, Signup, etc.
│   │   └── app/             # Dashboard, Projects, Tasks, etc.
│   ├── services/
│   │   └── supabaseService.js # All database functions
│   └── utils/               # Helper functions
├── supabase/
│   ├── schema.sql           # Complete database schema + RLS
│   └── functions/
│       └── send-invitation/ # Email edge function
├── .env.example             # Environment variables template
└── README.md
```

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (extends auth.users) |
| `projects` | Projects with metadata |
| `project_members` | Links users to projects with roles |
| `tasks` | Tasks with assignments and priorities |
| `task_comments` | Comments on tasks |
| `notifications` | User notifications |
| `invitations` | Team invitation tokens |
| `files` | File uploads metadata |
| `subscriptions` | Billing/plan management |

---

## 🛡️ Security

- **Row Level Security (RLS)** on all tables
- Users can **only** access data they belong to
- JWT verification on every request
- Invite tokens are cryptographically random UUIDs
- Invitations expire after 7 days

---

## 📧 Invitation Flow

1. Manager enters email in Invite Modal
2. Invitation record created in `invitations` table with unique token
3. Edge Function sends email with link: `https://yourapp.com/invite/{token}`
4. User clicks link → `AcceptInvitePage`
5. Token validated against database (checks expiry + status)
6. User signs up or logs in
7. User automatically added to `project_members`
8. Welcome notification created
9. User sees project and assigned tasks immediately

---

## 🎨 Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS 3.4 | Styling |
| Framer Motion | Animations |
| React Router 6 | Client-side routing |
| Supabase | Backend (Auth, DB, Storage, Realtime) |
| Recharts | Analytics charts |
| Zustand | State management |
| React Hot Toast | Toast notifications |
| Lucide React | Icons |
| Resend | Email delivery |

---

Built with ❤️ by FLUXY
