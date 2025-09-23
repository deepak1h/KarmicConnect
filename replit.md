# Karmic International E-commerce Platform

## Overview

A full-stack e-commerce and B2B quotation website for Karmic International, a textile export company specializing in yarn, fabric, garments, and home textiles. The platform features a customer-facing e-commerce site with a comprehensive admin panel for product and quotation management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite for build tooling
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent UI design
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management and caching
- **Forms**: React Hook Form with Zod for validation

### Backend Architecture
- **Runtime**: Node.js with Express.js for the REST API server
- **Language**: TypeScript for type safety across the entire stack
- **API Design**: RESTful endpoints with JWT-based authentication for admin features
- **File Uploads**: Multer middleware for handling product image uploads
- **Image Processing**: Sharp for image optimization and resizing

### Database & ORM
- **Database**: PostgreSQL via Neon Database (serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migrations**: Drizzle Kit for schema management and migrations
- **Schema Design**: 
  - Categories table for product organization
  - Products table with JSON fields for images and specifications
  - Quotations table for customer inquiries
  - Admin users table for authentication

### Authentication & Authorization
- **Admin Authentication**: JWT tokens with bcrypt password hashing
- **Session Management**: Client-side token storage with automatic header injection
- **Route Protection**: Middleware-based authentication for admin endpoints

### External Dependencies

#### Email Services
- **SendGrid**: Email delivery service for quotation notifications and admin communications

#### UI Components
- **Radix UI**: Headless component primitives for accessibility and functionality
- **Lucide React**: Icon library for consistent iconography

#### Development Tools
- **Replit Integration**: Specialized plugins for development environment
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

#### Image Handling
- **Sharp**: Server-side image processing and optimization
- **Multer**: Multipart form data handling for file uploads

The architecture follows a monorepo structure with shared TypeScript types between client and server, ensuring type safety across the full stack. The system supports both direct pricing and "price on request" models, with a comprehensive quotation system for B2B interactions.