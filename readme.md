# BreadVan Operations System

A full-stack delivery operations management system built with Flask (Python) and React (TypeScript).


## BreadVan Website Screenshots
![Alt Text](.png)


## Architecture

- **Backend**: Flask REST API + WebSockets on port 8000
- **Frontend**: React + TypeScript + Vite SPA on port 5000 (proxies API to Flask)
- **Database**: SQLite (dev) / PostgreSQL (prod via psycopg2)
- **Auth**: Flask-JWT-Extended (JWT tokens in localStorage)
- **Real-time**: Flask-SocketIO with gevent for live driver tracking

## Running the project

Two workflows run in parallel:
1. **Flask Server** — `flask run --host=0.0.0.0 --port=8000`
2. **Start application** — `cd client && npm run dev` (port 5000, this is what the preview shows)

## CLI Commands (original Flask CLI — preserved)

```bash
flask init                                        # Reset & seed DB
flask user create <username> <password>           # Create user
flask user list                                   # List users
flask bread seed-data                             # Add demo drivers/streets
flask bread schedule-drive --driver-id 1 --street-id 1 --time "10:00 AM"
flask bread driver-status --drive-id 1 --status EN_ROUTE --location "Near junction"
flask bread request-stop --drive-id 1 --resident-id 1 --note "2 loaves"
flask test user                                   # Run tests
flask test user unit         		# Run only unit tests
flask test user int          		# Run only integration tests

```

## Demo credentials

| User    | Password    | Street        |
|---------|-------------|---------------|
| bob     | bobpass     | Main Street   |
| alice   | alicepass   | Main Street   |
| charlie | charliepass | High Street   |
| diana   | dianapass   | Queen Street  |

## Frontend pages

- `/` — Dashboard: live map + stats cards + activity feed
- `/drives` — Manage drives (create, update status, track location)
- `/fleet` — Manage drivers and streets
- `/requests` — View and create stop requests

## User preferences

- Keep Flask CLI intact — never remove or modify wsgi.py CLI commands
- Backend on port 8000, frontend on port 5000
- TypeScript strict mode enabled on frontend



## Features
- Driver Management: Create and manage bread van drivers
- Street Management: Define delivery routes and streets
- Schedule Management: Assign drivers to streets with specific delivery times
- Stop Requests: Allow residents to request stops during scheduled deliveries
- Real-time Updates: Drivers can update their status and location
- User Management: Create and manage system users


## Technology Stack
- Backend: Flask (Python)
- Database: SQLite with SQLAlchemy ORM
- Authentication: Flask-JWT-Extended
- Testing: pytest
- CLI: Flask CLI with custom commands
- Prerequisites:
- Python 3.11+
- Flask
- SQLAlchemy
- Flask-JWT-Extended 



# Debug Mode
The Flask server runs in debug mode by default, providing:
- Automatic reloading on code changes
- Detailed error messages
- Interactive debugger
- Troubleshooting
- Common Issues

### "User already exists" error
- The system prevents duplicate usernames
- Use flask user list to see existing users
- Choose a different username


### Database errors
- Reset the database: flask init (warning: deletes all data)
- This recreates tables and demo data

### Reset Database
flask init  *(Drops and recreates all tables with demo data)*

### Data Model
1. Entities:
- User: System users with authentication
- Driver: Bread van drivers (id, name)
- Street: Delivery routes (id, name)
- Drive: Scheduled delivery runs (driver + street + time)
- StopRequest: Resident requests for stops during drives

2. Status Values:
- Drive Status: SCHEDULED, EN_ROUTE, DONE
- Stop Request Status: REQUESTED, SERVICED

3. Relationships
- Driver → Drive (1:many)
- Street → Drive (1:many)
- Drive → StopRequest (1:many)

