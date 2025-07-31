# Medalyst Ticketing System

A full-stack ticketing system built with Node.js, Express, MongoDB, React, and TypeScript.

## 🚀 Features

- **User Authentication**: JWT-based authentication with login/register
- **Ticket Management**: Create, read, update, and delete tickets
- **Status Tracking**: Track ticket status (Open, In Progress, Closed)
- **API Documentation**: Interactive Swagger documentation
- **Docker Support**: Containerized development environment
- **TypeScript**: Full TypeScript support for both frontend and backend

## 📋 Prerequisites

- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Node.js 20+** (if running locally)
- **pnpm** (if running locally)

## 🛠️ Setup Options

### Docker Setup


```bash
# Clone the repository
git clone https://github.com/medalyst/ticketing.git
cd ticketing

# Start all services
docker-compose up

# Or run in detached mode
docker-compose up -d

# To rebuild after changes
docker-compose up --build

# To stop all services
docker-compose down
```

**Services will be available at:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5050
- **Swagger Docs**: http://localhost:5050/api-docs
- **MongoDB**: localhost:27017

## 📁 Project Structure

```
medalyst-ticketing/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Database and Swagger config
│   │   ├── middleware/     # Authentication middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Main server file
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React/TypeScript app
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── context/       # React context (auth)
│   │   ├── pages/         # React pages/components
│   │   └── main.tsx       # Main React entry
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Docker services configuration
└── README.md
```

## 📚 API Documentation

Interactive API documentation is available via Swagger UI:

**URL**: http://localhost:5050/api-docs

