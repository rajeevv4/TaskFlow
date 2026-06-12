# TaskFlow – Full Stack Project Management Platform

TaskFlow is a full-stack project management application built using the MERN stack (MongoDB, Express.js, React.js, and Node.js). It enables teams to create projects, manage tasks, track progress, and collaborate through an intuitive and responsive interface.

## Features

* Project creation and management
* Task assignment and tracking
* Task status updates and workflow management
* Interactive Kanban-style task board
* Responsive user interface
* RESTful API architecture
* MongoDB database integration
* Modular and scalable code structure

## Tech Stack

### Frontend

* React.js
* Tailwind CSS
* React Router
* Axios
* Headless UI

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Additional Packages

* Joi Validation
* UUID
* Dotenv
* Cors

---

## Installation & Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd taskflow
```

### 2. Install Dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the backend folder:

```env
MONGODB_PATH=your_mongodb_connection_string
SERVER_PORT=9000
CORS_ORIGIN=http://localhost:3000
```

### 4. Start Backend Server

```bash
cd backend
npm run serve
```

### 5. Start Frontend

```bash
cd frontend
npm start
```

---

## Project Architecture

Frontend (React)
↓
REST APIs
↓
Backend (Node.js + Express)
↓
MongoDB Database

---

## Key Learning Outcomes

* Building scalable full-stack web applications
* Designing RESTful APIs
* Managing application state in React
* Database modeling with MongoDB
* Client-server communication using Axios
* Implementing modular backend architecture

---

## Future Enhancements

* User Authentication & Authorization
* Role-Based Access Control
* Real-Time Notifications
* Team Collaboration Features
* Activity Logs & Analytics Dashboard
* Cloud Deployment Support

---

## Author

Rajeev Karakoti
