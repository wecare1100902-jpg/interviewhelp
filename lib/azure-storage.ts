// ──────────────────────────────────────────────────────────────────────────────
// Azure Blob Storage — CV file upload
// ──────────────────────────────────────────────────────────────────────────────

import { BlobServiceClient } from '@azure/storage-blob';

const CONTAINER_NAME = 'candidate-cvs';

function getConnectionString(): string {
  const cs = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!cs) throw new Error('AZURE_STORAGE_CONNECTION_STRING not configured');
  return cs;
}

let _blobService: BlobServiceClient | null = null;
function getBlobService(): BlobServiceClient {
  if (!_blobService) {
    _blobService = BlobServiceClient.fromConnectionString(getConnectionString());
  }
  return _blobService;
}

export async function uploadCVToBlob(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<string> {
  const blobService = getBlobService();
  const containerClient = blobService.getContainerClient(CONTAINER_NAME);
  await containerClient.createIfNotExists({ access: undefined }); // private access

  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const blobName = `${timestamp}-${safeName}`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: mimeType },
  });

  return blockBlobClient.url;
}
