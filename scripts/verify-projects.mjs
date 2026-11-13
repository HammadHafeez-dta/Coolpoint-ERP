// Project board integration checks with isolated Chrome and API fixtures.
// Uses an isolated headless Chrome profile and mocked API responses. No live credentials.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const origin = process.argv[2] || 'http://127.0.0.1:5173';
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'coolpoint-uam-'));
const output = path.resolve('../.impeccable/review/projects');
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

  const token='e30.'+Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.test';
  let limited=false,editable=true,viewable=true,mode='data',delay=0,manualProject=null;
  let tasks=[{id:1,projectId:7,title:'Prepare commissioning schedule',description:'Coordinate the installation team and confirm availability.',assigneeUserId:'worker',assigneeName:'Limited Worker',status:'Todo',priority:'High',dueDate:'2026-12-01T00:00:00',rowVersion:'AQ=='},{id:2,projectId:7,title:'Confirm equipment delivery',assigneeUserId:'other',assigneeName:'Other Worker',status:'InProgress',priority:'Medium',rowVersion:'AQ=='}];
  const calls=[],errors=[];const boardTasks=()=>limited?tasks.filter(t=>t.assigneeUserId==='worker'):tasks;
  const status=items=>!items.length||items.every(t=>t.status==='Todo')?'NotStarted':items.every(t=>t.status==='Done')?'Completed':'InProgress';
  const project=()=>({id:7,title:'Chiller installation and commissioning',customerName:'CoolPoint Test Client',leadId:limited?null:3,status:status(boardTasks()),personal:limited,totalTasks:boardTasks().length,doneTasks:boardTasks().filter(t=>t.status==='Done').length});
  listeners.push(message=>{
    if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.text);
    if(message.method!=='Fetch.requestPaused')return;const {requestId,request}=message.params;
    const url=new URL(request.url),p=url.pathname.toLowerCase();
    if(request.url.startsWith(origin)&&!url.pathname.startsWith('/api')){void cdp('Fetch.continueRequest',{requestId});return;}
    void(async()=>{let data={},code=200;
      if(request.method==='OPTIONS')data={};
      else if(p.includes('my-permissions'))data={userId:limited?'worker':'admin',site:'TEST',userLevel:limited?'U':'A',isAdmin:!limited,accessibleModules:['CRM'],pages:viewable?[{software:'CRM',pageName:'Projects',canView:true,canEdit:editable}]:[]};
      else if(p.includes('/crm/projects')){
        calls.push({path:p,method:request.method,body:request.postData});await sleep(delay);
        if(mode==='error'){code=503;data={message:'Project service temporarily unavailable'};}
        else if(request.method==='POST'&&p.endsWith('/projects')){
          if(mode==='create-error'){code=503;data={message:'Could not create project. Try again.'};mode='data';}
          else {const input=JSON.parse(request.postData);manualProject={id:8,title:input.title,customerName:input.customerName,leadId:null,status:'NotStarted',personal:false,tasks:[]};data={id:8};code=201;}
        }
        else if(p.endsWith('/assignees'))data=[{userId:'worker',name:'Limited Worker'},{userId:'other',name:'Other Worker'}];
        else if(p.endsWith('/status')){
          const input=JSON.parse(request.postData),task=tasks.find(t=>t.id===Number(p.split('/').at(-2)));
          if(mode==='conflict'){task.status='InProgress';task.rowVersion='Ag==';code=409;data={message:'The record changed. Refresh and retry.'};mode='data';}
          else if(mode==='move-error'){code=503;data={message:'Temporarily unavailable'};mode='data';}
          else {assert(input.rowVersion,'Row version sent');task.status=input.status;task.rowVersion=Buffer.from(String(Date.now())).toString('base64');data=task;}
        }
        else if(request.method==='POST'&&p.endsWith('/tasks')){const input=JSON.parse(request.postData);const task={...input,id:tasks.length+1,projectId:7,status:'Todo',rowVersion:'AQ==',assigneeName:input.assigneeUserId==='worker'?'Limited Worker':'Other Worker'};tasks.push(task);data=task;}
        else if(request.method==='PATCH'){const task=tasks.find(t=>t.id===Number(p.split('/').at(-1)));Object.assign(task,JSON.parse(request.postData));task.assigneeName=task.assigneeUserId==='worker'?'Limited Worker':'Other Worker';task.rowVersion='Aw==';data=task;}
        else if(/\/projects\/8$/.test(p))data=manualProject;
        else if(/\/projects\/7$/.test(p))data={...project(),tasks:mode==='empty-board'?[]:boardTasks()};
        else {const matching=mode==='empty'?[]:url.searchParams.get('search')&&!project().title.toLowerCase().includes(url.searchParams.get('search').toLowerCase())?[]:limited&&!boardTasks().length?[]:[project()];data={items:matching,totalCount:matching.length,page:1,pageSize:25};}
      }
      else if(p.includes('/crm'))data=[];
      await cdp('Fetch.fulfillRequest',{requestId,responseCode:code,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:origin},{name:'Access-Control-Allow-Headers',value:'*'},{name:'Access-Control-Allow-Methods',value:'GET,POST,PATCH,OPTIONS'}],body:Buffer.from(JSON.stringify(data)).toString('base64')});
    })().catch(e=>{if(!String(e).includes('Invalid InterceptionId'))errors.push(String(e));});
  });
  await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Fetch.enable',{patterns:[{urlPattern:'*'}]});
  const authSource=level=>`sessionStorage.setItem('token',${JSON.stringify(token)});sessionStorage.setItem('site','TEST');sessionStorage.setItem('user',JSON.stringify({username:'tester',userLevel:'${level}'}));`;
  let authScript=await cdp('Page.addScriptToEvaluateOnNewDocument',{source:authSource('A')});
  const run=(fn,...args)=>evaluate('('+fn.toString()+')(...'+JSON.stringify(args)+')');
  const text=text=>until('document.body.innerText.includes('+JSON.stringify(text)+')');
  const go=async(path='/crm/projects/7')=>{await cdp('Page.navigate',{url:origin+path});await text('Projects');};
  const viewport=(width,height=1000)=>cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<768});
  const shot=async name=>{await sleep(150);const s=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(s.data,'base64'));};
  const click=label=>run(label=>{const root=document.querySelector('[role="dialog"]')||document;const button=[...root.querySelectorAll('button')].find(b=>b.textContent.trim()===label);if(!button)throw Error('Missing '+label);button.click();},label);
  const setValue=(selector,value)=>run((selector,value)=>{const e=document.querySelector(selector);if(!e)throw Error('Missing '+selector);const type=e.tagName==='SELECT'?HTMLSelectElement:e.tagName==='TEXTAREA'?HTMLTextAreaElement:HTMLInputElement;Object.getOwnPropertyDescriptor(type.prototype,'value').set.call(e,value);e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));},selector,value);
  const taskIn=(id,status)=>until(`!!document.querySelector('[data-task-column="${status}"] [data-task-id="${id}"]')`);
  const settled=()=>until('!document.querySelector("select[aria-label^=\\"Status for\\"]:disabled")');
  await viewport(1440);await go('/crm/projects');await text('1 projects');await shot('list');
  await setValue('[aria-label="Search projects"]','no-match');await text('No matching projects');
  await go('/crm/projects');await text('1 projects');await click('Create project');await text('Start a standalone project');
  await setValue('[role="dialog"] input','Manual commissioning project');await setValue('[role="dialog"] label:nth-of-type(2) input','Manual test client');await shot('manual-form');
  mode='create-error';await click('Create project');await text('Could not create project. Try again.');assert.equal(await run(()=>document.querySelector('[role="dialog"] input').value),'Manual commissioning project');
  await click('Create project');await text('Manual commissioning project');await until('location.pathname==="/crm/projects/8"');await until('!document.querySelector("[role=dialog]")');await shot('manual-board');
  assert(await run(()=>document.body.innerText.includes('Project: Not started')));assert(!(await run(()=>document.body.innerText.includes('View source inquiry'))));
  await go();await taskIn(1,'Todo');await shot('desktop');
  await setValue('[aria-label="Status for Prepare commissioning schedule"]','Done');await taskIn(1,'Done');await settled();await go();await taskIn(1,'Done');assert.equal(tasks[0].status,'Done','Status survives reload');
  // Native HTML5 drag with a real data transfer, moving backwards to To do.
  await run(()=>{window.testTransfer=new DataTransfer();document.querySelector('[data-task-id="1"]').dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:window.testTransfer}));});
  await run(()=>{const target=document.querySelector('[data-task-column="Todo"]');target.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:window.testTransfer}));target.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:window.testTransfer}));});
  await taskIn(1,'Todo');await settled();assert(calls.some(c=>c.path.endsWith('/1/status')&&JSON.parse(c.body).status==='Todo'),'Dragging sends status command');
  mode='conflict';await setValue('[aria-label="Status for Prepare commissioning schedule"]','Done');await text('This task changed while');await taskIn(1,'InProgress');await settled();await shot('conflict');
  mode='move-error';await setValue('[aria-label="Status for Prepare commissioning schedule"]','Done');await text('Task was not moved');await taskIn(1,'InProgress');await settled();
  await click('Create task');await text('Assign work to a limited user');await until('document.querySelector("[aria-label=\\"Task assignee\\"]").options.length===3');
  await setValue('[role="dialog"] input','Check wiring');await setValue('[aria-label="Task assignee"]','worker');await click('Create task');
  await until('!document.querySelector("[role=dialog]")');await text('Check wiring');assert.equal(tasks.length,3);
  await run(()=>document.querySelector('[aria-label="Edit Check wiring"]').click());await text('Edit task');await setValue('[aria-label="Task assignee"]','other');await click('Save task');await until('!document.querySelector("[role=dialog]")');assert.equal(tasks[2].assigneeUserId,'other');
  tasks.push({...tasks[1],id:99,title:'VeryLongEquipmentCommissioningTask'.repeat(12).slice(0,250),status:'Done'});
  for(const width of [1024,768,390,320]){await viewport(width);await go();await taskIn(1,'InProgress');assert(await run(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow at '+width);await shot(width===390?'mobile':'width-'+width);}
  await viewport(1440);await go();await taskIn(1,'InProgress');await run(()=>document.documentElement.classList.add('dark'));await shot('dark');
  limited=true;await cdp('Page.removeScriptToEvaluateOnNewDocument',{identifier:authScript.identifier});authScript=await cdp('Page.addScriptToEvaluateOnNewDocument',{source:authSource('U')});
  await go('/crm/projects');await text('1 projects');assert(!(await run(()=>document.body.innerText.includes('Create project'))));
  await go();await taskIn(1,'InProgress');assert(!(await run(()=>document.body.innerText.includes('Other Worker')||document.body.innerText.includes('Check wiring')||document.body.innerText.includes('Create task'))));assert(await run(()=>document.body.innerText.includes('My progress')));await shot('limited');
  await setValue('[aria-label="Status for Prepare commissioning schedule"]','Done');await text('My progress: Completed');await settled();
  editable=false;await go();await taskIn(1,'Done');assert(await run(()=>document.querySelector('[aria-label="Status for Prepare commissioning schedule"]').disabled));await shot('read-only');
  viewable=false;const before=calls.length;await go();await text('You do not have access');assert.equal(calls.length,before,'No Projects requests without View');
  viewable=true;editable=true;mode='empty';await go('/crm/projects');await text('No projects yet');await shot('empty');
  mode='error';await go();await text('Project service temporarily unavailable');await shot('error');
  mode='data';delay=800;await go();await until('!!document.querySelector("[aria-label=\\"Loading projects\\"]")');await shot('loading');await taskIn(1,'Done');delay=0;
  assert.deepEqual(errors,[]);console.log('PASS Projects list/search, native drag, accessible status menu, reload persistence, conflict/error rollback, create/reassign, own-task UI, read-only/denied, 1440/1024/768/390/320, dark and loading/empty/error states');
  fs.writeFileSync(path.join(output,'result.txt'),'Projects browser checks passed with API fixtures; no live database used.\n');
} catch(error) {
  try {console.log(await evaluate('document.body.innerText'));const s=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'failure.png'),Buffer.from(s.data,'base64'));} catch {}
  throw error;
} finally {clearTimeout(guard);socket?.close();child.kill();}


