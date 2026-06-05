// ──────────────────────────────────────────────────────────────────────────────
// Azure OpenAI Client — multi-region streaming with fallback
// ──────────────────────────────────────────────────────────────────────────────

interface RegionConfig {
  name: string;
  endpoint: string;
  apiKey: string;
  model: string;
}

export interface ChatCompletionMeta {
  content: string;
  finishReason: string;
  region: string;
}

export class AIUpstreamError extends Error {
  httpStatus?: number;
  region?: string;
  clientAborted?: boolean;

  constructor(
    message: string,
    opts?: { httpStatus?: number; region?: string; clientAborted?: boolean },
  ) {
    super(message);
    this.name = 'AIUpstreamError';
    this.httpStatus = opts?.httpStatus;
    this.region = opts?.region;
    this.clientAborted = opts?.clientAborted;
  }
}

export class AnalysisTruncatedError extends Error {
  contentLength: number;
  maxTokens: number;
  region: string;

  constructor(contentLength: number, maxTokens: number, region: string) {
    super(`Analysis truncated: ${contentLength} chars, maxTokens=${maxTokens}`);
    this.name = 'AnalysisTruncatedError';
    this.contentLength = contentLength;
    this.maxTokens = maxTokens;
    this.region = region;
  }
}

function getAvailableRegions(): RegionConfig[] {
  const regions: RegionConfig[] = [];

  const ep = process.env.AZURE_OPENAI_ENDPOINT;
  const key = process.env.AZURE_OPENAI_API_KEY;
  const model = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-5.4-mini';

  if (ep && key) {
    regions.push({ name: 'primary', endpoint: ep.replace(/\/$/, ''), apiKey: key, model });
  }

  const fbEp = process.env.AZURE_OPENAI_FALLBACK_ENDPOINT;
  const fbKey = process.env.AZURE_OPENAI_FALLBACK_KEY;
  const fbModel = process.env.AZURE_OPENAI_FALLBACK_MODEL || model;

  if (fbEp && fbKey) {
    regions.push({
      name: 'fallback',
      endpoint: fbEp.replace(/\/$/, ''),
      apiKey: fbKey,
      model: fbModel,
    });
  }

  return regions;
}

async function chatCompletionSingleRegion(
  region: RegionConfig,
  systemPrompt: string,
  userMessage: string,
  options: { temperature: number; maxTokens: number; timeoutMs: number },
): Promise<ChatCompletionMeta> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const response = await fetch(`${region.endpoint}/openai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${region.apiKey}`,
      },
      body: JSON.stringify({
        model: region.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_completion_tokens: options.maxTokens,
        response_format: { type: 'json_object' },
        stream: true,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AIUpstreamError(`HTTP ${response.status}`, {
        httpStatus: response.status,
        region: region.name,
      });
    }

    if (!response.body) {
      throw new AIUpstreamError('No response body', { region: region.name });
    }

    let content = '';
    let finishReason = '';
    let firstChunkReceived = false;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (!firstChunkReceived) {
        clearTimeout(timeoutId);
        firstChunkReceived = true;
      }

      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') continue;

        try {
          const data = JSON.parse(payload);
          const delta = data.choices?.[0]?.delta?.content;
          if (delta) content += delta;
          const fr = data.choices?.[0]?.finish_reason;
          if (fr) finishReason = fr;
        } catch {
          // Skip malformed SSE lines
        }
      }
    }

    return { content, finishReason: finishReason || 'stop', region: region.name };
  } catch (err) {
    if (err instanceof AIUpstreamError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new AIUpstreamError('Client timeout', {
        region: region.name,
        clientAborted: true,
      });
    }
    throw new AIUpstreamError(String(err), { region: region.name });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function chatCompletionWithMeta(
  systemPrompt: string,
  userMessage: string,
  options: {
    temperature: number;
    maxTokens: number;
    timeoutMs: number;
    maxRegions?: number;
  },
): Promise<ChatCompletionMeta> {
  const regions = getAvailableRegions();
  if (regions.length === 0) {
    throw new Error('No Azure OpenAI regions configured');
  }

  const maxRegions = Math.min(options.maxRegions || 2, regions.length);
  const regionsToTry = regions.slice(0, maxRegions);

  let lastError: Error | null = null;

  for (const region of regionsToTry) {
    try {
      return await chatCompletionSingleRegion(region, systemPrompt, userMessage, {
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        timeoutMs: options.timeoutMs,
      });
    } catch (err) {
      lastError = err as Error;
      console.warn(`Region ${region.name} failed, trying next...`, err);
    }
  }

  throw lastError || new Error('All regions failed');
}

/** Parse JSON from AI response content, stripping markdown fences if present */
export function parseJsonResponse<T>(content: string): T {
  let cleaned = content.trim();

  // Strip ```json ... ``` fences
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  return JSON.parse(cleaned) as T;
}
