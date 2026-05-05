# Production Deployment

This guide covers deploying Vigil from Docker Compose (development) to production-ready infrastructure.

## Development (Docker Compose)

```bash
cp .env.example .env
# Edit .env — set SECRET_KEY, optionally set payment keys
docker-compose up --build -d
```

Services:
- Backend API: `http://localhost:8000`
- Frontend: `http://localhost:5173`
- Redis: `localhost:6379`
- SQLite database: persisted in `backend_data` volume

## Staging (Single Server)

### Prerequisites
- Ubuntu 22.04 LTS (or equivalent)
- Docker + Docker Compose
- Domain name with DNS A record pointing to server
- SSL certificate (Let's Encrypt)

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt install docker-compose-plugin

# Clone repo
git clone https://github.com/SBTabanar/vigil-cloud-security.git /opt/vigil
cd /opt/vigil
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Security (generate with: openssl rand -hex 32)
SECRET_KEY=your-256-bit-secret-key-here

# Production URLs
FRONTEND_URL=https://vigil.yourdomain.com

# Database (switch to PostgreSQL)
DATABASE_URL=postgresql://vigil:password@db:5432/vigil

# Redis
REDIS_URL=redis://redis:6379/0

# Stripe (required for payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# PayMongo (optional)
PAYMONGO_SECRET_KEY=sk_live_...
PAYMONGO_WEBHOOK_SECRET=whsec_...
PAYMONGO_PUBLIC_KEY=pk_live_...

# SendGrid (optional)
SENDGRID_API_KEY=SG.your-key
FROM_EMAIL=alerts@yourdomain.com
FROM_NAME=Vigil Security
```

### 3. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: vigil
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: vigil
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vigil"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://vigil:${DB_PASSWORD}@db:5432/vigil
      - FRONTEND_URL=${FRONTEND_URL}
      - SECRET_KEY=${SECRET_KEY}
      - REDIS_URL=redis://redis:6379/0
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
      - STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
      - PAYMONGO_SECRET_KEY=${PAYMONGO_SECRET_KEY}
      - PAYMONGO_WEBHOOK_SECRET=${PAYMONGO_WEBHOOK_SECRET}
      - PAYMONGO_PUBLIC_KEY=${PAYMONGO_PUBLIC_KEY}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
      - FROM_EMAIL=${FROM_EMAIL}
      - FROM_NAME=${FROM_NAME}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped

  frontend:
    build: ./frontend
    environment:
      - VITE_API_URL=/api/v1
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

volumes:
  postgres_data:
```

### 4. Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:5173;
    }

    server {
        listen 80;
        server_name vigil.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name vigil.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

        # API routes
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /api/health {
            proxy_pass http://backend;
            access_log off;
        }

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

### 5. SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot

# Obtain certificate
sudo certbot certonly --standalone -d vigil.yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/vigil.yourdomain.com/fullchain.pem /opt/vigil/ssl/
sudo cp /etc/letsencrypt/live/vigil.yourdomain.com/privkey.pem /opt/vigil/ssl/

# Auto-renewal
sudo certbot renew --dry-run
```

### 6. Deploy

```bash
cd /opt/vigil
docker-compose -f docker-compose.prod.yml up -d
```

## Production (Kubernetes)

### Architecture

```
┌─────────────────────────────────────────┐
│              Ingress (nginx)             │
│         TLS termination + routing        │
└──────────────────┬──────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌────────┐   ┌────────┐   ┌────────────┐
│Frontend│   │Backend │   │  Celery    │
│ (3 pods)│   │(3 pods)│   │  Workers   │
└────────┘   └────────┘   └────────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌────────┐   ┌────────┐   ┌────────────┐
│PostgreSQL│  │  Redis  │   │  S3/MinIO  │
│(Stateful)│  │(Cache)  │   │  (Logs)    │
└────────┘   └────────┘   └────────────┘
```

### Helm Chart (Recommended)

Create `helm/vigil/`:

```
helm/vigil/
├── Chart.yaml
├── values.yaml
├── values-production.yaml
└── templates/
    ├── deployment-backend.yaml
    ├── deployment-frontend.yaml
    ├── deployment-celery.yaml
    ├── service.yaml
    ├── ingress.yaml
    ├── secret.yaml
    ├── configmap.yaml
    └── hpa.yaml
```

Example `values-production.yaml`:

```yaml
replicaCount:
  backend: 3
  frontend: 3
  celery: 2

image:
  backend: ghcr.io/sbtabanar/vigil-backend:v1.0.0
  frontend: ghcr.io/sbtabanar/vigil-frontend:v1.0.0

resources:
  backend:
    requests:
      memory: "512Mi"
      cpu: "250m"
    limits:
      memory: "1Gi"
      cpu: "1000m"
  frontend:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "500m"

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: vigil.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: vigil-tls
      hosts:
        - vigil.yourdomain.com

database:
  type: postgres
  host: postgres-cluster.default.svc.cluster.local
  name: vigil
  user: vigil
  passwordSecret: vigil-db-password

redis:
  host: redis-cluster.default.svc.cluster.local
```

### Deploy with Helm

```bash
# Add Helm repos
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add jetstack https://charts.jetstack.io
helm repo update

# Install ingress controller
helm install ingress-nginx ingress-nginx/ingress-nginx

# Install cert-manager
helm install cert-manager jetstack/cert-manager --set installCRDs=true

# Create ClusterIssuer for Let's Encrypt
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@yourdomain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

# Deploy Vigil
helm install vigil ./helm/vigil -f values-production.yaml
```

## Monitoring

### Prometheus + Grafana

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'vigil-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: /api/metrics
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

Key metrics to alert on:
- `vigil_scan_duration_seconds` > 300
- `vigil_auth_failed_total` rate > 5/min
- `postgres_connections_active` > 80% of max

### Health Checks

Vigil exposes:
- `GET /api/health` — Basic liveness probe
- `GET /api/health/ready` — Readiness (checks DB + Redis connectivity)

## Backup Strategy

### Database

```bash
# Automated daily backup
crontab -e
# Add: 0 2 * * * pg_dump postgresql://vigil:password@db:5432/vigil | gzip > /backups/vigil-$(date +\%Y\%m\%d).sql.gz

# Restore
zcat /backups/vigil-20250115.sql.gz | psql postgresql://vigil:password@db:5432/vigil
```

### Terraform State

Store remote state in S3 + DynamoDB:

```hcl
terraform {
  backend "s3" {
    bucket         = "vigil-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "vigil-terraform-locks"
  }
}
```

## Scaling Checklist

- [ ] PostgreSQL with read replicas
- [ ] Redis Cluster for caching + rate limiting
- [ ] Celery workers for async scan execution
- [ ] S3/MinIO for scan artifacts and logs
- [ ] CDN for static frontend assets
- [ ] Horizontal Pod Autoscaling (HPA)
- [ ] Database connection pooling (PgBouncer)
- [ ] Separate ML inference service
- [ ] Webhook queue with retry logic
- [ ] Log aggregation (ELK/Loki)
