// ──────────────────────────────────────────────────────────────────────────────
// File text extraction — PDF, DOCX, TXT, Markdown
// ──────────────────────────────────────────────────────────────────────────────

const MAX_TEXT_LENGTH = 30000; // ~30K chars max

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const EXTENSION_MIME_MAP: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export function resolveMimeType(fileName: string, declaredType: string): string {
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  return EXTENSION_MIME_MAP[ext] || declaredType;
}

export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType);
}

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
): Promise<{ text: string; truncated: boolean; originalLength: number }> {
  let text = '';

  switch (mimeType) {
    case 'application/pdf': {
      // Dynamic import to avoid bundling issues
      const pdfParse = (await import('pdf-parse')).default;
      const result = await pdfParse(buffer);
      text = result.text;
      break;
    }
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
      break;
    }
    case 'text/plain':
    case 'text/markdown':
    default:
      text = buffer.toString('utf-8');
      break;
  }

  const originalLength = text.length;
  const truncated = originalLength > MAX_TEXT_LENGTH;
  if (truncated) {
    text = text.slice(0, MAX_TEXT_LENGTH);
  }

  return { text: text.trim(), truncated, originalLength };
}
