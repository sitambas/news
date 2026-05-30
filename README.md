# 📰 NewsHub - Modern Production-Ready News Platform

A full-stack, production-ready news website built with **Next.js 15**, **React**, **Tailwind CSS**, **MongoDB**, and **Node.js** — similar to BBC News or Reuters in architecture and features.

---

## ✨ Features

### 🌐 Public Website
- **Breaking News Ticker** with auto-rotating headlines
- **Hero Banner** with featured article carousel/slider
- **Latest News** with grid/list toggle view
- **Trending Section** with view counts and time
- **Category Pages** for all 8 news categories
- **Article Detail** with rich content, comments, and social sharing
- **Search** with real-time filtering and category/sort options
- **Author Profile** pages with article listings
- **Dark/Light Mode** with system preference detection
- **Responsive Design** — mobile-first, works on all screen sizes
- **SEO Optimized** — dynamic metadata, Open Graph, Twitter Cards
- **PWA Ready** — installable, works offline (manifest.json)

### 🔐 Authentication
- JWT-based authentication with httpOnly cookies
- Login / Register with form validation
- Password strength indicator
- Protected routes via middleware
- Social login placeholders (Google, GitHub)

### 👤 User Features
- User profile with avatar, bio, and social links
- Bookmark articles
- Like / comment system
- Notification preferences
- My Articles tab

### 🛡️ Admin Dashboard
- **Dashboard** with traffic charts, stats, and quick actions
- **Article Manager** — Create, Edit, Delete, filter by status
- **Rich Text Editor** powered by TipTap
- **Category Manager** with color picker
- **User Manager** with role-based access
- **Analytics** — traffic, top countries, top articles
- Draft/Published/Scheduled/Archived status system
- Article flags: Breaking, Featured, Trending
- SEO fields per article

### 🏗️ Architecture
- Next.js 15 App Router (Server & Client Components)
- Server-Side Rendering (SSR) + Incremental Static Regeneration (ISR)
- REST API with Next.js Route Handlers
- MongoDB with Mongoose ODM
- Zustand for client state management
- TanStack Query for server state / caching
- Framer Motion for animations

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and Install
```bash
cd news
npm install
```

### 2. Configure Environment
```bash
cp .env.local .env.local.backup
# Edit .env.local with your values
```

Required variables:
```env
MONGODB_URI=mongodb://localhost:27017/newsdb
JWT_SECRET=your-super-secret-jwt-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NewsHub
```

### 3. Seed the Database (Optional)
```bash
node scripts/seed.js
```
This creates test accounts:
- **Admin:** admin@newshub.com / admin123
- **Author:** sarah@newshub.com / author123
- **Editor:** mike@newshub.com / editor123

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.js                 # Homepage
│   ├── layout.js               # Root layout
│   ├── not-found.js            # 404 page
│   ├── error.js                # Error boundary
│   ├── sitemap.js              # Dynamic sitemap
│   ├── robots.js               # Robots.txt
│   ├── admin/                  # Admin dashboard
│   │   ├── layout.js           # Admin sidebar layout
│   │   ├── page.js             # Dashboard overview
│   │   ├── articles/           # Article management
│   │   ├── categories/         # Category management
│   │   ├── users/              # User management
│   │   └── analytics/          # Analytics page
│   ├── api/                    # REST API routes
│   │   ├── auth/               # login, register, logout, me
│   │   ├── articles/           # CRUD + like + bookmark
│   │   ├── categories/         # CRUD
│   │   ├── comments/           # CRUD
│   │   ├── users/              # Profile + by username
│   │   ├── bookmarks/          # User bookmarks
│   │   ├── notifications/      # User notifications
│   │   └── search/             # Full-text search
│   ├── auth/                   # Login + Register pages
│   ├── news/[slug]/            # Article detail page
│   ├── category/[slug]/        # Category listing page
│   ├── author/[username]/      # Author profile page
│   ├── search/                 # Search page
│   ├── profile/                # User profile page
│   └── bookmarks/              # Saved articles page
├── components/
│   ├── admin/                  # Rich text editor
│   ├── auth/                   # Auth components
│   ├── common/                 # QueryProvider, AuthInitializer
│   ├── layout/                 # Navbar, Footer, Sidebar
│   ├── news/                   # ArticleCard, HeroSection, etc.
│   └── ui/                     # Skeleton, LoadingSpinner, etc.
├── context/                    # ThemeContext (dark/light mode)
├── hooks/                      # Custom React hooks
├── lib/                        # DB connection, JWT, Auth helpers
├── middleware.js               # Route protection
├── models/                     # Mongoose schemas
│   ├── User.js
│   ├── Article.js
│   ├── Category.js
│   ├── Comment.js
│   ├── Bookmark.js
│   └── Notification.js
├── services/                   # API service functions
├── store/                      # Zustand stores (authStore)
├── styles/                     # Global CSS
└── utils/                      # Helpers, sample data, API response
```

---

## 🗄️ Database Models

| Model        | Key Fields                                           |
|-------------|------------------------------------------------------|
| User        | name, username, email, password, role, avatar, bio   |
| Article     | title, slug, content, author, category, status, tags |
| Category    | name, slug, color, icon, description                 |
| Comment     | article, author, content, parent (for replies)       |
| Bookmark    | user, article (unique pair)                          |
| Notification| recipient, type, message, isRead                     |

---

## 🔌 API Endpoints

| Method | Endpoint                         | Description              |
|--------|----------------------------------|--------------------------|
| POST   | /api/auth/register               | Register new user        |
| POST   | /api/auth/login                  | Login user               |
| POST   | /api/auth/logout                 | Logout user              |
| GET    | /api/auth/me                     | Get current user         |
| GET    | /api/articles                    | List articles            |
| POST   | /api/articles                    | Create article (auth)    |
| GET    | /api/articles/[slug]             | Get single article       |
| PUT    | /api/articles/[slug]             | Update article (auth)    |
| DELETE | /api/articles/[slug]             | Delete article (auth)    |
| POST   | /api/articles/[slug]/like        | Toggle like (auth)       |
| POST   | /api/articles/[slug]/bookmark    | Toggle bookmark (auth)   |
| GET    | /api/categories                  | List categories          |
| POST   | /api/categories                  | Create category (admin)  |
| GET    | /api/comments?articleId=xxx      | Get article comments     |
| POST   | /api/comments                    | Post comment (auth)      |
| GET    | /api/search?q=query              | Full-text search         |
| GET    | /api/bookmarks                   | User bookmarks (auth)    |
| GET    | /api/notifications               | User notifications (auth)|
| PUT    | /api/users/profile               | Update profile (auth)    |
| GET    | /api/users/[username]            | Get user profile         |

---

## 🔑 User Roles

| Role    | Permissions                                      |
|---------|--------------------------------------------------|
| user    | Read, comment, like, bookmark                    |
| author  | + Create own articles                            |
| editor  | + Edit/delete any article, manage categories     |
| admin   | Full access including user management            |

---

## 🚢 Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables from `.env.local`
4. Deploy!

### Required Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong-random-secret-at-least-32-chars
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_SECRET=another-strong-random-secret
```

---

## 🧰 Tech Stack

| Layer       | Technology                          |
|------------|--------------------------------------|
| Framework  | Next.js 15 (App Router)              |
| UI         | React 19, Tailwind CSS v4            |
| State      | Zustand + TanStack Query             |
| Animation  | Framer Motion                        |
| Editor     | TipTap                               |
| Database   | MongoDB + Mongoose                   |
| Auth       | JWT + bcryptjs (httpOnly cookies)    |
| Icons      | React Icons (Feather)                |
| Toasts     | React Hot Toast                      |
| Date       | date-fns                             |

---

## 🎨 Design Features

- Modern red/white/dark color scheme
- Mobile-first responsive design
- Smooth animations and transitions
- Skeleton loading states
- Error boundaries
- Accessible markup (ARIA labels, focus styles)
- Dark mode with system preference detection

---

## 📄 License

MIT License — free for personal and commercial use.

---

Built with ❤️ using Next.js 15, React, Tailwind CSS, MongoDB
