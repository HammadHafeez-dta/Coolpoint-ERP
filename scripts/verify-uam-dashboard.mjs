// Run against Vite: node scripts/verify-uam-dashboard.mjs [http://127.0.0.1:5173]
// Uses an isolated headless Chrome profile and mocked API responses. No live credentials.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const origin = process.argv[2] || 'http://127.0.0.1:5173';
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'coolpoint-uam-'));
const output = path.resolve('../.impeccable/review/uam');
fs.mkdirSync(output, { recursive: true });
const child = spawn(chrome, ['--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0',
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--no-sandbox', 'about:blank'], { stdio: 'ignore', windowsHide: true });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
let cdp, evaluate;
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

  const token = 'e30.' + Buffer.from(JSON.stringify({exp: Math.floor(Date.now()/1000)+3600})).toString('base64url') + '.test';
  let mode = 'data', limited = false, delay = 0;
  const calls = [], errors = [];
  const users = Array.from({length: 19}, (_, i) => ({userNo:i+1,userID:'user'+(i+1),userName:i===0?'Ayesha Administrator':i===1?'Bilal Operations':i===2?'A very long account name for engineering and technical operations across the company':`Account ${i+1}`,userLevel:i<2?'A':i===18?'X':'U',webUser:i<10}));
  listeners.push(message => {
    if(message.method==='Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if(message.method!=='Fetch.requestPaused') return;
    const {requestId,request}=message.params;
    if(request.url.startsWith(origin)&&!new URL(request.url).pathname.startsWith('/api')){void cdp('Fetch.continueRequest',{requestId});return;}
    void (async()=>{
      const url=new URL(request.url), p=url.pathname.toLowerCase();let data={},status=200;
      if(request.method==='OPTIONS') data={};
      else if(p.includes('my-permissions')) data={userId:'tester',site:'TEST',userLevel:limited?'U':'A',isAdmin:!limited,accessibleModules:['HRMS'],pages:[]};
      else if(p.endsWith('/users/all')) {calls.push(p);await sleep(delay);if(mode==='error'){status=503;data={message:'Unavailable'};}else data=mode==='empty'?[]:users;}
      else if(p.endsWith('/users/childs-list')) {calls.push(p);assert.equal(url.searchParams.get('site'),'TEST');if(mode==='partial'){status=503;data={message:'Unavailable'};}else data=mode==='empty'?[]:[{userNo:3,softwareName:'HRMS',site:'TEST'},{userNo:3,softwareName:'HR',site:'TEST'},{userNo:4,softwareName:'Commercial CRM',site:'TEST'},{userNo:999,softwareName:'HRMS',site:'TEST'},{userNo:5,softwareName:'HRMS',site:'OTHER'},{userNo:6,softwareName:'UAM',site:'TEST'}];}
      await cdp('Fetch.fulfillRequest',{requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:origin},{name:'Access-Control-Allow-Headers',value:request.headers['Access-Control-Request-Headers']||'*'},{name:'Access-Control-Allow-Methods',value:'GET,OPTIONS'}],body:Buffer.from(JSON.stringify(data)).toString('base64')});
    })().catch(error=>{if(!String(error).includes('Invalid InterceptionId'))errors.push(String(error));});
  });
  await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Fetch.enable',{patterns:[{urlPattern:'*'}]});
  const authSource = userLevel => `sessionStorage.setItem('token',${JSON.stringify(token)});sessionStorage.setItem('site','TEST');sessionStorage.setItem('user',JSON.stringify({username:'tester',site:'TEST',userLevel:'${userLevel}'}));`;
  const authScript = await cdp('Page.addScriptToEvaluateOnNewDocument',{source:authSource('A')});
  const run=(fn,...args)=>evaluate('('+fn.toString()+')(...'+JSON.stringify(args)+')');
  const waitText=text=>until('document.body.textContent.includes('+JSON.stringify(text)+')');
  const viewport=(width,height=1000)=>cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<768});
  const go=async(path='/user-access/dashboard')=>{await cdp('Page.navigate',{url:origin+path});await waitText('UAM Dashboard');};
  const shot=async name=>{await sleep(150);const result=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(result.data,'base64'));};
  const clickLabel=async label=>run(label=>document.querySelector(`[aria-label="${label}"]`).click(),label);
  const change=async(label,value)=>run((label,value)=>{const e=document.querySelector(`[aria-label="${label}"]`);Object.getOwnPropertyDescriptor(e.tagName==='INPUT'?HTMLInputElement.prototype:HTMLSelectElement.prototype,'value').set.call(e,value);e.dispatchEvent(new Event(e.tagName==='INPUT'?'input':'change',{bubbles:true}));},label,value);

  await viewport(1440);await go();await waitText('14 limited accounts');
  assert.deepEqual(await run(()=>[...document.querySelector('[aria-label="Account summary"] dl').querySelectorAll('dd')].map(e=>e.textContent)),['19','2','16','10']);
  assert.deepEqual(await run(()=>[...document.querySelector('#uam-access-title').parentElement.querySelectorAll('dd')].map(e=>e.textContent)),['1','1'],'Assignments deduplicate aliases and exclude orphan, foreign-site and UAM rows');
  assert(await run(()=>[...document.querySelectorAll('aside button')].some(e=>e.textContent==='Dashboard')),'Sidebar dashboard entry');
  assert(await run(()=>!!document.querySelector('a[href="/user-access/create-user?userNo=1"]')),'Edit deep link');
  await shot('desktop');
  await clickLabel('Next users');await waitText('Page 2 of 3');await clickLabel('Previous users');await waitText('Page 1 of 3');
  await change('Search users','Bilal');await waitText('1 accounts');assert(await run(()=>!document.querySelector('a[href="/user-access/create-user?userNo=1"]')));
  await change('Search users','nobody-matches');await waitText('No matching accounts');
  await run(()=>[...document.querySelectorAll('button')].find(e=>e.textContent==='Clear filters').click());
  await change('Filter by access level','other');await waitText('1 accounts');assert(await run(()=>!!document.querySelector('a[href="/user-access/create-user?userNo=19"]')));
  await change('Filter by access level','all');
  for(const width of [1024,768,390,320]){await viewport(width);await go();await waitText('14 limited accounts');assert(await run(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow at '+width);await shot(width===390?'mobile':'width-'+width);}
  await viewport(1440);await go();await waitText('14 limited accounts');await run(()=>document.documentElement.classList.add('dark'));await shot('dark');
  await go('/user-access');await waitText('14 limited accounts');assert(await run(()=>location.pathname==='/user-access/dashboard'),'Root redirect');
  mode='partial';await go();await waitText('Module assignments could not be loaded');assert(await run(()=>!!document.querySelector('#uam-users-title')));await shot('partial');
  mode='empty';await go();await waitText('No accounts found');assert.deepEqual(await run(()=>[...document.querySelector('[aria-label="Account summary"] dl').querySelectorAll('dd')].map(e=>e.textContent)),['0','0','0','0']);await shot('empty');
  mode='error';await go();await waitText('Accounts could not be loaded');assert(!(await run(()=>!!document.querySelector('[aria-label="Account summary"]'))));await shot('error');
  mode='data';delay=800;await go();await until('!!document.querySelector("[aria-label=\\"Loading UAM dashboard\\"]")');await shot('loading');await waitText('14 limited accounts');delay=0;
  limited=true;await cdp('Page.removeScriptToEvaluateOnNewDocument',{identifier:authScript.identifier});await cdp('Page.addScriptToEvaluateOnNewDocument',{source:authSource('U')});const before=calls.length;await cdp('Page.navigate',{url:origin+'/user-access/dashboard'});await until('location.pathname!=="/user-access/dashboard"');await sleep(300);assert.equal(calls.length,before,'Limited user cannot fetch dashboard data');assert(!(await run(()=>document.body.textContent.includes('UAM Dashboard'))));
  assert.deepEqual(errors,[]);console.log('PASS totals, assignment scoping/deduplication, search, roles, pagination, edit links, root/sidebar navigation, 1440/1024/768/390/320, dark, loading, empty, partial, error, and non-admin protection');
  fs.writeFileSync(path.join(output,'result.txt'),'UAM dashboard browser checks passed with mocked APIs. No live data changed.\n');
} catch (error) {
  try {
    console.log(await evaluate('document.body.innerText'));
    const capture=await cdp('Page.captureScreenshot',{format:'png'});
    fs.writeFileSync(path.join(output,'failure.png'),Buffer.from(capture.data,'base64'));
  } catch {}
  throw error;
} finally { clearTimeout(guard);socket?.close();child.kill(); }



