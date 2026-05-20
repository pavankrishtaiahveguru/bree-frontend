# Frontend Setup Guide

React 19 customer and admin dashboard for BREE e-commerce platform.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Pages & Routes](#pages--routes)
- [Components](#components)
- [State Management](#state-management)
- [Performance Optimizations](#performance-optimizations)
- [Available Scripts](#available-scripts)

---

## Overview

The BREE frontend is a full-featured React application providing:

- **Customer Portal**: Product browsing, cart, checkout, order tracking
- **User Accounts**: Registration, profile management, address management
- **Admin Dashboard**: Complete business operations management
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Real-time Notifications**: Toast notifications for user actions

---

## Tech Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| React | 19 | UI framework |
| React Router | v7 | Client-side routing |
| Tailwind CSS | 3.x | Styling framework |
| Axios | 1.x | HTTP client |
| React Helmet | 6.x | SEO management |
| Shadcn/ui | Latest | Component library |
| Lucide React | Latest | Icon library |
| Sonner | Latest | Toast notifications |

---

## Setup Instructions

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Git
- Backend API running on `http://localhost:5000`

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create `.env.local` file in the `frontend/` directory:

```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY=your_razorpay_public_key
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend runs at: `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

---

## Project Structure

```
frontend/src/
├── components/              # Reusable UI components
│   ├── admin/              # Admin-specific components
│   └── ui/                 # Base UI components
├── context/                # React Context (Auth, Cart)
├── pages/                  # Page components
│   └── admin/              # Admin pages
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities (api, firebase, etc)
├── App.js                  # Root component & routing
└── index.js                # Entry point
```

---

## Pages & Routes

### Public Routes
- `/` - Landing page
- `/shop` - Product catalog
- `/about`, `/benefits` - Info pages
- `/contact` - Contact form
- `/login`, `/register` - Authentication

### User Routes (Protected)
- `/profile` - User profile
- `/checkout` - Order checkout

### Admin Routes (Protected)
- `/admin` - Dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/customers` - Customer directory
- `/admin/testimonials` - Review moderation

---

## State Management

### AuthContext
```javascript
const { user, loading, loginWithGoogle, logout, checkAuth } = useAuth();
```

### CartContext
```javascript
const { cart, addToCart, removeFromCart, cartTotal } = useCart();
```

---

## Performance Optimizations

- Code splitting with lazy loading
- Cloudinary CDN for images
- Response caching with TTL
- Bundle optimization via Tailwind
- Axios interceptors for auth

---

## Available Scripts

```bash
npm run dev              # Start dev server
npm run build           # Production build
npm run lint            # Lint code
npm start              # CRA dev server
```

---

## Related Documentation

- [Root README](../README.md) - Project overview
- [Backend README](../backend/README.md) - API setup
- [API Reference](../docs/API.md) - Endpoints
- [Deployment Guide](../docs/DEPLOYMENT.md) - Production

---

**Last Updated:** May 2026
