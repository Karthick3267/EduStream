# EduStream — Paperless Scholarship Disbursement Platform

A comprehensive, full-stack **MERN** web platform designed to eliminate physical paperwork, manual verification delays, and opaque fund disbursals in scholarship administration.

EduStream connects **Students**, **College / Institution Staff**, **Scholarship Administrators**, and **Finance / Treasury Officers** into an auditable, multi-stage approval and Direct Benefit Transfer (DBT) tracking workflow.

---

## 🚀 Key Highlights & Architectural Features

- **100% Paperless Workflow**: Digital profile creation, criteria screening, supporting document uploads (marksheets, income certificate, bonafide), institutional scrutiny, administrative sanction, and DBT payment execution.
- **Strict Role-Based Access Control (RBAC)**: Enforced both on the Express backend middleware and React client navigation across 4 distinct user roles:
  1. **Student**
  2. **Institution Staff**
  3. **Scholarship Administrator**
  4. **Finance / Disbursement Officer**
- **Dual-Mode MongoDB Integration**:
  - Automatically connects to `MONGODB_URI` (Atlas or local MongoDB) if configured.
  - Seamlessly falls back to an embedded in-memory MongoDB engine (`mongodb-memory-server`) with zero external installation required.
  - Auto-seeds realistic sample colleges, schemes, applications, and accounts across all 4 roles.
- **Append-Only Audit Trail & State Machine**: State transitions (`Submitted` $\to$ `Under Institution Review` $\to$ `Correction Required` / `Institution Approved` $\to$ `Under Admin Review` $\to$ `Approved` $\to$ `Disbursed`) are strictly guarded on the backend.
- **Secured Document Management**: Uploaded certificates and marksheets are stored in protected directories and streamed through an authenticated endpoint verifying applicant ownership or institutional clearance.
- **1-Click Demo Persona Switcher**: Embedded directly in the navbar and login page for examiners, evaluators, and reviewers to instantly test all 4 perspectives without manual typing.

---

## 👥 Demo Accounts for College Presentation

| Role | Email | Password | Pre-seeded Context |
| :--- | :--- | :--- | :--- |
| **Student (Rahul)** | `rahul.sharma@student.edu` | `Student@123` | Apex Institute, B.Tech CS (Application under review) |
| **Student (Priya)** | `priya.patel@student.edu` | `Student@123` | National College, STEM Grant (Approved & Queued for DBT) |
| **Institution Staff** | `staff@apex.edu` | `Staff@123` | Scrutinizes documents for Apex Institute of Technology |
| **Administrator** | `admin@scholarships.gov` | `Admin@123` | State Scholarship Board (Scheme management & Sanctions) |
| **Finance Officer** | `finance@treasury.gov` | `Finance@123` | Treasury Desk (Records UTR transaction reference, DBT execution) |

*(All accounts are also accessible via the **1-Click Demo Buttons** on the Login page and Navbar).*

---

## 🔄 End-to-End Scholarship Lifecycle

```
[Draft]
  │ (Student Submits Profile Snapshot & Uploads Docs)
  ▼
[Submitted]
  │ (College Staff Picks up from Institution Queue)
  ▼
[Under Institution Review] ──(Defect in Document)──► [Correction Required]
  │                                                           │ (Student re-submits file)
  │ (College Approves Bonafide & Docs)                        └────────► [Submitted]
  ▼
[Institution Approved]
  │ (Board Administrator Scrutinizes)
  ▼
[Under Administrative Review]
  │
  ├─────────────────────────────────────────► [Rejected]
  ▼ (Board Grants Sanction)
[Approved]
  │ (Auto-Queued for Treasury Payment)
  ▼
[Under Disbursement]
  │
  ├─────────────────────────────────────────► [Payment Failed] (Allows Retry)
  ▼ (Finance records UTR Reference Number)
[Disbursed] (Completed & Notification Dispatched)
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, React Router DOM v7, Axios.
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), `bcryptjs`, `multer`, `cors`.
- **Database**: MongoDB with Mongoose (with dual-mode fallback).
- **Security**: Password hashing, JWT bearer verification, RBAC middleware, MIME type validation, 5MB file upload cap, append-only status log.

---

## 💻 Installation & Running Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev   # Or npm start
```
*The backend automatically starts on `http://localhost:5000` and self-seeds demo data.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The Vite frontend starts on `http://localhost:3000` with hot module replacement.*

### 3. Automated Test Suite
To run the automated integration test suite:
```bash
cd backend
npm test
```
*Runs 11 automated integration tests verifying healthcheck, public colleges listing, multi-role authentication, role-based 403 authorization guards, student profile fetching, and disbursement retrieval.*

---

## 📑 REST API Specification

### Authentication & Profiles
- `POST /api/auth/register` — Student registration with college selection
- `POST /api/auth/login` — Authentication returning JWT token & user payload
- `GET /api/auth/me` — Currently authenticated user details
- `GET /api/auth/institutions` — Active colleges listing for dropdowns
- `GET /api/student/profile` — Fetch student academic and DBT bank account info
- `PUT /api/student/profile` — Update student academic, personal, and bank details

### Schemes & Applications
- `GET /api/scholarships` — Browse active scholarship schemes
- `GET /api/scholarships/:id` — Specific scheme details & eligibility rules
- `POST /api/scholarships` — Admin: Publish new scholarship scheme
- `PATCH /api/scholarships/:id/status` — Admin: Toggle Active/Closed scheme status
- `POST /api/applications` — Student: Submit application with profile snapshot
- `GET /api/applications/my` — Student: List submitted applications
- `GET /api/applications/:id` — Full application breakdown, documents, and timeline
- `POST /api/applications/:id/documents` — Student: Multipart file upload for required documents

### Institutional Scrutiny & Board Sanction
- `GET /api/verification/applications` — College Staff: View applications from own institution
- `PATCH /api/verification/applications/:id/verify-document` — Staff: Mark document `Verified` or `Defective` with remarks
- `PATCH /api/verification/applications/:id/decision` — Staff: Submit review (`Institution Approved`, `Correction Required`, `Institution Rejected`)
- `GET /api/admin/applications` — Admin: Global registry across all colleges
- `PATCH /api/admin/applications/:id/decision` — Admin: Issue final sanction (`Approved`, `Rejected`)
- `GET /api/admin/metrics` — Admin: Aggregated KPI analytics and audit logs

### Treasury & Disbursement
- `GET /api/disbursements` — Finance: View applications queued for payment
- `POST /api/disbursements/process` — Finance: Record UTR number, date, mode, and mark `Disbursed`
- `GET /api/disbursements/summary` — Finance: Treasury funds overview

---

## 📜 College Project Evaluation Notes
- **Simulated DBT Workflow**: Real bank payment gateways require institutional banking clearances; this platform implements a realistic treasury disbursement workflow recording real UTR transaction reference numbers, bank accounts, and payment dates with full audit logging.
- **Zero Configuration**: Evaluators can run the project on any computer without needing an external database server, thanks to the automatic embedded database layer.
