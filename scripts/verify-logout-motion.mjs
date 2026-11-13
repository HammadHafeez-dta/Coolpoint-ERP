// Run against Vite: node scripts/verify-logout-motion.mjs [http://127.0.0.1:5173]
// Uses an isolated headless Chrome profile and mocked API responses. No live credentials.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const origin = process.argv[2] || 'http://127.0.0.1:5173';
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'coolpoint-logout-'));
const output = path.resolve('../.impeccable/review/logout-motion');
fs.mkdirSync(output, { recursive: true });
const child = spawn(chrome, ['--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0',
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--no-sandbox', 'about:blank'], { stdio: 'ignore', windowsHide: true });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
let cdp, evaluate;
const dialogs=[];
const guard = setTimeout(() => { child.kill(); process.exit(1); }, 150000);
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
  cdp = async (method, params = {}) => {
    const response = await Promise.race([send(method, params, sessionId), sleep(10000).then(() => { throw new Error('CDP timed out: ' + method); })]);
    assert(!response.error, JSON.stringify(response.error)); return response.result;
  };
  evaluate = async expression => {
    const response = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    assert(!response.exceptionDetails, JSON.stringify(response.exceptionDetails)); return response.result.value;
  };
  const until = async (expression, timeout = 10000) => {
    const start = Date.now();
    while (!(await evaluate(expression))) {
      assert(Date.now() - start < timeout, `Timed out: ${expression}`); await sleep(40);
    }
  };

  const token = 'e30.' + Buffer.from(JSON.stringify({ exp: Math.floor(Date.now()/1000)+3600 })).toString('base64url') + '.test';
  listeners.push(message => {
    if (message.method !== 'Fetch.requestPaused') return;
    const { requestId, request } = message.params;
    const url = new URL(request.url), p = url.pathname.toLowerCase();
    if (url.origin === origin && !p.startsWith('/api')) { void cdp('Fetch.continueRequest', { requestId }); return; }
    let data = [];
    if (p.includes('my-permissions')) data = { userId: 'tester', site: 'TEST', userLevel: 'A', isAdmin: true, accessibleModules: ['HRMS', 'CRM'], pages: [] };
    else if (p.endsWith('/sites/all')) data = [{site:'TEST',name:'Test site'}];
    else if (p.endsWith('/users/all')) data = [{userNo:1,userID:'tester',userName:'Test Administrator',userLevel:'A',site:'TEST'}];
    void cdp('Fetch.fulfillRequest', { requestId, responseCode:200, responseHeaders:[
      {name:'Content-Type',value:'application/json'}, {name:'Access-Control-Allow-Origin',value:origin},
      {name:'Access-Control-Allow-Headers',value:'*'},{name:'Access-Control-Allow-Methods',value:'GET,POST,OPTIONS'}
    ], body:Buffer.from(JSON.stringify(data)).toString('base64') });
  });
  await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Fetch.enable',{patterns:[{urlPattern:'*'}]});
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`sessionStorage.setItem('token',${JSON.stringify(token)});sessionStorage.setItem('site','TEST');sessionStorage.setItem('user',JSON.stringify({username:'tester',userNo:1,userLevel:'A'}));`});
  const shot = async name => {
    const result=await cdp('Page.captureScreenshot',{format:'png'});
    fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(result.data,'base64'));
  };
  for (const scenario of [
    {name:'desktop',width:1440,route:'/user-access/existing-users'},
    {name:'mobile',width:390,route:'/modules'},
    {name:'reduced',width:1440,route:'/modules',reduced:true},
    {name:'fallback',width:1440,route:'/modules',fallback:true}
  ]) {
    await cdp('Emulation.setDeviceMetricsOverride',{width:scenario.width,height:900,deviceScaleFactor:1,mobile:scenario.width<768});
    await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:scenario.reduced?'reduce':'no-preference'}]});
    await cdp('Page.navigate',{url:origin+scenario.route});
    await until(`!!document.querySelector('[aria-label="Logout"], [aria-label="Sign out"]')`);
    if (scenario.fallback) await evaluate('document.startViewTransition = undefined');
    await shot(scenario.name+'-before');
    await evaluate(`(() => {
      window.__logoutAt = performance.now();
      const button=document.querySelector('[aria-label=Logout], [aria-label="Sign out"]');
      button.click();
    })()`);
    await until('location.pathname === "/" && !sessionStorage.getItem("token") && !!document.querySelector("[autocomplete=username]")');
    const state=await evaluate(`({transition:document.documentElement.classList.contains('logout-transition'),focus:document.activeElement?.getAttribute('autocomplete'),duration:getComputedStyle(document.documentElement,'::view-transition-new(root)').animationDuration})`);
    assert.equal(state.focus,'username','Focus lands on sign-in');
    if (!scenario.reduced && !scenario.fallback) {
      assert(state.transition,'Native transition is active after route/session update');
      assert.equal(state.duration,'0.26s');
      await shot(scenario.name+'-transition');
    }
    if (scenario.reduced) assert(!state.transition,'Reduced motion skips transition');
    await until('!document.documentElement.classList.contains("logout-transition")');
    await sleep(300);
    assert.equal(await evaluate('location.pathname'),'/','No second redirect or logout');
    await shot(scenario.name+'-signin');
    console.log('PASS '+scenario.name+' logout, immediate session cleanup and sign-in focus');
  }
} finally { clearTimeout(guard); socket?.close(); child.kill(); }
