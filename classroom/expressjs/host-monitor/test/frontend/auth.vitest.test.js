import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, test, vi } from 'vitest';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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

function extractModuleScript(html, fileName) {
  const match = html.match(/<script type="module">([\s\S]*?)<\/script>/);

  if (!match) {
    throw new Error(`Module script not found in ${fileName}`);
  }

  return match[1];
}

function readPublicPage(fileName) {
  const htmlPath = resolve(__dirname, `../../public/${fileName}`);
  const html = readFileSync(htmlPath, 'utf8');

  return {
    html,
    navbarScript: readFileSync(navbarPath, 'utf8'),
    scriptContent: extractModuleScript(html, fileName),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('public auth pages', () => {
  test('landing page exibe links de login e cadastro', async () => {
    const { html, navbarScript, scriptContent } = readPublicPage('index.html');
    const dom = new JSDOM(html, {
      url: 'http://localhost:3000/',
      runScripts: 'outside-only',
    });

    dom.window.eval(navbarScript);
    await dom.window.eval(`(async () => {${scriptContent}})()`);

    assert.ok(dom.window.document.querySelector('a[href="/login.html"]'));
    assert.ok(dom.window.document.querySelector('a[href="/register.html"]'));
    assert.match(dom.window.document.body.textContent, /Host Monitor/);

    dom.window.close();
  });

  test('login salva token e usuario no localStorage', async () => {
    const { html, navbarScript, scriptContent } = readPublicPage('login.html');
    const dom = new JSDOM(html, {
      url: 'http://localhost:3000/login.html',
      runScripts: 'outside-only',
    });
    const fetchMock = vi.fn(async (url, options = {}) => {
      assert.equal(url, '/api/auth/login');
      assert.equal(options.method, 'POST');

      return createJsonResponse({
        token: 'jwt-token',
        user: { id: 'u-1', name: 'Maria Silva', email: 'maria@example.com' },
      });
    });

    dom.window.fetch = fetchMock;
    dom.window.eval(navbarScript);
    await dom.window.eval(`(async () => {${scriptContent}})()`);

    const form = dom.window.document.getElementById('login-form');
    form.querySelector('input[name="email"]').value = 'maria@example.com';
    form.querySelector('input[name="password"]').value = 'secret123';
    form.dispatchEvent(
      new dom.window.Event('submit', { bubbles: true, cancelable: true })
    );

    await Promise.resolve();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.equal(
      dom.window.localStorage.getItem('hostMonitorToken'),
      'jwt-token'
    );
    assert.match(
      dom.window.localStorage.getItem('hostMonitorUser'),
      /maria@example.com/
    );

    dom.window.close();
  });

  test('cadastro envia confirmacao de senha e salva token', async () => {
    const { html, navbarScript, scriptContent } =
      readPublicPage('register.html');
    const dom = new JSDOM(html, {
      url: 'http://localhost:3000/register.html',
      runScripts: 'outside-only',
    });
    const fetchMock = vi.fn(async (url, options = {}) => {
      assert.equal(url, '/api/auth/register');
      assert.equal(options.method, 'POST');
      assert.deepEqual(JSON.parse(options.body), {
        name: 'Maria Silva',
        email: 'maria@example.com',
        password: 'secret123',
        passwordConfirmation: 'secret123',
      });

      return createJsonResponse({
        token: 'jwt-token',
        user: { id: 'u-1', name: 'Maria Silva', email: 'maria@example.com' },
      });
    });

    dom.window.fetch = fetchMock;
    dom.window.eval(navbarScript);
    await dom.window.eval(`(async () => {${scriptContent}})()`);

    const form = dom.window.document.getElementById('register-form');
    form.querySelector('input[name="name"]').value = 'Maria Silva';
    form.querySelector('input[name="email"]').value = 'maria@example.com';
    form.querySelector('input[name="password"]').value = 'secret123';
    form.querySelector('input[name="passwordConfirmation"]').value =
      'secret123';
    form.dispatchEvent(
      new dom.window.Event('submit', { bubbles: true, cancelable: true })
    );

    await Promise.resolve();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.equal(
      dom.window.localStorage.getItem('hostMonitorToken'),
      'jwt-token'
    );

    dom.window.close();
  });
});
