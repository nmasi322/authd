# FastAPI Authentication Template

This is a template for building a FastAPI-based web application with user authentication and authorization features. It includes routes for user registration, login, email verification, password reset, token refresh, and more.

## Features

- User registration
- User login and authentication using JWT tokens.
- Password reset functionality.
- Token refreshing to extend the validity of access tokens.
- Secure password hashing using bcrypt.
- Swagger-based interactive API documentation.

## Getting Started

```bash
python -m venv venv
source venv/bin/activate # On Windows, use venv\Scripts\activate
pip install -r requirements.txt
```

## Usage

> uvicorn main:app --reload
