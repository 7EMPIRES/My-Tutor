import { jsPDF } from 'jspdf';

export async function generatePdf(title: string, sourceFileName: string, content: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxLineWidth = pageWidth - margin * 2;
  
  let cursorY = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, cursorY);
  cursorY += 10;

  // Source info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(`Source File: ${sourceFileName}`, margin, cursorY);
  cursorY += 5;
  
  doc.setLineWidth(0.5);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 10;

  // Content
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const lines = content.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed === '') {
      cursorY += 5;
      return;
    }

    const isHeader = trimmed.startsWith('#');
    const isQuestion = trimmed.startsWith('Q:') || trimmed.startsWith('**Q:');
    
    if (isHeader) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      cursorY += 5;
    } else if (isQuestion) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
    }

    const cleanLine = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '');
    const splitText = doc.splitTextToSize(cleanLine, maxLineWidth);
    
    // Check for page break
    if (cursorY + (splitText.length * 7) > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      cursorY = 20;
    }

    doc.text(splitText, margin, cursorY);
    cursorY += (splitText.length * 7);
  });

  doc.save('My_Study_Guide.pdf');
}
