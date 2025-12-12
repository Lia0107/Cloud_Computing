# VPC Network Architecture - AWS Academy Deployment

## Network Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          VPC: ecommerce-vpc (10.0.0.0/16)                   │
│                                                                              │
│  ┌────────────────────────────────┐  ┌────────────────────────────────┐    │
│  │  Availability Zone 1a          │  │  Availability Zone 1b          │    │
│  │  (us-east-1a)                  │  │  (us-east-1b)                  │    │
│  │                                │  │                                │    │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────┐  │    │
│  │  │ Public Subnet 1          │  │  │  │ Public Subnet 2          │  │    │
│  │  │ 10.0.1.0/24              │  │  │  │ 10.0.2.0/24              │  │    │
│  │  │                          │  │  │  │                          │  │    │
│  │  │  ┌────────────────┐      │  │  │  │  ┌────────────────┐      │  │    │
│  │  │  │ Bastion Host   │      │  │  │  │  │                │      │  │    │
│  │  │  │ (SSH Access)   │      │  │  │  │  │                │      │  │    │
│  │  │  └────────────────┘      │  │  │  │  └────────────────┘      │  │    │
│  │  │                          │  │  │  │                          │  │    │
│  │  │  ┌────────────────┐      │  │  │  │                          │  │    │
│  │  │  │ NAT Gateway    │      │  │  │  │                          │  │    │
│  │  │  │ (+ Elastic IP) │      │  │  │  │                          │  │    │
│  │  │  └────────────────┘      │  │  │  │                          │  │    │
│  │  │                          │  │  │  │                          │  │    │
│  │  │  ┌──────────────────────────────────────────────────┐        │  │    │
│  │  │  │   Application Load Balancer (ALB)                │        │  │    │
│  │  │  │   Spans both public subnets                      │        │  │    │
│  │  │  │   Internet-facing, distributes traffic           │        │  │    │
│  │  │  └──────────────────────────────────────────────────┘        │  │    │
│  │  └──────────────────────────┘  │  │  └──────────────────────────┘  │    │
│  │              │                  │  │              │                  │    │
│  │              │ IGW              │  │              │ IGW              │    │
│  │              ▼                  │  │              ▼                  │    │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────┐  │    │
│  │  │ Private Subnet 1         │  │  │  │ Private Subnet 2         │  │    │
│  │  │ 10.0.3.0/24              │  │  │  │ 10.0.4.0/24              │  │    │
│  │  │                          │  │  │  │                          │  │    │
│  │  │  ┌────────────────┐      │  │  │  │  ┌────────────────┐      │  │    │
│  │  │  │ EC2 Instance 1 │      │  │  │  │  │ EC2 Instance 2 │      │  │    │
│  │  │  │ (App Server)   │      │  │  │  │  │ (App Server)   │      │  │    │
│  │  │  │ - Frontend     │      │  │  │  │  │ - Frontend     │      │  │    │
│  │  │  │ - Backend API  │      │  │  │  │  │ - Backend API  │      │  │    │
│  │  │  └────────────────┘      │  │  │  │  └────────────────┘      │  │    │
│  │  │          │               │  │  │  │          │               │  │    │
│  │  │          │ NAT           │  │  │  │          │ NAT           │  │    │
│  │  │          ▼               │  │  │  │          ▼               │  │    │
│  │  │  ┌────────────────┐      │  │  │  │  ┌────────────────┐      │  │    │
│  │  │  │ RDS PostgreSQL │      │  │  │  │  │ RDS Standby    │      │  │    │
│  │  │  │ (Primary)      │◄─────┼──┼──┼──┼─►│ (Multi-AZ)     │      │  │    │
│  │  │  └────────────────┘      │  │  │  │  └────────────────┘      │  │    │
│  │  └──────────────────────────┘  │  │  └──────────────────────────┘  │    │
│  └────────────────────────────────┘  └────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                        Internet Gateway (IGW)                       │    │
│  │                  Attached to VPC for internet access                │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                                  Internet
                                      │
                                      ▼
                              ┌───────────────┐
                              │   S3 Bucket   │
                              │ (Product Imgs)│
                              └───────────────┘
```

## Traffic Flow

### User Request Flow
```
Internet User
    │
    ▼
Internet Gateway (IGW)
    │
    ▼
Application Load Balancer (ALB)
    │ (in public subnets)
    ▼
EC2 Instances (in private subnets)
    │
    ├─► RDS Database (in private subnet)
    │
    └─► S3 Bucket (via NAT Gateway)
```

### SSH Access Flow
```
Administrator
    │
    ▼
Bastion Host (public subnet)
    │
    ▼
EC2 App Servers (private subnet)
```

### Outbound Internet Access (from private subnet)
```
EC2 Instance (private subnet)
    │
    ▼
NAT Gateway (public subnet)
    │
    ▼
Internet Gateway
    │
    ▼
Internet (for updates, S3 access, etc.)
```

## Route Tables

### Public Route Table
| Destination | Target | Purpose |
|-------------|--------|---------|
| 10.0.0.0/16 | local | VPC internal traffic |
| 0.0.0.0/0 | igw-xxx | Internet access via IGW |

**Associated Subnets:**
- ecommerce-public-subnet-1a (10.0.1.0/24)
- ecommerce-public-subnet-1b (10.0.2.0/24)

### Private Route Table
| Destination | Target | Purpose |
|-------------|--------|---------|
| 10.0.0.0/16 | local | VPC internal traffic |
| 0.0.0.0/0 | nat-xxx | Internet access via NAT Gateway |

**Associated Subnets:**
- ecommerce-private-subnet-1a (10.0.3.0/24)
- ecommerce-private-subnet-1b (10.0.4.0/24)

## Security Groups

### ALB Security Group (ecommerce-alb-sg)
**Inbound Rules:**
| Type | Protocol | Port | Source | Purpose |
|------|----------|------|--------|---------|
| HTTP | TCP | 80 | 0.0.0.0/0 | Public web access |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Secure web access |

**Outbound Rules:**
| Type | Protocol | Port | Destination | Purpose |
|------|----------|------|-------------|---------|
| All | All | All | 0.0.0.0/0 | Allow all outbound |

### EC2 App Security Group (ecommerce-app-sg)
**Inbound Rules:**
| Type | Protocol | Port | Source | Purpose |
|------|----------|------|--------|---------|
| SSH | TCP | 22 | ecommerce-bastion-sg | SSH from bastion |
| HTTP | TCP | 80 | ecommerce-alb-sg | Web traffic from ALB |
| HTTPS | TCP | 443 | ecommerce-alb-sg | Secure traffic from ALB |
| Custom | TCP | 5000 | ecommerce-alb-sg | Backend API from ALB |

**Outbound Rules:**
| Type | Protocol | Port | Destination | Purpose |
|------|----------|------|-------------|---------|
| All | All | All | 0.0.0.0/0 | Allow all outbound |

### RDS Security Group (ecommerce-db-sg)
**Inbound Rules:**
| Type | Protocol | Port | Source | Purpose |
|------|----------|------|--------|---------|
| PostgreSQL | TCP | 5432 | ecommerce-app-sg | Database access from app |

**Outbound Rules:**
| Type | Protocol | Port | Destination | Purpose |
|------|----------|------|-------------|---------|
| All | All | All | 0.0.0.0/0 | Allow all outbound |

### Bastion Security Group (ecommerce-bastion-sg)
**Inbound Rules:**
| Type | Protocol | Port | Source | Purpose |
|------|----------|------|--------|---------|
| SSH | TCP | 22 | Your IP | SSH access for admin |

**Outbound Rules:**
| Type | Protocol | Port | Destination | Purpose |
|------|----------|------|-------------|---------|
| All | All | All | 0.0.0.0/0 | Allow all outbound |

## High Availability Features

### Multi-AZ Deployment
1. **Application Layer:**
   - EC2 instances distributed across 2 AZs via Auto Scaling Group
   - ALB spans both AZs for traffic distribution
   - If one AZ fails, traffic automatically routes to healthy AZ

2. **Database Layer:**
   - RDS Multi-AZ deployment (optional but recommended)
   - Automatic failover to standby in different AZ
   - Synchronous replication between primary and standby

3. **Network Layer:**
   - Public subnets in both AZs for ALB redundancy
   - Private subnets in both AZs for app server redundancy
   - NAT Gateway in one AZ (can add second for full redundancy)

### Auto Scaling
- **Min instances:** 1 (cost optimization)
- **Desired instances:** 2 (one per AZ)
- **Max instances:** 4 (handle traffic spikes)
- **Scaling trigger:** CPU > 70%

## IP Address Allocation

| Subnet | CIDR Block | Available IPs | Usage |
|--------|------------|---------------|-------|
| VPC | 10.0.0.0/16 | 65,536 | Entire network |
| Public Subnet 1a | 10.0.1.0/24 | 256 | ALB, NAT, Bastion |
| Public Subnet 1b | 10.0.2.0/24 | 256 | ALB redundancy |
| Private Subnet 1a | 10.0.3.0/24 | 256 | EC2 app servers, RDS |
| Private Subnet 1b | 10.0.4.0/24 | 256 | EC2 app servers, RDS standby |

## Cost Considerations

### NAT Gateway Costs
- **Hourly charge:** ~$0.045/hour (~$32/month)
- **Data processing:** $0.045/GB
- **Alternative:** NAT Instance (cheaper but less reliable)

### Elastic IP Costs
- **Free** when attached to running instance
- **$0.005/hour** when not attached (idle)

### Multi-AZ RDS Costs
- **~2x** the cost of single-AZ deployment
- Worth it for production, optional for development

## Best Practices Implemented

✅ **Network Isolation:** Public and private subnets separate concerns  
✅ **Defense in Depth:** Multiple security group layers  
✅ **High Availability:** Multi-AZ deployment across 2 AZs  
✅ **Scalability:** Auto Scaling Group for dynamic capacity  
✅ **Security:** Bastion host for controlled SSH access  
✅ **Fault Tolerance:** Load balancer distributes traffic  
✅ **Internet Access:** NAT Gateway for private subnet outbound  
✅ **Monitoring:** CloudWatch integration for all resources  

## Deployment Order

1. ✅ VPC and Subnets
2. ✅ Internet Gateway
3. ✅ NAT Gateway (requires Elastic IP)
4. ✅ Route Tables
5. ✅ Security Groups
6. ✅ S3 Bucket
7. ✅ RDS Database (in private subnet)
8. ✅ Bastion Host (in public subnet)
9. ✅ EC2 App Servers (in private subnet)
10. ✅ Application Load Balancer (in public subnets)
11. ✅ Auto Scaling Group
12. ✅ CloudWatch Monitoring

---

This architecture meets all AWS Well-Architected Framework pillars:
- **Operational Excellence:** Automated scaling and monitoring
- **Security:** Network isolation, security groups, private subnets
- **Reliability:** Multi-AZ, auto-scaling, load balancing
- **Performance Efficiency:** Right-sized instances, distributed load
- **Cost Optimization:** Auto-scaling, appropriate instance types
