# OpsPilot – Enterprise Asset Management Platform

OpsPilot is a full-stack Enterprise Asset Management Platform for managing company hardware, asset allocations, maintenance workflows, and operational analytics.

## Key Features

- **Asset Management** – Register, track, search, and manage company hardware.
- **Asset Allocation** – Assign hardware to employees and track allocation history.
- **Issue Management** – Employees can report hardware issues for review and resolution.
- **Maintenance Workflow** – Manage technician dispatch, work orders, repairs, and maintenance records.
- **Role-Based Access** – Dedicated workflows for Admin, Manager, Technician, and Employee.
- **Reports & Analytics** – Inventory, allocation, maintenance, and lifecycle reports with filters, charts, and CSV export.
- **Dashboards** – Role-specific dashboards for monitoring assets, allocations, maintenance, and operational activity.

## Workflow

```text
Asset Registration
       ↓
Asset Allocation
       ↓
Issue Reporting
       ↓
Issue Review
       ↓
Work Order
       ↓
Maintenance
       ↓
Resolution
       ↓
Reporting
````

## Screenshots

### Admin Dashboard

<img width="622" height="579" alt="image" src="https://github.com/user-attachments/assets/0f4803f7-2b44-4ded-ab0e-ba6c008caff1" />

### Employee Workspace

<img width="1114" height="590" alt="image" src="https://github.com/user-attachments/assets/28908860-16c9-4491-8048-3f8dcce675fa" />


### Manager Operations
<img width="1066" height="583" alt="image" src="https://github.com/user-attachments/assets/4084b5ba-57c2-44ed-834a-b96e85bf6899" />


### Technician Workbench

<img width="1082" height="575" alt="image" src="https://github.com/user-attachments/assets/f1e4aa36-6177-411e-8f69-227d830e1974" />


### Reports & Analytics

<img width="631" height="525" alt="image" src="https://github.com/user-attachments/assets/301ac500-0373-479d-88d8-616efc37c919" />


### Login
<img width="550" alt="Admin Dashboard" src="https://github.com/user-attachments/assets/71243d4f-abd5-40d1-a48e-466425c0544d" />


## Technology Stack

**Backend:** Java, Spring Boot, Spring Security, Spring Data JPA, Hibernate, JWT, Maven

**Database:** PostgreSQL, Flyway

**Frontend:** React, TypeScript, Vite, Recharts

**Tools:** IntelliJ IDEA, VS Code, Postman, Git, GitHub

## Architecture

```text
React + TypeScript
        ↓
     REST API
        ↓
Spring Boot Backend
        ↓
Controller → Service → Repository
        ↓
     PostgreSQL
```

## Authentication & Authorization

* JWT-based authentication
* Spring Security
* Role-Based Access Control
* Roles: `ADMIN`, `MANAGER`, `TECHNICIAN`, `EMPLOYEE`

## Project Structure

```text
Enterprise-Asset-Management/
├── backend/
├── frontend/
├── docs/
│   └── screenshots/
└── README.md
```

## Getting Started

### Clone

```bash
git clone https://github.com/Chaitali-ag05/Enterprise-Asset-Management.git
cd Enterprise-Asset-Management
```

### Backend

```bash
cd backend
```

Configure PostgreSQL and the application's database properties, then run the Spring Boot application.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Project Highlights

* Full-stack enterprise application
* Role-based operational workflows
* JWT-secured REST APIs
* PostgreSQL database with Flyway migrations
* Interactive dashboards and analytics
* CSV reporting and export

