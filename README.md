# 🌟 Neon Chat - Real-Time Chat Application

[![CI/CD Pipeline](https://github.com/Yousefashraf074/PRODIGY_FS_04/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Yousefashraf074/PRODIGY_FS_04/actions/workflows/ci-cd.yml)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://hub.docker.com/)
[![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=flat&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-ready, real-time chat application featuring a stunning neon-themed UI, WebSocket messaging, full DevOps automation, containerization, and Kubernetes deployment.

## 📸 Screenshots

 Chat Dashboard |<img width="1905" height="904" alt="Screenshot 2026-03-04 024057" src="https://github.com/user-attachments/assets/9961a826-9449-4b17-840c-aa213b47ab5e" />
 
Chat users |<img width="1911" height="914" alt="Screenshot 2026-03-04 023952" src="https://github.com/user-attachments/assets/434d8b29-d75f-4dbd-af02-a946586f9b9b" />


 
| Real-Time Messaging <img width="1904" height="907" alt="Screenshot 2026-03-04 024154" src="https://github.com/user-attachments/assets/f6597059-3a8c-4c2c-a48a-75b12587ca0e" />


|pgAdmin Database |<img width="1920" height="1080" alt="Screenshot 2026-03-04 054845" src="https://github.com/user-attachments/assets/958220a8-60d8-4fdb-97a4-41f48a16cd4c" />

 Kubernetes Pods| <img width="1920" height="1080" alt="Screenshot 2026-03-04 031914" src="https://github.com/user-attachments/assets/d888842e-0e50-4253-83bd-70c479cf7269" />


 Docker Desktop |<img width="1919" height="1019" alt="Screenshot 2026-03-04 025139" src="https://github.com/user-attachments/assets/25c0dac9-5c74-477f-bc1f-d9236ef502ef" />


K8s Services| <img width="1919" height="969" alt="Screenshot 2026-03-04 031505" src="https://github.com/user-attachments/assets/8c7128c5-53b1-4ba4-bad4-14150b5f7685" />


 Health Check |<img width="1920" height="1080" alt="Screenshot 2026-03-04 032740" src="https://github.com/user-attachments/assets/d4d52104-a8d4-4280-b8ec-1437c1dd418e" />


## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Local Development](#-local-development)
- [Docker Deployment](#-docker-deployment)
- [Kubernetes Deployment](#-kubernetes-deployment)
- [CI/CD Pipeline](#-cicd-pipeline)
- [API Documentation](#-api-documentation)
- [Monitoring](#-monitoring)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Frontend

- 🎨 **Modern Neon UI** - Dark theme with glowing neon blue gradients
- 🔐 **JWT Authentication** - Secure login and registration
- 💬 **Real-Time Messaging** - Instant message delivery via WebSocket
- 👥 **Chat Rooms** - Public chat rooms for group conversations
- 🔒 **Private Messaging** - One-on-one private conversations
- 🟢 **Online Presence** - See who's online in real-time
- ⌨️ **Typing Indicators** - Know when others are typing
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ✨ **Smooth Animations** - Framer Motion powered transitions

### Backend

- 🚀 **Express.js** - Fast, minimalist web framework
- 🔌 **Socket.IO** - Real-time bidirectional communication
- 🗄️ **PostgreSQL** - Robust relational database
- 🔄 **Prisma ORM** - Type-safe database client
- 🔐 **bcrypt** - Secure password hashing
- 📊 **Prometheus Metrics** - Application monitoring

### DevOps

- 🐳 **Docker** - Containerized microservices
- ☸️ **Kubernetes** - Container orchestration
- 🔄 **GitHub Actions** - Automated CI/CD pipeline
- 📈 **Prometheus** - Metrics collection
- 📊 **Grafana-Ready** - Visualization dashboards
- 🔧 **Nginx** - Reverse proxy with WebSocket support

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                           │
│   ┌──────────────┬──────────────┬──────────────────────────┐    │
│   │  / → Frontend│ /api → Backend│ /socket.io → WebSocket   │    │
│   └──────────────┴──────────────┴──────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   Frontend    │  │    Backend    │  │  Prometheus   │
│ React + Vite  │  │ Express + IO  │  │  Monitoring   │
│  Port: 3006   │  │  Port: 5004   │  │  Port: 9091   │
└───────────────┘  └───────────────┘  └───────────────┘
                            │
                            ▼
                   ┌───────────────┐
                   │  PostgreSQL   │
                   │   Database    │
                   │  Port: 5433   │
                   └───────────────┘
```

## 🛠 Tech Stack

| Layer                | Technology                                                            |
| -------------------- | --------------------------------------------------------------------- |
| **Frontend**         | React 18, Vite, TailwindCSS, Socket.IO Client, Zustand, Framer Motion |
| **Backend**          | Node.js, Express.js, Socket.IO, Prisma ORM                            |
| **Database**         | PostgreSQL 16                                                         |
| **Authentication**   | JWT, bcryptjs                                                         |
| **Containerization** | Docker, Docker Compose                                                |
| **Orchestration**    | Kubernetes                                                            |
| **CI/CD**            | GitHub Actions                                                        |
| **Reverse Proxy**    | Nginx                                                                 |
| **Monitoring**       | Prometheus, Grafana                                                   |

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- Git

### Clone the Repository

```bash
git clone https://github.com/Yousefashraf074/PRODIGY_FS_04.git
cd PRODIGY_FS_04/neon-chat-devops-kubernetes
```

### Environment Setup

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend (optional)
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` with your configuration:

```env
PORT=5004
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres123@localhost:5433/neon_chat?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

## 💻 Local Development

### Option 1: Run Manually

```bash
# Terminal 1: Start PostgreSQL (via Docker)
docker run --name neon-postgres -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=neon_chat -p 5433:5432 -d postgres:16-alpine

# Terminal 2: Start Backend
cd backend
npm install
npx prisma migrate dev
npm run dev

# Terminal 3: Start Frontend
cd frontend
npm install
npm run dev
```

Access the application:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5004
- API Docs: http://localhost:5004/health

### Option 2: Docker Compose (Development)

```bash
docker-compose up -d
```

## 🐳 Docker Deployment

### Build Images

```bash
# Build backend
docker build -t neon-chat-backend ./backend

# Build frontend
docker build -t neon-chat-frontend ./frontend
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Push to Docker Hub

```bash
# Tag images
docker tag neon-chat-backend your-username/neon-chat-backend:latest
docker tag neon-chat-frontend your-username/neon-chat-frontend:latest

# Push images
docker push your-username/neon-chat-backend:latest
docker push your-username/neon-chat-frontend:latest
```

### Docker Compose Services

| Service    | Port       | Description         |
| ---------- | ---------- | ------------------- |
| frontend   | 3006       | React application   |
| backend    | 5004       | Express API server  |
| postgres   | 5433       | PostgreSQL database |
| nginx      | 8081, 8443 | Reverse proxy       |
| prometheus | 9091       | Metrics server      |
| grafana    | 3007       | Dashboards          |

## ☸️ Kubernetes Deployment

### Prerequisites

- kubectl configured
- Kubernetes cluster (minikube, EKS, GKE, AKS)
- Nginx Ingress Controller installed

### Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Deploy PostgreSQL
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml

# Wait for PostgreSQL to be ready
kubectl wait --for=condition=ready pod -l app=neon-chat,component=database -n neon-chat --timeout=120s

# Deploy Backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Deploy Frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Configure Ingress
kubectl apply -f k8s/ingress.yaml

# Check status
kubectl get all -n neon-chat
```

### Access the Application

Add to `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
<INGRESS_IP> neon-chat.local
```

Then access: http://neon-chat.local

### Useful Commands

```bash
# View pods
kubectl get pods -n neon-chat

# View logs
kubectl logs -f deployment/backend -n neon-chat

# Scale deployment
kubectl scale deployment/backend --replicas=3 -n neon-chat

# Restart deployment
kubectl rollout restart deployment/backend -n neon-chat

# Delete all resources
kubectl delete namespace neon-chat
```

## 🔄 CI/CD Pipeline

The GitHub Actions workflow automates:

1. **Test** - Run unit tests for backend and frontend
2. **Build** - Build Docker images for both services
3. **Push** - Push images to Docker Hub
4. **Deploy** - Deploy to Kubernetes (staging/production)
5. **Scan** - Security vulnerability scanning

### Required Secrets

Configure these in GitHub repository settings:

| Secret                   | Description                      |
| ------------------------ | -------------------------------- |
| `DOCKERHUB_USERNAME`     | Docker Hub username              |
| `DOCKERHUB_TOKEN`        | Docker Hub access token          |
| `KUBE_CONFIG_STAGING`    | Kubernetes config for staging    |
| `KUBE_CONFIG_PRODUCTION` | Kubernetes config for production |

### Pipeline Triggers

- **Push to `develop`** → Deploy to staging
- **Push to `main`** → Deploy to production (with tag)
- **Pull Request** → Run tests only

## 📚 API Documentation

### Authentication

| Endpoint             | Method | Description       |
| -------------------- | ------ | ----------------- |
| `/api/auth/register` | POST   | Register new user |
| `/api/auth/login`    | POST   | Login user        |
| `/api/auth/me`       | GET    | Get current user  |

### Users

| Endpoint                       | Method | Description              |
| ------------------------------ | ------ | ------------------------ |
| `/api/users`                   | GET    | Get all users            |
| `/api/users/:id`               | GET    | Get user by ID           |
| `/api/users/:id/private-chats` | GET    | Get user's private chats |

### Chat Rooms

| Endpoint                 | Method | Description         |
| ------------------------ | ------ | ------------------- |
| `/api/chatrooms`         | GET    | Get all chat rooms  |
| `/api/chatrooms`         | POST   | Create chat room    |
| `/api/chatrooms/:id`     | GET    | Get chat room by ID |
| `/api/chatrooms/private` | POST   | Create private chat |

### Messages

| Endpoint                | Method | Description  |
| ----------------------- | ------ | ------------ |
| `/api/messages/:chatId` | GET    | Get messages |
| `/api/messages/:chatId` | POST   | Send message |

### WebSocket Events

| Event               | Direction       | Description          |
| ------------------- | --------------- | -------------------- |
| `join-room`         | Client → Server | Join a chat room     |
| `leave-room`        | Client → Server | Leave a chat room    |
| `send-room-message` | Client → Server | Send room message    |
| `new-room-message`  | Server → Client | New message received |
| `typing-start`      | Client → Server | User started typing  |
| `typing-stop`       | Client → Server | User stopped typing  |
| `user-typing`       | Server → Client | User is typing       |
| `online-users`      | Server → Client | Online users list    |

## 📊 Monitoring

### Prometheus Metrics

Access metrics at: http://neon-chat.local/metrics (Kubernetes) or http://localhost:5004/metrics (local dev)

Available metrics:

- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration
- `active_websocket_connections` - Active WebSocket connections
- Default Node.js metrics

### Grafana Dashboards

Access Grafana at: http://neon-chat.local/grafana (Kubernetes) or http://localhost:3007 (Docker Compose)

Default credentials:

- Username: `admin`
- Password: `neonchat123`

## 🔒 Security

### Best Practices Implemented

- ✅ JWT token authentication
- ✅ bcrypt password hashing (12 rounds)
- ✅ Environment variables for secrets
- ✅ Kubernetes Secrets for sensitive data
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Rate limiting via Nginx
- ✅ Security headers
- ✅ Non-root Docker containers
- ✅ Container security scanning

### Production Recommendations

1. Use strong, unique JWT secrets
2. Enable HTTPS with valid certificates
3. Use Kubernetes Secrets Store CSI driver
4. Implement network policies
5. Regular security audits
6. Enable Pod Security Standards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- [React](https://reactjs.org/)
- [Socket.IO](https://socket.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [Kubernetes](https://kubernetes.io/)

---

<p align="center">
  Made with ❤️ and ☕ by <a href="https://github.com/Yousefashraf074">Yousef Ashraf</a>
</p>
