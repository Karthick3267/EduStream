# Walkthrough: EduStream — Paperless Scholarship Disbursement Platform & RAG AI Advisor

The **EduStream Paperless Scholarship Disbursement Platform** is a full-stack MERN application equipped with an intelligent **Retrieval-Augmented Generation (RAG)** system for scholarship advisory, eligibility assessment, document scrutiny guidelines, and Direct Benefit Transfer (DBT) tracking.

---

## 🌐 Running Services

| Service | Address | Description | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Application** | `http://localhost:3000` | Vite + React 19 SPA with RAG Assistant Drawer, Tailwind CSS, Lucide Icons | **ACTIVE** |
| **Backend REST API** | `http://localhost:5000` | Node.js + Express API, RAG Endpoints (`/api/rag/*`), JWT Auth | **ACTIVE** |
| **Database Engine** | `mongodb://127.0.0.1:57717/` | Embedded in-memory MongoDB engine with pre-seeded data & RAG corpus | **CONNECTED** |
| **RAG Knowledge Base** | `http://localhost:3000/knowledge` | Official policy guidelines, Tehsildar issuing rules, DBT circulars | **LIVE** |
| **Healthcheck Endpoint** | `http://localhost:5000/api/health` | Service health & uptime verification | **HEALTHY** |
| **Standalone Demo HTML** | `edustream-standalone.html` | Self-contained, zero-dependency offline version with embedded RAG AI chat | **READY** |

---

## 🤖 Retrieval-Augmented Generation (RAG) Architecture

EduStream incorporates a **Dual-Mode RAG Engine**:

```
                                      +------------------------------------+
                                      |       User Query / Student         |
                                      +-----------------+------------------+
                                                        |
                                                        v
                                      +------------------------------------+
                                      |     RAG Controller (/api/rag/ask)  |
                                      +-----------------+------------------+
                                                        |
                                   +--------------------+--------------------+
                                   |                                         |
                                   v                                         v
                 +-----------------------------------+     +-----------------------------------+
                 |    Semantic Retrieval Index       |     |      Student Profile Grounding    |
                 | - TF-IDF / BM25 Vector Weights    |     | - Academic Percentage             |
                 | - Official Policy Documents       |     | - Annual Family Income            |
                 | - Live Mongoose Active Schemes    |     | - Social Category & Gender        |
                 +-----------------+-----------------+     +-----------------+-----------------+
                                   |                                         |
                                   +--------------------+--------------------+
                                                        |
                                                        v
                                      +------------------------------------+
                                      |       Dual-Mode Synthesis          |
                                      |                                    |
                                      | [Mode A: GEMINI_API_KEY present]   |
                                      |  -> Google Gemini 3.8 Flash via    |
                                      |     @google/genai SDK              |
                                      |                                    |
                                      | [Mode B: Offline / Zero-Config]    |
                                      |  -> Embedded Semantic Rule Engine  |
                                      |     with Policy Citations          |
                                      +-----------------+------------------+
                                                        |
                                                        v
                                      +------------------------------------+
                                      | - Formatted Grounded Markdown      |
                                      | - Official Government Citations    |
                                      | - 1-Click Apply Scheme Cards       |
                                      +------------------------------------+
```

### Key RAG Features
1. **Zero-Config Guarantee**: Works out-of-the-box offline without requiring any paid API key, while automatically scaling to **Google Gemini 3.8 Flash** when `GEMINI_API_KEY` is present.
2. **Student Profile Interoperability**: Intersects the student's marks percentage, annual income ceiling, gender, and social category with active database schemes, explaining exactly why they qualify.
3. **Official Document Rubrics**: Directly answers Tehsildar issuing authority rules, valid financial year cutoffs, defective document reasons, and bonafide AISHE code requirements.
4. **Disbursement & UTR Lookup**: Explains PFMS / Direct Benefit Transfer protocols, NPCI Aadhaar bank mapping, and how to track unique transaction reference (UTR) numbers.

---

## 🔑 1-Click Demo Credentials

You can log in directly using the pre-seeded credentials below or by clicking the **"1-Click Demo Personas"** buttons on the login page or top navigation bar:

| Persona | Role | Email | Password | Pre-loaded Context |
| :--- | :--- | :--- | :--- | :--- |
| **Student (Rahul Sharma)** | `student` | `rahul.sharma@student.edu` | `Student@123` | Apex Institute, B.Tech CS, 86.4% marks, ₹2.2L income (OBC) |
| **Student (Priya Patel)** | `student` | `priya.patel@student.edu` | `Student@123` | NCE, B.Tech EC, 91.2% marks, ₹1.8L income (Female, General, STEM Sanctioned) |
| **College Staff** | `institution_staff` | `staff@apex.edu` | `Staff@123` | Verifier for Apex Institute of Technology |
| **Administrator** | `admin` | `admin@scholarships.gov` | `Admin@123` | Central Board Officer (Scheme CRUD, Sanctions) |
| **Finance Officer** | `finance_officer` | `finance@treasury.gov` | `Finance@123` | Treasury Desk (UTR recording, DBT disbursement) |

---

## 🧪 Automated Test Verification

All 13 automated integration tests pass cleanly:

```
--- STARTING AUTOMATED BACKEND INTEGRATION TESTS ---

Initializing embedded in-memory MongoDB engine for zero-friction local execution...
Connected to Embedded MongoDB at: mongodb://127.0.0.1:57717/
Seeding initial data for Paperless Scholarship Disbursement Platform...
Seed completed successfully!
📚 [RAG] Seeding default knowledge base documents...
✅ [RAG] Vector & Semantic Index loaded (12 documents indexed). Mode: Local Semantic Engine
  PASS: Healthcheck returns 200 and healthy
  PASS: Public institutions endpoint lists active colleges
  PASS: Student can log in and receives JWT token
  PASS: Institution Staff can log in
  PASS: Scholarship Administrator can log in
  PASS: Finance Officer can log in
  PASS: Security guard: Student blocked with 403 Forbidden from accessing Admin applications endpoint
  PASS: Student can fetch own profile with academic and bank details
  PASS: Staff can fetch application queue for their assigned institution
  PASS: Admin can fetch aggregated system metrics and KPI cards
  PASS: Finance officer can view disbursement records
  PASS: RAG knowledge base returns indexed policy directives and document guidelines
  PASS: RAG query endpoint processes eligibility query, returns grounded citations, and recommends matching schemes

TEST RESULTS: 13 passed, 0 failed.
```

---

## 💡 How to Test the RAG Assistant & Knowledge Base

### 1. Interactive Floating AI Assistant
1. Open **`http://localhost:3000`** in your browser.
2. Click the floating **"Ask EduStream AI"** button in the bottom-right corner.
3. Try clicking any of the pre-configured prompt chips:
   - *"What scholarships am I eligible for?"*
   - *"Income certificate issuing authority rules"*
   - *"Bonafide certificate AISHE requirements"*
   - *"How does DBT payout and UTR tracking work?"*
   - *"Why was my application marked Defective?"*
4. Notice the grounded answer, official source citations, and interactive scheme cards with **"Apply for Scheme"** buttons!

### 2. Testing as Authenticated Students
- **As Rahul Sharma** (`rahul.sharma@student.edu`):
  - Ask: *"What scholarships can I apply for?"*
  - RAG automatically extracts Rahul's marks (86.4%), income (₹2,20,000), gender (Male), and category (OBC).
  - Recommends: **Post-Matric Technical Scholarship** (₹35,000) and **Merit-cum-Means Scholarship** (₹50,000), while correctly excluding the Women in STEM fellowship.
- **As Priya Patel** (`priya.patel@student.edu`):
  - Ask: *"What scholarships are available for female STEM students?"*
  - RAG verifies her gender (Female) and academic cutoff (91.2%), recommending the **National STEM Excellence Grant for Women** (₹75,000)!

### 3. Dedicated Knowledge Base Page
1. Click **"Knowledge Base"** in the top navigation bar or navigate to **`http://localhost:3000/knowledge`**.
2. Filter circulars by category (**Eligibility**, **Documents**, **Disbursement**, **Verification**, **General**).
3. Search keywords like *"tehsildar"*, *"dbt"*, or *"attendance"*.
4. Click **"Ask AI"** on any card to immediately open the RAG drawer pre-populated with questions about that guideline.
