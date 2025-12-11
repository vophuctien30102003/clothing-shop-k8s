# Clothing Shop - E-commerce Platform on Kubernetes

Website bán hàng áo quần được triển khai trên Kubernetes với kiến trúc microservices.

## 🏗️ Architecture

- **Backend**: Node.js Express API (Port 3000)
- **Frontend**: React SPA với Vite, served by Nginx (Port 80)
- **Database**: MySQL 8.0 với persistent storage
- **Object Storage**: MinIO (S3-compatible) cho product images
- **Orchestration**: Kubernetes namespace `clothing-ns`

## 📁 Project Structure

```
clothing-shop/
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── controllers/ # Business logic
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   └── app.js       # Express app entry point
│   ├── package.json
│   └── Dockerfile
├── frontend/             # React SPA
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── infra/
│   └── k8s/             # Kubernetes manifests
│       ├── 00-namespace.yaml
│       ├── 01-secrets.yaml
│       ├── 02-mysql-pv-pvc.yaml
│       ├── 03-mysql-deployment.yaml
│       ├── 04-minio-pv-pvc.yaml
│       ├── 05-minio-deployment.yaml
│       ├── 06-backend-deployment.yaml
│       ├── 07-frontend-deployment.yaml
│       ├── 08-configmap-db-init.yaml
│       ├── 09-ingress.yaml
│       └── job-db-migrate.yaml
├── docs/
│   ├── architecture.md  # Architecture documentation
│   └── deploy-guide.md  # Deployment guide
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Kubernetes cluster (v1.24+)
- `kubectl` configured
- Docker (for building images)
- Container registry access

### Local Development

#### Backend

```bash
cd backend
npm install
npm run dev
```

Backend sẽ chạy tại `http://localhost:3000`

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

### Build Docker Images

```bash
# Backend
cd backend
docker build -t registry.example.com/clothing/backend:dev .

# Frontend
cd frontend
docker build -t registry.example.com/clothing/frontend:dev .
```

### Deploy to Kubernetes

```bash
# Update image tags in deployment files first
# Then apply all manifests
kubectl apply -f infra/k8s/
```

Xem chi tiết trong [Deployment Guide](docs/deploy-guide.md)

## 📚 Documentation

- [Architecture Documentation](docs/architecture.md) - Kiến trúc hệ thống
- [Deployment Guide](docs/deploy-guide.md) - Hướng dẫn triển khai

## 🔑 Features

### User Management
- Đăng ký/Đăng nhập với email hoặc số điện thoại
- Xác thực email/SMS (mock)
- Phân quyền theo role (Admin, Manager, User, Guest)
- Quản lý profile và reset mật khẩu

### Product Management
- CRUD operations cho products
- Import/Export dữ liệu (Excel, CSV, PDF)
- Filter theo giá, loại, size, màu

### Reports & Statistics
₋ Dashboard tổng quan với KPI và metrics

₋ Báo cáo định kỳ (hàng ngày, tuần, tháng, quý)

₋ Biểu đồ trực quan (chart, graph)

₋ Xuất báo cáo đa định dạng

## 🔧 Configuration

### Environment Variables

**Backend**:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`
- `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`

**Frontend**:
- `VITE_API_URL` - Backend API URL

### Secrets

Secrets được quản lý trong `infra/k8s/01-secrets.yaml`. 

⚠️ **Production**: Sử dụng external secret management (Vault, AWS Secrets Manager, etc.)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 CI/CD

CI/CD pipelines được cấu hình trong:
- `.github/workflows/ci-cd.yml` (GitHub Actions)
- `.gitlab-ci.yml` (GitLab CI)

## 🐛 Troubleshooting

Xem [Deployment Guide - Troubleshooting](docs/deploy-guide.md#troubleshooting)

## 📝 License

ISC

## 👥 Contributors

Add your name here

## 🔗 Links

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Documentation](https://react.dev/)

