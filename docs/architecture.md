# Clothing Shop - Architecture Documentation

## Overview

Clothing Shop là một ứng dụng web bán hàng áo quần được triển khai trên Kubernetes, sử dụng kiến trúc microservices với các thành phần chính:

- **Backend**: Node.js Express API
- **Frontend**: React SPA (Vite) served by Nginx
- **Database**: MySQL 8.0 với persistent storage
- **Object Storage**: MinIO (S3-compatible) cho product images
- **Orchestration**: Kubernetes với namespace `clothing-ns`

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Kubernetes Cluster                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Namespace: clothing-ns                   │  │
│  │                                                         │  │
│  │  ┌──────────────┐    ┌──────────────┐                │  │
│  │  │   Frontend   │───▶│   Backend    │                │  │
│  │  │  (Nginx)     │    │  (Express)   │                │  │
│  │  │  Port: 80    │    │  Port: 3000  │                │  │
│  │  └──────────────┘    └──────┬───────┘                │  │
│  │                             │                          │  │
│  │                    ┌────────┴────────┐                 │  │
│  │                    │                 │                 │  │
│  │            ┌───────▼──────┐  ┌──────▼──────┐          │  │
│  │            │    MySQL     │  │    MinIO    │          │  │
│  │            │   Port: 3306 │  │  Port: 9000 │          │  │
│  │            └───────┬──────┘  └─────────────┘          │  │
│  │                    │                                   │  │
│  │            ┌───────▼──────┐                           │  │
│  │            │   PVC (10Gi) │                           │  │
│  │            │   MySQL Data │                           │  │
│  │            └──────────────┘                           │  │
│  │                                                         │  │
│  │            ┌──────────────┐                           │  │
│  │            │   PVC (20Gi) │                           │  │
│  │            │  MinIO Data  │                           │  │
│  │            └──────────────┘                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Ingress Controller                       │  │
│  │         (Optional - shop.example.com)                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Frontend (React + Vite + Nginx)

- **Technology**: React 18, Vite, Nginx
- **Build**: Multi-stage Docker build
- **Port**: 80 (container), 30082 (NodePort)
- **Replicas**: 2
- **Storage**: Stateless

**Features**:
- SPA routing với React Router
- API proxy via Nginx (optional)
- Health check endpoint

### 2. Backend (Node.js Express)

- **Technology**: Node.js 18, Express.js
- **Port**: 3000 (container), 30081 (NodePort)
- **Replicas**: 2
- **Storage**: Stateless

**API Endpoints**:
- `GET /api/health` - Health check
- `GET /api/liveness` - Liveness probe
- `/api/users/*` - User management
- `/api/products/*` - Product CRUD (including import/export)
- `/api/reports/*` - Reports & statistics (including charts/graphs)

**Environment Variables**:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`
- `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`

### 3. MySQL Database

- **Version**: MySQL 8.0
- **Port**: 3306
- **Replicas**: 1 (stateful)
- **Storage**: 10Gi PVC (hostPath)
- **Character Set**: utf8mb4_unicode_ci

**Database Schema**:
- `users` - User accounts với roles
- `products` - Product catalog
- `orders` - Order records
- `order_items` - Order line items

**Security**:
- Root password từ Secret
- Application user `clothing_app` với limited privileges
- Init script tự động tạo schema và user

### 4. MinIO Object Storage

- **Version**: Latest
- **Ports**: 9000 (API), 9001 (Console)
- **Replicas**: 1
- **Storage**: 20Gi PVC (hostPath)
- **Bucket**: `clothing-images` (auto-created via Job)

**Usage**:
- Store product images
- S3-compatible API
- Public read access cho images

## Networking

### Services

- `frontend-svc` (ClusterIP:80) + `frontend-nodeport` (NodePort:30082)
- `backend-svc` (ClusterIP:3000) + `backend-nodeport` (NodePort:30081)
- `mysql-svc` (ClusterIP:3306)
- `minio-svc` (ClusterIP:9000, 9001)

### Ingress (Optional)

- Host: `shop.example.com`
- Path `/` → Frontend
- Path `/api` → Backend
- TLS: Supported (cert-manager)

## Storage

### Persistent Volumes

1. **MySQL PV/PVC**:
   - Size: 10Gi
   - Access Mode: ReadWriteOnce
   - Path: `/mnt/data/mysql` (hostPath)

2. **MinIO PV/PVC**:
   - Size: 20Gi
   - Access Mode: ReadWriteOnce
   - Path: `/mnt/data/minio` (hostPath)

**Note**: Trong production, nên dùng cloud storage (EBS, Azure Disk, GCE Persistent Disk) thay vì hostPath.

## Security

### Secrets Management

- **Secret**: `clothing-secrets` (namespace: clothing-ns)
- **Contents**:
  - MySQL root password
  - MySQL app user credentials
  - MinIO access keys

**Best Practices**:
- Production: Sử dụng External Secrets Operator hoặc Vault
- Không commit secrets vào Git
- Rotate credentials định kỳ

### Network Policies (Optional)

Có thể thêm NetworkPolicy để:
- Chỉ backend pods mới được kết nối MySQL
- Chỉ backend pods mới được kết nối MinIO
- Frontend chỉ được kết nối backend

## Monitoring & Observability

### Health Checks

- **Liveness Probe**: Kiểm tra pod có đang chạy không
- **Readiness Probe**: Kiểm tra pod sẵn sàng nhận traffic

### Logging

- Applications log ra stdout/stderr
- Cluster logging solution (Fluentd/ELK) collect logs

### Metrics (Future)

- Expose `/metrics` endpoint (Prometheus format)
- Grafana dashboards
- Alerting rules

## Scaling

### Horizontal Pod Autoscaling (HPA)

Có thể cấu hình HPA cho:
- Backend: Scale dựa trên CPU/memory
- Frontend: Scale dựa trên request rate

### Database Scaling

- MySQL: Single replica (có thể thêm read replicas)
- MinIO: Single replica (có thể scale với distributed mode)

## Backup & Recovery

### MySQL Backup

- **Strategy**: Logical backup (mysqldump)
- **Schedule**: CronJob chạy định kỳ
- **Storage**: Backup to MinIO hoặc external storage

### MinIO Backup

- **Strategy**: Replication hoặc backup bucket
- **Schedule**: Periodic sync

## CI/CD Pipeline

### Build Process

1. Build Docker images (backend, frontend)
2. Run tests
3. Push to container registry
4. Update K8s manifests với image tags
5. Deploy to cluster (kubectl apply hoặc Helm)

### Deployment Strategy

- **Development**: Manual deploy
- **Staging**: Auto-deploy on merge to `develop`
- **Production**: Manual approval + blue-green deployment

## Development Workflow

1. **Local Development**:
   - Backend: `npm run dev` (nodemon)
   - Frontend: `npm run dev` (Vite dev server)
   - DB: Local MySQL hoặc Docker Compose

2. **Testing**:
   - Unit tests
   - Integration tests
   - E2E tests

3. **Build & Deploy**:
   - CI/CD pipeline tự động build và deploy

## Troubleshooting

### Common Issues

1. **Pods không start**:
   - Check logs: `kubectl -n clothing-ns logs <pod-name>`
   - Check events: `kubectl -n clothing-ns get events`

2. **Database connection failed**:
   - Verify MySQL pod running
   - Check service DNS: `mysql-svc.clothing-ns.svc.cluster.local`
   - Verify credentials trong Secret

3. **Image pull failed**:
   - Check image registry credentials
   - Verify image tag exists

4. **Storage issues**:
   - Check PV/PVC status
   - Verify hostPath permissions

## Future Enhancements

- [ ] Redis cache layer
- [ ] Message queue (RabbitMQ/Kafka) cho async tasks
- [ ] Elasticsearch cho search
- [ ] CDN cho static assets
- [ ] Service mesh (Istio/Linkerd)
- [ ] Multi-region deployment
- [ ] Disaster recovery plan

