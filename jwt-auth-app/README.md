# jwt-auth-app

## Overview
This project is a simple authentication system using JSON Web Tokens (JWT) for user sign-in and sign-up functionality. It is built with TypeScript and Express.js, providing a secure way to manage user authentication.

## Features
- User registration (sign-up)
- User login (sign-in)
- JWT token generation and verification
- Middleware for protecting routes

## Project Structure
```
jwt-auth-app
├── src
│   ├── controllers
│   │   ├── authController.ts
│   ├── middleware
│   │   └── authMiddleware.ts
│   ├── models
│   │   └── userModel.ts
│   ├── routes
│   │   └── authRoutes.ts
│   ├── utils
│   │   └── jwt.ts
│   ├── app.ts
│   └── types
│       └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd jwt-auth-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
1. Start the server:
   ```
   npm start
   ```
2. Use the following endpoints for authentication:
   - **Sign Up**: `POST /api/auth/signup`
   - **Sign In**: `POST /api/auth/signin`

## Environment Variables
Make sure to set up your environment variables in a `.env.local` file:
```
MONGODB_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
GEMINI_API_KEY=<your_api_key>
```

## License
This project is licensed under the MIT License.