import JSZip from 'jszip';

export async function extractTextFromPPTX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  let fullText = '';
  
  // PPTX files store slides in ppt/slides/slide[n].xml
  const slideFiles = Object.keys(zip.files).filter(name => 
    name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
  );
  
  // Sort slides numerically
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)![0]);
    const numB = parseInt(b.match(/\d+/)![0]);
    return numA - numB;
  });

  for (const slideFile of slideFiles) {
    const content = await zip.file(slideFile)?.async('text');
    if (content) {
      // Basic XML parsing to get text between <a:t> tags
      const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g);
      if (textMatches) {
        const slideText = textMatches
          .map(match => match.replace(/<\/?a:t>/g, ''))
          .join(' ');
        fullText += `[Slide] ${slideText}\n\n`;
      }
    }
  }
  
  return fullText;
}
