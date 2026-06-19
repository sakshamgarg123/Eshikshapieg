import { jsPDF } from 'jspdf';
import { StudentDoubtSubmission } from '../types';

/**
 * Generates a polished, high-fidelity physical class entry pass PDF for the student.
 * Designed with a Swiss clean layout, visual dividers, secure headers, status watermark,
 * and a mock high-density barcode/QR representation.
 */
export function exportTicketToPDF(sub: StudentDoubtSubmission) {
  // Create jsPDF instance (standard portrait A4)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Color Palette Definitions
  const primaryDark = '#0F172A'; // Deep Slate
  const primaryIndigo = '#3B28CC'; // Indigo Brand
  const bgSoft = '#F8FAFC'; // Soft Slate Grey
  const borderGrey = '#CBD5E1'; // Light Slate border
  const accentOrange = '#FF7A45'; // Orange accent
  const greenSuccess = '#10B981'; // Approved color
  const greyMuted = '#64748B'; // Muted description grey

  // 1. Page Background and Outer Border
  doc.setFillColor(248, 250, 252); // Soft background (bgSoft)
  doc.rect(0, 0, 210, 297, 'F');

  // Stylish clean border frame
  doc.setDrawColor(203, 213, 225); // borderGrey
  doc.setLineWidth(1);
  doc.rect(8, 8, 194, 281, 'S');

  // Decorative double line accent on inner margin
  doc.setDrawColor(59, 40, 204); // Indigo line
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 190, 277, 'S');

  // 2. Headings & Brand Information
  // Header accent bar (Orange badge)
  doc.setFillColor(255, 122, 69); // accentOrange
  doc.rect(10, 10, 190, 5, 'F');

  // Main Category
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 122, 69); // orange
  doc.text('✦ ESHIKSHAPIE OFFLINE ACADEMIC COMPANION ✦', 15, 23);

  // Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // primaryDark
  doc.text('CLASS ENTRY CLEARANCE & GATEPASS', 15, 33);

  // Secondary description
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139); // greyMuted
  doc.text('Official offline weekend attendance permit verified under the active administrative coordination hub.', 15, 38.5);

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(15, 43, 195, 43);

  // 3. Ticket Main Overview & Status Watermark
  // Check student status
  const isApproved = sub.status === 'approved';
  const isRejected = sub.status === 'rejected';

  // We place a large, elegant watermark block in the background
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(36);
  if (isApproved) {
    doc.setTextColor(230, 245, 235); // extremely faint green
    doc.text('SECURE CLEARANCE', 28, 155, { angle: 30 });
    doc.text('APPROVED PASS', 42, 175, { angle: 30 });
  } else if (isRejected) {
    doc.setTextColor(254, 242, 242); // faint red
    doc.text('ENTRY DENIED', 40, 160, { angle: 30 });
    doc.text('EXCLUDED TICKET', 35, 180, { angle: 30 });
  } else {
    doc.setTextColor(254, 243, 199); // faint amber
    doc.text('AUDIT ENQUEUE', 45, 160, { angle: 30 });
    doc.text('PENDING VERIFY', 40, 180, { angle: 30 });
  }

  // Restore Text state
  doc.setTextColor(15, 23, 42);

  // 4. Student & Academic Information Panels (Two Columns layout)
  // Left Column: Academic Metadata
  doc.setFillColor(255, 255, 255); // Solid white card backings
  doc.rect(15, 48, 88, 54, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, 48, 88, 54, 'S');

  // Left column content
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('STUDENT PROFILE', 20, 54);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(59, 40, 204); // Indigo
  doc.text(sub.studentName || 'Unregistered Student', 20, 61.5);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Academic Class: ${sub.studentClass || sub.className || 'Class 12'}`, 20, 69);
  
  doc.setFont('Helvetica', 'normal');
  doc.text(`Unique Ticket ID: ${sub.id}`, 20, 75);
  doc.text(`Recorded On: ${new Date(sub.submittedAt).toLocaleDateString()}`, 20, 81);

  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(255, 122, 69);
  doc.text(`Topic: ${sub.chapter}`, 20, 88);

  const rawDay = sub.doubtDayType || sub.doubtDay || 'Saturday';
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Submitted into active audit stream.`, 20, 95);

  // Right Column: Attendance & Logistics Details
  doc.setFillColor(255, 255, 255);
  doc.rect(107, 48, 88, 54, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(107, 48, 88, 54, 'S');

  // Right column content
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('OFFLINE CLASS SCHEDULE', 112, 54);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`${rawDay.toUpperCase()} CLASS`, 112, 61.5);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Direct Time Interval:`, 112, 69);
  doc.setTextColor(15, 23, 42);
  doc.text(sub.scheduledTimeSlot || sub.preferredTime || '10:00 AM to 11:30 AM', 112, 74.5);

  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text(`Assigned Station Desk:`, 112, 82.5);
  doc.setTextColor(59, 40, 204);
  doc.text(sub.offlineLocationDetails || 'Pending Coordinator Assignment', 112, 88);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Verify QR Code / entry code upon arrival.`, 112, 95);


  // 5. Verification Code & High-Security Header
  doc.setFillColor(241, 245, 249); // lighter background grey
  doc.rect(15, 108, 180, 24, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(15, 108, 180, 24, 'S');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('ADMINISTRATIVE SECURITY BARCODE & GATEPASS VERIFICATION CODE', 18, 113.5);

  // Big security code
  doc.setFont('Courier', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(15, 23, 42);
  const codeToPrint = sub.entryGrantCode || `PENDING-AUDIT-${sub.id.toUpperCase()}`;
  doc.text(codeToPrint, 18, 122.5);

  // Secure badge tag inside verification zone
  doc.setFillColor(59, 40, 204);
  doc.rect(142, 114, 48, 12, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  const badgeTitle = isApproved ? 'APPROVED ACCESS' : isRejected ? 'ENTRY EXCLUDED' : 'PENDING STAGE';
  doc.text(badgeTitle, 146, 122, { align: 'left' });


  // 6. Large Core Content Box (Student's Doubt Problem Context)
  doc.setFillColor(255, 255, 255);
  doc.rect(15, 138, 180, 72, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, 138, 180, 72, 'S');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL ACADEMIC QUERY DESCRIPTION:', 20, 145);

  // Split description text to multiple lines supporting clean spacing
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const descText = sub.doubtDescription || sub.doubtText || 'No plain-text query input available...';
  // auto wrap text to max 170mm width
  const splitText = doc.splitTextToSize(descText, 170);
  doc.text(splitText, 20, 151.5);

  // Subordinated divider
  doc.setDrawColor(241, 245, 249);
  doc.line(20, 184, 190, 184);

  // Teacher notes advisory
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('TEACHER / COORDINATOR DIRECT ADVISORY:', 20, 190);

  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(59, 40, 204);
  const notesText = sub.teacherNotes || (isApproved ? 'Study class approved for classroom entrance. Please bring textbooks and printed homework assignments.' : 'Awaiting administrative credentials audit. Make sure to double check standard prerequisites.');
  const splitNotes = doc.splitTextToSize(notesText, 170);
  doc.text(splitNotes, 20, 196);


  // 7. Security Code QR & Stamp Section
  // Build clean visual representation of a high density barcode
  doc.setFillColor(15, 23, 42);
  // Drawing clean vertical lines for barcode representation
  let xOffset = 18;
  const barcodeY = 220;
  const barcodeHeight = 14;
  doc.setFont('Courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('ESHIKSHA SECURE TICKETING SYSTEM', xOffset, 217);

  // Mock barcodes with differential spacing & width
  for (let i = 0; i < 45; i++) {
    const barWidth = (i % 3 === 0) ? 0.35 : (i % 5 === 0) ? 1.0 : 0.65;
    const spacing = (i % 2 === 0) ? 1.2 : 0.8;
    doc.setFillColor(15, 23, 42);
    doc.rect(xOffset, barcodeY, barWidth, barcodeHeight, 'F');
    xOffset += barWidth + spacing;
  }
  doc.setFont('Courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`VERIFICATION SIGN: ${sub.id.toUpperCase()}-${codeToPrint}`, 18, 239);


  // 8. Terms, Conditions & Security Policies (Modern footer layout)
  // Double lined divider
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(15, 246, 195, 246);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 122, 69);
  doc.text('ESHIKSHA SYSTEM DIRECTIVES & SECURITY PROTOCOLS', 15, 252);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const infoDirective_1 = '1. This gatepass is strictly non-transferable and represents specific classroom desk allocation slots designed to preserve maximum crowding prevention.';
  doc.text(infoDirective_1, 15, 257.5);
  const infoDirective_2 = '2. The digital code stamped on this document corresponds to active administrative databases. Fake entry codes constitute academic policy breaches.';
  doc.text(infoDirective_2, 15, 261.5);
  const infoDirective_3 = '3. Students must present a printed PDF format or state their authentication code at the classroom reception to clear physical security protocols.';
  doc.text(infoDirective_3, 15, 265.5);

  // Secondary fine-print line
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('This is an authentic computer-generated document authorized by eShikshaPie Academics. System time logs are recorded at standard production coordinates.', 15, 271);

  // Footer stamp indicator
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(59, 40, 204);
  doc.text('PAGE 1 OF 1', 105, 279, { align: 'center' });

  // Custom QR-like visual box in bottom-right corner
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.rect(162, 216, 28, 28, 'S');
  
  // Fill inside with nested visual blocks to represent QR
  doc.setFillColor(15, 23, 42);
  doc.rect(164, 218, 6, 6, 'F');
  doc.rect(182, 218, 6, 6, 'F');
  doc.rect(164, 236, 6, 6, 'F');
  doc.rect(173, 226, 4, 4, 'F');
  doc.rect(179, 232, 5, 2, 'F');
  doc.rect(173, 234, 3, 5, 'F');
  doc.rect(181, 226, 3, 4, 'F');

  // Trigger browser download window
  doc.save(`eShiksha_ClearancePass_${sub.id}.pdf`);
}
