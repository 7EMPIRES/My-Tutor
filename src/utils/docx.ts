import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

export async function generateDocx(title: string, sourceFileName: string, content: string) {
  // Simple markdown-ish to docx converter
  // This is a basic implementation. For a real app, you'd want a more robust parser.
  
  const lines = content.split('\n');
  const children = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Source File: ${sourceFileName}`,
          italics: true,
        }),
      ],
    }),
    new Paragraph({
      text: '________________________________________________',
    }),
  ];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed === '') return;

    const isHeader1 = trimmed.startsWith('# ');
    const isHeader2 = trimmed.startsWith('## ');
    const isQuestion = trimmed.startsWith('Q:') || trimmed.startsWith('**Q:');

    if (isHeader1 || isHeader2) {
      children.push(
        new Paragraph({
          text: trimmed.replace(/^#+\s*/, ''),
          heading: isHeader1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        })
      );
    } else {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              bold: isQuestion,
            }),
          ],
          spacing: {
            before: 200,
          },
        })
      );
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'My_Study_Guide.docx');
}
