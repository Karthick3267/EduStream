const http = require('http');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');

// Lightweight test runner without external framework dependencies
let server;
let baseUrl;

const request = async (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(rawData);
          } catch (e) {
            parsed = rawData;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        });
      }
    );

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('\n--- STARTING AUTOMATED BACKEND INTEGRATION TESTS ---\n');
  process.env.NODE_ENV = 'test';

  await connectDB();
  const ragService = require('../src/services/ragService');
  await ragService.initialize();
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;

  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`  PASS: ${title}`);
      passed++;
    } else {
      console.error(`  FAIL: ${title}`);
      failed++;
    }
  };

  try {
    // 1. Healthcheck
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'healthy', 'Healthcheck returns 200 and healthy');

    // 2. Institutions Public List
    const instRes = await request('GET', '/api/auth/institutions');
    assert(instRes.status === 200 && instRes.body.institutions.length >= 3, 'Public institutions endpoint lists active colleges');

    // 3. Student Login
    const studentLogin = await request('POST', '/api/auth/login', {
      email: 'rahul.sharma@student.edu',
      password: 'Student@123',
    });
    assert(studentLogin.status === 200 && studentLogin.body.token, 'Student can log in and receives JWT token');
    const studentToken = studentLogin.body.token;

    // 4. Institution Staff Login
    const staffLogin = await request('POST', '/api/auth/login', {
      email: 'staff@apex.edu',
      password: 'Staff@123',
    });
    assert(staffLogin.status === 200 && staffLogin.body.token, 'Institution Staff can log in');
    const staffToken = staffLogin.body.token;

    // 5. Admin Login
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@scholarships.gov',
      password: 'Admin@123',
    });
    assert(adminLogin.status === 200 && adminLogin.body.token, 'Scholarship Administrator can log in');
    const adminToken = adminLogin.body.token;

    // 6. Finance Officer Login
    const finLogin = await request('POST', '/api/auth/login', {
      email: 'finance@treasury.gov',
      password: 'Finance@123',
    });
    assert(finLogin.status === 200 && finLogin.body.token, 'Finance Officer can log in');
    const finToken = finLogin.body.token;

    // 7. Security Role Authorization Check (Negative test: student attempting admin actions)
    const unauthorizedAttempt = await request('GET', '/api/admin/applications', null, studentToken);
    assert(
      unauthorizedAttempt.status === 403,
      'Security guard: Student blocked with 403 Forbidden from accessing Admin applications endpoint'
    );

    // 8. Student Profile Access
    const profileRes = await request('GET', '/api/student/profile', null, studentToken);
    assert(
      profileRes.status === 200 && profileRes.body.profile.course === 'B.Tech Computer Science',
      'Student can fetch own profile with academic and bank details'
    );

    // 9. Staff retrieves institutional queue
    const staffQueue = await request('GET', '/api/verification/applications', null, staffToken);
    assert(
      staffQueue.status === 200 && Array.isArray(staffQueue.body.applications),
      'Staff can fetch application queue for their assigned institution'
    );

    // 10. Admin retrieves global metrics
    const metricsRes = await request('GET', '/api/admin/metrics', null, adminToken);
    assert(
      metricsRes.status === 200 && metricsRes.body.metrics.totalApplications >= 3,
      'Admin can fetch aggregated system metrics and KPI cards'
    );

    // 11. Finance retrieves disbursements list
    const disbRes = await request('GET', '/api/disbursements', null, finToken);
    assert(
      disbRes.status === 200 && Array.isArray(disbRes.body.disbursements),
      'Finance officer can view disbursement records'
    );

    // 12. RAG Knowledge Corpus Retrieval
    const knowledgeRes = await request('GET', '/api/rag/knowledge');
    assert(
      knowledgeRes.status === 200 && Array.isArray(knowledgeRes.body.data) && knowledgeRes.body.data.length >= 5,
      'RAG knowledge base returns indexed policy directives and document guidelines'
    );

    // 13. RAG Query Processing with Student Profile Grounding
    const ragQueryRes = await request(
      'POST',
      '/api/rag/ask',
      { query: 'What scholarships can I apply for if my family income is under 2.5 lakhs and what are the income certificate rules?' },
      studentToken
    );
    assert(
      ragQueryRes.status === 200 &&
        ragQueryRes.body.success === true &&
        typeof ragQueryRes.body.answer === 'string' &&
        ragQueryRes.body.answer.length > 50 &&
        Array.isArray(ragQueryRes.body.citations) &&
        ragQueryRes.body.citations.length > 0,
      'RAG query endpoint processes eligibility query, returns grounded citations, and recommends matching schemes'
    );

    console.log(`\nTEST RESULTS: ${passed} passed, ${failed} failed.\n`);
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    await disconnectDB();
    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
};

runTests();
