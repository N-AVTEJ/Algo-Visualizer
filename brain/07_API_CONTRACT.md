# 07 API CONTRACT

## 1. Overview
The AlgoLens Pro backend exposes a REST API built on FastAPI.

- **Base URL (Local)**: `http://127.0.0.1:8000`
- **Interactive Documentation**: `http://127.0.0.1:8000/docs`

---

## 2. Endpoints

### 2.1 Health Check
- **HTTP Method**: `GET`
- **Path**: `/health`
- **Description**: Returns service health status and current API version.
- **Authentication**: None required
- **Response (200 OK)**:
  ```json
  {
    "status": "healthy",
    "service": "AlgoLens Pro API",
    "version": "0.1.0"
  }
  ```

---

### 2.2 Root Metadata
- **HTTP Method**: `GET`
- **Path**: `/`
- **Description**: Returns welcome message and documentation links.
- **Authentication**: None required
- **Response (200 OK)**:
  ```json
  {
    "message": "Welcome to AlgoLens Pro API",
    "docs_url": "/docs",
    "health_url": "/health"
  }
  ```
