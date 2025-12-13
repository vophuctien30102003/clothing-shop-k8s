# Clothing Shop - Deployment Guide

## Prerequisites

- Kubernetes cluster (v1.24+)
- `kubectl` configured và có quyền admin
- Docker (để build images locally - optional)
- Container registry access (để push images)

## Quick Start

### 1. Build Docker Images

#### Backend Image

```bash
cd backend
docker build -t registry.example.com/clothing/backend:dev .
# Hoặc với tag từ git commit
docker build -t registry.example.com/clothing/backend:dev-$(git rev-parse --short HEAD) .
docker push registry.example.com/clothing/backend:dev
```

#### Frontend Image

```bash
cd frontend
docker build -t vophuctien01/clothing-k8s-frontend:dev .
# Hoặc với tag từ git commit
docker build -t vophuctien01/clothing-k8s-frontend:dev-$(git rev-parse --short HEAD) .
docker push vophuctien01/clothing-k8s-frontend:dev
```

**⚠️ Lưu ý quan trọng về Domain/Registry:**

1. **`registry.example.com`** - KHÔNG phải domain cho dự án
   - Đây là **Container Registry** (nơi lưu trữ Docker images)
   - Cần thay bằng registry thực tế:
     - **Docker Hub**: `docker.io/yourusername/clothing-backend` hoặc `yourusername/clothing-backend`
     - **Google Container Registry (GCR)**: `gcr.io/your-project-id/clothing-backend`
     - **AWS ECR**: `123456789.dkr.ecr.region.amazonaws.com/clothing-backend`
     - **Azure Container Registry**: `yourregistry.azurecr.io/clothing-backend`
     - **GitHub Container Registry**: `ghcr.io/yourusername/clothing-backend`

2. **`shop.example.com`** - Đây mới là domain cho người dùng truy cập website
   - Được cấu hình trong `infra/k8s/09-ingress.yaml`
   - Người dùng truy cập: `http://shop.example.com` hoặc `https://shop.example.com`
   - Cần thay bằng domain thực tế của bạn (ví dụ: `shop.yourdomain.com`)

**Tóm lại:**
- `registry.example.com` = Nơi lưu Docker images (chỉ dùng nội bộ, không phải domain công khai)
- `shop.example.com` = Domain website (người dùng truy cập)

### 2. Update Image Tags trong K8s Manifests

Trước khi deploy, cập nhật image tags trong:
- `infra/k8s/06-backend-deployment.yaml`
- `infra/k8s/07-frontend-deployment.yaml`

```yaml
# Thay đổi từ:
image: vophuctien01/clothing-backend:dev
# Thành:
image: vophuctien01/clothing-backend:dev-abc1234

# Frontend:
image: vophuctien01/clothing-k8s-frontend:dev
# Thành:
image: vophuctien01/clothing-k8s-frontend:dev-abc1234
```

### 3. Deploy to Kubernetes

#### Option A: Deploy tất cả cùng lúc

```bash
kubectl apply -f infra/k8s/
```

#### Option B: Deploy theo thứ tự (recommended)

```bash
# 1. Create namespace
kubectl apply -f infra/k8s/00-namespace.yaml

# 2. Create secrets
kubectl apply -f infra/k8s/01-secrets.yaml

# 3. Create storage (PV/PVC)
kubectl apply -f infra/k8s/02-mysql-pv-pvc.yaml
kubectl apply -f infra/k8s/04-minio-pv-pvc.yaml

# 4. Create database init config
kubectl apply -f infra/k8s/08-configmap-db-init.yaml

# 5. Deploy MySQL
kubectl apply -f infra/k8s/03-mysql-deployment.yaml

# 6. Wait for MySQL to be ready
kubectl -n clothing-ns wait --for=condition=ready pod -l app=mysql --timeout=300s

# 7. Deploy MinIO
kubectl apply -f infra/k8s/05-minio-deployment.yaml

# 8. Wait for MinIO to be ready
kubectl -n clothing-ns wait --for=condition=ready pod -l app=minio --timeout=300s

# 9. Deploy backend
kubectl apply -f infra/k8s/06-backend-deployment.yaml

# 10. Deploy frontend
kubectl apply -f infra/k8s/07-frontend-deployment.yaml

# 11. (Optional) Deploy Ingress
kubectl apply -f infra/k8s/09-ingress.yaml
```

### 4. Verify Deployment

#### Check Pods Status

```bash
kubectl -n clothing-ns get pods
```

Tất cả pods phải có status `Running` và `READY` là `1/1` hoặc `2/2`.

#### Check Services

```bash
kubectl -n clothing-ns get svc
```

#### Check Persistent Volumes

```bash
kubectl -n clothing-ns get pv,pvc
```

### 5. Access Application

#### Via NodePort (Development)

1. **Frontend**: `http://<node-ip>:30082`
2. **Backend API**: `http://<node-ip>:30081/api/health`

Để lấy node IP:
```bash
kubectl get nodes -o wide
```

#### Via Ingress (Production)

1. Cập nhật `/etc/hosts` hoặc DNS:
   ```
   <ingress-ip> shop.example.com
   ```

2. Truy cập: `http://shop.example.com`

### 6. Test Health Endpoints

```bash
# Backend health
curl http://<node-ip>:30081/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z","service":"clothing-shop-backend","version":"1.0.0"}

# Frontend
curl http://<node-ip>:30082
```

## Database Migration

### Run Migration Job

```bash
# Update image tag in job-db-migrate.yaml first
kubectl apply -f infra/k8s/job-db-migrate.yaml

# Check job status
kubectl -n clothing-ns get jobs

# View logs
kubectl -n clothing-ns logs job/db-migrate
```

## Troubleshooting

### Pods không start

```bash
# Check pod status
kubectl -n clothing-ns describe pod <pod-name>

# Check logs
kubectl -n clothing-ns logs <pod-name>

# Check events
kubectl -n clothing-ns get events --sort-by='.lastTimestamp'
```

### Database Connection Issues

```bash
# Check MySQL pod
kubectl -n clothing-ns logs deploy/mysql

# Test connection từ backend pod
kubectl -n clothing-ns exec -it deploy/backend -- sh
# Inside pod:
# mysql -h mysql-svc -u clothing_app -p
```

### Image Pull Errors

```bash
# Check image pull secrets
kubectl -n clothing-ns get secrets

# Verify image exists
docker pull registry.example.com/clothing/backend:dev
```

### Storage Issues

```bash
# Check PV/PVC status
kubectl -n clothing-ns get pv,pvc

# Check PV details
kubectl describe pv mysql-pv

# Verify hostPath exists và có quyền
sudo ls -la /mnt/data/mysql
sudo ls -la /mnt/data/minio
```

### Service DNS Issues

```bash
# Test DNS resolution từ pod
kubectl -n clothing-ns exec -it deploy/backend -- nslookup mysql-svc

# Test service connectivity
kubectl -n clothing-ns exec -it deploy/backend -- wget -O- http://mysql-svc:3306
```

## Configuration

### Update Secrets

**⚠️ Warning**: Không nên hardcode secrets trong YAML cho production.

```bash
# Update secret
kubectl -n clothing-ns create secret generic clothing-secrets \
  --from-literal=mysql-root-password='NewPassword123' \
  --from-literal=mysql-app-password='NewAppPassword123' \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart pods để load new secrets
kubectl -n clothing-ns rollout restart deploy/backend
```

### Scale Deployments

```bash
# Scale backend
kubectl -n clothing-ns scale deploy/backend --replicas=3

# Scale frontend
kubectl -n clothing-ns scale deploy/frontend --replicas=3
```

### Update Application

```bash
# 1. Build new image với tag mới
docker build -t registry.example.com/clothing/backend:v1.1.0 ./backend
docker push registry.example.com/clothing/backend:v1.1.0

# 2. Update deployment
kubectl -n clothing-ns set image deploy/backend backend=registry.example.com/clothing/backend:v1.1.0

# 3. Watch rollout
kubectl -n clothing-ns rollout status deploy/backend

# 4. Rollback nếu cần
kubectl -n clothing-ns rollout undo deploy/backend
```

## Cleanup

### Delete All Resources

```bash
# Delete all resources trong namespace
kubectl delete namespace clothing-ns

# Hoặc delete từng resource
kubectl delete -f infra/k8s/
```

### Cleanup Persistent Data

```bash
# ⚠️ Warning: This will delete all data!
sudo rm -rf /mnt/data/mysql
sudo rm -rf /mnt/data/minio
```

## Production Checklist

- [ ] Update image tags với version tags (không dùng `:dev`)
- [ ] Configure proper secrets management (Vault/External Secrets)
- [ ] Setup monitoring (Prometheus/Grafana)
- [ ] Configure logging aggregation
- [ ] Setup backup strategy cho MySQL và MinIO
- [ ] Configure Ingress với TLS (cert-manager)
- [ ] Setup HPA (Horizontal Pod Autoscaler)
- [ ] Configure resource limits và requests
- [ ] Setup network policies
- [ ] Configure pod disruption budgets
- [ ] Setup CI/CD pipeline
- [ ] Document runbooks và procedures
- [ ] Setup alerting rules
- [ ] Test disaster recovery procedures

## Environment-Specific Configs

### Development

- Use NodePort services
- Single replica
- Minimal resource limits
- Debug logging enabled

### Staging

- Use Ingress
- 2 replicas
- Production-like resource limits
- Production logging

### Production

- Use Ingress với TLS
- 3+ replicas
- Strict resource limits
- Production logging và monitoring
- Backup automation
- Disaster recovery plan

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [MySQL on Kubernetes](https://kubernetes.io/docs/tasks/run-application/run-replicated-stateful-application/)
- [MinIO Documentation](https://min.io/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

