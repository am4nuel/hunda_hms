# System Design Document - Hotel Management System

## 1. Architecture Overview

The application follows a client-server architecture:

- **Client**: A Single Page Application (SPA) built with React, Vite, and Tailwind CSS.
- **Server**: A RESTful API built with Node.js, Express, and PostgreSQL (via Sequelize).

## 2. Folder Structure

### Root

- `/client`: Frontend application.
- `/server`: Backend application.

### Client (`/client/src`)

- `api`: Axios configuration and API endpoints.
- `assets`: Static assets (images, fonts).
- `auth`: Authentication pages and logic (Login, Signup).
- `components`: Shared reusable UI components (Buttons, Inputs, Cards).
- `hunda_system_admin`: Features specific to the System Admin role.
- `hotel_company`: Features specific to the Hotel Company role.

### Server (`/server`)

- `config`: Database configuration.
- `controllers`: logic for handling requests (MVC pattern).
- `migrations`: Database schema changes.
- `models`: Sequelize models defining database tables.
- `routes`: API route definitions.
- `seeders`: Initial database data.
- `middleware`: Request processing (Authentication, Error handling).

## 3. Database Schema

### SystemAdmin

- `id`: PK
- `firstName`: String
- `lastName`: String
- `userName`: String (Unique)
- `email`: String (Unique)
- `password`: String (Hashed)
- `phoneNumber`: String
- `profilePicture`: String
- `role`: String (Default: 'admin')

## 4. Authentication Flow

- **Login**:
  1. Client sends `email`/`userName` and `password` to `POST /api/auth/login`.
  2. Server verifies credentials.
  3. Server generates a JSON Web Token (JWT).
  4. Server returns JWT to client.
  5. Client stores JWT (localStorage).
- **Protected Routes**:
  1. Client sends JWT in `Authorization` header (`Bearer <token>`).
  2. Server middleware verifies token.
  3. If valid, request proceeds; otherwise, 401 Unauthorized.

## 5. Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, Axios, React Router.
- **Backend**: Node.js, Express, Sequelize, PostgreSQL.
- **Authentication**: JWT, bcryptjs.
