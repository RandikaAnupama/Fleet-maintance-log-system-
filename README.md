# Fleet Maintenance Log System

A fleet maintenance application built with React, Express and MySQL.

Administrators manage fleet records, service schedules, reported issues and user vehicle assignments. Users view their assigned vehicle, maintenance history and submitted issues.

## Technology Stack

- Frontend: React, Vite, React Router, Axios and Bootstrap
- Backend: Node.js and Express
- Database: MySQL 8.0
- Authentication: JWT and bcrypt

## Features

- User registration and login through the backend API
- ADMIN and USER roles with protected routes
- Vehicle and driver management
- Garage management
- Maintenance and repair records
- Service scheduling, cancellation and completion
- Maintenance record creation when a scheduled service is completed
- Vehicle issue reporting and administrator status updates
- User vehicle assignments
- Assigned vehicle and maintenance history views
- Dashboard using database records
- Daily and monthly maintenance and repair reports
- Filtered CSV export and browser Print / Save as PDF
- Profile name and phone updates
- Inactive account access restrictions
- Protection against administrator self-demotion and self-deactivation

## Project Structure

```text
backend/
  config/
  controllers/
  database/
  middleware/
  models/
  routes/
  utils/
  app.js
  server.js

src/
  components/
  context/
  layouts/
  pages/
  services/
  styles/
```

## Requirements

- Node.js 24.18.0 with npm (tested version)
- MySQL Server 8.0
- MySQL Workbench or another MySQL client
- Git

Check the installed Node.js and npm versions:

```powershell
node -v
npm -v
```

## 1. Open the Project

Open a terminal in the project root: the folder containing both `src` and `backend`.

For the current development checkout:

```powershell
cd D:\fleet-maintenance-member3
```

Use your own folder path if the project is located elsewhere.

## 2. Create the Database

The complete schema is stored at:

```text
backend/database/schema.sql
```

For a fresh installation:

1. Open MySQL Workbench and connect to MySQL Server.
2. Open `backend/database/schema.sql`.
3. Execute the script.

The script creates the `fleet_management` database and these eight tables:

- users
- vehicles
- drivers
- garages
- maintenance_logs
- repair_logs
- service_schedules
- issues

### Existing Database Warning

`schema.sql` contains `DROP TABLE IF EXISTS` statements.

Running it against an existing `fleet_management` database replaces its tables and deletes their records. Use it only for a fresh installation or an intentional reset after taking a backup.

The schema already includes the changes from the older migration files. Do not run those migration files again after importing this schema.

The schema contains structure only. No accounts, passwords or application records are included.

## 3. Configure the Backend

Create this file:

```text
backend/.env
```

Enter:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=fleet_management
PORT=5000
JWT_SECRET=replace_with_a_random_secret
```

Replace the database credentials with your local MySQL credentials.

Generate a JWT secret with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the generated value into `JWT_SECRET`.

Keep `.env` files and actual credentials out of Git.

## 4. Install and Start the Backend

From the project root:

```powershell
cd backend
npm install
npm run dev
```

Expected startup messages:

```text
MySQL database connected successfully.
Server is running on port 5000
```

Backend address:

```text
http://localhost:5000
```

To start without nodemon:

```powershell
npm start
```

Keep this terminal running.

## 5. Configure the Frontend

Create `.env` in the project root, alongside the frontend `package.json`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Authentication uses the backend API. Mock accounts are not supported.

Restart the frontend development server after changing its environment settings.

## 6. Install and Start the Frontend

Open a second terminal in the project root:

```powershell
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

The current backend CORS configuration permits this frontend origin. Use port 5173 for the documented local setup.

Both the backend and frontend must be running.

## 7. Create the First Administrator

A fresh database has no accounts.

1. Open the frontend Register page.
2. Register using your own name, email and password.
3. Registration creates a USER account.
4. In MySQL Workbench, promote that specific account using its registered email.

Replace the example email below with the email you registered:

```sql
UPDATE fleet_management.users
SET role = 'ADMIN', status = 'ACTIVE'
WHERE email = 'your-registered-email@example.com'
  AND role = 'USER';
```

Verify the result:

```sql
SELECT id, full_name, email, role, status
FROM fleet_management.users
WHERE email = 'your-registered-email@example.com';
```

Log out if already signed in, then log in again.

This is a manual bootstrap step for the database owner. It is not a public registration option.

There are no built-in administrator credentials. Registration hashes the password before storing it.

## 8. Create and Assign Users

1. Register another account through the Register page.
2. Log in as an administrator.
3. Create an ACTIVE vehicle if needed.
4. Open Users and assign the vehicle to an ACTIVE USER account.
5. Log in as that user to view My Vehicle and Maintenance History.

A user without an assigned vehicle sees a message asking them to contact the administrator.

Driver records and user accounts are separate. User vehicle assignments control the My Vehicle page.

## Main API Routes

All paths below use this base URL:

```text
http://localhost:5000/api
```

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Register a USER account |
| POST | `/auth/login` | Log in and receive a JWT |
| GET | `/dashboard` | Dashboard for the logged-in account |
| GET, PUT | `/profile` | Read or update the current user's profile |
| GET | `/my-vehicle` | Read the current user's assigned vehicle |
| GET | `/my-maintenance` | Read assigned vehicle maintenance history |
| GET | `/users` | Administrator user list |
| PUT | `/users/:id/role` | Update a user's role |
| PUT | `/users/:id/status` | Update a user's account status |
| PUT | `/users/:id/vehicle` | Assign or remove a user's vehicle |
| GET, POST | `/vehicles` | List or create vehicles |
| GET, PUT, DELETE | `/vehicles/:id` | Read, update or deactivate a vehicle |
| GET, POST | `/drivers` | List or create drivers |
| GET, PUT, DELETE | `/drivers/:id` | Read, update or deactivate a driver |
| GET, POST | `/garages` | List or create garages |
| GET, POST | `/maintenance` | List or create maintenance records |
| GET, PUT, DELETE | `/maintenance/:id` | Read, update or delete maintenance |
| GET, POST | `/repairs` | List or create repair records |
| GET, PUT, DELETE | `/repairs/:id` | Read, update or delete repairs |
| GET, POST | `/schedules` | List or create service schedules |
| GET, PUT, DELETE | `/schedules/:id` | Read, update or delete eligible schedules |
| POST | `/schedules/:id/complete` | Complete a service and create maintenance |
| GET, POST | `/issues` | List permitted issues or submit a user issue |
| GET | `/issues/:id` | Read a permitted issue |
| PUT | `/issues/:id/status` | Administrator issue status update |

Protected API requests use:

```text
Authorization: Bearer YOUR_TOKEN
```

Backend middleware enforces authentication and role permissions. Hiding frontend buttons alone does not grant or prevent API access.

## Reports

Reports load records from the maintenance and repair APIs.

- Filter by daily or monthly period.
- Apply vehicle, work type and status filters.
- Repair reports also support garage filtering.
- CSV exports contain the filtered records.
- Print / PDF opens the browser print dialog; choose Save as PDF where supported.

Report totals include all matching records in the selected period and statuses, including future-dated records.

Dashboard monthly cost includes completed maintenance and repairs in the current month through today. Its total may therefore differ from a report total.

## Build the Frontend

From the project root:

```powershell
npm run build
```

The output is written to:

```text
dist/
```

This builds the frontend only. It does not deploy the backend or database.

Hosting requires configuring the API address, backend environment, allowed frontend origin and HTTPS for the target environment.

## Troubleshooting

### Frontend cannot be reached

Start `npm run dev` from the project root and check the URL printed by Vite.

### API connection fails

Check that the backend is running on port 5000 and that `VITE_API_BASE_URL` points to it.

### Database connection fails

Check that MySQL Server is running and verify the `DB_*` settings in `backend/.env`.

### Invalid or expired token

Log out and log in again. Tokens currently expire after one day.

### Account is inactive

An administrator must reactivate the account before it can log in or use protected APIs.

### Access forbidden

The logged-in account does not have permission for that endpoint.

### No vehicle assigned

An administrator must assign a vehicle from the Users page.

### Duplicate column or table during setup

Do not rerun older migration files after importing the complete schema.

### Reports show no records

Check the selected date or month and the other filters. Records must exist for that period.

## API Documentation — Swagger

Start the backend:

```bash
cd backend
npm install
npm run dev
```

Open Swagger UI:

http://localhost:5000/api-docs/

OpenAPI JSON:

http://localhost:5000/api-docs.json

To test protected endpoints:
1. Execute POST /api/auth/login with a registered account.
2. Copy the token from the response.
3. Click Authorize and paste only the token, without the Bearer prefix.
4. Execute an endpoint permitted for the account's role.

Authorization is cleared when the Swagger page is refreshed.
Create, update and delete requests affect the connected database.