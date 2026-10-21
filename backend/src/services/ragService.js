const { GoogleGenAI } = require('@google/genai');
const KnowledgeDoc = require('../models/KnowledgeDoc');
const Scholarship = require('../models/Scholarship');
const StudentProfile = require('../models/StudentProfile');
const { RAG_KNOWLEDGE_DOCS } = require('../config/ragKnowledgeBase');

class RAGService {
  constructor() {
    this.geminiClient = null;
    this.geminiApiKey = process.env.GEMINI_API_KEY || null;
    if (this.geminiApiKey) {
      try {
        this.geminiClient = new GoogleGenAI({ apiKey: this.geminiApiKey });
      } catch (err) {
        console.warn('⚠️ [RAG] Failed to initialize Gemini client:', err.message);
      }
    }
    this.localCorpus = [];
    this.vocab = new Map();
    this.idf = new Map();
    this.docVectors = [];
    this.isInitialized = false;
  }

  /**
   * Initialize knowledge base in MongoDB and build local semantic index
   */
  async initialize() {
    try {
      // 1. Ensure KnowledgeDoc collection has base documents
      const count = await KnowledgeDoc.countDocuments();
      if (count === 0) {
        console.log('📚 [RAG] Seeding default knowledge base documents...');
        await KnowledgeDoc.insertMany(RAG_KNOWLEDGE_DOCS);
      }

      // 2. Build local index combining KnowledgeDocs + Active Scholarships
      await this.buildIndex();
      this.isInitialized = true;
      console.log(`✅ [RAG] Vector & Semantic Index loaded (${this.localCorpus.length} documents indexed). Mode: ${this.geminiApiKey ? 'Gemini 3.8 Flash' : 'Local Semantic Engine'}`);
    } catch (err) {
      console.error('❌ [RAG] Initialization error:', err.message);
    }
  }

  /**
   * Build TF-IDF vector index for zero-config fast retrieval
   */
  async buildIndex() {
    const docs = await KnowledgeDoc.find({ isActive: true }).lean();
    const scholarships = await Scholarship.find({ status: 'Active' }).lean();

    // Map scholarships to knowledge chunks
    const scholarshipDocs = scholarships.map((sch) => ({
      _id: sch._id,
      title: `${sch.title} (${sch.code})`,
      category: 'Eligibility',
      schemeCode: sch.code,
      sourceRef: `EduStream Active Scheme Registry: ${sch.code}`,
      tags: ['scholarship', sch.code.toLowerCase(), sch.providerName.toLowerCase(), ...sch.eligibleCategories.map((c) => c.toLowerCase()), ...sch.eligibleGenders.map((g) => g.toLowerCase())],
      summary: `${sch.title}: Amount ₹${sch.amount.toLocaleString('en-IN')}, Min Marks: ${sch.minPercentage}%, Max Family Income: ₹${sch.maxAnnualIncome > 0 ? sch.maxAnnualIncome.toLocaleString('en-IN') : 'No ceiling'}.`,
      content: `
# Scheme: ${sch.title} (Code: ${sch.code})
- **Provider:** ${sch.providerName}
- **Grant Amount:** ₹${sch.amount.toLocaleString('en-IN')}
- **Academic Year:** ${sch.academicYear}
- **Eligibility Criteria:**
  - Minimum Marks: ${sch.minPercentage}% in previous exam.
  - Annual Family Income Limit: ${sch.maxAnnualIncome > 0 ? '₹' + sch.maxAnnualIncome.toLocaleString('en-IN') : 'No Limit / Open to all income brackets'}
  - Eligible Genders: ${sch.eligibleGenders.join(', ')}
  - Eligible Categories: ${sch.eligibleCategories.join(', ')}
  - Eligible Courses: ${sch.eligibleCourses && sch.eligibleCourses.length > 0 ? sch.eligibleCourses.join(', ') : 'All courses eligible'}
- **Required Documents:** ${sch.requiredDocuments && sch.requiredDocuments.length > 0 ? sch.requiredDocuments.map((d) => d.name).join(', ') : 'Income Certificate, Marksheet, Bonafide'}
- **Description:** ${sch.description}
      `.trim(),
      scholarshipData: sch,
    }));

    this.localCorpus = [...docs, ...scholarshipDocs];

    // Compute TF-IDF vocabulary and document vectors
    this.vocab.clear();
    this.idf.clear();
    const N = this.localCorpus.length;
    const docTermFreqs = [];

    const stopWords = new Set([
      'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
      'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
      'could', 'did', 'do', 'does', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
      'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
      'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'my', 'myself',
      'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves',
      'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
      'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under',
      'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why',
      'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
    ]);

    const tokenize = (text) => {
      return (text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stopWords.has(w));
    };

    const docFreqs = new Map();

    this.localCorpus.forEach((doc, idx) => {
      const fullText = `${doc.title} ${doc.category} ${doc.tags ? doc.tags.join(' ') : ''} ${doc.summary || ''} ${doc.content}`;
      const tokens = tokenize(fullText);
      const tf = new Map();
      const uniqueTokens = new Set(tokens);

      tokens.forEach((t) => {
        tf.set(t, (tf.get(t) || 0) + 1);
      });

      docTermFreqs.push({ tf, totalTokens: tokens.length });

      uniqueTokens.forEach((t) => {
        docFreqs.set(t, (docFreqs.get(t) || 0) + 1);
      });
    });

    // Compute IDF
    docFreqs.forEach((df, term) => {
      const idfScore = Math.log((N + 1) / (df + 1)) + 1;
      this.idf.set(term, idfScore);
    });

    // Build vector for each document
    this.docVectors = docTermFreqs.map(({ tf, totalTokens }) => {
      const vector = new Map();
      let normSq = 0;
      tf.forEach((count, term) => {
        const idfVal = this.idf.get(term) || 1;
        const weight = (count / (totalTokens || 1)) * idfVal;
        vector.set(term, weight);
        normSq += weight * weight;
      });
      return { vector, norm: Math.sqrt(normSq) || 1 };
    });
  }

  /**
   * Retrieve Top-K documents relevant to user query
   */
  async retrieveRelevantDocs(query, topK = 4) {
    if (!this.isInitialized || this.localCorpus.length === 0) {
      await this.buildIndex();
    }

    const stopWords = new Set(['a', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'is', 'are', 'what', 'how', 'can', 'i', 'get', 'my']);
    const queryTokens = (query || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    // Form query vector
    const queryTf = new Map();
    queryTokens.forEach((t) => queryTf.set(t, (queryTf.get(t) || 0) + 1));

    let queryNormSq = 0;
    const queryVector = new Map();
    queryTf.forEach((count, term) => {
      const idfVal = this.idf.get(term) || Math.log(this.localCorpus.length + 1);
      const weight = (count / queryTokens.length) * idfVal;
      queryVector.set(term, weight);
      queryNormSq += weight * weight;
    });
    const queryNorm = Math.sqrt(queryNormSq) || 1;

    // Calculate similarity with each document
    const scoredDocs = this.localCorpus.map((doc, idx) => {
      const { vector: docVec, norm: docNorm } = this.docVectors[idx] || { vector: new Map(), norm: 1 };
      let dotProduct = 0;

      queryVector.forEach((qWeight, term) => {
        if (docVec.has(term)) {
          dotProduct += qWeight * docVec.get(term);
        }
      });

      let score = dotProduct / (queryNorm * docNorm);

      // Boost for exact tag or code matches
      const queryLower = query.toLowerCase();
      if (doc.schemeCode && queryLower.includes(doc.schemeCode.toLowerCase())) {
        score += 0.45;
      }
      if (doc.tags && doc.tags.some((t) => queryLower.includes(t.toLowerCase()))) {
        score += 0.25;
      }
      if (doc.title && queryLower.includes(doc.title.toLowerCase())) {
        score += 0.35;
      }

      return { doc, score };
    });

    scoredDocs.sort((a, b) => b.score - a.score);
    return scoredDocs.slice(0, topK).map((item) => item.doc);
  }

  /**
   * Determine matching scholarships based on student profile
   */
  async findMatchingSchemes(studentProfile) {
    if (!studentProfile) return [];
    try {
      const percentage = Number(studentProfile.gpaOrPercentage ?? studentProfile.percentage ?? 0);
      const annualIncome = Number(studentProfile.familyAnnualIncome ?? studentProfile.annualIncome ?? 0);
      const gender = studentProfile.gender || 'All';
      const category = studentProfile.category || 'General';

      const allSchemes = await Scholarship.find({ status: 'Active' }).lean();
      const matched = [];

      for (const sch of allSchemes) {
        let isEligible = true;
        const reasons = [];

        // 1. Percentage check
        if (sch.minPercentage > 0) {
          if (percentage < sch.minPercentage) {
            isEligible = false;
          } else {
            reasons.push(`Meets minimum marks (${percentage}% >= ${sch.minPercentage}%)`);
          }
        }

        // 2. Income check
        if (sch.maxAnnualIncome > 0) {
          if (annualIncome > sch.maxAnnualIncome) {
            isEligible = false;
          } else {
            reasons.push(`Qualifies under annual income ceiling (₹${annualIncome.toLocaleString('en-IN')} <= ₹${sch.maxAnnualIncome.toLocaleString('en-IN')})`);
          }
        }

        // 3. Gender check
        if (sch.eligibleGenders && !sch.eligibleGenders.includes('All')) {
          if (!sch.eligibleGenders.includes(gender)) {
            isEligible = false;
          } else {
            reasons.push(`Meets gender eligibility (${gender})`);
          }
        }

        // 4. Category check
        if (sch.eligibleCategories && sch.eligibleCategories.length > 0) {
          if (!sch.eligibleCategories.includes(category)) {
            isEligible = false;
          } else {
            reasons.push(`Matches social category (${category})`);
          }
        }

        if (isEligible) {
          matched.push({
            id: sch._id,
            title: sch.title,
            code: sch.code,
            amount: sch.amount,
            deadline: sch.applicationDeadline,
            reasons,
          });
        }
      }

      return matched;
    } catch (err) {
      console.warn('⚠️ [RAG] Matching error:', err.message);
      return [];
    }
  }

  /**
   * Synthesize grounded answer using local knowledge rules (zero-config fallback)
   */
  synthesizeLocalResponse(query, retrievedDocs, studentProfile, matchedSchemes) {
    const q = query.toLowerCase();

    // Check specific query intentions
    const isEligibilityQuery = q.includes('eligible') || q.includes('qualify') || q.includes('scholarship') || q.includes('apply');
    const isIncomeQuery = q.includes('income') || q.includes('tehsildar') || q.includes('salary') || q.includes('affidavit');
    const isDisbursementQuery = q.includes('dbt') || q.includes('pfms') || q.includes('utr') || q.includes('bank') || q.includes('money') || q.includes('credit');
    const isDefectQuery = q.includes('defect') || q.includes('reject') || q.includes('resubmit') || q.includes('correction') || q.includes('timeline');
    const isVerificationQuery = q.includes('verify') || q.includes('college') || q.includes('attendance') || q.includes('bonafide');

    let answer = '';

    if (studentProfile && isEligibilityQuery) {
      const percentage = Number(studentProfile.gpaOrPercentage ?? studentProfile.percentage ?? 0);
      const annualIncome = Number(studentProfile.familyAnnualIncome ?? studentProfile.annualIncome ?? 0);
      const category = studentProfile.category || 'General';
      const gender = studentProfile.gender || 'Not specified';
      const studentName = studentProfile.firstName || studentProfile.name || 'Student';

      answer += `### 🎓 Personalized Scholarship Eligibility Assessment for **${studentName}**\n\n`;
      answer += `Based on your profile data (**${percentage}% marks**, Annual Income: **₹${annualIncome.toLocaleString('en-IN')}**, Category: **${category}**, Gender: **${gender}**):\n\n`;

      if (matchedSchemes.length > 0) {
        answer += `You are eligible for **${matchedSchemes.length} active scholarship schemes**:\n\n`;
        matchedSchemes.forEach((sch, i) => {
          answer += `${i + 1}. **${sch.title} (${sch.code})**\n`;
          answer += `   - **Grant Amount:** ₹${sch.amount.toLocaleString('en-IN')}\n`;
          answer += `   - **Why you qualify:** ${sch.reasons.join(', ')}\n\n`;
        });
        answer += `> **Next Step:** Navigate to the **Available Scholarships** page and click **Apply Now** to submit your verified documents before the scheme deadline.\n\n`;
      } else {
        answer += `Currently, your profile does not meet the cutoffs for active schemes (such as minimum percentage or family income ceilings). You may check individual scheme requirements below.\n\n`;
      }
    }

    // Add retrieved knowledge summary
    if (retrievedDocs.length > 0) {
      const topDoc = retrievedDocs[0];
      answer += `### 📑 Policy Guidelines & Rules: ${topDoc.title}\n\n`;

      if (isIncomeQuery) {
        answer += `- **Valid Issuing Authorities:** Only certificates signed by a **Tehsildar**, **Sub-Divisional Magistrate (SDM)**, or authorized State e-District portal are accepted.\n`;
        answer += `- **Not Allowed:** Notary stamp paper affidavits and private salary slips are strictly prohibited and will be marked **Defective**.\n`;
        answer += `- **Validity:** Must be issued on or after April 1st of the preceding financial year.\n\n`;
      } else if (isDisbursementQuery) {
        answer += `- **Direct Benefit Transfer (DBT):** Funds are credited directly via PFMS into your **Aadhaar-seeded** bank account.\n`;
        answer += `- **Unique Transaction Reference (UTR):** Once payment is cleared by the Reserve Bank, a unique UTR number is generated and viewable in your Application Timeline.\n`;
        answer += `- **Bank Verification:** Ensure your bank account is active, not dormant, and has NPCI Aadhaar mapping enabled.\n\n`;
      } else if (isDefectQuery) {
        answer += `- **Defective Status:** Does not mean rejection. You have **7 calendar days** to upload corrected documents.\n`;
        answer += `- **Common Fixes:** Ensure scans are 300 DPI (under 2MB), verify bonafide has college AISHE code, and ensure income certificate is valid.\n\n`;
      } else if (isVerificationQuery) {
        answer += `- **Institutional Turnaround:** Colleges must complete Level 1 scrutiny within **14 working days**.\n`;
        answer += `- **Attendance:** Minimum 75% attendance in the preceding semester is required.\n`;
        answer += `- **Bonafide:** Must be on college letterhead signed by the Principal/Dean with the AISHE registration code.\n\n`;
      } else {
        answer += `${topDoc.summary || topDoc.content.substring(0, 300)}...\n\n`;
      }

      answer += `*Source Citation: ${topDoc.sourceRef || topDoc.title}*\n`;
    }

    return answer.trim();
  }

  /**
   * Process a RAG query: Retrieve -> Augment -> Generate (Dual Mode)
   */
  async ask(query, studentProfile = null) {
    // 1. Retrieve relevant policy chunks
    const retrievedDocs = await this.retrieveRelevantDocs(query, 3);

    // 2. Compute matching schemes if student profile is available
    const matchedSchemes = await this.findMatchingSchemes(studentProfile);

    // Prepare citations
    const citations = retrievedDocs.map((doc) => ({
      title: doc.title,
      category: doc.category,
      sourceRef: doc.sourceRef || 'EduStream Official Policy',
      schemeCode: doc.schemeCode || null,
    }));

    // 3. Try Gemini 3.8 Flash if API key is present
    if (this.geminiClient) {
      try {
        const contextText = retrievedDocs
          .map((d, i) => `[Document ${i + 1}: ${d.title} (${d.sourceRef})]\n${d.content}`)
          .join('\n\n---\n\n');

        let profileContext = 'Student is an anonymous visitor / guest.';
        if (studentProfile) {
          profileContext = `
Student Profile:
- Name: ${studentProfile.firstName} ${studentProfile.lastName || ''}
- Course: ${studentProfile.course || 'B.Tech'} (${studentProfile.currentYear || '3rd'} Year)
- Academic Percentage: ${studentProfile.percentage || 'N/A'}%
- Annual Family Income: ₹${studentProfile.annualIncome ? studentProfile.annualIncome.toLocaleString('en-IN') : 'N/A'}
- Category: ${studentProfile.category || 'General'}
- Gender: ${studentProfile.gender || 'Not specified'}
- Aadhaar Verified: ${studentProfile.aadhaarVerified ? 'Yes' : 'No'}
- Bank Account Seeded: ${studentProfile.bankDetails?.accountNumber ? 'Yes' : 'No'}
          `.trim();
        }

        const prompt = `
You are the EduStream AI Scholarship & Policy Advisor, an expert assistant for Indian higher education scholarship disbursement, institutional scrutiny, and Direct Benefit Transfer (DBT).

Your answers must be:
1. Grounded strictly in the retrieved knowledge base below and active scholarship rules.
2. Direct, professional, and formatted in clean GitHub Markdown with clear bullet points.
3. If the student profile is provided and they ask about eligibility or schemes, explicitly evaluate their percentage, income ceiling, gender, and category against the schemes.
4. Always cite the relevant government directive or scheme name.

---
RETRIEVED KNOWLEDGE BASE:
${contextText}

---
ACTIVE MATCHED SCHEMES FROM DATABASE:
${JSON.stringify(matchedSchemes, null, 2)}

---
USER PROFILE CONTEXT:
${profileContext}

---
USER QUERY:
${query}
        `.trim();

        const response = await this.geminiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const outputText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (outputText) {
          return {
            answer: outputText.trim(),
            citations,
            recommendedSchemes: matchedSchemes,
            mode: 'gemini-3.8-flash',
          };
        }
      } catch (err) {
        console.warn('⚠️ [RAG] Gemini API call failed, falling back to local semantic engine:', err.message);
      }
    }

    // 4. Fallback: Local Semantic Engine
    const localAnswer = this.synthesizeLocalResponse(query, retrievedDocs, studentProfile, matchedSchemes);
    return {
      answer: localAnswer,
      citations,
      recommendedSchemes: matchedSchemes,
      mode: 'local-semantic-engine',
    };
  }
}

// Singleton instance
const ragService = new RAGService();

module.exports = ragService;
