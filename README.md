# UrbanFix - Geospatial Civic Issue Tracking System

**FAST NUCES - Web Programming Project**

Group Members:
- Ahmed Irfan - 23i-0020
- Muhammad Bilal - 23i-0595

## Overview

UrbanFix is a geospatial civic issue tracking platform that connects citizens to local authorities. Citizens can report problems like potholes, garbage, broken streetlights, or water supply issues by pinning them on an interactive map. Admins review, update status, and add resolution notes.

## Tech Stack

- **Framework**: Next.js 15 (App Router, JavaScript)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT stored in httpOnly cookies, 30-minute inactivity timeout
- **Maps**: Leaflet.js with OpenStreetMap tiles + Nominatim reverse geocoding
- **Styling**: Tailwind CSS 4
- **Email**: Nodemailer (password reset)
- **Deployment**: Vercel

## Features

- Role-based access control (user / admin)
- Interactive map with click-to-pin location selection
- Reverse geocoding (auto-fill address from coordinates)
- Filter issues by status and category
- Admin dashboard with live statistics
- Full-screen live map view for admins
- User management (activate/deactivate, change roles)
- Password reset via email
- Responsive mobile-first design

## Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/AhmedIrfan7/web-project.git
   cd web-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/urbanfix
   JWT_SECRET=your_secret_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=UrbanFix <your_email@gmail.com>
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`

## Vercel Deployment

Set these environment variables in Vercel project settings:

- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - A strong random secret
- `NEXT_PUBLIC_APP_URL` - Your Vercel deployment URL
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET/POST | `/api/issues` | List all issues (admin) / Create issue |
| GET | `/api/issues/my` | Get current user's issues |
| GET | `/api/issues/map` | Get issues for map view |
| GET/PATCH/DELETE | `/api/issues/[id]` | Issue detail operations |
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | List all users |
| PATCH | `/api/admin/users/[id]` | Update user role/status |

## Project Structure

```
app/
  api/              API route handlers
  admin/            Admin dashboard, map, users
  dashboard/        User issue list
  issues/[id]/      Issue detail page
  login/            Sign in page
  signup/           Registration page
  report/           Report new issue form
  forgot-password/  Password reset request
  reset-password/   Password reset form
components/
  Navbar.jsx        Navigation with role-aware links
  Footer.jsx        Site footer
  IssueCard.jsx     Issue list card component
  MapPicker.jsx     Interactive location picker
  MapView.jsx       Read-only issue map display
context/
  AuthContext.jsx   Global auth state + inactivity timer
lib/
  db.js             MongoDB connection
  jwt.js            Token sign/verify helpers
  auth.js           Server-side auth helpers
  email.js          Nodemailer email sender
  validation.js     Input validation utilities
models/
  User.js           User schema with bcrypt
  Issue.js          Issue schema with geolocation
  PasswordReset.js  Password reset token schema
middleware.js       Route protection middleware
```
