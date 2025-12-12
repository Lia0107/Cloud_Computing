# AWS Security Groups - Complete Guide

## 🔒 What is a Security Group?

A **Security Group** acts as a **virtual firewall** for your AWS resources (EC2, RDS, ALB, etc.). It controls:
- **Inbound traffic** (incoming connections TO your resource)
- **Outbound traffic** (outgoing connections FROM your resource)

Think of it as a **bouncer at a club** - it decides who can come in and who can go out.

---

## 📊 Security Group Basics

### **Key Concepts:**

| Concept | Explanation |
|---------|-------------|
| **Stateful** | If you allow inbound traffic, the response is automatically allowed outbound (and vice versa) |
| **Default Deny** | By default, all inbound traffic is BLOCKED unless you explicitly allow it |
| **Allow Only** | You can only create ALLOW rules, not DENY rules |
| **Multiple Rules** | You can have multiple rules for different types of traffic |

### **How It Works:**

```
Internet User (1.2.3.4)
    │
    ▼
Security Group Rule Check
    │
    ├─ Rule 1: Allow HTTP (port 80) from 0.0.0.0/0 ✅
    ├─ Rule 2: Allow HTTPS (port 443) from 0.0.0.0/0 ✅
    ├─ Rule 3: Allow SSH (port 22) from My IP ✅
    └─ No matching rule for port 3389? ❌ BLOCKED
    │
    ▼
Your EC2 Instance (if allowed)
```

---

## 🎯 Inbound Rules Explained

**Inbound rules** control what traffic can **reach** your resource.

### **Rule Components:**

Each inbound rule has these fields:

| Field | What It Means | Example |
|-------|---------------|---------|
| **Type** | The protocol/service | HTTP, HTTPS, SSH, PostgreSQL, Custom TCP |
| **Protocol** | Network protocol | TCP, UDP, ICMP |
| **Port Range** | Which port(s) to allow | 80, 443, 22, 5432, 8000-9000 |
| **Source** | Where traffic can come FROM | IP address, CIDR block, or another security group |
| **Description** | Optional note | "Allow web traffic from internet" |

---

## 🌐 Understanding "Source" (Most Important!)

The **Source** field determines **WHO** can connect to your resource. This is the most critical part!

### **Source Types:**

#### **1. CIDR Block (IP Address Range)**

**Format:** `x.x.x.x/y`

**Examples:**

| CIDR | Meaning | Use Case |
|------|---------|----------|
| `0.0.0.0/0` | **Entire internet** (any IP) | Public web servers (HTTP/HTTPS) |
| `10.0.0.0/16` | Your entire VPC | Internal VPC communication |
| `10.0.3.0/24` | Specific subnet | Allow from one subnet only |
| `203.45.67.89/32` | Single specific IP | Your office/home IP for SSH |

**CIDR Notation Explained:**
```
10.0.0.0/16
│       │
│       └─ /16 = First 16 bits are fixed (10.0.x.x)
└─ Network address

10.0.0.0/24
│       │
│       └─ /24 = First 24 bits are fixed (10.0.0.x)
└─ Network address

/32 = Exact single IP (all 32 bits fixed)
/0 = Any IP (0 bits fixed)
```

#### **2. Security Group**

**Format:** `sg-xxxxxxxxx` or select by name

**Example:**
```
Source: ecommerce-app-sg
```

**What it means:**
- Allow traffic from **any resource** that has the `ecommerce-app-sg` security group attached
- Works across instances (great for Auto Scaling Groups!)
- More flexible than IP addresses

**Why use Security Groups as source:**
- ✅ **Dynamic** - Works even if IPs change
- ✅ **Auto Scaling** - New instances automatically get access
- ✅ **Cleaner** - Don't need to track IP addresses
- ✅ **Best Practice** - Industry standard

#### **3. Prefix List**

**Format:** `pl-xxxxxxxxx`

**What it is:**
- Managed list of IP ranges (e.g., AWS service IPs, S3 IPs)
- Less common for your use case

---

## 🏗️ Your E-Commerce Architecture Security Groups

Let me explain the security groups for your project:

### **1. ALB Security Group (`ecommerce-alb-sg`)**

**Purpose:** Allow internet users to access your website

**Inbound Rules:**

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| HTTP | TCP | 80 | 0.0.0.0/0 | Allow web traffic from internet |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Allow secure web traffic |

**Why `0.0.0.0/0`?**
- Your website needs to be accessible from **anywhere** on the internet
- Anyone can visit your e-commerce site

**Outbound Rules:**
- Default: Allow all outbound (to forward requests to EC2)

---

### **2. EC2 App Security Group (`ecommerce-app-sg`)**

**Purpose:** Allow traffic from ALB and SSH from bastion

**Inbound Rules:**

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| HTTP | TCP | 80 | ecommerce-alb-sg | Allow from load balancer |
| HTTPS | TCP | 443 | ecommerce-alb-sg | Allow secure traffic from ALB |
| Custom TCP | TCP | 5000 | ecommerce-alb-sg | Allow backend API from ALB |
| SSH | TCP | 22 | ecommerce-bastion-sg | Allow SSH from bastion host |

**Why use security groups as source?**
- ✅ Only ALB can send traffic to EC2 (not direct internet access)
- ✅ Only bastion host can SSH to EC2 (not direct SSH from internet)
- ✅ Works with Auto Scaling (new instances automatically allowed)

**Outbound Rules:**
- Default: Allow all outbound (to access RDS, S3, internet)

---

### **3. RDS Database Security Group (`ecommerce-db-sg`)**

**Purpose:** Allow database connections from EC2 only

**Inbound Rules:**

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| PostgreSQL | TCP | 5432 | ecommerce-app-sg | Allow database access from app servers |

**OR (temporary):**

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| PostgreSQL | TCP | 5432 | 10.0.0.0/16 | Allow from VPC (temporary) |

**Why security group source is better:**
- ✅ Only EC2 instances with app security group can access
- ✅ More secure than allowing entire VPC
- ✅ Principle of least privilege

**Outbound Rules:**
- Default: Allow all outbound

---

### **4. Bastion Host Security Group (`ecommerce-bastion-sg`)**

**Purpose:** Allow SSH access from your IP only

**Inbound Rules:**

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| SSH | TCP | 22 | YOUR-IP/32 | Allow SSH from your computer |

**Example:**
```
Source: 203.45.67.89/32 (your public IP)
```

**Why `/32`?**
- Only YOUR specific IP can SSH to bastion
- Most secure approach

**Outbound Rules:**
- Default: Allow all outbound (to SSH to EC2 instances)

---

## 🔐 Security Best Practices

### **Principle of Least Privilege:**

```
❌ BAD: Allow 0.0.0.0/0 for everything
✅ GOOD: Only allow what's necessary

❌ BAD: Allow entire VPC to RDS
✅ GOOD: Only allow EC2 app security group to RDS

❌ BAD: Allow SSH from 0.0.0.0/0
✅ GOOD: Allow SSH from bastion only, bastion from your IP only
```

### **Defense in Depth:**

**Multiple layers of security:**

```
Internet
    ↓
Layer 1: ALB Security Group (allow HTTP/HTTPS from internet)
    ↓
Layer 2: EC2 Security Group (allow only from ALB)
    ↓
Layer 3: RDS Security Group (allow only from EC2)
    ↓
Layer 4: Private Subnet (no direct internet access)
```

---

## 📝 Common Port Numbers

| Service | Port | Protocol | Type in AWS |
|---------|------|----------|-------------|
| HTTP | 80 | TCP | HTTP |
| HTTPS | 443 | TCP | HTTPS |
| SSH | 22 | TCP | SSH |
| PostgreSQL | 5432 | TCP | PostgreSQL |
| MySQL | 3306 | TCP | MYSQL/Aurora |
| MongoDB | 27017 | TCP | Custom TCP |
| Redis | 6379 | TCP | Custom TCP |
| Custom Backend | 5000 | TCP | Custom TCP |

---

## 🎓 Real-World Examples

### **Example 1: Public Web Server**

**Scenario:** EC2 instance hosting a website

**Inbound Rules:**
```
Type: HTTP, Port: 80, Source: 0.0.0.0/0
Type: HTTPS, Port: 443, Source: 0.0.0.0/0
Type: SSH, Port: 22, Source: YOUR-IP/32
```

---

### **Example 2: Private Database**

**Scenario:** RDS database for application

**Inbound Rules:**
```
Type: PostgreSQL, Port: 5432, Source: app-server-sg
```

**NOT:**
```
❌ Type: PostgreSQL, Port: 5432, Source: 0.0.0.0/0
```

---

### **Example 3: Load Balancer → App Server**

**ALB Security Group:**
```
Inbound:
  HTTP (80) from 0.0.0.0/0
  HTTPS (443) from 0.0.0.0/0
```

**App Server Security Group:**
```
Inbound:
  HTTP (80) from alb-sg
  HTTPS (443) from alb-sg
```

**Why this works:**
- Internet → ALB ✅ (allowed by ALB SG)
- ALB → App Server ✅ (allowed by App SG, source is ALB SG)
- Internet → App Server ❌ (blocked, no direct rule)

---

## 🔄 Stateful Nature Explained

**Stateful means:**
- If you allow **inbound** traffic, the **response** is automatically allowed outbound
- You don't need to create outbound rules for responses

**Example:**

```
Inbound Rule: Allow HTTP (port 80) from 0.0.0.0/0

User Request:
  Internet (1.2.3.4) → Your Server (port 80) ✅ Allowed by inbound rule

Server Response:
  Your Server → Internet (1.2.3.4) ✅ Automatically allowed (stateful)
```

**You DON'T need:**
```
❌ Outbound Rule: Allow to 1.2.3.4 (not needed, automatic)
```

---

## 🚨 Common Mistakes

### **Mistake 1: Too Permissive**
```
❌ BAD:
Type: All Traffic, Source: 0.0.0.0/0

✅ GOOD:
Type: HTTP, Source: 0.0.0.0/0
Type: HTTPS, Source: 0.0.0.0/0
```

### **Mistake 2: Wrong Source**
```
❌ BAD (RDS):
Source: 0.0.0.0/0 (entire internet can access database!)

✅ GOOD (RDS):
Source: ecommerce-app-sg (only app servers)
```

### **Mistake 3: Forgetting /32**
```
❌ BAD (SSH):
Source: 203.45.67.89 (invalid, needs CIDR notation)

✅ GOOD (SSH):
Source: 203.45.67.89/32 (single IP)
```

### **Mistake 4: Using IP Instead of Security Group**
```
❌ OKAY (but not ideal):
Source: 10.0.3.5/32 (specific EC2 IP)

✅ BETTER:
Source: ecommerce-app-sg (works with Auto Scaling)
```

---

## 📊 Your Project Security Group Summary

| Security Group | Protects | Allows Inbound From | Purpose |
|----------------|----------|---------------------|---------|
| `ecommerce-alb-sg` | ALB | Internet (0.0.0.0/0) | Public web access |
| `ecommerce-app-sg` | EC2 | ALB SG, Bastion SG | App servers |
| `ecommerce-db-sg` | RDS | App SG | Database |
| `ecommerce-bastion-sg` | Bastion | Your IP | SSH gateway |

**Traffic Flow:**
```
Internet → ALB (via ecommerce-alb-sg)
    ↓
ALB → EC2 (via ecommerce-app-sg, source: alb-sg)
    ↓
EC2 → RDS (via ecommerce-db-sg, source: app-sg)

Admin → Bastion (via ecommerce-bastion-sg, source: your IP)
    ↓
Bastion → EC2 (via ecommerce-app-sg, source: bastion-sg)
```

---

## ✅ Quick Reference

### **For Your Screenshot (EC2 Launch):**

**Create security group:** `ecommerce-app-sg`

**Inbound Rules to Add:**

```
Rule 1:
  Type: HTTP
  Port: 80
  Source: ecommerce-alb-sg (if ALB created) OR 0.0.0.0/0 (temporary)
  Description: Allow from load balancer

Rule 2:
  Type: Custom TCP
  Port: 5000
  Source: ecommerce-alb-sg (if ALB created) OR 0.0.0.0/0 (temporary)
  Description: Allow backend API

Rule 3:
  Type: SSH
  Port: 22
  Source: ecommerce-bastion-sg (if bastion created) OR YOUR-IP/32
  Description: Allow SSH access
```

---

**Security groups are your first line of defense!** Master them and your AWS infrastructure will be secure! 🔒
