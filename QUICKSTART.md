# Quick Start Guide

Get the e-commerce application running locally in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ installed and running (or use Docker)
- npm or yarn

## Option 1: Docker (Easiest)

1. **Install Docker and Docker Compose**
   - Download from [docker.com](https://www.docker.com/products/docker-desktop)

2. **Clone and Setup**
   ```bash
   cd Cloud_Computing
   cp .env.example .env
   # Edit .env with your settings (optional for local dev)
   ```

3. **Start Everything**
   ```bash
   docker-compose up -d
   ```

4. **Access Application**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - API Health: http://localhost:5000/health

5. **Stop Everything**
   ```bash
   docker-compose down
   ```

## Option 2: Manual Setup

### Backend

1. **Navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start PostgreSQL** (if not using Docker)
   ```bash
   # Create database
   createdb ecommerce
   ```

5. **Start backend**
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

Backend will run on http://localhost:5000

### Frontend

1. **Navigate to frontend** (in a new terminal)
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env: REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start frontend**
   ```bash
   npm start
   ```

Frontend will run on http://localhost:3000

## First Steps

1. **Register a new account**
   - Go to http://localhost:3000 (or http://localhost if using Docker)
   - Click "Sign Up"
   - Create an account

2. **Browse products**
   - View the product catalog
   - Search and filter products

3. **Add to cart**
   - Click on any product
   - Add to cart
   - View cart

4. **Place an order**
   - Go to cart
   - Enter shipping address
   - Select payment method
   - Complete checkout

## Admin Access

To create an admin user, you need to manually update the database:

```sql
-- Connect to database
psql -U postgres -d ecommerce

-- Update user role to admin
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

Then you can:
- Access admin dashboard at http://localhost:3000/admin
- Manage products
- Manage orders

## Troubleshooting

### Port already in use
- Change ports in `.env` files
- Or stop the service using the port

### Database connection error
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database `ecommerce` exists

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend `.env`
- Check CORS settings in backend

## Next Steps

- Read [README.md](README.md) for full documentation
- Read [DEPLOYMENT.md](DEPLOYMENT.md) for cloud deployment guide
- Customize the application for your needs

---

Happy coding! 🚀

