# Hướng Dẫn Cho Newbie: Docker, Kubernetes, CI/CD

Tài liệu này giải thích từng phần của project để bạn hiểu rõ giá trị cốt lõi.

---

## 📦 PHẦN 1: DOCKERFILE - Đóng Gói Ứng Dụng

### Dockerfile là gì?
Dockerfile giống như **công thức nấu ăn** - nó mô tả cách "nấu" (build) một container image chứa ứng dụng của bạn.

### Backend Dockerfile Giải Thích

```dockerfile
FROM node:18-alpine
```
**Giá trị cốt lõi**: Chọn "nguyên liệu" cơ bản - image Node.js phiên bản 18, bản nhẹ (alpine).
- `alpine` = bản Linux nhỏ gọn, giúp image nhẹ hơn

```dockerfile
WORKDIR /app
```
**Giá trị cốt lõi**: Tạo thư mục làm việc `/app` trong container (giống `cd /app`).
- Tất cả lệnh sau sẽ chạy trong thư mục này

```dockerfile
COPY package*.json ./
```
**Giá trị cốt lõi**: Copy file `package.json` và `package-lock.json` từ máy bạn vào container.
- Làm bước này TRƯỚC khi copy code để tận dụng Docker cache (nếu dependencies không đổi, không cần cài lại)

```dockerfile
RUN npm ci --only=production
```
**Giá trị cốt lõi**: Cài đặt dependencies (thư viện) cần thiết.
- `npm ci` = cài đặt chính xác theo package-lock.json (nhanh và ổn định hơn `npm install`)
- `--only=production` = chỉ cài dependencies cần cho production (bỏ dev dependencies)

```dockerfile
COPY . .
```
**Giá trị cốt lõi**: Copy toàn bộ source code vào container.
- Dấu `.` đầu = copy từ thư mục hiện tại (máy bạn)
- Dấu `.` sau = copy vào thư mục hiện tại trong container (`/app`)

```dockerfile
EXPOSE 3000
```
**Giá trị cốt lõi**: Khai báo container sẽ lắng nghe ở port 3000.
- Không thực sự mở port, chỉ là "tài liệu" để người khác biết

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', ...)"
```
**Giá trị cốt lõi**: Tự động kiểm tra ứng dụng có còn sống không.
- `interval=30s`: Kiểm tra mỗi 30 giây
- `timeout=3s`: Nếu không phản hồi trong 3 giây = lỗi
- `start-period=40s`: Đợi 40 giây sau khi start mới bắt đầu check (cho app khởi động)
- `retries=3`: Thử 3 lần trước khi đánh dấu unhealthy

```dockerfile
CMD ["npm", "start"]
```
**Giá trị cốt lõi**: Lệnh chạy khi container khởi động.
- Tương đương chạy `npm start` trong terminal

### Frontend Dockerfile (Multi-stage Build)

```dockerfile
FROM node:18-alpine AS builder
```
**Giá trị cốt lõi**: Stage 1 - dùng để BUILD ứng dụng.
- `AS builder` = đặt tên stage này là "builder" để dùng lại sau

```dockerfile
RUN npm run build
```
**Giá trị cốt lõi**: Build React app thành các file tĩnh (HTML, CSS, JS).
- Output: thư mục `dist/` chứa các file đã build

```dockerfile
FROM nginx:stable-alpine
```
**Giá trị cốt lõi**: Stage 2 - dùng Nginx để PHỤC VỤ file tĩnh.
- Tại sao 2 stage? Stage 1 cần Node.js để build, nhưng stage 2 chỉ cần Nginx (nhẹ hơn nhiều)

```dockerfile
COPY --from=builder /app/dist /usr/share/nginx/html
```
**Giá trị cốt lõi**: Copy file đã build từ stage 1 vào Nginx.
- `--from=builder` = lấy từ stage "builder"
- `/usr/share/nginx/html` = thư mục Nginx phục vụ file web

**Tại sao Multi-stage?**
- Image cuối cùng chỉ chứa Nginx + file tĩnh (rất nhẹ ~20MB)
- Nếu dùng 1 stage: image sẽ có cả Node.js + build tools (nặng ~300MB)

---

## ☸️ PHẦN 2: KUBERNETES - Quản Lý Container

### Kubernetes là gì?
Kubernetes (K8s) giống như **người quản lý nhà hàng**:
- Tự động phân phối công việc (pods) cho các nhân viên (nodes)
- Đảm bảo luôn có đủ nhân viên làm việc
- Tự động thay thế nhân viên bị ốm (pod crash)

### Các Khái Niệm Cơ Bản

#### 1. Namespace - Phân Vùng
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: clothing-ns
```
**Giá trị cốt lõi**: Tạo "phòng riêng" cho ứng dụng của bạn.
- Giống như tạo folder riêng để không lẫn với app khác
- Tất cả resources (pods, services) sẽ nằm trong namespace này

#### 2. Deployment - Định Nghĩa Ứng Dụng

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: clothing-ns
```
**Giá trị cốt lõi**: Khai báo "tôi muốn chạy ứng dụng backend".

```yaml
spec:
  replicas: 2
```
**Giá trị cốt lõi**: Chạy 2 bản copy (pods) của ứng dụng.
- Tại sao? Để có **high availability** - nếu 1 pod chết, còn 1 pod vẫn chạy
- Load balancing tự động phân chia traffic

```yaml
selector:
  matchLabels:
    app: backend
```
**Giá trị cốt lõi**: Cách K8s tìm pods thuộc deployment này.
- Giống như "tag" để nhận diện

```yaml
template:
  metadata:
    labels:
      app: backend
```
**Giá trị cốt lõi**: Gắn label "app: backend" cho mỗi pod được tạo.
- Label này dùng để Service tìm pods

```yaml
containers:
  - name: backend
    image: registry.example.com/clothing/backend:dev
```
**Giá trị cốt lõi**: Chỉ định container image nào sẽ chạy.
- `image` = địa chỉ image trong registry (Docker Hub, GCR, ECR...)

```yaml
ports:
  - containerPort: 3000
```
**Giá trị cốt lõi**: Container lắng nghe ở port 3000.
- Chỉ là khai báo, không mở port ra ngoài

#### 3. Environment Variables - Biến Môi Trường

```yaml
env:
  - name: DB_HOST
    value: "mysql-svc"
  - name: DB_PASS
    valueFrom:
      secretKeyRef:
        name: clothing-secrets
        key: mysql-app-password
```
**Giá trị cốt lõi**: Truyền thông tin cấu hình vào container.
- `value`: Giá trị trực tiếp (không nhạy cảm)
- `valueFrom.secretKeyRef`: Lấy từ Secret (bảo mật hơn cho password)

**Tại sao dùng Secret?**
- Password không nên hardcode trong YAML
- Secret được mã hóa trong K8s
- Dễ quản lý và rotate (đổi password)

#### 4. Resources - Giới Hạn Tài Nguyên

```yaml
resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi
```
**Giá trị cốt lõi**: Đảm bảo và giới hạn tài nguyên cho pod.

- **requests**: Tài nguyên ĐẢM BẢO có sẵn
  - `cpu: 100m` = 0.1 CPU core (100 millicores)
  - `memory: 256Mi` = 256 MB RAM
  - K8s sẽ đảm bảo pod này có ít nhất lượng này

- **limits**: Tài nguyên TỐI ĐA được dùng
  - `cpu: 500m` = tối đa 0.5 CPU core
  - `memory: 512Mi` = tối đa 512 MB RAM
  - Nếu vượt quá, pod có thể bị kill

**Tại sao quan trọng?**
- Tránh 1 pod "ăn hết" tài nguyên cluster
- Giúp K8s quyết định đặt pod ở node nào

#### 5. Probes - Kiểm Tra Sức Khỏe

```yaml
livenessProbe:
  httpGet:
    path: /api/liveness
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
```
**Giá trị cốt lõi**: Kiểm tra ứng dụng có còn sống không.

- **livenessProbe**: Nếu fail → K8s sẽ **restart pod**
  - `initialDelaySeconds: 30` = đợi 30s sau khi start mới check
  - `periodSeconds: 10` = check mỗi 10 giây

```yaml
readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
```
**Giá trị cốt lõi**: Kiểm tra ứng dụng đã sẵn sàng nhận traffic chưa.

- **readinessProbe**: Nếu fail → K8s sẽ **ngừng gửi traffic** đến pod
  - Pod vẫn chạy, nhưng Service không route traffic đến
  - Dùng khi app đang khởi động hoặc tạm thời không sẵn sàng

**Khác biệt:**
- Liveness = "Ứng dụng có chết không?" → Restart nếu chết
- Readiness = "Ứng dụng sẵn sàng chưa?" → Tạm thời loại khỏi load balancer

#### 6. Service - Cổng Vào Ứng Dụng

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-svc
spec:
  type: ClusterIP
  ports:
    - port: 3000
      targetPort: 3000
  selector:
    app: backend
```
**Giá trị cốt lõi**: Tạo "địa chỉ cố định" để truy cập pods.

- **ClusterIP**: Chỉ truy cập được TỪ TRONG cluster
  - Frontend pod có thể gọi `http://backend-svc:3000`
  - Không truy cập được từ bên ngoài

- **selector**: Service tìm pods có label `app: backend`
  - Tự động load balance giữa các pods

- **port vs targetPort**:
  - `port: 3000` = port của Service (bên ngoài)
  - `targetPort: 3000` = port của container (bên trong)

```yaml
type: NodePort
nodePort: 30081
```
**Giá trị cốt lõi**: Mở port ra ngoài cluster để truy cập trực tiếp.

- **NodePort**: Truy cập từ bên ngoài qua `<node-ip>:30081`
  - Dùng cho development/testing
  - Production nên dùng Ingress

#### 7. PersistentVolume (PV) & PersistentVolumeClaim (PVC) - Lưu Trữ Dữ Liệu

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mysql-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /mnt/data/mysql
```
**Giá trị cốt lõi**: Tạo "ổ cứng" để lưu dữ liệu.

- **PersistentVolume (PV)**: Tài nguyên lưu trữ thực tế
  - `capacity: 10Gi` = 10 GB
  - `hostPath` = lưu trên máy vật lý (development)
  - Production nên dùng cloud storage (EBS, Azure Disk...)

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
spec:
  storageClassName: manual
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```
**Giá trị cốt lõi**: "Yêu cầu" sử dụng storage.

- **PersistentVolumeClaim (PVC)**: Pod "xin" sử dụng storage
  - `storageClassName: manual` = dùng PV có class "manual"
  - `accessModes: ReadWriteOnce` = chỉ 1 pod được mount cùng lúc (phù hợp database)
  - K8s tự động gán PV phù hợp
  - Pod mount PVC vào container qua `volumeMounts`

**Tại sao cần?**
- Container mặc định là "stateless" - mất dữ liệu khi restart
- Database cần lưu dữ liệu lâu dài → cần PV/PVC
- **ReadWriteOnce**: Database chỉ cho 1 pod đọc/ghi (tránh conflict)

**Luồng hoạt động:**
1. Tạo PV (có sẵn storage)
2. Tạo PVC (yêu cầu storage)
3. K8s tự động "bind" PVC với PV phù hợp
4. Pod mount PVC → dữ liệu được lưu vào PV

#### 8. ConfigMap - Cấu Hình Không Nhạy Cảm

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mysql-config
data:
  my.cnf: |
    [mysqld]
    character-set-server=utf8mb4
```
**Giá trị cốt lõi**: Lưu cấu hình dạng key-value.

- Khác Secret: ConfigMap cho dữ liệu KHÔNG nhạy cảm
- Có thể mount vào pod như file hoặc dùng như env var

#### 9. Secret - Thông Tin Nhạy Cảm

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: clothing-secrets
  namespace: clothing-ns
type: Opaque
stringData:
  mysql-root-password: "ClothingRoot@123"
  mysql-app-password: "Cl0th1ngApp@123"
  minio-access-key: "minioadmin"
```
**Giá trị cốt lõi**: Lưu password, API keys... một cách an toàn.

- **Opaque**: Loại secret cơ bản (K8s tự động base64 encode)
- **stringData**: Dữ liệu dạng text (K8s tự encode)
- **data**: Dữ liệu đã base64 encoded (nếu muốn tự encode)

**Cách sử dụng trong Pod:**
```yaml
env:
  - name: DB_PASS
    valueFrom:
      secretKeyRef:
        name: clothing-secrets
        key: mysql-app-password
```
- Pod lấy giá trị từ Secret → set làm env variable
- Không hardcode password trong YAML

**Bảo mật:**
- Secret được mã hóa trong etcd (K8s database)
- Chỉ pods trong cùng namespace mới đọc được (nếu có RBAC)
- **Production**: Nên dùng External Secrets Operator hoặc Vault (rotate password dễ hơn)

---

## 🔄 PHẦN 3: CI/CD - Tự Động Hóa

### CI/CD là gì?
**CI (Continuous Integration)**: Tự động build và test khi có code mới
**CD (Continuous Deployment)**: Tự động deploy lên môi trường

### GitHub Actions Workflow Giải Thích

```yaml
on:
  push:
    branches: [ main, develop ]
```
**Giá trị cốt lõi**: Kích hoạt pipeline khi push code lên branch `main` hoặc `develop`.

```yaml
jobs:
  build-backend:
    runs-on: ubuntu-latest
```
**Giá trị cốt lõi**: Chạy job trên máy Ubuntu (GitHub cung cấp miễn phí).

```yaml
- name: Checkout code
  uses: actions/checkout@v3
```
**Giá trị cốt lõi**: Tải code từ repository về máy runner.

```yaml
- name: Set up Node.js
  uses: actions/setup-node@v3
  with:
    node-version: '18'
```
**Giá trị cốt lõi**: Cài đặt Node.js phiên bản 18.

```yaml
- name: Install dependencies
  working-directory: ./backend
  run: npm ci
```
**Giá trị cốt lõi**: Cài đặt dependencies của backend.

```yaml
- name: Run tests
  run: npm test || echo "Tests not implemented yet"
```
**Giá trị cốt lõi**: Chạy tests (nếu có).

```yaml
- name: Build Docker image
  run: |
    docker build -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_BACKEND }}:${{ github.sha }} .
```
**Giá trị cốt lõi**: Build Docker image với tag là commit SHA.
- `${{ github.sha }}` = hash của commit (ví dụ: `abc1234`)
- Mỗi commit có image riêng → dễ rollback

```yaml
- name: Push Docker image
  if: github.event_name == 'push'
  run: |
    echo "${{ secrets.REGISTRY_PASSWORD }}" | docker login ${{ env.REGISTRY }} -u ${{ secrets.REGISTRY_USERNAME }} --password-stdin
    docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_BACKEND }}:${{ github.sha }}
    docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_BACKEND }}:latest
```
**Giá trị cốt lõi**: Đẩy image lên registry (Docker Hub, GCR...).

- `if: github.event_name == 'push'` = chỉ push khi push code (không push khi PR)
- `${{ secrets.REGISTRY_PASSWORD }}` = lấy password từ GitHub Secrets (Settings → Secrets)
- `--password-stdin` = đọc password từ stdin (an toàn hơn)
- Push 2 tags: commit SHA (riêng biệt) và `latest` (luôn mới nhất)

**GitHub Secrets:**
- Vào Repository → Settings → Secrets and variables → Actions
- Thêm: `REGISTRY_USERNAME`, `REGISTRY_PASSWORD`, `KUBECONFIG`
- Secrets được mã hóa, chỉ dùng được trong Actions

```yaml
- name: Configure kubectl
  run: |
    echo "${{ secrets.KUBECONFIG }}" | base64 -d > $HOME/.kube/config
```
**Giá trị cốt lõi**: Cấu hình kubectl để kết nối K8s cluster.

- `KUBECONFIG` = file cấu hình K8s (chứa thông tin cluster, credentials)
- Base64 encode để lưu trong GitHub Secrets
- Giải mã và lưu vào `~/.kube/config` → kubectl biết kết nối đâu

```yaml
- name: Update image tags
  run: |
    sed -i "s|registry.example.com/clothing/backend:dev|${{ env.REGISTRY }}/${{ env.IMAGE_NAME_BACKEND }}:${{ github.sha }}|g" infra/k8s/06-backend-deployment.yaml
```
**Giá trị cốt lõi**: Thay thế image tag placeholder bằng tag thực tế.

- `sed` = công cụ Linux để thay thế text trong file
- Tìm: `registry.example.com/clothing/backend:dev`
- Thay bằng: `registry.example.com/clothing/backend:abc1234` (commit SHA)

```yaml
- name: Deploy to Kubernetes
  run: |
    kubectl apply -f infra/k8s/
```
**Giá trị cốt lõi**: 
1. Thay đổi image tag trong deployment YAML
2. Apply YAML lên K8s cluster → tự động update pods

```yaml
- name: Wait for rollout
  run: |
    kubectl -n clothing-ns rollout status deploy/backend --timeout=5m
```
**Giá trị cốt lõi**: Đợi deployment hoàn tất.
- Kiểm tra pods mới đã chạy và sẵn sàng chưa
- `--timeout=5m` = tối đa đợi 5 phút
- Nếu quá timeout → pipeline fail (báo lỗi)

**Quy trình CI/CD hoàn chỉnh:**
1. Developer push code → GitHub
2. GitHub Actions trigger (tự động chạy)
3. **Build stage**: Cài dependencies, chạy tests
4. **Build Docker image**: Tạo image với tag = commit SHA
5. **Push image**: Đẩy lên registry (Docker Hub, GCR...)
6. **Deploy stage**: 
   - Update image tag trong K8s YAML
   - `kubectl apply` → K8s nhận biết có thay đổi
   - K8s tự động: pull image mới → tạo pods mới → dừng pods cũ (rolling update)
7. **Verify**: Đợi rollout hoàn tất, đảm bảo pods mới chạy OK

**Tại sao dùng commit SHA làm tag?**
- Mỗi commit có image riêng → dễ rollback về version cũ
- `latest` tag luôn trỏ đến commit mới nhất

---

## 🎯 TÓM TẮT GIÁ TRỊ CỐT LÕI

### Dockerfile
- **Đóng gói** ứng dụng + dependencies thành 1 image
- **Nhất quán** giữa các môi trường (dev, staging, prod)
- **Dễ deploy** - chỉ cần pull image và chạy

### Kubernetes
- **Tự động hóa**: Tự restart pod chết, tự scale, tự load balance
- **High Availability**: Chạy nhiều replicas, không downtime
- **Quản lý tài nguyên**: Giới hạn CPU/RAM, tránh conflict
- **Service Discovery**: Pods tự tìm nhau qua Service name

### CI/CD
- **Tự động hóa**: Không cần build/deploy thủ công
- **Nhất quán**: Mọi người deploy giống nhau
- **Nhanh chóng**: Phát hiện lỗi sớm, deploy nhanh
- **Rollback dễ dàng**: Mỗi commit có image riêng

---

## ❓ FAQ - Câu Hỏi Thường Gặp

### 1. Tại sao cần Docker?
**Trước khi có Docker:**
- "Ứng dụng chạy trên máy tôi nhưng không chạy trên máy bạn"
- Phải cài đặt thủ công: Node.js, dependencies, database...
- Mỗi môi trường (dev, staging, prod) khác nhau → dễ lỗi

**Sau khi có Docker:**
- "Chạy giống nhau ở mọi nơi" - container chứa tất cả dependencies
- Chỉ cần: `docker run image-name` → app chạy ngay
- Dev, staging, prod dùng cùng 1 image → nhất quán

### 2. Tại sao cần Kubernetes?
**Vấn đề khi chỉ dùng Docker:**
- Nếu container chết → phải restart thủ công
- Muốn scale (chạy nhiều bản) → phải chạy nhiều lệnh `docker run`
- Load balancing → phải setup nginx thủ công
- Quản lý nhiều containers → rất phức tạp

**Kubernetes giải quyết:**
- Tự động restart container chết
- Chỉ cần set `replicas: 3` → tự động chạy 3 pods
- Tự động load balance
- Quản lý tập trung tất cả containers

### 3. CI/CD làm gì?
**Không có CI/CD:**
1. Code xong → build thủ công
2. Test thủ công
3. Build Docker image thủ công
4. Push image thủ công
5. SSH vào server → deploy thủ công
→ Mất thời gian, dễ sai sót

**Có CI/CD:**
1. Push code → Tự động làm tất cả
→ Tiết kiệm thời gian, nhất quán, ít lỗi

### 4. Replicas là gì?
**replicas: 1** = Chạy 1 pod
- Nếu pod chết → app down (downtime)
- Không có backup

**replicas: 3** = Chạy 3 pods
- Nếu 1 pod chết → còn 2 pods chạy (không downtime)
- Load được chia đều → nhanh hơn

### 5. Service vs Deployment khác gì?
- **Deployment**: Quản lý pods (tạo, xóa, update)
- **Service**: Tạo địa chỉ cố định để truy cập pods
  - Pods có thể thay đổi IP → Service giữ IP cố định
  - Load balance giữa các pods

### 6. Tại sao cần Secret thay vì hardcode password?
**Hardcode trong YAML:**
```yaml
env:
  - name: DB_PASS
    value: "MyPassword123"  # ❌ Ai cũng thấy được
```
- Commit vào Git → ai cũng thấy password
- Khó đổi password (phải sửa code)

**Dùng Secret:**
```yaml
env:
  - name: DB_PASS
    valueFrom:
      secretKeyRef:
        name: clothing-secrets
        key: mysql-password  # ✅ Chỉ K8s biết
```
- Password không có trong code
- Dễ đổi password (chỉ cần update Secret)

---

## 🎬 VÍ DỤ THỰC TẾ: Luồng Hoạt Động

### Scenario: Developer thêm tính năng mới

1. **Developer code**:
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin main
   ```

2. **GitHub Actions tự động chạy**:
   - Checkout code
   - Install dependencies
   - Run tests
   - Build Docker image: `clothing/backend:abc1234`
   - Push lên registry

3. **Deploy job chạy**:
   - Update K8s YAML: thay `backend:dev` → `backend:abc1234`
   - `kubectl apply` → K8s nhận biết có thay đổi

4. **Kubernetes tự động**:
   - Pull image mới từ registry
   - Tạo pod mới với image mới
   - Pod mới chạy → readiness probe pass
   - Service chuyển traffic sang pod mới
   - Dừng pod cũ (rolling update)
   - **Zero downtime** - người dùng không biết có update

5. **Nếu có lỗi**:
   - Liveness probe fail → K8s restart pod
   - Nếu vẫn lỗi → có thể rollback về image cũ

---

## 📚 TÀI LIỆU THAM KHẢO

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Basics](https://kubernetes.io/docs/tutorials/kubernetes-basics/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Kubernetes Concepts](https://kubernetes.io/docs/concepts/)

