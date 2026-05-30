# Frontend Setup Guide

React storefront and admin dashboard for the BREE Wellness E-Commerce Platform.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Pages & Routes](#pages--routes)
- [Available Scripts](#available-scripts)
- [Related Documentation](#related-documentation)

---

## Overview

The frontend delivers a complete wellness shopping experience with:

- Product browsing, search, and filtering
- Cart management with smart recommendations
- Razorpay checkout flow
- Order success and tracking pages
- Profile and order history pages
- Admin dashboard for product, order, and customer management
- Fully responsive UI for mobile and desktop

---

## Tech Stack

- React
- React Router
- Tailwind CSS
- Axios
- Sonner
- Lucide React
- Firebase authentication
- Cloudinary image hosting

---

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── admin/           # Admin-specific components
│   │   ├── orders/          # Order and checkout components
│   │   └── ui/              # Base UI primitives
│   ├── context/             # Auth and cart state management
│   ├── data/                # Static data and helpers
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # API helpers and utilities
│   ├── pages/               # Page-level views
│   ├── App.js               # Root application and routing
│   └── index.js             # React entry point
├── public/                  # Public assets
├── package.json
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:4000`

### Install Dependencies

```bash
cd frontend
npm install
```

### Environment Configuration

Create `frontend/.env.local`:

```env
REACT_APP_BACKEND_URL=http://localhost:4000
REACT_APP_RAZORPAY_KEY=your_razorpay_public_key
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

### Start Development Server

```bash
npm run dev
```

The frontend runs at `http://localhost:3000`.

---

## Environment Variables

Required variables:

- `REACT_APP_BACKEND_URL`
- `REACT_APP_RAZORPAY_KEY`
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`

---

## Pages & Routes

### Public Routes

- `/` - Home and product catalog
- `/shop` - Product listings
- `/about` - Brand and benefits
- `/contact` - Contact form
- `/login` - Login page
- `/register` - Registration page

### Customer Routes

- `/profile` - User profile
- `/checkout` - Checkout flow
- `/order-success` - Order confirmation
- `/orders` - Order history

### Admin Routes

- `/admin` - Admin dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/customers` - Customer management
- `/admin/testimonials` - Testimonials moderation

---

## Available Scripts

```bash
npm run dev
npm run build
npm run test
```

---

## Related Documentation

- [Root README](../README.md)
- [Backend README](../backend/README.md)
- [API Reference](../docs/API.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)

---

## Last Updated

May 2026
