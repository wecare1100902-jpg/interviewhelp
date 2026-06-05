// ──────────────────────────────────────────────────────────────────────────────
// Azure Table Storage — evaluation results persistence
// ──────────────────────────────────────────────────────────────────────────────

import { TableClient, TableServiceClient } from '@azure/data-tables';

function getConnectionString(): string {
  const cs = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!cs) throw new Error('AZURE_STORAGE_CONNECTION_STRING not configured');
  return cs;
}

let _tableService: TableServiceClient | null = null;
function getTableService(): TableServiceClient {
  if (!_tableService) {
    _tableService = TableServiceClient.fromConnectionString(getConnectionString());
  }
  return _tableService;
}

async function ensureTable(tableName: string): Promise<TableClient> {
  const service = getTableService();
  const client = service.getTableClient(tableName);
  try {
    await client.createTable();
  } catch (err: unknown) {
    // Table already exists — 409 Conflict is expected
    if (err && typeof err === 'object' && 'statusCode' in err && err.statusCode !== 409) {
      throw err;
    }
  }
  return client;
}

// ── Evaluations ──────────────────────────────────────────────────────────────

export async function saveEvaluation(
  userId: string,
  evaluationId: string,
  evaluationData: Record<string, unknown>,
): Promise<void> {
  const client = await ensureTable('evaluations');
  await client.upsertEntity(
    {
      partitionKey: userId,
      rowKey: evaluationId,
      data: JSON.stringify(evaluationData),
      createdAt: new Date().toISOString(),
    },
    'Replace',
  );
}

export async function getEvaluation(
  userId: string,
  evaluationId: string,
): Promise<Record<string, unknown> | null> {
  const client = await ensureTable('evaluations');
  try {
    const entity = await client.getEntity(userId, evaluationId);
    return JSON.parse(entity.data as string) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function listEvaluations(
  userId: string,
): Promise<{ evaluationId: string; createdAt: string }[]> {
  const client = await ensureTable('evaluations');
  const results: { evaluationId: string; createdAt: string }[] = [];

  const entities = client.listEntities({
    queryOptions: { filter: `PartitionKey eq '${userId}'` },
  });

  for await (const entity of entities) {
    results.push({
      evaluationId: entity.rowKey as string,
      createdAt: entity.createdAt as string,
    });
  }

  return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
