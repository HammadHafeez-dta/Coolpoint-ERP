// Run against Vite: node scripts/verify-coolpoint-loader.mjs [http://127.0.0.1:5173]
// Uses an isolated headless Chrome profile and mocked API responses. No live credentials.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const origin = process.argv[2] || 'http://127.0.0.1:5173';
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'coolpoint-loader-'));
const output = path.resolve('../.taste-skill/loader-check');
fs.mkdirSync(output, { recursive: true });
const child = spawn(chrome, ['--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0',
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--no-sandbox', 'about:blank'], { stdio: 'ignore', windowsHide: true });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
const guard = setTimeout(() => { child.kill(); process.exit(1); }, 90000);
try {
  let port;
  for (let i = 0; i < 100 && !port; i++) {
    await sleep(100);
    try { port = Number(fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]); } catch {}
  }
  assert(port, 'Chrome started'); console.log('Chrome ready');
  const version = await (await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(5000) })).json();
  console.log('CDP connected');
  socket = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  let id = 0;
  const pending = new Map();
  const listeners = [];
  socket.addEventListener('message', event => {
    const msg = JSON.parse(event.data);
    if (msg.id) { pending.get(msg.id)?.(msg); pending.delete(msg.id); }
    else listeners.forEach(listener => listener(msg));
  });
  const send = (method, params = {}, sessionId) => new Promise(resolve => {
    const request = ++id; pending.set(request, resolve);
    socket.send(JSON.stringify({ id: request, method, params, sessionId }));
  });
  const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
  const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
  const cdp = async (method, params = {}) => {
    const response = await Promise.race([send(method, params, sessionId), sleep(10000).then(() => { throw new Error('CDP timed out: ' + method); })]);
    assert(!response.error, JSON.stringify(response.error)); return response.result;
  };
  const evaluate = async expression => {
    const response = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    assert(!response.exceptionDetails, JSON.stringify(response.exceptionDetails)); return response.result.value;
  };
  const until = async (expression, timeout = 10000) => {
    const start = Date.now();
    while (!(await evaluate(expression))) {
      assert(Date.now() - start < timeout, `Timed out: ${expression}`); await sleep(40);
    }
  };
  let loginDelay = 50, loginFails = false, moduleDelay = 0, loginCount = 0;
  const token = `e30.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.test`;
  const exceptions = [];
  listeners.push(message => {
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text);
    if (message.method !== 'Fetch.requestPaused') return;
    const { requestId, request } = message.params;
    if (request.url.startsWith(origin)) { void cdp('Fetch.continueRequest', { requestId }).catch(() => {}); return; }
    void (async () => {
      let data = [], status = 200;
      const url = new URL(request.url);
      if (request.method === 'OPTIONS') data = {};
      else if (url.pathname.endsWith('/auth/sites/all')) data = [{ site: 'TEST', name: 'Test Facility' }];
      else if (url.pathname.endsWith('/auth/login')) {
        loginCount++; await sleep(loginDelay); status = loginFails ? 401 : 200;
        data = loginFails ? { message: 'Test invalid credentials' } : { token, userID: 'tester', userName: 'Test User', userLevel: 'A', site: 'TEST', userNo: 1 };
      } else if (url.pathname.includes('my-permissions')) {
        data = { userId: 'tester', site: 'TEST', isAdmin: true, userLevel: 'A', accessibleModules: ['HRMS', 'CRM'], pages: [] };
      } else if (url.pathname.includes('/crm/') || url.pathname.includes('/employee/list') || url.pathname.includes('/auth/users/all') || url.pathname.includes('/auth/softwares/all')) {
        await sleep(moduleDelay);
        if (url.pathname.endsWith('dashboard-stats')) data = { totalPipelineValue: 0, activeInquiriesCount: 0, totalWonValue: 0, wonCount: 0, conversionRate: 0 };
      }
      await cdp('Fetch.fulfillRequest', { requestId, responseCode: status, responseHeaders: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Access-Control-Allow-Origin', value: origin },
        { name: 'Access-Control-Allow-Headers', value: request.headers['Access-Control-Request-Headers'] || '*' },
        { name: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
      ], body: Buffer.from(JSON.stringify(data)).toString('base64') });
    })().catch(error => { if (!String(error).includes('Invalid InterceptionId')) exceptions.push(String(error)); });
  });
  console.log('Target attached');
  await cdp('Page.enable'); await cdp('Runtime.enable');
  await cdp('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  const navigate = async route => { await cdp('Page.navigate', { url: origin + route }); await sleep(350); };
  const reset = async () => {
    await evaluate('localStorage.clear();sessionStorage.clear()'); await navigate('/');
    await until(`document.querySelector('[role="combobox"]')?.textContent.includes('Test Facility')`);
  };
  const submit = async () => {
    await evaluate(`(() => {
      window.loginTransitionGaps = [];
      let covered = false;
      const check = () => {
        if (location.pathname !== '/') return;
        const loader = document.querySelector('.coolpoint-loader--fullscreen');
        if (loader && getComputedStyle(loader).opacity === '1') covered = true;
        if (covered && (!loader || getComputedStyle(loader).opacity !== '1')) {
          window.loginTransitionGaps.push(loader?.dataset.phase || 'missing');
        }
        requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
    })()`);
    await evaluate(`(() => {
      const fields = document.querySelectorAll('input');
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      for (const input of fields) { set.call(input, 'tester'); input.dispatchEvent(new Event('input', { bubbles: true })); }
      document.querySelector('button[type="submit"]').focus();
    })()`);
    await sleep(30);
    await evaluate(`document.querySelector('form').requestSubmit()`);
    await until(`!!document.querySelector('.coolpoint-loader--fullscreen')`);
  };
  const screenshot = async name => {
    const shot = await cdp('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(output, name + '.png'), Buffer.from(shot.data, 'base64'));
  };
  console.log('Loading login'); await navigate('/'); console.log('Login loaded'); await reset();
  const originalOverflow = await evaluate('document.body.style.overflow');
  const started = Date.now(); await submit();
  await evaluate(`document.querySelector('form').dispatchEvent(new Event('submit', { bubbles:true, cancelable:true }))`);
  await sleep(450); await screenshot('desktop-grayscale');
  assert.match(await evaluate(`getComputedStyle(document.querySelector('.coolpoint-loader__color')).clipPath`), /100%/);
  assert.equal(await evaluate(`document.body.style.overflow`), 'hidden');
  await sleep(1600); await screenshot('desktop-reveal');
  assert.equal(await evaluate('location.pathname'), '/');
  await sleep(1600); await screenshot('desktop-blue');
  await until(`location.pathname === '/modules'`);
  assert.deepEqual(await evaluate('window.loginTransitionGaps'), [], 'Login stays covered until navigation');
  assert(Date.now() - started >= 5000); assert.equal(loginCount, 1);
  await sleep(100);
  assert.equal(await evaluate(`document.body.style.overflow`), originalOverflow);
  console.log('PASS fast login: full sequence, duplicate guard, navigation, scroll cleanup');

  loginFails = true; await reset(); const failedAt = Date.now(); await submit();
  await until(`!document.querySelector('.coolpoint-loader--fullscreen')`);
  assert(Date.now() - failedAt < 2000);
  assert(await evaluate(`document.body.textContent.includes('Test invalid credentials')`));
  assert(await evaluate(`document.activeElement === document.querySelector('button[type="submit"]')`));
  console.log('PASS failed login: prompt dismissal, existing error, restored focus');

  loginFails = false; loginDelay = 6500; await reset(); await submit();
  await sleep(5250);
  assert.equal(await evaluate('location.pathname'), '/');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.coolpoint-loader__color')).clipPath`), 'inset(0px 0% 0px 0px)');
  await until(`location.pathname === '/modules'`);
  assert.deepEqual(await evaluate('window.loginTransitionGaps'), [], 'Slow login stays covered until navigation');
  console.log('PASS slow login: blue hold until authentication succeeds');

  loginDelay = 150;
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await reset(); await submit();
  await until(`location.pathname === '/modules'`);
  assert.deepEqual(await evaluate('window.loginTransitionGaps'), [], 'Reduced-motion login stays covered until navigation');
  console.log('PASS reduced-motion login: no login-page flash');
  await cdp('Emulation.setEmulatedMedia', { features: [] });

  loginDelay = 50; await reset();
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await submit(); await until(`location.pathname === '/modules'`, 2000);
  console.log('PASS reduced motion: no artificial sequence delay');
  await cdp('Emulation.setEmulatedMedia', { features: [] });

  moduleDelay = 1000;
  for (const route of ['/hr/employees', '/crm', '/user-access/user-rights']) {
    await navigate(route);
    await until(`!!document.querySelector('.coolpoint-loader--content')`);
    assert.equal(await evaluate(`!!document.querySelector('.coolpoint-loader--fullscreen')`), false);
    await screenshot('module-' + route.split('/')[1]);
    await until(`!document.querySelector('.coolpoint-loader--content')`);
    console.log('PASS initial module loader and cleanup: ' + route);
  }
  moduleDelay = 0;
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.loaderFlashes = 0;
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === 1 && (node.matches('.coolpoint-loader--content') || node.querySelector('.coolpoint-loader--content'))) window.loaderFlashes++;
    }))).observe(document, { childList: true, subtree: true });
  ` });
  await navigate('/hr/employees');
  await until(`!document.querySelector('.coolpoint-loader--content')`);
  assert.equal(await evaluate('window.loaderFlashes'), 0);
  console.log('PASS fast module fetch: no loader flash');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  loginFails = true; loginDelay = 1000; await reset(); await submit(); await sleep(300);
  await screenshot('mobile-grayscale');
  assert(await evaluate(`(() => { const b=document.querySelector('.coolpoint-loader__logo').getBoundingClientRect(); return b.left>=0 && b.right<=innerWidth && Math.abs(b.width/b.height-286/60)<.01; })()`));
  await until(`!document.querySelector('.coolpoint-loader--fullscreen')`);
  assert.deepEqual(exceptions, []);
  console.log('PASS responsive aspect ratio; no browser runtime exceptions');
  fs.writeFileSync(path.join(output, 'result.txt'), 'All loader browser checks passed. API responses mocked; no live login performed.\n');
} finally {
  clearTimeout(guard); socket?.close(); child.kill();
}
