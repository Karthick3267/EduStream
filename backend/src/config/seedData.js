const User = require('../models/User');
const Institution = require('../models/Institution');
const StudentProfile = require('../models/StudentProfile');
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');
const Disbursement = require('../models/Disbursement');
const Notification = require('../models/Notification');

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    console.log('Seeding initial data for Paperless Scholarship Disbursement Platform...');

    // 1. Create Institutions
    const institutions = await Institution.create([
      {
        name: 'Apex Institute of Technology',
        code: 'AIT-101',
        address: 'Sector 62, Institutional Area',
        state: 'Delhi NCR',
        contactEmail: 'admissions@apex.edu',
        contactPhone: '+91 11 2345 6789',
        isActive: true,
      },
      {
        name: 'National College of Engineering',
        code: 'NCE-202',
        address: 'Electronic City Phase 1',
        state: 'Karnataka',
        contactEmail: 'dean@nce.edu',
        contactPhone: '+91 80 4567 8901',
        isActive: true,
      },
      {
        name: "St. Xavier's University of Science",
        code: 'SXU-303',
        address: 'Marine Lines Campus',
        state: 'Maharashtra',
        contactEmail: 'scholarships@sxu.edu',
        contactPhone: '+91 22 9876 5432',
        isActive: true,
      },
    ]);

    const ait = institutions[0];
    const nce = institutions[1];
    const sxu = institutions[2];

    // 2. Create Users across 4 Roles
    // Passwords will be hashed automatically by User pre-save hook
    const users = await User.create([
      // Admin
      {
        name: 'Dr. Rajesh Verma',
        email: 'admin@scholarships.gov',
        password: 'Admin@123',
        role: 'admin',
        phone: '+91 98110 01122',
        isActive: true,
      },
      // Finance Officer
      {
        name: 'Suresh Menon',
        email: 'finance@treasury.gov',
        password: 'Finance@123',
        role: 'finance_officer',
        phone: '+91 98220 02233',
        isActive: true,
      },
      // Institution Staff - Apex
      {
        name: 'Prof. Anita Desai',
        email: 'staff@apex.edu',
        password: 'Staff@123',
        role: 'institution_staff',
        institutionId: ait._id,
        phone: '+91 98330 03344',
        isActive: true,
      },
      // Institution Staff - NCE
      {
        name: 'Dr. Anand Kumar',
        email: 'staff@nce.edu',
        password: 'Staff@123',
        role: 'institution_staff',
        institutionId: nce._id,
        phone: '+91 98440 04455',
        isActive: true,
      },
      // Student 1 - Rahul Sharma (Apex)
      {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@student.edu',
        password: 'Student@123',
        role: 'student',
        institutionId: ait._id,
        phone: '+91 98550 05566',
        isActive: true,
      },
      // Student 2 - Priya Patel (NCE)
      {
        name: 'Priya Patel',
        email: 'priya.patel@student.edu',
        password: 'Student@123',
        role: 'student',
        institutionId: nce._id,
        phone: '+91 98660 06677',
        isActive: true,
      },
      // Student 3 - Vikram Das (Apex)
      {
        name: 'Vikram Das',
        email: 'vikram.das@student.edu',
        password: 'Student@123',
        role: 'student',
        institutionId: ait._id,
        phone: '+91 98770 07788',
        isActive: true,
      },
    ]);

    const [adminUser, financeUser, staffApex, staffNce, studentRahul, studentPriya, studentVikram] =
      users;

    // 3. Create Student Profiles
    await StudentProfile.create([
      {
        userId: studentRahul._id,
        institutionId: ait._id,
        admissionNumber: 'AIT-2023-CS-042',
        course: 'B.Tech Computer Science',
        department: 'Department of Computer Science & Engineering',
        yearOfStudy: 3,
        currentSemester: 5,
        gpaOrPercentage: 86.4,
        familyAnnualIncome: 220000,
        category: 'OBC',
        gender: 'Male',
        dateOfBirth: new Date('2004-05-14'),
        address: 'House 42, Green Park Extension, New Delhi',
        bankDetails: {
          accountHolderName: 'Rahul Sharma',
          accountNumber: '91802003847291',
          ifscCode: 'SBIN0001234',
          bankName: 'State Bank of India',
          branch: 'Green Park Branch',
        },
        isProfileComplete: true,
      },
      {
        userId: studentPriya._id,
        institutionId: nce._id,
        admissionNumber: 'NCE-2024-EC-089',
        course: 'B.Tech Electronics & Communication',
        department: 'Electronics Engineering',
        yearOfStudy: 2,
        currentSemester: 3,
        gpaOrPercentage: 91.2,
        familyAnnualIncome: 180000,
        category: 'General',
        gender: 'Female',
        dateOfBirth: new Date('2005-08-22'),
        address: 'Plot 17, Jaya Nagar 4th Block, Bangalore',
        bankDetails: {
          accountHolderName: 'Priya Patel',
          accountNumber: '44556677889901',
          ifscCode: 'HDFC0000456',
          bankName: 'HDFC Bank',
          branch: 'Koramangala Branch',
        },
        isProfileComplete: true,
      },
      {
        userId: studentVikram._id,
        institutionId: ait._id,
        admissionNumber: 'AIT-2022-ME-115',
        course: 'B.Tech Mechanical Engineering',
        department: 'Mechanical Engineering',
        yearOfStudy: 4,
        currentSemester: 7,
        gpaOrPercentage: 78.5,
        familyAnnualIncome: 290000,
        category: 'EWS',
        gender: 'Male',
        dateOfBirth: new Date('2003-11-03'),
        address: 'B-12, Vasant Kunj, New Delhi',
        bankDetails: {
          accountHolderName: 'Vikram Das',
          accountNumber: '50100234918234',
          ifscCode: 'PUNB0023400',
          bankName: 'Punjab National Bank',
          branch: 'Vasant Vihar',
        },
        isProfileComplete: true,
      },
    ]);

    // 4. Create Scholarships
    const futureDeadline = new Date();
    futureDeadline.setMonth(futureDeadline.getMonth() + 3);

    const scholarships = await Scholarship.create([
      {
        title: 'Merit-cum-Means Higher Education Scholarship 2026',
        code: 'MCM-2026',
        description:
          'Financial assistance scheme aimed at meritorious undergraduate students from economically weaker sections to ensure uninterrupted higher education.',
        providerName: 'Ministry of Education & Human Welfare',
        academicYear: '2026-2027',
        amount: 50000,
        maxAnnualIncome: 300000,
        minPercentage: 75,
        eligibleGenders: ['All'],
        eligibleCategories: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'],
        eligibleCourses: [],
        requiredDocuments: [
          { docType: 'Previous Year Marksheet', description: 'Certified marksheet showing >75%', isMandatory: true },
          { docType: 'Family Income Certificate', description: 'Government issued revenue officer certificate', isMandatory: true },
          { docType: 'College Bonafide Certificate', description: 'Signed by head of institution / Dean', isMandatory: true },
          { docType: 'Bank Passbook / Cancelled Cheque', description: 'Showing Account number and IFSC clearly', isMandatory: true },
        ],
        deadline: futureDeadline,
        quota: 500,
        status: 'Active',
        createdBy: adminUser._id,
      },
      {
        title: 'National STEM Excellence Grant for Women',
        code: 'STEM-WOMEN-26',
        description:
          'Empowering talented female scholars pursuing undergraduate and postgraduate degrees in Science, Technology, Engineering, and Mathematics.',
        providerName: 'Department of Science and Technology',
        academicYear: '2026-2027',
        amount: 75000,
        maxAnnualIncome: 600000,
        minPercentage: 70,
        eligibleGenders: ['Female'],
        eligibleCategories: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'],
        eligibleCourses: ['B.Tech Computer Science', 'B.Tech Electronics & Communication', 'B.Sc Physics', 'B.Tech AI & Data Science'],
        requiredDocuments: [
          { docType: 'Class 12th / Semester Marksheet', description: 'Academic score proof', isMandatory: true },
          { docType: 'College ID & Bonafide', description: 'Current enrollment verification', isMandatory: true },
          { docType: 'Bank Account Passbook', description: 'Student self bank account copy', isMandatory: true },
        ],
        deadline: futureDeadline,
        quota: 250,
        status: 'Active',
        createdBy: adminUser._id,
      },
      {
        title: 'Post-Matric Technical Scholarship Scheme',
        code: 'TECH-GRANT-26',
        description:
          'Dedicated financial aid for students enrolled in professional engineering, architecture, and technology programs across accredited institutes.',
        providerName: 'State Higher Education Council',
        academicYear: '2026-2027',
        amount: 35000,
        maxAnnualIncome: 450000,
        minPercentage: 65,
        eligibleGenders: ['All'],
        eligibleCategories: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'],
        eligibleCourses: [],
        requiredDocuments: [
          { docType: 'Latest Grade Card', description: 'Official university transcript', isMandatory: true },
          { docType: 'Fee Payment Receipt', description: 'Current academic year college fee receipt', isMandatory: true },
          { docType: 'Aadhaar / ID Card Proof', description: 'Identity verification copy', isMandatory: true },
          { docType: 'Bank Passbook Copy', description: 'Active bank account details', isMandatory: true },
        ],
        deadline: futureDeadline,
        quota: 1000,
        status: 'Active',
        createdBy: adminUser._id,
      },
    ]);

    const [schMcm, schStem, schTech] = scholarships;

    // 5. Create Applications in various realistic stages

    // App 1: Rahul Sharma -> Merit-cum-Means -> Status: Submitted (Ready for Apex Staff review)
    const app1 = await Application.create({
      applicationNumber: 'SCH-2026-001042',
      studentId: studentRahul._id,
      scholarshipId: schMcm._id,
      institutionId: ait._id,
      studentProfileSnapshot: {
        name: studentRahul.name,
        email: studentRahul.email,
        phone: studentRahul.phone,
        admissionNumber: 'AIT-2023-CS-042',
        course: 'B.Tech Computer Science',
        department: 'Department of Computer Science & Engineering',
        yearOfStudy: 3,
        gpaOrPercentage: 86.4,
        familyAnnualIncome: 220000,
        category: 'OBC',
        gender: 'Male',
        bankDetails: {
          accountHolderName: 'Rahul Sharma',
          accountNumber: '91802003847291',
          ifscCode: 'SBIN0001234',
          bankName: 'State Bank of India',
          branch: 'Green Park Branch',
        },
      },
      currentStatus: 'Submitted',
      documents: [
        {
          docType: 'Previous Year Marksheet',
          fileName: 'marksheets_rahul_sem4.pdf',
          originalName: 'Marksheet_Sem4_86pct.pdf',
          filePath: 'uploads/demo_marksheets.pdf',
          fileSize: 1048576,
          mimeType: 'application/pdf',
          status: 'Pending',
        },
        {
          docType: 'Family Income Certificate',
          fileName: 'income_cert_rahul.pdf',
          originalName: 'Income_Certificate_2026.pdf',
          filePath: 'uploads/demo_income.pdf',
          fileSize: 524288,
          mimeType: 'application/pdf',
          status: 'Pending',
        },
        {
          docType: 'College Bonafide Certificate',
          fileName: 'bonafide_ait_cs042.pdf',
          originalName: 'AIT_Bonafide_Rahul.pdf',
          filePath: 'uploads/demo_bonafide.pdf',
          fileSize: 786432,
          mimeType: 'application/pdf',
          status: 'Pending',
        },
      ],
      statusHistory: [
        {
          status: 'Submitted',
          changedBy: studentRahul._id,
          role: 'student',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          remarks: 'Application submitted with certified academic and income credentials.',
        },
      ],
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    // App 2: Priya Patel -> STEM Grant for Women -> Status: Approved (Ready for Finance Disbursement)
    const app2 = await Application.create({
      applicationNumber: 'SCH-2026-002089',
      studentId: studentPriya._id,
      scholarshipId: schStem._id,
      institutionId: nce._id,
      studentProfileSnapshot: {
        name: studentPriya.name,
        email: studentPriya.email,
        phone: studentPriya.phone,
        admissionNumber: 'NCE-2024-EC-089',
        course: 'B.Tech Electronics & Communication',
        department: 'Electronics Engineering',
        yearOfStudy: 2,
        gpaOrPercentage: 91.2,
        familyAnnualIncome: 180000,
        category: 'General',
        gender: 'Female',
        bankDetails: {
          accountHolderName: 'Priya Patel',
          accountNumber: '44556677889901',
          ifscCode: 'HDFC0000456',
          bankName: 'HDFC Bank',
          branch: 'Koramangala Branch',
        },
      },
      currentStatus: 'Approved',
      documents: [
        {
          docType: 'Class 12th / Semester Marksheet',
          fileName: 'marksheet_priya.pdf',
          originalName: 'Priya_Semester2_Transcript.pdf',
          filePath: 'uploads/demo_transcript.pdf',
          fileSize: 1258291,
          mimeType: 'application/pdf',
          status: 'Verified',
          verificationRemarks: '91.2% verified against university database.',
          verifiedBy: staffNce._id,
        },
        {
          docType: 'College ID & Bonafide',
          fileName: 'bonafide_priya.pdf',
          originalName: 'NCE_Bonafide_Priya.pdf',
          filePath: 'uploads/demo_bonafide.pdf',
          fileSize: 458752,
          mimeType: 'application/pdf',
          status: 'Verified',
          verificationRemarks: 'Valid bonafide student in year 2.',
          verifiedBy: staffNce._id,
        },
        {
          docType: 'Bank Account Passbook',
          fileName: 'passbook_priya.pdf',
          originalName: 'HDFC_Passbook_Copy.pdf',
          filePath: 'uploads/demo_bank.pdf',
          fileSize: 629145,
          mimeType: 'application/pdf',
          status: 'Verified',
          verificationRemarks: 'Account active and matches student name.',
          verifiedBy: staffNce._id,
        },
      ],
      reviewRemarks: {
        institutionRemarks: 'All documents verified and bonafide standing confirmed.',
        adminRemarks: 'Eligible and high merit rank. Approved for ₹75,000 disbursement.',
      },
      statusHistory: [
        {
          status: 'Submitted',
          changedBy: studentPriya._id,
          role: 'student',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          remarks: 'Submitted for STEM Women grant.',
        },
        {
          status: 'Under Institution Review',
          changedBy: staffNce._id,
          role: 'institution_staff',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          remarks: 'Verification initiated by Dr. Anand Kumar.',
        },
        {
          status: 'Institution Approved',
          changedBy: staffNce._id,
          role: 'institution_staff',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          remarks: 'Institutional clearance granted with full merit recommendation.',
        },
        {
          status: 'Approved',
          changedBy: adminUser._id,
          role: 'admin',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          remarks: 'Final administrative sanction granted. Queued for finance disbursement.',
        },
      ],
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });

    // Create pending Disbursement record for App 2
    const disbApp2 = await Disbursement.create({
      applicationId: app2._id,
      studentId: studentPriya._id,
      scholarshipId: schStem._id,
      amount: 75000,
      disbursementStatus: 'Pending',
      bankDetailsSnapshot: app2.studentProfileSnapshot.bankDetails,
      remarks: 'Sanctioned by central scholarship board. Ready for bank DBT execution.',
    });
    app2.disbursementId = disbApp2._id;
    await app2.save();

    // App 3: Vikram Das -> Tech Scholarship -> Status: Disbursed (Completed payment with UTR)
    const app3 = await Application.create({
      applicationNumber: 'SCH-2026-003115',
      studentId: studentVikram._id,
      scholarshipId: schTech._id,
      institutionId: ait._id,
      studentProfileSnapshot: {
        name: studentVikram.name,
        email: studentVikram.email,
        phone: studentVikram.phone,
        admissionNumber: 'AIT-2022-ME-115',
        course: 'B.Tech Mechanical Engineering',
        department: 'Mechanical Engineering',
        yearOfStudy: 4,
        gpaOrPercentage: 78.5,
        familyAnnualIncome: 290000,
        category: 'EWS',
        gender: 'Male',
        bankDetails: {
          accountHolderName: 'Vikram Das',
          accountNumber: '50100234918234',
          ifscCode: 'PUNB0023400',
          bankName: 'Punjab National Bank',
          branch: 'Vasant Vihar',
        },
      },
      currentStatus: 'Disbursed',
      documents: [
        {
          docType: 'Latest Grade Card',
          fileName: 'transcript_vikram.pdf',
          originalName: 'Transcript_Year3.pdf',
          filePath: 'uploads/demo_transcript.pdf',
          fileSize: 850000,
          mimeType: 'application/pdf',
          status: 'Verified',
          verificationRemarks: 'Grade card authentic.',
          verifiedBy: staffApex._id,
        },
        {
          docType: 'Fee Payment Receipt',
          fileName: 'receipt_vikram.pdf',
          originalName: 'College_Fee_Receipt_2026.pdf',
          filePath: 'uploads/demo_receipt.pdf',
          fileSize: 420000,
          mimeType: 'application/pdf',
          status: 'Verified',
          verificationRemarks: 'Fee paid in full.',
          verifiedBy: staffApex._id,
        },
      ],
      reviewRemarks: {
        institutionRemarks: 'Verified all eligibility and fee clearance.',
        adminRemarks: 'Sanctioned under Technical Higher Education grant.',
        financeRemarks: 'Funds disbursed successfully via Direct Benefit Transfer.',
      },
      statusHistory: [
        {
          status: 'Submitted',
          changedBy: studentVikram._id,
          role: 'student',
          timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          remarks: 'Submitted.',
        },
        {
          status: 'Institution Approved',
          changedBy: staffApex._id,
          role: 'institution_staff',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          remarks: 'College verification passed.',
        },
        {
          status: 'Approved',
          changedBy: adminUser._id,
          role: 'admin',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          remarks: 'Admin sanction approved.',
        },
        {
          status: 'Disbursed',
          changedBy: financeUser._id,
          role: 'finance_officer',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          remarks: 'Payment processed. UTR Ref: UTR202609170849201. Amount ₹35,000.',
        },
      ],
      submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    });

    const disbApp3 = await Disbursement.create({
      applicationId: app3._id,
      studentId: studentVikram._id,
      scholarshipId: schTech._id,
      amount: 35000,
      disbursementStatus: 'Completed',
      transactionReference: 'UTR202609170849201',
      paymentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      paymentMode: 'Direct Benefit Transfer (DBT)',
      processedBy: financeUser._id,
      bankDetailsSnapshot: app3.studentProfileSnapshot.bankDetails,
      remarks: 'Disbursed to Punjab National Bank account ending in ...8234 via DBT.',
    });
    app3.disbursementId = disbApp3._id;
    await app3.save();

    // 6. Create Seed Notifications
    await Notification.create([
      {
        userId: studentRahul._id,
        title: 'Application Received',
        message: 'Your application #SCH-2026-001042 for Merit-cum-Means Scholarship is under review.',
        type: 'info',
        link: `/applications/${app1._id}`,
      },
      {
        userId: studentPriya._id,
        title: 'Scholarship Approved!',
        message: 'Your application #SCH-2026-002089 for STEM Excellence Grant has been approved for ₹75,000.',
        type: 'success',
        link: `/applications/${app2._id}`,
      },
      {
        userId: studentVikram._id,
        title: 'Scholarship Amount Disbursed',
        message: '₹35,000 has been credited to your bank account. UTR Ref: UTR202609170849201.',
        type: 'success',
        link: `/applications/${app3._id}`,
      },
      {
        userId: staffApex._id,
        title: 'Pending Verification',
        message: 'You have 1 pending scholarship application waiting for institutional verification.',
        type: 'warning',
        link: '/institution/dashboard',
      },
      {
        userId: financeUser._id,
        title: 'Disbursement Ready',
        message: '1 approved application (Priya Patel, ₹75,000) is ready for payment batch processing.',
        type: 'info',
        link: '/finance/disbursements',
      },
    ]);

    console.log('Seed completed successfully!');
  } catch (err) {
    console.error('Database seeding failed:', err);
  }
};

module.exports = { seedDatabase };
