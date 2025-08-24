# Pathly - College Major Discovery Platform

## Overview

Pathly is a comprehensive web application designed to help students discover their ideal college major through interactive assessments, detailed roadmaps, and AI-powered guidance. The platform provides personalized recommendations across 7 major fields including Computer Science, Business Administration, Psychology, Mechanical Engineering, Nursing, and Marketing. Built with Next.js 14, the application features a modern React-based frontend with TypeScript, Supabase for authentication and data management, and Google's Generative AI for intelligent career counseling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router architecture for server-side rendering and optimized performance
- **UI Framework**: React 18 with TypeScript for type safety and component-based architecture
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible design system
- **State Management**: React Context API for global state (Language, Auth) with custom hooks for data fetching
- **Animations**: Framer Motion for smooth page transitions and interactive elements
- **Development Tools**: Tempo DevTools for visual development and component prototyping

### Backend Architecture
- **API Routes**: Next.js API routes for server-side logic and AI integration
- **Authentication**: Supabase Auth with server-side session management and middleware protection
- **Database Integration**: Supabase with TypeScript type generation for user management and progress tracking
- **AI Integration**: Google Generative AI (Gemini 2.0) for career counseling chat functionality

### Data Storage Solutions
- **Primary Database**: Supabase (PostgreSQL) for user profiles, progress tracking, and application data
- **Client Storage**: LocalStorage for temporary demo data and user preferences
- **Session Management**: Server-side cookies with Supabase SSR for secure authentication state

### Authentication and Authorization
- **Authentication Provider**: Supabase Auth with email/password and social login support
- **Session Handling**: Server-side session management with automatic refresh and middleware protection
- **Route Protection**: Middleware-based route guards for protected pages like dashboard and profile
- **User Management**: Custom user profile system with metadata storage for personalization

### External Dependencies
- **Supabase**: Backend-as-a-Service for authentication, database, and real-time features
- **Google Generative AI**: AI-powered career counseling and personalized recommendations
- **Stripe**: Payment processing integration for premium features
- **Radix UI**: Headless UI components for accessibility and customization
- **Lucide React**: Icon library for consistent iconography
- **Next Themes**: Theme management for dark/light mode support

### Key Design Decisions
- **Internationalization**: Built-in support for English and Russian languages with context-based translation system
- **Progressive Enhancement**: Server-side rendering with client-side hydration for optimal performance
- **Component Architecture**: Modular component design with shadcn/ui for maintainable and consistent UI
- **Performance Optimization**: Next.js optimizations including image optimization, code splitting, and webpack bundle optimization
- **Responsive Design**: Mobile-first approach with Tailwind CSS responsive utilities
- **Accessibility**: ARIA compliance through Radix UI primitives and semantic HTML structure

### Development Environment Configuration
- **Replit Optimization**: Configured for 0.0.0.0 binding and external access
- **Build Tools**: SWC for fast compilation and Prettier for code formatting
- **Type Safety**: Comprehensive TypeScript configuration with strict mode enabled
- **Environment Variables**: Secure configuration for API keys and database credentials