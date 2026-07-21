# Fleet Maintenance Log — React Frontend

This frontend follows the university requirements:

- Single-page application using React
- REST API integration through Axios
- One login page for ADMIN and USER
- Role-based sidebar, dashboard content, routes, and actions
- Client-side form validation
- Daily and monthly report screens with CSV download
- Responsive Bootstrap UI
- README instructions for running locally

## 1. Requirements

Install:

- Node.js 20.19+ or 22.12+
- npm
- VS Code

Check versions:

```bash
node -v
npm -v
```

## 2. Start the project

```bash
npm install
copy .env.example .env
npm run dev
```

Open:

```text
http://localhost:5173
```

On macOS/Linux use:

```bash
cp .env.example .env
```

## 3. Demo accounts

Mock authentication is enabled by default.

Admin:

```text
admin@fleet.com
admin123
```

Normal user:

```text
user@fleet.com
user123
```

## 4. Connect the Spring Boot REST API

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK_AUTH=false
```

Expected login request:

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@fleet.com",
  "password": "admin123"
}
```

Expected response:

```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "name": "System Admin",
    "email": "admin@fleet.com",
    "role": "ADMIN"
  }
}
```

## 5. Suggested REST endpoints

```text
POST   /api/auth/login
POST   /api/auth/register

GET    /api/vehicles
POST   /api/vehicles
PUT    /api/vehicles/{id}
DELETE /api/vehicles/{id}

GET    /api/drivers
POST   /api/drivers
PUT    /api/drivers/{id}
DELETE /api/drivers/{id}

GET    /api/maintenance
POST   /api/maintenance
PUT    /api/maintenance/{id}
DELETE /api/maintenance/{id}

GET    /api/fuel-logs
POST   /api/fuel-logs

GET    /api/repair-logs
POST   /api/repair-logs

GET    /api/service-schedules
POST   /api/service-schedules

GET    /api/issues
POST   /api/issues
PUT    /api/issues/{id}

GET    /api/reports/daily
GET    /api/reports/monthly
GET    /api/reports/daily/export?format=csv
GET    /api/reports/monthly/export?format=pdf
```

## 6. Important security rule

Hiding buttons in React is not enough. Spring Security must also check roles on every protected REST endpoint.
