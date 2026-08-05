# Apex Resume Frontend

Apex Resume – Frontend Requirements (Phase 1)

Objective

Build a modern, fully responsive, and interactive frontend for Apex Resume that provides a premium SaaS-like experience. The initial focus is on creating the authentication flow (Login & Signup) and the basic application layout before integrating the backend.

Design Theme

The overall UI should have a modern, minimal, and professional look similar to premium SaaS products. The interface should feel clean, spacious, and smooth, with subtle animations and polished interactions.

The design should include:

 Modern and minimal layout

 Professional SaaS-style interface

 Rounded components and cards

 Smooth animations and transitions

 Clean typography with proper spacing

 Soft shadows and subtle depth effects

 Interactive hover and click animations

 Consistent design language across all pages

Responsiveness

The entire application must be fully responsive and work seamlessly across:

 Mobile

 Tablet

 Laptop

 Desktop

No horizontal scrolling or broken layouts should occur on any screen size.

Navigation Bar

The navigation bar should remain consistent across the application.

It should include:

 Application logo and name

 Navigation links (Dashboard, Resume Analyzer, JD Analyzer, AI Interview, History)

 Theme switch (Dark / Light)

 Notifications icon (placeholder for now)

 User profile menu

 Mobile hamburger menu for smaller screens

Features:

 Sticky while scrolling

 Smooth hover effects

 Responsive navigation

 Dropdown menu for mobile devices

Authentication Module

Signup Page

Create a modern and visually appealing signup page.

Fields:

 Full Name

 Username

 Email

 Password

 Confirm Password

Features:

 Client-side validation

 Password confirmation validation

 Show/Hide password option

 Smooth input animations

 Interactive buttons

 Link to Login page

Login Page

Create a premium-looking login page with a clean and engaging design.

Fields:

 Username

 Password

Features:

 Show/Hide password

 Remember Me (optional)

 Forgot Password link (placeholder)

 Link to Signup page

 Animated validation messages

 Loading animation during login

Temporary Authentication

Until the backend is integrated, use simple frontend authentication.

Credentials:

 Username: user

 Password: Pass

Behavior:

 If the credentials match, redirect the user to the Dashboard/Homepage.

 Otherwise, display an "Invalid Username or Password" message.

Store the login state locally so users remain logged in after refreshing the page.

Dashboard (Homepage)

After successful login, redirect the user to a simple dashboard.

The dashboard should include:

 Welcome message

 Quick access cards for major modules

 Recent activity section (placeholder)

 Responsive layout

 Interactive cards with hover effects

Theme Support

The application should support both Dark Mode and Light Mode.

Requirements:

 Theme toggle should be accessible from the navigation bar or settings.

 Theme preference should persist after page refresh.

 All pages should adapt consistently to the selected theme.

Settings Page

Initially, the Settings page should include:

 Theme Toggle (Dark / Light)

 Basic Profile Information

 Logout Button

Additional settings can be added in later phases.

Animations & User Experience

The application should feel smooth and interactive.

Include:

 Page transition animations

 Button hover effects

 Card hover animations

 Input focus animations

 Loading indicators

 Toast notifications

 Smooth navigation transitions

Animations should enhance the experience without affecting performance.

Basic Pages (Phase 1)

 Landing Page (optional)

 Login

 Signup

 Dashboard

 Settings

 404 Page

Component Structure

Create reusable UI components such as:

 Navbar

 Buttons

 Input Fields

 Cards

 Theme Toggle

 Profile Menu

 Loading Spinner

 Toast Notifications

These components should be reusable throughout the application.

Initial Goal (Phase 1)

The first milestone is to build a beautiful and fully interactive authentication system.

Deliverables:

 Modern Login Page

 Modern Signup Page

 Responsive Design

 Dark/Light Theme Support

 Temporary Frontend Authentication (user / Pass)

 Redirect to Dashboard after successful login

 Basic Dashboard Layout

 Reusable UI Components

 Smooth animations and polished user experience

This foundation will later be integrated with the Spring Boot backend for JWT-based authentication and the remaining Apex Resume features.

You can also take references from this website. https://100xschool.in/

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a51aa067-4122-471a-8aa6-cf1b7fcd6f29).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
