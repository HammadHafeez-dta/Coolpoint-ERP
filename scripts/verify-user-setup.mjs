// Run against Vite: node scripts/verify-user-setup.mjs [http://127.0.0.1:5173]
// Uses an isolated headless Chrome profile and mocked API responses. No live credentials.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const origin = process.argv[2] || 'http://127.0.0.1:5173';
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'coolpoint-uam-'));
const output = path.resolve('../.impeccable/review/user-setup');
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

  const token='e30.'+Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.test';
  const users=Array.from({length:11},(_,i)=>({userNo:i+1,userID:i===0?'tester':'worker'+(i+1),userName:i===0?'Test Administrator':'Worker '+(i+1),userLevel:i===0?'A':'U',webUser:true}));
  const modules=new Map(users.map(u=>[u.userNo,['CRM']])),saved=new Map(),calls=[],errors=[];
  let allowDialogs=false,failSave=false,failDelete=false,failModule=false,failPermissions=false;
  const forms=software=>software==='HRMS'?[{id:1,software,mainName:'Define',rightsName:'Employee'}]:[{id:2,software,mainName:'Transaction',rightsName:'Projects'},{id:3,software,mainName:'Define',rightsName:'HVAC Inquiries'},{id:4,software,mainName:'Define',rightsName:'Commercial Clients'},{id:5,software,mainName:'Transaction',rightsName:'Deals Pipeline'},{id:6,software,mainName:'Transaction',rightsName:'Project Quotations'},{id:7,software,mainName:'Reports',rightsName:'Sales Analytics'}];
  listeners.push(message=>{
    if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.text);
    if(message.method==='Page.javascriptDialogOpening'){dialogs.push(message.params.message);void cdp('Page.handleJavaScriptDialog',{accept:allowDialogs});return;}
    if(message.method!=='Fetch.requestPaused')return;const {requestId,request}=message.params;
    const url=new URL(request.url),p=url.pathname.toLowerCase();if(url.origin===origin&&!p.startsWith('/api')){void cdp('Fetch.continueRequest',{requestId});return;}
    void(async()=>{let data={},code=200;const body=request.postData?JSON.parse(request.postData):null;
      calls.push({p,method:request.method,body});
      if(request.method==='OPTIONS')data={};
      else if(p.includes('my-permissions')){if(failPermissions){code=503;data={message:'Permissions temporarily unavailable'};}else data={userId:'tester',site:'TEST',userLevel:'A',isAdmin:true,accessibleModules:['CRM','HRMS'],pages:[]};}
      else if(p.endsWith('/users/all'))data=users;
      else if(p.endsWith('/user-types'))data=[{userNo:1,userLevel:'A',userType:'Administrator'},{userNo:2,userLevel:'U',userType:'Limited'}];
      else if(p.endsWith('/users/maxno'))data=Math.max(...users.map(u=>u.userNo))+1;
      else if(/\/users\/edit\/\d+$/.test(p)){data=users.find(u=>u.userNo===Number(p.split('/').at(-1)))||{};}
      else if(p.endsWith('/users/save')){let user=users.find(u=>u.userNo===body.userNo);if(!user){user={userNo:body.userNo};users.push(user);}Object.assign(user,body);if(body.moduleAccessSpecified)modules.set(body.userNo,body.moduleAccess.split(','));data={userNo:body.userNo,message:'User saved'};}
      else if(request.method==='DELETE'&&p.includes('/users/child/')&&failModule){failModule=false;code=503;data={message:'Module update unavailable'};}
      else if(/\/users\/child\/\d+$/.test(p))data=(modules.get(Number(p.split('/').at(-1)))||[]).map(softwareName=>({userNo:Number(p.split('/').at(-1)),softwareName,site:'TEST'}));
      else if(p.endsWith('/softwares/all'))data=[{softwareNo:1,softwareName:'CRM',site:'TEST'},{softwareNo:2,softwareName:'HRMS',site:'TEST'}];
      else if(p.endsWith('/rights/form-names'))data=forms(url.searchParams.get('software'));
      else if(p.endsWith('/rights/saved'))data=saved.get(url.searchParams.get('userId')+'|'+url.searchParams.get('software'))||[];
      else if(p.endsWith('/rights/batch-save')){if(failSave){failSave=false;code=503;data={message:'Save temporarily unavailable'};}else{for(const right of body.rights){const key=body.userId+'|'+right.software;const rows=saved.get(key)||[];const item={formName:right.formName,enter:right.enter,addition:right.addition,updation:right.updation,delition:right.deletion};const i=rows.findIndex(r=>r.formName===right.formName);if(i<0)rows.push(item);else rows[i]=item;saved.set(key,rows);}data={message:'Rights saved'};}}
      else if(request.method==='DELETE'&&/\/users\/\d+$/.test(p)){if(failDelete){failDelete=false;code=503;data={message:'Deletion unavailable. Try again.'};}else{const no=Number(p.split('/').at(-1)),i=users.findIndex(u=>u.userNo===no);if(i>=0)users.splice(i,1);modules.delete(no);data={message:'User deleted'};}}
      await cdp('Fetch.fulfillRequest',{requestId,responseCode:code,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:origin},{name:'Access-Control-Allow-Headers',value:'*'},{name:'Access-Control-Allow-Methods',value:'GET,POST,DELETE,OPTIONS'}],body:Buffer.from(JSON.stringify(data)).toString('base64')});
    })().catch(e=>{if(!String(e).includes('Invalid InterceptionId'))errors.push(String(e));});
  });
  await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Fetch.enable',{patterns:[{urlPattern:'*'}]});
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`sessionStorage.setItem('token',${JSON.stringify(token)});sessionStorage.setItem('site','TEST');sessionStorage.setItem('user',JSON.stringify({username:'tester',userNo:1,userLevel:'A'}));`});
  const run=(fn,...args)=>evaluate('('+fn.toString()+')(...'+JSON.stringify(args)+')');
  const text=t=>until('document.body.innerText.includes('+JSON.stringify(t)+')');
  const click=t=>run(t=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===t);if(!e)throw Error('Missing '+t);e.click();},t);
  const labelClick=label=>run(label=>document.querySelector(`[aria-label="${label}"]`).click(),label);
  const input=(selector,value)=>run((selector,value)=>{const e=document.querySelector(selector);if(!e)throw Error('Missing '+selector);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,value);e.dispatchEvent(new Event('input',{bubbles:true}));},selector,value);
  const viewport=(width,height=1000)=>cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<768});
  const shot=async name=>{await sleep(200);const result=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(result.data,'base64'));};
  const go=async path=>{await cdp('Page.navigate',{url:origin+path});};
  const create=async(id,keys)=>{
    await go('/user-access/create-user');await until('!!document.querySelector("input[placeholder=\\"Enter a unique username\\"]")');
    assert(!(await run(()=>!!document.querySelector('table'))),'Create User has no directory table');
    await input('[placeholder="Enter a unique username"]',id);await input('[placeholder="e.g. John Doe"]',id+' Name');await input('input[type="password"]','pass123');
    for(const key of keys)await run(key=>{const label=[...document.querySelectorAll('label')].find(e=>e.querySelector('input[type=checkbox]')&&e.textContent.includes(key==='HRMS'?'Human Resources':'Commercial CRM'));label.querySelector('input').click();},key);
  };
  const pressed=label=>run(label=>document.querySelector(`[aria-label="${label}"]`).getAttribute('aria-pressed'),label);
  const readyRights=async()=>{await until('!!document.querySelector("[aria-label=\\"Permission setup progress\\"]")');await until('!!document.querySelector("[aria-label^=\\"View \\"]")');await until('!document.body.innerText.includes("Checking saved page access")');};
  await viewport(1440);await create('workerh',['HRMS']);await shot('create-desktop');const savesBefore=calls.filter(c=>c.p.endsWith('/rights/batch-save')).length;
  await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:1350,y:900,button:'left',clickCount:1});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:1350,y:900,button:'left',clickCount:1});
  await click('Save and assign permissions');await readyRights();assert(await run(()=>location.search.includes('software=HRMS')));assert.equal(calls.filter(c=>c.p.endsWith('/rights/batch-save')).length,savesBefore,'No automatic rights granted');assert.equal(await pressed('View Employee'),'false');await shot('guided-desktop');
  await labelClick('View Employee');let count=dialogs.length;await labelClick('Commercial CRM');assert.equal(dialogs.length,count+1);assert(await run(()=>location.search.includes('software=HRMS')));assert.equal(await pressed('View Employee'),'true','Cancelled switch retains changes');
  count=dialogs.length;await click('Existing Users');assert.equal(dialogs.length,count+1);assert(await run(()=>location.pathname.endsWith('user-rights')));
  count=dialogs.length;await run(()=>history.back());await until('location.pathname.endsWith("user-rights")');await sleep(200);assert.equal(dialogs.length,count+1,'Browser back protects unsaved edits');
  await click('Finish later');assert(await run(()=>document.body.innerText.toLowerCase().includes('unsaved changes')),'Cancelled finish retains dirty state');failModule=true;await run(()=>document.querySelector('.rights-module-settings summary').click());await click('Revoke Module Access');await text('Failed to update module access');assert(await run(()=>document.body.innerText.toLowerCase().includes('unsaved changes')),'Failed module update retains dirty state');
  failSave=true;await click('Save Rights');await text('Your selections are still here');assert.equal(await pressed('View Employee'),'true');await click('Save Rights');await text('Permissions configured');assert.equal(saved.get('workerh|HRMS')[0].enter,true);await click('Finish setup');await until('location.pathname.endsWith("existing-users")');
  console.log('PASS HRMS setup, no automatic grants, dirty module/sidebar/back guards, failed save and retry');

  await create('workerc',['CRM']);await click('Save and assign permissions');await readyRights();assert(await run(()=>location.search.includes('software=CRM')));await text('Projects: View + Edit for assignees.');await labelClick('View Projects');await labelClick('Edit Projects');await click('Save Rights');await text('Permissions configured');
  await create('workerboth',['HRMS','CRM']);await click('Save and assign permissions');await readyRights();await text('HRMS: No page access');await text('CRM: No page access');await labelClick('Commercial CRM');await until('!!document.querySelector("[aria-label=\\"View Projects\\"]")');await labelClick('View Projects');await click('Save Rights');await text('CRM: 1 page with View');assert(await run(()=>document.body.innerText.includes('Setup incomplete')));
  allowDialogs=true;await click('Finish later');await until('!!document.querySelector("input[placeholder^=\\"Search by User ID\\"]")');await input('[placeholder="Search by User ID, Name, Site, or User No..."]','workerboth');await until('!!document.querySelector("[aria-label=\\"Permissions for workerboth\\"]")');await labelClick('Permissions for workerboth');await readyRights();await text('CRM: 1 page with View');await labelClick('Human Resources (HRMS)');await until('!!document.querySelector("[aria-label=\\"View Employee\\"]")');await labelClick('View Employee');await click('Save Rights');await text('Permissions configured');await shot('complete');
  console.log('PASS CRM and both-module setup, saved indicators and resume incomplete setup');

  await create('workerh',['HRMS']);let requests=calls.filter(c=>c.p.endsWith('/users/save')).length;await click('Save and assign permissions');await text('Duplicate Login ID');assert.equal(calls.filter(c=>c.p.endsWith('/users/save')).length,requests);
  await create('adminnew',[]);await run(()=>document.querySelector('[role="combobox"]').click());await until('!!document.querySelector("[role=option]")');await run(()=>[...document.querySelectorAll('[role=option]')].find(e=>e.textContent.includes('Administrator')).click());await click('Save User');await text('User Created');assert(await run(()=>location.pathname.endsWith('create-user')));
  await go('/user-access/existing-users');await until('!!document.querySelector("input[placeholder^=\\"Search by User ID\\"]")');await input('[placeholder="Search by User ID, Name, Site, or User No..."]','workerh');await until('!!document.querySelector("[aria-label=\\"Edit workerh\\"]")');await labelClick('Edit workerh');await until('document.querySelector("input[placeholder=\\"Enter a unique username\\"]")?.value==="workerh"');await click('Save and assign permissions');await readyRights();
  for(const width of [1917,1024,768,390,320]){await viewport(width);await go('/user-access/user-rights?userNo='+users.find(u=>u.userID==='workerboth').userNo+'&setup=1&software=CRM');await readyRights().catch(async()=>{await text('Permissions configured');});await until('!document.body.innerText.includes("Checking saved page access")');assert(await run(()=>document.documentElement.scrollWidth<=innerWidth),'Rights no overflow at '+width);await shot(width===390?'guided-mobile':'rights-'+width);if(width===390){await run(()=>document.querySelector('.rights-page main').scrollTop=document.querySelector('.rights-page main').scrollHeight);assert(await run(()=>document.querySelector('.rights-page main').scrollTop>0),'Mobile permission list scrolls');await shot('mobile-permissions');}}
  await run(()=>document.documentElement.classList.add('dark'));await shot('guided-dark');await run(()=>document.documentElement.classList.remove('dark'));
  await viewport(1440);await cdp('Page.bringToFront');await cdp('Emulation.setFocusEmulationEnabled',{enabled:true});await run(()=>document.querySelector('[aria-label="Edit Projects"]').focus());assert.equal(await run(()=>document.activeElement?.getAttribute('aria-label')),'Edit Projects','Keyboard target focused');const beforeKey=await pressed('Edit Projects');await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});await sleep(200);assert.notEqual(await pressed('Edit Projects'),beforeKey,'Keyboard changes permissions');await click('Reload');await until('!document.body.innerText.toLowerCase().includes("unsaved changes")');
  await labelClick('Select user');await input('#rights-user-search','workerh');await until('!!document.querySelector("[aria-label=Accounts]")');assert(await run(()=>document.querySelector('[aria-label=Accounts]').innerText.includes('workerh')));await run(()=>[...document.querySelectorAll('[aria-label=Accounts] button')].find(e=>e.textContent.includes('workerh')).click());await until('!document.querySelector("#rights-user-search")');await readyRights();assert.equal(await run(()=>new URLSearchParams(location.search).get('userNo')),String(users.find(user=>user.userID==='workerh').userNo));
  await viewport(1440);await go('/user-access/user-rights?userNo=9999&setup=1');await text('This account was not found');assert(!(await run(()=>!!document.querySelector('[aria-label^="View "]'))));await go('/user-access/user-rights?userNo=bad&software=CRM&setup=1');await text('setup link is invalid');
  console.log('PASS duplicate validation, administrator creation, edit routing, responsive rights and invalid/deleted links');

  users.splice(11);await go('/user-access/existing-users');await text('Page 1 of 2');await run(()=>document.querySelector('[title="Last Page"]').click());await text('Page 2 of 2');await labelClick('Delete worker11');await text('Unfinished project tasks remain assigned');await shot('delete-confirmation');requests=calls.filter(c=>c.method==='DELETE').length;await click('Cancel');assert.equal(calls.filter(c=>c.method==='DELETE').length,requests);
  await labelClick('Delete worker11');failDelete=true;await click('Delete user');await text('Deletion unavailable');assert(await run(()=>!!document.querySelector('[role="alertdialog"]')));await click('Delete user');await until('!document.querySelector("[role=alertdialog]")');await text('Page 1 of 1');assert(!users.some(u=>u.userNo===11));assert(!calls.some(c=>c.method==='DELETE'&&c.p.includes('/crm/')),'Deletion never touches project tasks');await shot('existing-users');
  await viewport(390);await go('/user-access/existing-users');await text('Existing Users');assert(await run(()=>document.documentElement.scrollWidth<=innerWidth));await shot('existing-mobile');
  console.log('PASS delete confirmation/cancel/failure/retry, pagination correction and task-history preservation boundary');

  // Logging out of an admin route must not race the admin guard's /modules redirect.
  await viewport(1440);await go('/user-access/user-rights?userNo=2&software=CRM&setup=1');await readyRights();
  await labelClick('View Projects');await click('Save Rights');await text('Permissions configured');
  await labelClick('Logout');await until('location.pathname === "/" && !!document.querySelector("input[type=password]")');
  await sleep(1200);
  assert.equal(await run(()=>location.pathname),'/','One logout stays on sign-in after saving rights');
  assert.equal(await run(()=>localStorage.getItem('token')||sessionStorage.getItem('token')),null);
  const permissionCalls=calls.filter(c=>c.p.includes('my-permissions')).length;
  await run(()=>{history.pushState({},'', '/modules');dispatchEvent(new PopStateEvent('popstate'));});
  await until('location.pathname === "/"');
  assert.equal(calls.filter(c=>c.p.includes('my-permissions')).length,permissionCalls,'Anonymous module navigation never loads permissions');
  console.log('PASS single logout after permission assignment and anonymous route guard');

  // A queued permissions retry must be canceled when its session ends.
  await go('/user-access/existing-users');await text('Existing Users');
  failPermissions=true;
  await evaluate(`import('/src/modules/auth/services/authService.ts').then(() => window.dispatchEvent(new Event('auth-changed')))`);
  await until('document.body.innerText.includes("Existing Users")');
  await sleep(200);
  await labelClick('Logout');await until('location.pathname === "/"');
  const callsAtLogout=calls.filter(c=>c.p.includes('my-permissions')).length;
  await sleep(1400);
  assert.equal(calls.filter(c=>c.p.includes('my-permissions')).length,callsAtLogout,'Logout cancels the pending retry');
  assert.equal(await evaluate(`import('/src/modules/user-management/store/permissionsStore.ts').then(m => m.usePermissionsStore.getState().bundle)`),null,'Logged-out permissions stay cleared');
  console.log('PASS logout cancels failed permission retries');
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(output,'result.txt'),'Guided user setup checks passed with API fixtures; no live accounts changed.\n');
}catch(error){try{console.log(await evaluate('document.body.innerText'));console.log('Dialogs:',JSON.stringify(dialogs));console.log('History:',await evaluate('JSON.stringify(history.state)'));const s=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'failure.png'),Buffer.from(s.data,'base64'));}catch{}throw error;}finally{clearTimeout(guard);socket?.close();child.kill();}


