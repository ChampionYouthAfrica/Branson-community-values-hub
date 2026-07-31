// Extract plain text from an uploaded file, in the browser.
// Supports plain-text formats directly and PDFs via pdfjs (dynamically imported
// so it only loads when a PDF is actually chosen).
export async function extractTextFromFile(file) {
  const name = (file.name || '').toLowerCase();

  // Plain-text-like files
  if (/\.(txt|md|markdown|csv|json|html?|rtf)$/.test(name) || file.type.startsWith('text/')) {
    return await file.text();
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
    'Unsupported file type. Please upload a .txt, .md, .csv, .json, or .pdf file — or paste the text directly.'
  );
}
