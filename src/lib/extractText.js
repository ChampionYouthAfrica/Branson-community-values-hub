// Extract plain text from an uploaded file, in the browser.
// Supports plain-text formats directly and PDFs via pdfjs (dynamically imported
// so it only loads when a PDF is actually chosen).
export async function extractTextFromFile(file) {
  const name = (file.name || '').toLowerCase();

  // Plain-text-like files
  if (/\.(txt|md|markdown|csv|json|html?|rtf)$/.test(name) || file.type.startsWith('text/')) {
    return await file.text();
  }

  // Word .docx
  if (name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammoth = await import('mammoth/mammoth.browser');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return (result.value || '').trim();
  }

  // Legacy Word .doc is not supported for text extraction
  if (name.endsWith('.doc')) {
    throw new Error(
      'Old-format .doc files can’t be read directly. Please save it as .docx or .pdf, or paste the text below.'
    );
  }

  // PDF
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    const pdfjs = await import('pdfjs-dist');
    // Worker: use the bundled worker via Vite's ?url import.
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

    const buf = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buf }).promise;
    let out = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      out += content.items.map((it) => it.str).join(' ') + '\n\n';
    }
    return out.trim();
  }

  throw new Error(
    'Unsupported file type. Please upload a .txt, .md, .csv, .json, .pdf, or .docx file — or paste the text directly.'
  );
}
