/**
 * EduStream RAG Knowledge Base Corpus
 * Official government directives, document validation rubrics, DBT disbursement protocols, and FAQs.
 */

const RAG_KNOWLEDGE_DOCS = [
  {
    title: 'Income Certificate Verification & Issuing Authority Standards',
    category: 'Documents',
    schemeCode: null,
    sourceRef: 'Ministry of Social Justice Circular No. 2026/REV-09',
    tags: ['income certificate', 'tehsildar', 'revenue officer', 'sdm', 'validity', 'defective'],
    summary: 'Guidelines on acceptable issuing authorities, validity periods, and digital verification for family income certificates.',
    content: `
# Income Certificate Verification & Issuing Authority Standards

### 1. Competent Issuing Authority
An Income Certificate submitted on EduStream is considered valid only if issued and digitally signed by an authorized revenue authority:
- Tehsildar / Naib Tehsildar / Taluk Executive Magistrate
- Sub-Divisional Magistrate (SDM) / Revenue Divisional Officer (RDO)
- District Magistrate / Deputy Commissioner
- Authorized State e-Governance portals (e.g., MeeSeva, e-District, Nadakacheri) with verifiable digital signature and 2D barcode / QR code.

> **NOT ACCEPTABLE:** Affidavits on notary stamp papers, salary slips from private employers without Form 16, or letters from village heads/panchayat members are NOT accepted as substitute income proof. Submissions containing these will be marked as **Defective** during College Scrutiny.

### 2. Validity Period
- Income certificates must be issued on or after April 1st of the preceding financial year (validity is 1 financial year unless the certificate explicitly states a multi-year validity).
- For academic year 2026-2027, certificates issued before April 1, 2025 are expired.

### 3. Verification Rubric for College Scrutiny Staff
- Compare the annual gross income printed on the certificate against the amount declared in the student's EduStream profile.
- Verify that the certificate is in the name of the parent/guardian or mentions the student's father/mother name matching 10th marks card records.
- Ensure certificate QR code or application reference number is legible.
    `.trim(),
  },
  {
    title: 'Caste & Category Certificate Compliance Rubric',
    category: 'Documents',
    schemeCode: null,
    sourceRef: 'National Commission for Backward Classes & Ministry of Tribal Affairs 2026',
    tags: ['caste certificate', 'obc', 'ncl', 'sc', 'st', 'ews', 'category'],
    summary: 'Specifications for SC, ST, OBC (Non-Creamy Layer), and EWS certificates for reservation-based scholarships.',
    content: `
# Caste & Category Certificate Compliance Rubric

### 1. SC / ST Category Certificates
- Permanent caste certificates issued by the Competent Revenue Authority (SDM/Tehsildar) remain valid for life unless revoked.
- The applicant's name, parent's name, and sub-caste must match school records and Aadhaar database.

### 2. OBC Non-Creamy Layer (OBC-NCL)
- To avail OBC reserved benefits or fee waivers, an OBC-NCL certificate issued within the past 12 months is mandatory.
- A central format OBC certificate is required for Central Government sponsored schemes.
- The certificate must explicitly state that the candidate does not belong to the Creamy Layer section as per DoPT guidelines.

### 3. Economically Weaker Section (EWS)
- EWS certificates are valid for the financial year of issuance only.
- Annual family income must be below ₹8,00,000, and candidates must satisfy the asset ceiling limits specified by the Department of Higher Education.
    `.trim(),
  },
  {
    title: 'Bonafide Certificate & Institutional Verification Standards',
    category: 'Verification',
    schemeCode: null,
    sourceRef: 'Higher Education Department Institutional Scrutiny Manual 2026',
    tags: ['bonafide', 'attendance', 'college verification', 'aishe', 'fees'],
    summary: 'Mandatory items required in College Bonafide Certificates and Level-1 institutional scrutiny protocol.',
    content: `
# Bonafide Certificate & Institutional Verification Standards

### 1. Bonafide Certificate Requirements
The Institutional Bonafide Certificate must be issued on official college letterhead and contain:
- Name of the Institution and its registered AISHE (All India Survey on Higher Education) Code.
- Student's Full Legal Name and University Registration / Roll Number.
- Degree program, department, current academic year, and semester (e.g., B.Tech Computer Science, 3rd Year / 6th Semester).
- Academic Year (e.g., 2026-2027).
- Official seal/stamp and signature of the Principal, Dean, or Registrar.

### 2. College Scrutiny Workflow (Level 1)
- **Turnaround Time:** Colleges must verify submitted applications within 14 working days of student submission.
- **Attendance Requirement:** Minimum 75% attendance in the preceding semester is mandatory for merit and technical grants.
- **Actions Available:**
  1. **Verify & Recommend:** Forward application to the State Scholarship Board (Level 2).
  2. **Mark Defective:** Return to student with specific corrective instructions (e.g., "Income certificate scan is blurred; re-upload clear copy").
  3. **Reject:** Mark ineligible if student failed exams, was expelled, or violates core criteria.
    `.trim(),
  },
  {
    title: 'Direct Benefit Transfer (DBT) & PFMS Credit Architecture',
    category: 'Disbursement',
    schemeCode: null,
    sourceRef: 'Public Financial Management System (PFMS) & NPCI Circular 2026',
    tags: ['dbt', 'pfms', 'utr', 'bank account', 'aadhaar seeding', 'disbursement', 'npci'],
    summary: 'How payments are processed directly to student bank accounts, Aadhaar seeding criteria, and UTR lookup.',
    content: `
# Direct Benefit Transfer (DBT) & PFMS Credit Architecture

### 1. Aadhaar Seeding & NPCI Mapping
Under the Direct Benefit Transfer mandate, scholarship funds are disbursed directly into the beneficiary's bank account via the Public Financial Management System (PFMS) / National Automated Clearing House (NACH):
- The bank account must be actively **Aadhaar-seeded** (mapped in NPCI mapper).
- Accounts under moratorium, frozen accounts, or minor accounts will trigger transaction failures with error code \`DBT-ACC-FAILED\`.
- Joint accounts are not recommended. If a joint account is submitted, the scholarship applicant must be the primary account holder.

### 2. Unique Transaction Reference (UTR) Tracking
- When the State Treasury / Finance Officer approves a disbursement batch, a government payment order is generated.
- Once cleared by the Reserve Bank of India / clearing bank, a 12-to-18 character **UTR (Unique Transaction Reference)** number is minted and stored on the EduStream ledger.
- Students can present this UTR number to their bank branch if funds do not reflect within 48 hours of disbursement status being marked \`Credited\`.

### 3. Payment Status Lifecycle
- \`Queued\`: Disbursement voucher generated by Finance Dept; waiting for bank gateway batch.
- \`Processing\`: Sent to RBI / PFMS gateway.
- \`Credited\`: Transaction settled, UTR minted, SMS notification dispatched.
- \`Failed\`: Bank returned failure (e.g. invalid IFSC, closed account, dormant account). Student can update bank details for auto-retry.
    `.trim(),
  },
  {
    title: 'Merit-cum-Means (MCM) Scholarship Policy & Eligibility Rules',
    category: 'Eligibility',
    schemeCode: 'MCM-2026',
    sourceRef: 'Central Directorate of Higher Education Scheme Guideline #MCM-2026',
    tags: ['mcm-2026', 'merit', 'means', 'eligibility', 'percentage', 'income'],
    summary: 'Full eligibility criteria, financial assistance amounts, and renewal clauses for Merit-cum-Means scholarship.',
    content: `
# Merit-cum-Means (MCM) Scholarship Policy & Eligibility Rules

### 1. Scheme Overview
The Merit-cum-Means (MCM) Scholarship provides financial assistance to meritorious students belonging to economically disadvantaged backgrounds to enable them to pursue higher professional and general degrees.

### 2. Eligibility Requirements
- **Academic Performance:** Minimum **60.0%** aggregate marks (or 6.5 CGPA out of 10) in the previous qualifying examination (12th board or previous degree semester).
- **Annual Family Gross Income:** Total annual income from all sources must not exceed **₹2,50,000** (Rupees Two Lakh Fifty Thousand only).
- **Course of Study:** Full-time undergraduate or postgraduate students in recognized government, aided, or accredited private institutions.
- **Gender & Category:** Open to all genders and all social categories (General, OBC, SC, ST, EWS).

### 3. Financial Benefits
- Direct grant of **₹25,000 per academic year** deposited directly into the student's Aadhaar-seeded bank account.

### 4. Mandatory Documents
1. Latest Marksheet of qualifying examination.
2. Income Certificate issued by Tehsildar (issued after April 1, 2025).
3. Institutional Bonafide Certificate with college AISHE code.
4. Aadhaar Card copy.
5. First page of bank passbook or cancelled cheque.
    `.trim(),
  },
  {
    title: 'Women in STEM Excellence Fellowship Policy & Guidelines',
    category: 'Eligibility',
    schemeCode: 'STEM-2026',
    sourceRef: 'National Science & Technology Development Board Directive #STEM-W-2026',
    tags: ['stem-2026', 'women in stem', 'female', 'engineering', 'science', 'fellowship'],
    summary: 'Rules, quota, academic cut-offs, and stipend details for the Women in STEM Fellowship.',
    content: `
# Women in STEM Excellence Fellowship Policy & Guidelines

### 1. Scheme Overview
The Women in STEM Excellence Fellowship aims to incentivize and support female students pursuing higher education and research in Science, Technology, Engineering, and Mathematics disciplines.

### 2. Eligibility Criteria
- **Gender:** Strictly reserved for **Female** students.
- **Eligible Programs:** B.Tech, B.E., M.Tech, M.Sc (Physics, Chemistry, Math, Data Science), or MCA from UGC/AICTE recognized institutions.
- **Academic Performance:** Minimum **75.0%** aggregate marks (or 8.0 CGPA) in the previous qualifying exam.
- **Annual Family Income:** Ceiling of **₹6,00,000** per annum.
- **Age Limit:** Under 28 years at the time of application.

### 3. Financial Assistance
- **₹50,000 per academic year** disbursed in a single installment via Direct Benefit Transfer.
- Includes a laptop/book allowance component of ₹10,000 within the total sanction.

### 4. Renewal Conditions
- Students must maintain minimum 70% aggregate marks in subsequent semesters with no active academic backlogs.
    `.trim(),
  },
  {
    title: 'Post-Matric Technical Education Grant Guidelines',
    category: 'Eligibility',
    schemeCode: 'TECH-2026',
    sourceRef: 'State Directorate of Technical Education Notice #TECH-PM-2026',
    tags: ['tech-2026', 'technical grant', 'engineering', 'polytechnic', 'diploma'],
    summary: 'Eligibility criteria, income limits, and funding rules for professional engineering and diploma students.',
    content: `
# Post-Matric Technical Education Grant Guidelines

### 1. Scheme Purpose
Financial assistance toward tuition fee reimbursement and living allowance for diploma, engineering, pharmacy, and professional polytechnic students.

### 2. Eligibility Criteria
- **Programs:** Engineering (B.Tech/B.E.), Polytechnic Diploma, Pharmacy (B.Pharm), Architecture (B.Arch).
- **Academic Cut-off:** Minimum **55.0%** aggregate marks.
- **Income Ceiling:** Annual family income must not exceed **₹4,50,000**.
- **Social Categories:** General, OBC, SC, ST, EWS, and Religious Minorities.

### 3. Award Amount
- **₹30,000 per academic year** disbursed directly to the student's verified bank account upon Level 2 State Approval.
    `.trim(),
  },
  {
    title: 'Document Defect Remediation & Resubmission Protocol',
    category: 'Documents',
    schemeCode: null,
    sourceRef: 'EduStream Helpdesk Standard Operating Procedure SOP-04',
    tags: ['defect', 'correction', 're-upload', 'clarification', 'remediation', 'timeline'],
    summary: 'Step-by-step guidance on how students can rectify applications marked Defective by college verifiers.',
    content: `
# Document Defect Remediation & Resubmission Protocol

### 1. What Does "Defective" Mean?
When an application is marked **Defective**, it has NOT been permanently rejected. The college scrutinizer or state officer identified a correctable issue (such as an illegible scan, missing seal, expired income certificate, or mismatched name).

### 2. Time Limit for Rectification
- Students have **7 calendar days** from the date of the defect notice to log in and upload corrected documents.
- Failure to re-submit within 7 days results in auto-rejection by the system.

### 3. Top Common Defects & Solutions
- **Defect: "Income Certificate Illegible or Blurry"**
  - *Fix:* Scan the physical certificate using a flatbed scanner or high-res phone scanner app at 300 DPI. File size must be between 100 KB and 2 MB in PDF or JPEG format.
- **Defect: "Name Mismatch with Aadhaar"**
  - *Fix:* Upload a 10th Marks card copy and an affidavit or Gazette notification acknowledging alias or married name.
- **Defect: "Bonafide Missing AISHE Code"**
  - *Fix:* Request your college administration office to issue a fresh bonafide with the college's official AISHE number stamped on letterhead.
    `.trim(),
  },
  {
    title: 'Audit Trail, Transparency & Fraud Prevention Policy',
    category: 'General',
    schemeCode: null,
    sourceRef: 'State Vigilance & Transparency Directorate Circular 2026',
    tags: ['audit log', 'fraud prevention', 'transparency', 'anti-corruption', 'timestamp'],
    summary: 'Immutability of logs, multi-tier approvals, and duplicate application detection in EduStream.',
    content: `
# Audit Trail, Transparency & Fraud Prevention Policy

### 1. Immutable Audit Logging
Every action on EduStream is permanently recorded in the system audit trail:
- User ID, IP address, timestamp, role, and action type.
- Verification notes entered by institutional staff cannot be purged or altered.
- Approval and rejection timestamps are cryptographically hashed.

### 2. Duplicate Detection
- The platform uses Aadhaar hashing, bank account numbers, and 10th standard roll numbers to detect duplicate applications across institutions.
- Students attempting to claim multiple government merit scholarships for the same academic year will be flagged by automated cross-scheme reconcilers.
    `.trim(),
  },
];

module.exports = { RAG_KNOWLEDGE_DOCS };
