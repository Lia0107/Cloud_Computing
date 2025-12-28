# E-Commerce Cloud Application - Code Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Backend Documentation](#backend-documentation)
5. [Frontend Documentation](#frontend-documentation)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [AWS Integration](#aws-integration)
9. [Docker Configuration](#docker-configuration)
10. [Deployment](#deployment)
11. [Security Implementation](#security-implementation)
12. [Environment Variables](#environment-variables)

---

## Project Overview

A production-ready, full-stack e-commerce application deployed on AWS with enterprise-grade scalability, high availability, and security features. The application supports customer shopping experiences and administrative product/order management.

### Key Features
- **Customer Features**: Product catalog, shopping cart, user authentication, order processing and tracking
- **Admin Features**: Product management (CRUD), order management, inventory tracking, user management
- **Cloud Services**: Multi-AZ deployment, Auto Scaling, Load Balancing, S3 Storage, RDS PostgreSQL
- **Security**: JWT authentication, rate limiting, HTTPS support, AWS security groups, IAM roles
- **Monitoring**: CloudWatch metrics, custom dashboards, SNS alarms

---

## Architecture

### AWS Cloud Architecture

The application runs on AWS with the following components:

#### **Compute Layer**
- **EC2 Instances**: t2.micro instances running Ubuntu 22.04 with Docker
- **Auto Scaling Group**: Min=1, Max=4, scales based on CPU utilization (70% threshold)
- **Multi-AZ Deployment**: Instances across us-east-1a and us-east-1b for high availability
- **Application Load Balancer**: Distributes traffic across availability zones

#### **Storage Layer**
- **S3 Bucket**: `ecommerce-images-22018097` for product images (public-read ACL)
- **RDS PostgreSQL**: db.t3.micro with Multi-AZ enabled for automatic failover

#### **Networking**
- **VPC**: Custom VPC with public/private subnets
- **Security Groups**: 
  - EC2: Ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (Backend API)
  - RDS: Port 5432 (PostgreSQL)
  - ALB: Ports 80, 443

#### **Monitoring & Operations**
- **CloudWatch**: Custom dashboards tracking CPU, RDS metrics, ALB metrics
- **CloudWatch Alarms**: SNS notifications for high CPU, database issues, errors
- **IAM**: Roles and policies for EC2, S3, and RDS access

---

## Technology Stack

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js 4.18.2
- **Database Driver**: pg (node-postgres) 8.11.3
- **Authentication**: JWT (jsonwebtoken 9.0.2), bcryptjs 2.4.3
- **Cloud SDK**: aws-sdk 2.1499.0
- **File Upload**: multer 1.4.5
- **Validation**: express-validator 7.0.1
- **Security**: helmet 7.1.0, express-rate-limit 7.1.0, cors 2.8.5

### Frontend
- **Framework**: React 18.2.0
- **Routing**: react-router-dom 6.20.0
- **HTTP Client**: axios 1.6.2
- **Data Fetching**: react-query 3.39.3
- **Icons**: @heroicons/react 2.1.1
- **Web Server**: nginx (alpine)

### Database
- **Database**: PostgreSQL 15
- **Connection Pool**: node-postgres Pool with max 20 connections
- **ORM**: Raw SQL queries with parameterized statements

### DevOps
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose (local development)
- **CI/CD**: AWS deployment with automated health checks
- **Monitoring**: CloudWatch, ALB health checks

---

## Backend Documentation

### Project Structure

```
backend/
├── config/
│   ├── database.js      # PostgreSQL connection pool and schema initialization
│   └── aws.js           # AWS S3 configuration and helper functions
├── middleware/
│   └── auth.js          # JWT authentication and authorization middleware
├── routes/
│   ├── auth.js          # User registration, login, profile endpoints
│   ├── products.js      # Product CRUD operations
│   ├── cart.js          # Shopping cart management
│   ├── orders.js        # Order creation and management
│   ├── users.js         # User profile management
│   └── migrate.js       # Database migration utilities
├── scripts/
│   └── migrate.js       # Database migration scripts
├── server.js            # Express application entry point
├── Dockerfile           # Container configuration for backend
├── package.json         # Dependencies and scripts
├── update-db-images.js  # Script to update product images in DB
└── upload-to-s3.js      # Script to upload images to S3
```

### Core Modules

#### **server.js** - Application Entry Point

```javascript
// Main responsibilities:
// 1. Express app initialization
// 2. Middleware configuration (security, CORS, rate limiting)
// 3. Route registration
// 4. Database initialization
// 5. Error handling
// 6. Server startup

const express = require('express');
const app = express();

// Security middleware
app.use(helmet());           // Security headers
app.use(cors({               // CORS configuration
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/migrate', migrateRoutes);

// Health check endpoint for ALB
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
```

**Key Features**:
- Trust proxy for proper client IP detection behind ALB
- Helmet for security headers
- CORS with credentials support
- Rate limiting to prevent abuse
- Health check endpoint for AWS ALB health checks
- Environment-based configuration

#### **config/database.js** - Database Configuration

```javascript
// Main responsibilities:
// 1. PostgreSQL connection pool management
// 2. Database schema initialization
// 3. Table creation with constraints
// 4. Index creation for performance
// 5. Sample data insertion

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,                      // Maximum pool connections
  idleTimeoutMillis: 30000,     // Close idle clients after 30s
  connectionTimeoutMillis: 2000 // Connection timeout
});
```

**Database Schema**:
- **users**: User accounts with roles (customer/admin)
- **products**: Product catalog with inventory
- **cart_items**: User shopping carts
- **orders**: Order headers with status tracking
- **order_items**: Order line items
- **inventory_logs**: Audit trail for inventory changes

**Performance Optimizations**:
- Indexed columns: products.category, orders.user_id, cart_items.user_id
- Connection pooling with max 20 connections
- Prepared statements to prevent SQL injection

#### **config/aws.js** - AWS S3 Integration

```javascript
// Main responsibilities:
// 1. AWS S3 client configuration
// 2. File upload to S3 with proper ACL
// 3. File deletion from S3
// 4. Signed URL generation for private files

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Upload file to S3 bucket
const uploadToS3 = async (file, folder = 'products') => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `${folder}/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };
  const result = await s3.upload(params).promise();
  return result.Location;
};
```

**Features**:
- Automatic key generation with timestamps
- Public-read ACL for product images
- Support for signed URLs for private content
- Error handling with detailed logging

#### **middleware/auth.js** - Authentication Middleware

```javascript
// Main responsibilities:
// 1. JWT token verification
// 2. User authentication from token
// 3. Role-based authorization (admin check)
// 4. Token expiration handling

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const decoded = jwt.verify(token, JWT_SECRET);
  const result = await db.query('SELECT id, email, role FROM users WHERE id = $1', [decoded.userId]);
  
  if (result.rows.length === 0) {
    return res.status(401).json({ message: 'User not found' });
  }
  
  req.user = result.rows[0];
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};
```

**Security Features**:
- Bearer token authentication
- Database verification of user existence
- Token expiration handling
- Role-based access control
- Detailed error messages for debugging

---

## Frontend Documentation

### Project Structure

```
frontend/
├── public/
│   ├── index.html           # HTML template
│   └── images/              # Local product images (pre-S3 migration)
├── src/
│   ├── components/
│   │   ├── Navbar.js        # Navigation bar component
│   │   └── Navbar.css       # Navigation styles
│   ├── context/
│   │   └── AuthContext.js   # Authentication context provider
│   ├── pages/
│   │   ├── Home.js          # Landing page
│   │   ├── Products.js      # Product listing page
│   │   ├── ProductDetail.js # Product detail page
│   │   ├── Cart.js          # Shopping cart page
│   │   ├── Orders.js        # Order history page
│   │   ├── OrderDetail.js   # Individual order details
│   │   ├── Login.js         # Login page
│   │   ├── Register.js      # Registration page
│   │   ├── Profile.js       # User profile page
│   │   └── AdminDashboard.js # Admin management dashboard
│   ├── services/            # API service modules
│   ├── App.js               # Root component with routing
│   ├── App.css              # Global styles
│   ├── index.js             # React entry point
│   └── index.css            # Base styles
├── Dockerfile               # Multi-stage Docker build
├── nginx.conf               # Nginx reverse proxy config
└── package.json             # Dependencies
```

### Core Components

#### **App.js** - Root Component

```javascript
// Main responsibilities:
// 1. React Router configuration
// 2. Route protection based on authentication
// 3. Role-based route access (admin routes)
// 4. Layout structure with Navbar

function App() {
  const { user } = useAuth();

  return (
    <div className="App">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          
          {/* Protected routes - redirect to login if not authenticated */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/orders" element={user ? <Orders /> : <Navigate to="/login" />} />
          <Route path="/orders/:id" element={user ? <OrderDetail /> : <Navigate to="/login" />} />
          
          {/* Admin-only route */}
          <Route path="/admin" element={
            user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />
          } />
        </Routes>
      </main>
    </div>
  );
}
```

**Routing Features**:
- Protected routes with automatic redirection
- Role-based access control for admin routes
- Dynamic route parameters for product/order details
- Redirect authenticated users away from login/register

#### **context/AuthContext.js** - Authentication State Management

```javascript
// Main responsibilities:
// 1. Global authentication state management
// 2. JWT token storage in localStorage
// 3. Login/logout functionality
// 4. User profile persistence
// 5. Axios interceptor for automatic token injection

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-login on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Axios interceptor for adding auth token
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
```

**Key Features**:
- Persistent authentication using localStorage
- Automatic token injection via Axios interceptors
- Loading state to prevent flash of unauthenticated content
- Global user state accessible via useAuth() hook

#### **Key Pages**

##### **Products.js** - Product Catalog
- Product listing with pagination
- Category filtering
- Search functionality
- Product image display from S3
- Add to cart functionality

##### **Cart.js** - Shopping Cart
- Display cart items with product details
- Quantity adjustment (increment/decrement)
- Item removal from cart
- Total price calculation
- Checkout process initiation

##### **Orders.js** - Order History
- List all user orders with status
- Order filtering by status
- Order summary display
- Navigation to order details

##### **AdminDashboard.js** - Admin Panel
- Product management (create, edit, delete)
- Order management (view, update status)
- Inventory tracking
- User management
- Image upload to S3
- Real-time data updates

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'customer',        -- 'customer' or 'admin'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Store user account information with role-based access
**Indexes**: Unique index on email
**Relationships**: Referenced by cart_items, orders

### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),                      -- 'Electronics', 'Furniture', etc.
  image_url VARCHAR(500),                     -- S3 URL
  stock_quantity INTEGER DEFAULT 0,
  sku VARCHAR(100) UNIQUE,                    -- Stock Keeping Unit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);
```

**Purpose**: Product catalog with inventory tracking
**Indexes**: category for filtered queries, unique SKU
**Relationships**: Referenced by cart_items, order_items, inventory_logs

### Cart Items Table
```sql
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)                 -- One entry per user/product combo
);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
```

**Purpose**: User shopping carts with product references
**Constraints**: Unique constraint prevents duplicate products per user
**Cascade**: Deletes when user or product is deleted

### Orders Table
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',       -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
  shipping_address TEXT,
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
```

**Purpose**: Order headers with status tracking
**Status Values**: pending, processing, shipped, delivered, cancelled
**Relationship**: user_id set to NULL if user deleted (preserves order history)

### Order Items Table
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,              -- Price at time of order
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Order line items with historical pricing
**Price Storage**: Captures price at order time (not current price)
**Cascade**: Deletes when order is deleted

### Inventory Logs Table
```sql
CREATE TABLE inventory_logs (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  change_type VARCHAR(20) NOT NULL,           -- 'sale', 'restock', 'adjustment', 'return'
  quantity_change INTEGER NOT NULL,           -- Positive or negative
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Audit trail for inventory changes
**Change Types**: sale, restock, adjustment, return
**Tracking**: Records all stock quantity modifications with reasons

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
**Purpose**: Register new user account  
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "signupCode": "MyAdminCode12345"  // Optional, for admin registration
}
```
**Response**: `{ token, user: { id, email, role, firstName, lastName } }`  
**Validation**: Email format, password length (min 6 chars), duplicate email check

#### POST /api/auth/login
**Purpose**: Authenticate user and receive JWT token  
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```
**Response**: `{ token, user: { id, email, role, firstName, lastName } }`  
**Authentication**: bcrypt password comparison

#### GET /api/auth/me
**Purpose**: Get current authenticated user profile  
**Headers**: `Authorization: Bearer <token>`  
**Response**: `{ id, email, role, firstName, lastName }`

### Product Endpoints

#### GET /api/products
**Purpose**: List products with filtering and pagination  
**Query Parameters**:
- `category` (optional): Filter by category
- `search` (optional): Search in name/description
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response**:
```json
{
  "products": [
    {
      "id": 1,
      "name": "Laptop Pro 15\"",
      "description": "High-performance laptop",
      "price": 1299.99,
      "category": "Electronics",
      "image_url": "https://s3.amazonaws.com/.../laptop.jpg",
      "stock_quantity": 50,
      "sku": "LAP-001"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### GET /api/products/:id
**Purpose**: Get single product details  
**Response**: Product object with all fields  
**Status**: 404 if product not found

#### POST /api/products (Admin Only)
**Purpose**: Create new product  
**Headers**: `Authorization: Bearer <admin-token>`  
**Request Body**: Product fields (name, description, price, category, stockQuantity, sku)  
**File Upload**: Optional image upload to S3 via multipart/form-data  
**Response**: Created product object

#### PUT /api/products/:id (Admin Only)
**Purpose**: Update existing product  
**Headers**: `Authorization: Bearer <admin-token>`  
**Request Body**: Fields to update  
**File Upload**: Optional new image (deletes old from S3)  
**Response**: Updated product object

#### DELETE /api/products/:id (Admin Only)
**Purpose**: Delete product  
**Headers**: `Authorization: Bearer <admin-token>`  
**Side Effects**: Deletes image from S3, cascade deletes cart items  
**Response**: `{ message: 'Product deleted' }`

### Cart Endpoints

#### GET /api/cart (Authenticated)
**Purpose**: Get user's cart items  
**Headers**: `Authorization: Bearer <token>`  
**Response**: Array of cart items with product details and calculated subtotals

#### POST /api/cart (Authenticated)
**Purpose**: Add item to cart or update quantity  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**:
```json
{
  "productId": 1,
  "quantity": 2
}
```
**Logic**: If item exists, updates quantity; otherwise creates new cart item  
**Validation**: Product existence, stock availability  
**Response**: Updated cart item

#### PUT /api/cart/:itemId (Authenticated)
**Purpose**: Update cart item quantity  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**: `{ quantity: 3 }`  
**Validation**: Stock availability  
**Response**: Updated cart item

#### DELETE /api/cart/:itemId (Authenticated)
**Purpose**: Remove item from cart  
**Headers**: `Authorization: Bearer <token>`  
**Response**: `{ message: 'Item removed from cart' }`

### Order Endpoints

#### POST /api/orders (Authenticated)
**Purpose**: Create order from cart  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**:
```json
{
  "shippingAddress": "123 Main St, City, State 12345",
  "paymentMethod": "credit_card"
}
```
**Process**:
1. Validates cart is not empty
2. Checks stock availability for all items
3. Calculates total amount
4. Creates order record
5. Creates order items
6. Updates product inventory
7. Logs inventory changes
8. Clears user's cart

**Response**: Created order with items  
**Transactions**: All operations in single transaction (rollback on error)

#### GET /api/orders (Authenticated)
**Purpose**: Get user's order history  
**Headers**: `Authorization: Bearer <token>`  
**Query**: `status` (optional): Filter by order status  
**Response**: Array of orders with item counts and totals

#### GET /api/orders/:id (Authenticated)
**Purpose**: Get order details  
**Headers**: `Authorization: Bearer <token>`  
**Response**: Order with nested order items including product details  
**Authorization**: Users can only view their own orders (admins can view all)

#### PUT /api/orders/:id/status (Admin Only)
**Purpose**: Update order status  
**Headers**: `Authorization: Bearer <admin-token>`  
**Request Body**: `{ status: 'shipped' }`  
**Valid Statuses**: pending, processing, shipped, delivered, cancelled  
**Response**: Updated order

#### GET /api/orders/admin/all (Admin Only)
**Purpose**: Get all orders for admin dashboard  
**Headers**: `Authorization: Bearer <admin-token>`  
**Query**: `status` (optional): Filter by order status  
**Response**: Array of all orders with user details

### User Endpoints

#### GET /api/users/profile (Authenticated)
**Purpose**: Get user profile  
**Headers**: `Authorization: Bearer <token>`  
**Response**: User object (excluding password_hash)

#### PUT /api/users/profile (Authenticated)
**Purpose**: Update user profile  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**: `{ firstName, lastName }` (partial updates allowed)  
**Response**: Updated user object

---

## AWS Integration

### S3 Storage

**Bucket**: `ecommerce-images-22018097`  
**Region**: us-east-1  
**Access**: Public-read ACL for product images

#### **Upload Process**
1. Admin uploads image via Admin Dashboard
2. multer receives file in memory (buffer)
3. File sent to S3 with unique key: `products/{timestamp}-{filename}`
4. S3 returns public URL
5. Product record updated with image_url

#### **Image URL Format**
```
https://ecommerce-images-22018097.s3.amazonaws.com/products/1703812345678-laptop.jpg
```

#### **S3 Operations** ([config/aws.js](config/aws.js))
- **Upload**: `uploadToS3(file, folder)` - Uploads with ACL public-read
- **Delete**: `deleteFromS3(fileUrl)` - Extracts key from URL and deletes
- **Signed URLs**: `getSignedUrl(key, expiresIn)` - For private content (future use)

### RDS PostgreSQL

**Instance**: ecommercedb.cpz9losh6eqj.us-east-1.rds.amazonaws.com  
**Instance Type**: db.t3.micro  
**Multi-AZ**: Enabled for automatic failover  
**SSL**: Required for connections

#### **Connection Configuration**
```javascript
{
  host: 'ecommercedb.cpz9losh6eqj.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'ecommerce',
  user: 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 20,  // Connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
}
```

### EC2 Instances

**AMI**: Ubuntu 22.04  
**Instance Type**: t2.micro  
**Docker**: Pre-installed with docker-compose  
**Deployment**: Instances pull from ECR or build from source

#### **User Data Script**
```bash
#!/bin/bash
# Install Docker and dependencies
# Clone repository
# Start containers with docker-compose
# Configure CloudWatch agent
```

### Auto Scaling

**Launch Template**: Ubuntu 22.04 with Docker setup  
**Scaling Policy**: Target tracking at 70% CPU  
**Health Checks**: ALB health checks every 30 seconds  
**Cooldown**: 300 seconds between scaling activities

### Application Load Balancer

**DNS**: ecommerce-alb-1178391586.us-east-1.elb.amazonaws.com  
**Target Groups**:
- Frontend: Port 80 (nginx)
- Backend: Port 5000 (Express)

**Health Check**:
- Path: `/health`
- Interval: 30 seconds
- Healthy threshold: 2
- Unhealthy threshold: 3

### CloudWatch Monitoring

**Custom Metrics**:
- CPU Utilization (per instance and aggregate)
- RDS CPU and connection count
- ALB target response time
- ALB request count

**Alarms**:
- High CPU (>80% for 5 minutes) → SNS notification
- RDS connection issues → SNS notification
- ALB 5XX errors (>10 in 5 minutes) → SNS notification

### Security Groups

#### EC2 Security Group
```
Inbound:
  - Port 22 (SSH) from Admin IP
  - Port 80 (HTTP) from ALB
  - Port 443 (HTTPS) from ALB
  - Port 5000 (API) from ALB
```

#### RDS Security Group
```
Inbound:
  - Port 5432 (PostgreSQL) from EC2 Security Group
```

#### ALB Security Group
```
Inbound:
  - Port 80 (HTTP) from 0.0.0.0/0
  - Port 443 (HTTPS) from 0.0.0.0/0
```

---

## Docker Configuration

### Backend Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose API port
EXPOSE 5000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
```

**Features**:
- Alpine base image for minimal size
- Production dependencies only
- Health check endpoint integration
- Non-root user for security

### Frontend Dockerfile (Multi-Stage)

```dockerfile
# Stage 1: Build React app
FROM node:18-alpine as build
WORKDIR /app

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Features**:
- Multi-stage build reduces final image size
- Build-time argument for API URL
- nginx for production-grade serving
- Static file optimization

### nginx Configuration

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  # SPA routing - fallback to index.html
  location / {
    try_files $uri $uri/ /index.html;
  }

  # API proxy (optional, if needed)
  location /api {
    proxy_pass http://backend:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # Cache static assets
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### docker-compose.yml (Local Development)

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: ecommerce-db
    environment:
      POSTGRES_DB: ecommerce
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ecommerce-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ecommerce-backend
    environment:
      NODE_ENV: production
      PORT: 5000
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: ecommerce
      DB_USER: postgres
      DB_PASSWORD: postgres
      # ... AWS credentials from env file
    ports:
      - "5000:5000"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - ecommerce-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        REACT_APP_API_URL: http://localhost:5000/api
    container_name: ecommerce-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - ecommerce-network

volumes:
  postgres_data:

networks:
  ecommerce-network:
    driver: bridge
```

---

## Deployment

### Deployment Architecture

```
Code Repository
    ↓
AWS EC2 Instance (Auto Scaling Group)
    ↓
Docker Containers
    ├── Frontend (nginx:alpine) → Port 80
    └── Backend (node:18-alpine) → Port 5000
         ↓
    RDS PostgreSQL (Multi-AZ)
         ↓
    S3 Bucket (Product Images)
```

### Deployment Steps

#### **1. Prerequisites**
- AWS Account with appropriate IAM permissions
- AWS CLI configured
- Docker installed locally (for testing)
- Git repository

#### **2. Infrastructure Setup**
```bash
# Create VPC with public/private subnets
# Configure security groups
# Launch RDS PostgreSQL instance with Multi-AZ
# Create S3 bucket with public-read policy
# Set up IAM roles for EC2 instances
```

#### **3. Application Deployment**
```bash
# SSH into EC2 instance
ssh -i key.pem ubuntu@<ec2-ip>

# Clone repository
git clone <repo-url>
cd Cloud_Computing

# Configure environment variables
nano .env  # Set DB_HOST, AWS credentials, etc.

# Build and start containers
docker-compose up -d

# Verify health
curl http://localhost:5000/health
```

#### **4. Load Balancer Configuration**
```bash
# Create Application Load Balancer
# Configure target groups for frontend (port 80) and backend (port 5000)
# Set up health checks on /health endpoint
# Configure listener rules
# Update DNS or use ALB DNS
```

#### **5. Auto Scaling Setup**
```bash
# Create launch template from working EC2 instance
# Create Auto Scaling Group with template
# Configure scaling policies (CPU-based)
# Attach to ALB target groups
```

#### **6. CloudWatch Setup**
```bash
# Create custom dashboard
# Set up alarms for CPU, RDS, ALB metrics
# Configure SNS topic for notifications
# Subscribe email endpoints
```

### Continuous Deployment

#### **Update Process**
1. Push code changes to repository
2. SSH into EC2 instances
3. Pull latest code: `git pull origin main`
4. Rebuild containers: `docker-compose up -d --build`
5. Health check passes → ALB routes traffic
6. Repeat for other instances in rotation

#### **Database Migrations**
```bash
# SSH into any backend instance
docker exec -it ecommerce-backend /bin/sh

# Run migration script
node scripts/migrate.js
```

### Rollback Procedure
```bash
# Revert to previous commit
git reset --hard <previous-commit>

# Rebuild containers
docker-compose up -d --build

# Verify health
curl http://localhost:5000/health
```

---

## Security Implementation

### Authentication & Authorization

#### **JWT Token Flow**
1. User logs in with email/password
2. Server validates credentials with bcrypt
3. Server generates JWT with userId and role
4. Token sent to client (stored in localStorage)
5. Client includes token in Authorization header: `Bearer <token>`
6. Server validates token on protected routes
7. Token expires after configured time (default: 7 days)

#### **Password Security**
```javascript
// Registration - hash password with bcrypt
const salt = await bcrypt.genSalt(10);
const passwordHash = await bcrypt.hash(password, salt);

// Login - compare with stored hash
const isMatch = await bcrypt.compare(password, user.password_hash);
```

**Configuration**:
- Salt rounds: 10
- Minimum password length: 6 characters
- Passwords never logged or exposed in responses

### API Security

#### **Rate Limiting**
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);
```

#### **Helmet Security Headers**
```javascript
app.use(helmet());
// Sets headers:
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY
// - Strict-Transport-Security
// - X-XSS-Protection
```

#### **CORS Configuration**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,  // Specific origin, not *
  credentials: true                   // Allow cookies/auth headers
}));
```

#### **SQL Injection Prevention**
```javascript
// Always use parameterized queries
db.query('SELECT * FROM products WHERE id = $1', [productId]);
// NEVER concatenate user input:
// db.query(`SELECT * FROM products WHERE id = ${productId}`); ❌
```

#### **Input Validation**
```javascript
const { body, validationResult } = require('express-validator');

router.post('/products', [
  body('name').trim().notEmpty().isLength({ max: 255 }),
  body('price').isFloat({ min: 0 }),
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process valid input
});
```

### AWS Security

#### **IAM Roles** (Preferred over access keys)
```javascript
// EC2 instance role permissions:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::ecommerce-images-22018097/*"
    }
  ]
}
```

#### **RDS Security**
- Multi-AZ for redundancy
- SSL/TLS required for connections
- Security group restricts access to EC2 instances only
- Automated backups enabled
- Encryption at rest (optional, can be enabled)

#### **S3 Security**
- Bucket policy for public-read on images
- Versioning enabled (recommended)
- Access logging for audit trail
- CORS configuration for frontend access

### Network Security

#### **Security Groups**
- Principle of least privilege
- Only necessary ports open
- Source restrictions (no 0.0.0.0/0 except ALB)
- Regular audit of rules

#### **ALB HTTPS** (Recommended)
```bash
# Request SSL certificate from ACM
aws acm request-certificate \
  --domain-name ecommerce.example.com \
  --validation-method DNS

# Add HTTPS listener to ALB
# Redirect HTTP to HTTPS
```

### Data Protection

#### **Sensitive Data Handling**
- Passwords: Hashed with bcrypt (never stored plain)
- JWT Secret: Strong, random, environment variable
- AWS Credentials: IAM roles preferred, never committed
- Database Credentials: Environment variables only

#### **Environment Variables**
```bash
# Never commit .env files to version control
# Use AWS Secrets Manager or Parameter Store for production
# Rotate credentials regularly
# Use different credentials per environment
```

---

## Environment Variables

### Backend Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
DB_HOST=ecommercedb.cpz9losh6eqj.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=ecommerce
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_SSL=true                                # Enable SSL for RDS

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-change-me   # Strong random string

# Frontend URL (for CORS)
FRONTEND_URL=http://ecommerce-alb-1178391586.us-east-1.elb.amazonaws.com

# Admin Setup
ADMIN_SIGNUP_CODE=MyAdminCode12345          # Code for admin registration

# AWS Configuration
AWS_ACCESS_KEY_ID=your-access-key           # Or use IAM role
AWS_SECRET_ACCESS_KEY=your-secret-key       # Or use IAM role
AWS_SESSION_TOKEN=your-session-token        # For temporary credentials
AWS_REGION=us-east-1
S3_BUCKET_NAME=ecommerce-images-22018097
```

### Frontend Environment Variables

```bash
# API Endpoint
REACT_APP_API_URL=http://ecommerce-alb-1178391586.us-east-1.elb.amazonaws.com/api

# Build-time variables (must start with REACT_APP_)
REACT_APP_ENV=production
```

### Docker Compose Environment

Create a `.env` file in the project root:

```bash
# Database
DB_NAME=ecommerce
DB_USER=postgres
DB_PASSWORD=postgres

# Backend
JWT_SECRET=local-development-secret
ADMIN_SIGNUP_CODE=admin123

# AWS (use your credentials)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=
AWS_REGION=us-east-1
S3_BUCKET_NAME=ecommerce-images-22018097

# URLs
FRONTEND_URL=http://localhost
REACT_APP_API_URL=http://localhost:5000/api
```

### Production Best Practices

1. **Never Commit Secrets**: Add `.env` to `.gitignore`
2. **Use AWS Secrets Manager**: For production credential management
3. **Rotate Credentials**: Regular rotation schedule
4. **Separate Environments**: Different credentials for dev/staging/prod
5. **IAM Roles**: Prefer IAM roles over access keys for EC2
6. **Environment-Specific**: Different values per environment

---

## Scripts and Utilities

### Backend Scripts

#### **scripts/migrate.js** - Database Migrations
```javascript
// Run schema migrations and data updates
// Usage: node scripts/migrate.js
```

#### **update-db-images.js** - Update Image URLs
```javascript
// Update product image URLs to S3 after upload
// Usage: node update-db-images.js
```

#### **upload-to-s3.js** - Direct S3 Upload
```javascript
// Upload images from local directory to S3
// Usage: node upload-to-s3.js
```

### Root Scripts

#### **scripts/upload-images-to-s3.js** - Batch Image Upload
```javascript
// Uploads all product images to S3 bucket
// Generates SQL UPDATE statements for database
// Usage: node scripts/upload-images-to-s3.js

const images = [
  { file: 'laptop.jpg', sku: 'LAP-001', key: 'products/laptop.jpg' },
  { file: 'wireless mouse.jpg', sku: 'MOU-001', key: 'products/wireless-mouse.jpg' },
  // ... more images
];

// Outputs SQL for updating database:
// UPDATE products SET image_url = 'https://s3...' WHERE sku = 'LAP-001';
```

#### **scripts/update-db-s3-urls.sh** - Database Update Script
```bash
#!/bin/bash
# Connects to RDS and updates image URLs
# Usage: ./scripts/update-db-s3-urls.sh
```

---

## Development Workflow

### Local Development Setup

1. **Clone Repository**
   ```bash
   git clone <repo-url>
   cd Cloud_Computing
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configure Environment**
   ```bash
   # Create .env file in project root
   cp .env.example .env
   # Edit with your local settings
   ```

4. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

5. **Access Application**
   - Frontend: http://localhost
   - Backend: http://localhost:5000
   - Database: localhost:5432

### Development Commands

```bash
# Backend development with hot reload
cd backend
npm run dev

# Frontend development server
cd frontend
npm start

# Run database migrations
cd backend
npm run migrate

# Build production images
docker-compose build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Remove volumes (reset database)
docker-compose down -v
```

### Testing

#### **Manual Testing**
- Use Postman or curl for API testing
- Test authentication flow
- Verify cart and order creation
- Test admin operations

#### **Health Checks**
```bash
# Backend health
curl http://localhost:5000/health

# Frontend availability
curl http://localhost

# Database connection
docker exec -it ecommerce-db psql -U postgres -d ecommerce -c "SELECT 1"
```

---

## Troubleshooting Guide

### Common Issues

#### **Database Connection Errors**
```
Error: connect ECONNREFUSED
```
**Solution**:
- Verify DB_HOST is correct
- Check security group allows connection
- Verify RDS instance is running
- Check SSL configuration (DB_SSL=true for RDS)

#### **S3 Upload Failures**
```
Error: Failed to upload file to cloud storage
```
**Solution**:
- Verify AWS credentials are valid
- Check IAM permissions for S3
- Verify bucket name is correct
- Check bucket region matches AWS_REGION

#### **JWT Authentication Errors**
```
Error: Invalid token
```
**Solution**:
- Verify JWT_SECRET matches between requests
- Check token expiration
- Ensure Authorization header format: `Bearer <token>`
- Verify user still exists in database

#### **Docker Container Won't Start**
```
Error: OCI runtime create failed
```
**Solution**:
- Check Docker logs: `docker logs ecommerce-backend`
- Verify environment variables are set
- Check port conflicts: `lsof -i :5000`
- Rebuild image: `docker-compose build backend`

#### **CORS Errors in Browser**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**:
- Verify FRONTEND_URL matches actual frontend URL
- Check CORS configuration in server.js
- Ensure credentials: true in CORS config
- Clear browser cache

### Performance Optimization

#### **Database Query Optimization**
- Use indexes on frequently queried columns
- Implement pagination for large result sets
- Use connection pooling (already configured)
- Monitor slow queries with CloudWatch

#### **Image Loading Optimization**
- Use CloudFront CDN in front of S3
- Implement lazy loading for images
- Compress images before upload
- Use responsive images

#### **API Response Time**
- Implement caching with Redis
- Use database query caching
- Minimize data transfer with field selection
- Implement HTTP caching headers

---

## Monitoring and Maintenance

### CloudWatch Metrics

#### **Custom Metrics Dashboard**
- EC2 CPU Utilization (per instance and average)
- RDS CPU Utilization and Connections
- ALB Request Count and Target Response Time
- Application-specific metrics (order count, user signups)

#### **CloudWatch Alarms**
```
High CPU Alarm:
  - Metric: CPUUtilization
  - Threshold: > 80%
  - Period: 5 minutes
  - Action: SNS notification

RDS Connection Issues:
  - Metric: DatabaseConnections
  - Threshold: > 18 (90% of max 20)
  - Period: 5 minutes
  - Action: SNS notification

ALB Error Rate:
  - Metric: HTTPCode_Target_5XX_Count
  - Threshold: > 10
  - Period: 5 minutes
  - Action: SNS notification
```

### Application Logging

#### **Backend Logging**
```javascript
// server.js logs startup and errors
console.log(`Server running on port ${PORT}`);
console.error('Failed to initialize database:', error);

// Route logs for debugging
console.log('Product created:', product);
console.error('Order creation failed:', error);
```

#### **Log Aggregation**
- Use CloudWatch Logs agent on EC2
- Configure log rotation
- Set retention policies
- Create log filters for errors

### Backup and Recovery

#### **Database Backups**
- RDS automated backups (daily)
- Retention: 7 days (configurable)
- Point-in-time recovery enabled
- Manual snapshots before major changes

#### **S3 Versioning**
```bash
# Enable versioning on S3 bucket
aws s3api put-bucket-versioning \
  --bucket ecommerce-images-22018097 \
  --versioning-configuration Status=Enabled
```

#### **Recovery Procedure**
1. Identify backup/snapshot to restore
2. Restore RDS from snapshot
3. Update DB_HOST in environment variables
4. Restart backend containers
5. Verify data integrity

---

## Future Enhancements

### Planned Features
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email notifications for orders
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search with filters
- [ ] Inventory alerts for low stock
- [ ] Sales analytics dashboard
- [ ] Multi-currency support
- [ ] Internationalization (i18n)

### Technical Improvements
- [ ] Implement Redis caching layer
- [ ] Add CloudFront CDN for static assets
- [ ] Implement CI/CD pipeline
- [ ] Add comprehensive test suite
- [ ] Implement WebSocket for real-time updates
- [ ] Add Elasticsearch for advanced search
- [ ] Implement API versioning
- [ ] Add GraphQL API option
- [ ] Kubernetes migration for container orchestration

### Security Enhancements
- [ ] Implement 2FA for admin accounts
- [ ] Add API rate limiting per user
- [ ] Implement WAF rules
- [ ] Add DDoS protection
- [ ] Implement secrets rotation
- [ ] Add audit logging
- [ ] Implement content security policy
- [ ] Add penetration testing

---

## Support and Maintenance

### Contact Information
- **Developer**: [Your Name/Team]
- **Email**: [support@example.com]
- **Repository**: [GitHub URL]

### Maintenance Schedule
- **Updates**: Weekly security patches
- **Backups**: Daily automated + weekly manual verification
- **Monitoring**: 24/7 CloudWatch alarms
- **Incident Response**: <2 hour response time

### Documentation Updates
This documentation should be updated when:
- New features are added
- API endpoints change
- Infrastructure modifications occur
- Security updates are implemented
- Major bug fixes are deployed

---

## Appendix

### Glossary
- **ALB**: Application Load Balancer
- **RDS**: Relational Database Service
- **S3**: Simple Storage Service
- **EC2**: Elastic Compute Cloud
- **JWT**: JSON Web Token
- **IAM**: Identity and Access Management
- **ACL**: Access Control List
- **CORS**: Cross-Origin Resource Sharing

### References
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [AWS Documentation](https://docs.aws.amazon.com/)
- [Docker Documentation](https://docs.docker.com/)

---

**Document Version**: 1.0  
**Last Updated**: December 28, 2025  
**Maintained By**: Development Team
