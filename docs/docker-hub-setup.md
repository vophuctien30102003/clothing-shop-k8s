# Docker Hub Setup Guide

## Đã cấu hình

Project đã được cấu hình để sử dụng Docker Hub của bạn:
- **Backend**: `vophuctien01/clothing-backend`
- **Frontend**: `vophuctien01/clothing-k8s-frontend`

## Các file đã được cập nhật

✅ `infra/k8s/06-backend-deployment.yaml` - Backend image
✅ `infra/k8s/07-frontend-deployment.yaml` - Frontend image  
✅ `infra/k8s/job-db-migrate.yaml` - Migration job image
✅ `.github/workflows/ci-cd.yml` - CI/CD pipeline
✅ `README.md` - Build commands

## Bước tiếp theo

### 1. Login Docker Hub

```bash
docker login
# Nhập username: vophuctien01
# Nhập password: [password của bạn]
```

### 3. Build và Push Images

#### Backend
```bash
cd backend
docker build -t vophuctien01/clothing-backend:dev .
docker push vophuctien01/clothing-backend:dev
```

#### Frontend
```bash
cd frontend
docker build -t vophuctien01/clothing-k8s-frontend:dev .
docker push vophuctien01/clothing-k8s-frontend:dev
```

### 2. Kiểm tra Images trên Docker Hub

- Backend: https://hub.docker.com/r/vophuctien01/clothing-backend
- Frontend: https://hub.docker.com/r/vophuctien01/clothing-k8s-frontend

### 3. Deploy lên Kubernetes

Sau khi push images, deploy như bình thường:

```bash
kubectl apply -f infra/k8s/
```

Kubernetes sẽ tự động pull images từ Docker Hub.

## CI/CD với Docker Hub

### Cấu hình GitHub Secrets

1. Vào Repository → **Settings** → **Secrets and variables** → **Actions**
2. Thêm các secrets sau:

| Secret Name | Value | Mô tả |
|------------|-------|-------|
| `REGISTRY_PASSWORD` | `[your-dockerhub-password]` | Docker Hub password (hoặc Access Token) |
| `KUBECONFIG` | `[base64-encoded-kubeconfig]` | K8s cluster config |

**Lưu ý**: Username (`vophuctien01`) đã được cấu hình trong workflow file, không cần secret.

**Lưu ý về REGISTRY_PASSWORD:**
- Có thể dùng password hoặc **Access Token** (an toàn hơn)
- Tạo Access Token: Docker Hub → Account Settings → Security → New Access Token

### CI/CD sẽ tự động:

1. Build images khi push code
2. Push lên Docker Hub với tag = commit SHA
3. Update K8s deployment
4. Deploy tự động

## Troubleshooting

### Lỗi: "unauthorized: authentication required"

```bash
# Đảm bảo đã login
docker login

# Kiểm tra credentials
cat ~/.docker/config.json
```

### Lỗi: "pull access denied"

- Kiểm tra repository là **Public** hoặc đã cấu hình quyền truy cập
- Kiểm tra image name đúng: 
  - Backend: `vophuctien01/clothing-backend:dev`
  - Frontend: `vophuctien01/clothing-k8s-frontend:dev`

### Lỗi: "image pull backoff" trong K8s

```bash
# Kiểm tra pod logs
kubectl -n clothing-ns describe pod <pod-name>

# Kiểm tra image có tồn tại
docker pull vophuctien01/clothing-backend:dev
docker pull vophuctien01/clothing-k8s-frontend:dev
```

## Image Tagging Strategy

### Development
- `vophuctien01/clothing-backend:dev` - Latest dev version
- `vophuctien01/clothing-backend:dev-abc1234` - Specific commit
- `vophuctien01/clothing-k8s-frontend:dev` - Latest dev version
- `vophuctien01/clothing-k8s-frontend:dev-abc1234` - Specific commit

### Production
- `vophuctien01/clothing-backend:v1.0.0` - Version tag
- `vophuctien01/clothing-backend:latest` - Latest stable
- `vophuctien01/clothing-k8s-frontend:v1.0.0` - Version tag
- `vophuctien01/clothing-k8s-frontend:latest` - Latest stable

## Best Practices

1. **Không push password vào Git** - Dùng GitHub Secrets
2. **Dùng Access Token** thay vì password cho CI/CD
3. **Tag images** với version hoặc commit SHA
4. **Scan images** cho security vulnerabilities (Docker Hub tự động scan)
5. **Giới hạn rate limit** - Docker Hub free tier có giới hạn pulls

