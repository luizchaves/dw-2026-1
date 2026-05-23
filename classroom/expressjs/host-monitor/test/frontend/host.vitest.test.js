import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, test, vi } from 'vitest';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../public/host.html');

function createJsonResponse(body, ok = true, status = 200) {
  return {
    ok,
    status,
    async json() {
      return body;
    },
  };
}

function createDetailsPayload(overrides = {}) {
  return {
    host: {
      id: 'h-1',
      name: 'Google DNS',
      address: '8.8.8.8',
      category: 'DNS',
      status: 'Online',
      uptime: 98.5,
      lastCheckedAt: '2026-05-23T10:00:00.000Z',
    },
    statistics: {
      totalChecks: 2,
      successfulChecks: 2,
      failedChecks: 0,
      availability: 100,
      averageLatency: 10.25,
      minLatency: 8.4,
      maxLatency: 12.1,
      lastCheckAt: '2026-05-23T10:00:00.000Z',
    },
    history: [
      {
        id: 2,
        checkedAt: '2026-05-23T10:00:00.000Z',
        reachable: true,
        transmitted: 1,
        received: 1,
        minMs: 10.1,
        avgMs: 10.2,
        maxMs: 10.3,
        stddevMs: 0.1,
        error: null,
      },
      {
        id: 1,
        checkedAt: '2026-05-23T09:50:00.000Z',
        reachable: false,
        transmitted: 1,
        received: 0,
        minMs: null,
        avgMs: null,
        maxMs: null,
        stddevMs: null,
        error: 'Unknown host',
      },
    ],
    ...overrides,
  };
}

function createFetchMock() {
  let detailsPayload = createDetailsPayload();

  return vi.fn(async (url, options = {}) => {
    const method = options.method ?? 'GET';

    if (url === '/api/hosts/h-1/details?limit=30' && method === 'GET') {
      return createJsonResponse(detailsPayload);
    }

    if (url.startsWith('/api/hosts/h-1/ping?count=') && method === 'GET') {
      detailsPayload = createDetailsPayload({
        host: {
          ...detailsPayload.host,
          status: 'Online',
          uptime: 99.0,
        },
      });

      return createJsonResponse({
        reachable: true,
        checkedAt: '2026-05-23T10:05:00.000Z',
      });
    }

    return createJsonResponse({ error: 'Not found' }, false, 404);
  });
}

function extractModuleScript(html) {
  const match = html.match(/<script type="module">([\s\S]*?)<\/script>/);

  if (!match) {
    throw new Error('Module script not found in host.html');
  }

  return match[1];
}

async function bootstrapPage() {
  const html = readFileSync(htmlPath, 'utf8');
  const scriptContent = extractModuleScript(html);
  const dom = new JSDOM(html, {
    url: 'http://localhost:3000/host.html?id=h-1',
    runScripts: 'outside-only',
  });

  const fetchMock = createFetchMock();
  dom.window.fetch = fetchMock;

  await dom.window.eval(`(async () => {${scriptContent}})()`);

  return { dom, fetchMock };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('public/host.html', () => {
  test('renderiza detalhes, historico e grafico do host', async () => {
    const { dom } = await bootstrapPage();

    const name = dom.window.document.getElementById('host-name').textContent;
    const address =
      dom.window.document.getElementById('host-address').textContent;
    const uptime =
      dom.window.document.getElementById('host-uptime').textContent;

    assert.match(name, /Google DNS/);
    assert.match(address, /8\.8\.8\.8/);
    assert.match(uptime, /98\.50%/);

    const historyRows =
      dom.window.document.querySelectorAll('#history-table tr');
    assert.equal(historyRows.length, 2);

    const chartPoints = dom.window.document.querySelectorAll(
      '#latency-chart circle'
    );
    assert.equal(chartPoints.length, 2);

    dom.window.close();
  });

  test('executa ping pelo botao e recarrega detalhes', async () => {
    const { dom, fetchMock } = await bootstrapPage();

    const pingInput = dom.window.document.getElementById('ping-count');
    const pingButton = dom.window.document.getElementById('run-ping');

    pingInput.value = '2';
    pingButton.click();

    await Promise.resolve();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const pingCall = fetchMock.mock.calls.find(
      ([url]) => url === '/api/hosts/h-1/ping?count=2'
    );

    assert.ok(pingCall, 'Expected ping request to be made');

    const detailsCalls = fetchMock.mock.calls.filter(
      ([url]) => url === '/api/hosts/h-1/details?limit=30'
    );

    assert.ok(
      detailsCalls.length >= 2,
      'Expected details to be reloaded after ping'
    );

    const feedback =
      dom.window.document.getElementById('ping-feedback').textContent;
    assert.match(feedback, /Ping realizado com sucesso/);

    dom.window.close();
  });
});
