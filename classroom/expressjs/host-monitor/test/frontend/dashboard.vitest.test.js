import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, test, vi } from 'vitest';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../public/dashboard.html');
const navbarPath = resolve(__dirname, '../../public/js/navbar.js');

function createJsonResponse(body, ok = true, status = 200) {
  return {
    ok,
    status,
    async json() {
      return body;
    },
  };
}

function createFetchMock(initialHosts = []) {
  const hosts = [...initialHosts];

  return vi.fn(async (url, options = {}) => {
    const method = options.method ?? 'GET';

    if (url === '/api/hosts' && method === 'GET') {
      return createJsonResponse(hosts);
    }

    if (url === '/api/hosts' && method === 'POST') {
      const payload = JSON.parse(options.body);
      const createdHost = {
        id: `host-${hosts.length + 1}`,
        status: 'Online',
        uptime: new Date().toISOString(),
        ...payload,
      };
      hosts.push(createdHost);
      return createJsonResponse(createdHost, true, 201);
    }

    if (url.startsWith('/api/hosts/') && method === 'DELETE') {
      // The backend only acknowledges deletion; UI updates its own local array.
      return createJsonResponse({}, true, 204);
    }

    return createJsonResponse({ error: 'Not found' }, false, 404);
  });
}

function extractModuleScript(html) {
  const match = html.match(/<script type="module">([\s\S]*?)<\/script>/);

  if (!match) {
    throw new Error('Module script not found in index.html');
  }

  return match[1];
}

async function bootstrapPage(initialHosts = []) {
  const html = readFileSync(htmlPath, 'utf8');
  const navbarScript = readFileSync(navbarPath, 'utf8');
  const scriptContent = extractModuleScript(html);
  const dom = new JSDOM(html, {
    url: 'http://localhost:3000',
    runScripts: 'outside-only',
  });

  const fetchMock = createFetchMock(initialHosts);
  dom.window.fetch = fetchMock;
  dom.window.localStorage.setItem('hostMonitorToken', 'fake-token');
  dom.window.localStorage.setItem(
    'hostMonitorUser',
    JSON.stringify({
      id: 'u-1',
      name: 'Maria Silva',
      email: 'maria@example.com',
    })
  );

  dom.window.eval(navbarScript);
  await dom.window.eval(`(async () => {${scriptContent}})()`);

  return { dom, fetchMock };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('public/dashboard.html', () => {
  test('renderiza hosts carregados da API', async () => {
    const { dom } = await bootstrapPage([
      {
        id: 'h-1',
        name: 'Google DNS',
        address: '8.8.8.8',
        category: 'DNS',
        status: 'Online',
        uptime: new Date(Date.now() - 60_000).toISOString(),
      },
    ]);

    const cardText = dom.window.document.body.textContent;
    assert.match(cardText, /Google DNS/);
    assert.match(cardText, /Categoria:\s*DNS/);
    assert.match(cardText, /8\.8\.8\.8/);

    const detailsLink = dom.window.document.querySelector(
      'a[href="/host.html?id=h-1"]'
    );
    assert.ok(detailsLink, 'Expected details link for host card');

    const deleteButton = dom.window.document.querySelector(
      '[data-id="h-1"] .delete-host-btn'
    );
    assert.ok(deleteButton, 'Expected remove button for host card');

    dom.window.close();
  });

  test('remove host do grid ao clicar em Remover', async () => {
    const { dom, fetchMock } = await bootstrapPage([
      {
        id: 'h-1',
        name: 'Google DNS',
        address: '8.8.8.8',
        category: 'DNS',
        status: 'Online',
        uptime: new Date(Date.now() - 60_000).toISOString(),
      },
    ]);

    const removeButton = dom.window.document.querySelector(
      '[data-id="h-1"] .delete-host-btn'
    );
    assert.ok(removeButton, 'Expected remove button to exist before deletion');

    removeButton.click();

    await Promise.resolve();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const deleteCall = fetchMock.mock.calls.find(
      ([url, options]) =>
        url === '/api/hosts/h-1' && options?.method === 'DELETE'
    );
    assert.ok(deleteCall, 'Expected DELETE /api/hosts/h-1 call');

    const removedCard = dom.window.document.querySelector('[data-id="h-1"]');
    assert.equal(removedCard, null);

    dom.window.close();
  });

  test('abre e fecha o modal de criação', async () => {
    const { dom } = await bootstrapPage();

    const modal = dom.window.document.getElementById('host-modal');
    const openButton = dom.window.document.getElementById('open-host-modal');
    const closeButton = dom.window.document.getElementById('close-host-modal');

    assert.ok(modal.classList.contains('hidden'));

    openButton.click();
    assert.ok(!modal.classList.contains('hidden'));

    closeButton.click();
    assert.ok(modal.classList.contains('hidden'));

    dom.window.close();
  });

  test('envia formulário e adiciona host ao grid', async () => {
    const { dom, fetchMock } = await bootstrapPage();

    const form = dom.window.document.getElementById('host-form');
    const nameInput = form.querySelector('input[name="name"]');
    const addressInput = form.querySelector('input[name="address"]');
    const categoryInput = form.querySelector('input[name="category"]');

    nameInput.value = 'Cloudflare DNS';
    addressInput.value = '1.1.1.1';
    categoryInput.value = 'DNS';

    form.dispatchEvent(
      new dom.window.Event('submit', { bubbles: true, cancelable: true })
    );

    await Promise.resolve();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const postCall = fetchMock.mock.calls.find(
      ([url, options]) => url === '/api/hosts' && options?.method === 'POST'
    );

    assert.ok(postCall, 'Expected a POST /api/hosts call');

    const postedBody = JSON.parse(postCall[1].body);
    assert.deepEqual(postedBody, {
      name: 'Cloudflare DNS',
      address: '1.1.1.1',
      category: 'DNS',
    });

    const createdCard = dom.window.document.querySelector('[data-id="host-1"]');
    assert.ok(createdCard, 'Expected created host card to be rendered');
    assert.match(createdCard.textContent, /Cloudflare DNS/);

    dom.window.close();
  });

  test('redireciona para login quando nao existe token', async () => {
    const html = readFileSync(htmlPath, 'utf8');
    const navbarScript = readFileSync(navbarPath, 'utf8');
    const scriptContent = extractModuleScript(html);
    const dom = new JSDOM(html, {
      url: 'http://localhost:3000/dashboard.html',
      runScripts: 'outside-only',
    });

    dom.window.fetch = createFetchMock();
    dom.window.eval(navbarScript);

    await assert.rejects(
      () => dom.window.eval(`(async () => {${scriptContent}})()`),
      /Missing auth token/
    );

    dom.window.close();
  });
});
