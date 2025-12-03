# E-Commerce Cloud Application

A full-stack e-commerce application designed for cloud deployment with scalability, high availability, and security features.

## 🏗️ Architecture Overview

This application is designed to meet cloud computing requirements including:

### Core Services (Required)
- **Cloud Virtual Machine(s)**: Backend API and Frontend hosted on VMs
- **Cloud Storage**: AWS S3 integration for product images
- **Cloud Database**: PostgreSQL database (compatible with RDS, Azure SQL)

### Scalability and Resilience (Required)
- **Load Balancing**: Configure Elastic Load Balancer (ELB) or equivalent
- **Auto Scaling**: Auto Scaling Groups for automatic instance scaling
- **Availability**: Multi-AZ deployment for fault tolerance

### Security & Monitoring
- **IAM Roles/Policies**: Secure access between services
- **Security Groups/Firewalls**: Restricted traffic on necessary ports
- **Cloud Monitoring**: CloudWatch integration for metrics and alarms

## 📋 Features

### Customer Features
- Product catalog with search and filtering
- Shopping cart functionality
- User authentication and accounts
- Order processing and tracking
- Order history

### Admin Features
- Product management (CRUD operations)
- Order management and status updates
- Inventory tracking
- User management

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** authentication
- **AWS SDK** for S3 integration
- **bcryptjs** for password hashing

### Frontend
- **React** 18
- **React Router** for navigation
- **React Query** for data fetching
- **Axios** for API calls
- **Heroicons** for icons

## 📁 Project Structure

```
Cloud_Computing/
├── backend/
│   ├── config/
│   │   ├── database.js      # Database configuration
│   │   └── aws.js           # AWS S3 configuration
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── products.js      # Product routes
│   │   ├── cart.js          # Shopping cart routes
│   │   ├── orders.js        # Order routes
│   │   └── users.js         # User profile routes
│   ├── server.js            # Express server
│   ├── Dockerfile           # Backend Docker configuration
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   ├── services/       # API services
│   │   └── App.js
│   ├── Dockerfile           # Frontend Docker configuration
│   ├── nginx.conf           # Nginx configuration
│   └── package.json
├── docker-compose.yml       # Docker Compose configuration
└── README.md
```

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 15+ (or use Docker)
- AWS Account (for S3, optional for local dev)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=ecommerce-product-images
```

5. Start PostgreSQL database (if not using Docker):
```bash
# Create database
createdb ecommerce
```

6. Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 🐳 Docker Deployment

### Using Docker Compose (Recommended for Local Testing)

1. Create `.env` file in root directory:
```env
DB_NAME=ecommerce
DB_USER=postgres
DB_PASSWORD=your-secure-password
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost
REACT_APP_API_URL=http://localhost:5000/api
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=ecommerce-product-images
```

2. Build and start all services:
```bash
docker-compose up -d
```

3. Access the application:
- Frontend: `http://localhost`
- Backend API: `http://localhost:5000`
- Database: `localhost:5432`

4. Stop services:
```bash
docker-compose down
```

## ☁️ Cloud Deployment Guide

### AWS Deployment

#### 1. Database Setup (RDS PostgreSQL)

1. Create RDS PostgreSQL instance:
   - Engine: PostgreSQL 15
   - Instance class: db.t3.micro (for testing)
   - Multi-AZ: Enabled (for high availability)
   - Storage: 20GB minimum
   - Security: Configure VPC and security groups

2. Update backend environment variables:
```env
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_SSL=true
```

#### 2. Storage Setup (S3)

1. Create S3 bucket for product images:
   - Bucket name: `ecommerce-product-images` (or your preferred name)
   - Region: Same as your application
   - Enable versioning (optional)
   - Configure CORS for frontend access

2. Create IAM user/role with S3 permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::ecommerce-product-images/*"
    }
  ]
}
```

#### 3. EC2 Instance Setup

1. Launch EC2 instances:
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t3.small or larger
   - Security groups: Allow HTTP (80), HTTPS (443), and custom backend port (5000)
   - Key pair: Create and download

2. Install Docker on EC2:
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
```

3. Deploy application:
```bash
# Clone repository
git clone your-repo-url
cd Cloud_Computing

# Create .env file with production values
nano .env

# Build and start
docker-compose up -d
```

#### 4. Load Balancer Setup (Application Load Balancer)

1. Create Application Load Balancer:
   - Type: Application Load Balancer
   - Scheme: Internet-facing
   - Listeners: HTTP (80) and HTTPS (443)
   - Target groups: Create for backend (port 5000) and frontend (port 80)

2. Register EC2 instances with target groups

3. Configure health checks:
   - Backend: `/health` endpoint
   - Frontend: `/health` endpoint

#### 5. Auto Scaling Setup

1. Create Launch Template:
   - Use your configured EC2 instance as base
   - Include user data script for Docker installation

2. Create Auto Scaling Group:
   - Min size: 2 (for multi-AZ)
   - Max size: 10
   - Desired capacity: 2
   - Availability Zones: At least 2 different zones
   - Target tracking policy: CPU utilization at 70%

3. Configure scaling policies:
   - Scale up: When CPU > 70% for 2 minutes
   - Scale down: When CPU < 30% for 5 minutes

#### 6. Security Configuration

1. Security Groups:
   - Backend: Allow port 5000 from ALB only
   - Frontend: Allow ports 80/443 from internet
   - Database: Allow port 5432 from backend security group only

2. IAM Roles:
   - Attach IAM role to EC2 instances for S3 access
   - No need for access keys when using IAM roles

3. SSL/TLS:
   - Use AWS Certificate Manager (ACM) for HTTPS
   - Configure ALB to use HTTPS certificate

#### 7. CloudWatch Monitoring

1. Create CloudWatch alarms:
   - High CPU utilization (>80%)
   - High memory usage (>85%)
   - Application errors (5xx responses)
   - Database connection errors

2. Set up CloudWatch dashboards:
   - API response times
   - Request counts
   - Error rates
   - Auto Scaling activity

### Azure Deployment

Similar steps apply for Azure:
- Use **Azure SQL Database** instead of RDS
- Use **Azure Blob Storage** instead of S3
- Use **Azure Load Balancer** or **Application Gateway**
- Use **Azure Virtual Machine Scale Sets** for auto-scaling
- Use **Azure Monitor** for monitoring

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secret**: Use strong, random secrets in production
3. **Database**: Use SSL connections in production
4. **HTTPS**: Always use HTTPS in production
5. **IAM Roles**: Use IAM roles instead of access keys when possible
6. **Security Groups**: Follow principle of least privilege
7. **Rate Limiting**: Already implemented in backend
8. **Input Validation**: All inputs are validated

## 📊 Database Schema

The application uses the following main tables:
- `users` - User accounts and authentication
- `products` - Product catalog
- `cart_items` - Shopping cart items
- `orders` - Order information
- `order_items` - Order line items
- `inventory_logs` - Inventory tracking

## 🧪 Testing

### Backend API Testing

Test endpoints using curl or Postman:

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get products
curl http://localhost:5000/api/products
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with pagination, search, filter)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `GET /api/products/categories/list` - Get all categories

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order from cart
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (Admin only)
- `GET /api/orders/admin/all` - Get all orders (Admin only)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password

## 👥 Role Distribution (3-Person Team)

### Role 1: Cloud Infrastructure Engineer
- Set up and configure cloud VMs
- Configure VPC, networking, and load balancing
- Implement auto-scaling
- Network security configuration
- Infrastructure as Code (bonus)

### Role 2: Application Developer
- Develop frontend and backend code
- Integrate cloud storage services
- Implement user authentication
- API development and integration
- Application-level error handling

### Role 3: Security & Operations Engineer
- Design and implement security architecture
- Configure IAM roles and RBAC
- Set up monitoring, logging, and alerts
- Create and test backup policies
- Implement database security
- Cost monitoring and optimization

## 🐛 Troubleshooting

### Database Connection Issues
- Verify database credentials in `.env`
- Check if database is running
- Verify network connectivity
- Check security group rules (cloud)

### S3 Upload Issues
- Verify AWS credentials
- Check IAM permissions
- Verify bucket name and region
- Check CORS configuration

### Frontend API Connection Issues
- Verify `REACT_APP_API_URL` in frontend `.env`
- Check CORS configuration in backend
- Verify backend is running

## 📄 License

This project is created for educational purposes as part of a cloud computing assignment.

## 🤝 Contributing

This is an assignment project. For questions or issues, please contact the development team.

---

**Note**: This application is designed for cloud deployment. Make sure to configure all environment variables appropriately for your cloud environment and follow security best practices.

