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
const output = path.resolve('../.taste-skill/hr-dashboard-check');
fs.mkdirSync(output, { recursive: true });
const child = spawn(chrome, ['--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0',
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--no-sandbox', 'about:blank'], { stdio: 'ignore', windowsHide: true });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
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


  const token='e30.'+Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.test';
  let mode='data',delay=0,limited=false; const errors=[],calls=[],photoCalls=[],approvalCalls=[];
  const ready=data=>({status:'ready',data,message:null});
  const restricted=()=>({status:'restricted',data:null,message:'You do not have access to this information.'});
  const unavailable=()=>({status:'unavailable',data:null,message:'This information could not be loaded. Refresh to retry.'});
  const fixture=url=>{
    const from=url.searchParams.get('from'),to=url.searchParams.get('to'),today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi'}).format(new Date()),queueStart=new Date(today+'T12:00:00Z');queueStart.setUTCMonth(queueStart.getUTCMonth()-1);const pendingFrom=queueStart.toISOString().slice(0,10);
    const zero=mode==='empty';const month=new Date(from+'T12:00:00Z'),last=new Date(to+'T12:00:00Z');month.setUTCDate(1);const joiners=[];
    while(month<=last){joiners.push({month:month.toISOString().slice(0,7),count:zero?0:joiners.length+2});month.setUTCMonth(month.getUTCMonth()+1);}
    const data={today,from,to,timeZone:'Asia/Karachi',asOf:new Date().toISOString(),
      workforce:ready({activeEmployees:zero?0:120,missingJoiningDates:zero?0:2,joiners,departments:zero?[]:[{label:'Engineering and technical operations',count:54},{label:'Production',count:36},{label:'Administration',count:18},{label:'Unassigned',count:12}]}),
      attendance:ready({total:zero?0:120,buckets:[{label:'Present',count:zero?0:84},{label:'On leave',count:zero?0:6},{label:'Absent',count:zero?0:4},{label:'Rest / holiday',count:zero?0:10},{label:'Other / not marked',count:zero?0:16}]}),
      leaves:ready({onLeave:zero?0:6,pendingRequests:zero?0:9,pendingFrom,pendingTo:today}),
      employeeActivity:ready(zero?[]:Array.from({length:10},(_,i)=>({id:'employee-'+(i+1),employee:'Test Employee '+(i+1),employeeId:i+1,action:'Employee record created',date:to+'T'+String(20-i).padStart(2,'0')+':00:00',status:'Active',href:'/hr/employees'}))),
      leaveActivity:ready(zero?[]:[{id:'leave-1',employee:'Test Leave Applicant',action:'Leave application submitted',date:to+'T09:00:00',status:'Pending',href:'/hr/leave-approval'}]),
      holidays:ready(zero?[]:[{id:'holiday-1',title:'Scheduled gazetted holiday',detail:'Gazetted holiday',date:today+'T00:00:00',kind:'holiday',href:'/hr/gazetted-leaves'}]),
      scheduledLeave:ready(zero?[]:Array.from({length:7},(_,i)=>({id:'leave-'+i,title:'Approved leave begins',detail:'Test Leave '+i,date:today+'T00:00:00',kind:'leave',href:'/hr/leave-approval'})))};
    if(mode==='partial')data.attendance=unavailable();
    if(limited){data.workforce=restricted();data.attendance=restricted();data.employeeActivity=restricted();data.holidays=restricted();}
    return data;
  };
  listeners.push(message=>{
    if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.text);
    if(message.method!=='Fetch.requestPaused')return;const {requestId,request}=message.params;
    if(request.url.startsWith(origin)&&!new URL(request.url).pathname.startsWith('/api')){void cdp('Fetch.continueRequest',{requestId});return;}
    void(async()=>{let data={},status=200;const url=new URL(request.url),p=url.pathname.toLowerCase();
      if(request.method==='OPTIONS')data={};
      else if(p.includes('my-permissions'))data={userId:'tester',site:'TEST',userLevel:limited?'U':'A',isAdmin:!limited,accessibleModules:['HRMS'],pages:limited?[{software:'HRMS',pageName:'Leave Approval',canView:true}]:[]};
      else if(p.endsWith('/leaveapproval')){approvalCalls.push(url);data=[];}
      else if(p.endsWith('/hr/dashboard')){calls.push(url);await sleep(delay);if(mode==='error'){status=503;data={message:'HR summary temporarily unavailable'};}else data=fixture(url);}
      else if(/\/hr\/dashboard\/employees\/\d+\/photo$/.test(p)){
        const id=Number(p.split('/').at(-2));photoCalls.push(id);
        if(id===1||id===3){await cdp('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'image/gif'},{name:'Access-Control-Allow-Origin',value:origin}],body:id===1?'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7':Buffer.from('unreadable image').toString('base64')});return;}
        status=404;data={};
      }
      else if(p.includes('employee'))data=[];
      await cdp('Fetch.fulfillRequest',{requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:origin},{name:'Access-Control-Allow-Headers',value:request.headers['Access-Control-Request-Headers']||'*'},{name:'Access-Control-Allow-Methods',value:'GET,OPTIONS'}],body:Buffer.from(JSON.stringify(data)).toString('base64')});
    })().catch(e=>{if(!String(e).includes('Invalid InterceptionId'))errors.push(String(e));});
  });
  await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Fetch.enable',{patterns:[{urlPattern:'*'}]});
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:'sessionStorage.setItem("token",'+JSON.stringify(token)+');sessionStorage.setItem("site","TEST");sessionStorage.setItem("user",JSON.stringify({username:"tester",site:"TEST",userLevel:"A"}));'});
  const run=(fn,...args)=>evaluate('('+fn.toString()+')(...'+JSON.stringify(args)+')');
  const waitText=text=>until('document.body.textContent.includes('+JSON.stringify(text)+')');
  const go=async()=>{await cdp('Page.navigate',{url:origin+'/hr/dashboard'});await waitText('HR Dashboard');};
  const viewport=async(width,height)=>cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<768});
  const shot=async name=>{await sleep(200);const s=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(s.data,'base64'));};
  const click=async text=>run(text=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===text);if(!e)throw Error('Missing '+text);e.click();},text);
  const choose=async value=>run(value=>{const e=document.querySelector('#hr-period');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(e,value);e.dispatchEvent(new Event('change',{bubbles:true}));},value);
  await viewport(1680,1100);await go();await waitText('120');await shot('desktop');
  await until('!!document.querySelector(\'[aria-label="Recent HR activity list"] img\')?.naturalWidth');
  assert(await run(()=>{const list=document.querySelector('[aria-label="Recent HR activity list"]');return list.scrollHeight>list.clientHeight;}),'Activity list scrolls internally');
  await run(()=>{const list=document.querySelector('[aria-label="Recent HR activity list"]');list.scrollTop=200;});
  assert(await run(()=>document.querySelector('[aria-label="Recent HR activity list"]').scrollTop>0),'Inline activity scroll works');
  await run(()=>document.querySelector('main').scrollTop=10000);await shot('activity-photos-scroll');
  await run(()=>document.querySelector('main').scrollTop=0);
  assert(await run(()=>[...document.querySelectorAll('aside button')].some(e=>e.textContent==='Dashboard')),'HR Dashboard is reachable from sidebar');
  assert(!(await run(()=>document.body.textContent.includes('John Doe')||document.body.textContent.includes('System Health'))),'No legacy demo content');
  const pendingLink=await run(()=>[...document.querySelectorAll('a')].find(a=>a.textContent.includes('Pending leave approvals')).getAttribute('href'));
  assert(pendingLink.includes('fromDate=')&&pendingLink.includes('toDate='),'Queue card carries exact approval dates');
  await run(()=>[...document.querySelectorAll('a')].find(a=>a.textContent.includes('Pending leave approvals')).click());
  await until('location.pathname==="/hr/leave-approval"');await until('!!document.querySelector("input[type=date]")');await sleep(200);
  const queueUrl=new URL(pendingLink,origin);
  assert(approvalCalls.some(url=>url.searchParams.get('status')==='Pending'&&url.searchParams.get('fromDate')===queueUrl.searchParams.get('fromDate')&&url.searchParams.get('toDate')===queueUrl.searchParams.get('toDate')),'Approval screen uses exact dashboard queue dates');
  await go();await waitText('120');

  await choose('3');await until('new URLSearchParams(location.search).has("from")');await sleep(200);assert(calls.length>=2);
  await choose('custom');await until('!!document.querySelector("input[name=from]")');
  await run(()=>{document.querySelector('input[name=from]').value='2026-01-01';document.querySelector('input[name=to]').value='2025-01-01';});await click('Apply dates');await waitText('Choose up to 366 days');
  await go();await waitText('120');await click('View all 8 events');await waitText('Test Leave 6');await click('Show fewer events');
  await run(()=>document.querySelector('main').scrollTop=10000);await shot('operations');await run(()=>document.querySelector('main').scrollTop=0);
  console.log('PASS data, real period controls, invalid range, upcoming event expansion and HR navigation');
  for(const width of [1440,1280,1024,768,390,320]){await viewport(width,1000);await go();await waitText('120');await shot('width-'+width);assert(await run(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow at '+width);}
  await viewport(1440,1000);await go();await waitText('120');await run(()=>document.documentElement.classList.add('dark'));await shot('dark');
  mode='empty';await go();await waitText('No active employees');assert(await run(()=>document.body.textContent.includes('No upcoming HR events')));await shot('empty');
  mode='partial';await go();await waitText('This information could not be loaded');assert(await run(()=>document.body.textContent.includes('120')));await shot('partial');
  mode='error';await go();await waitText('HR summary temporarily unavailable');assert(!(await run(()=>document.body.textContent.includes('Total employees'))));await shot('error');
  mode='data';delay=1200;await cdp('Page.navigate',{url:origin+'/hr/dashboard'});await until('!!document.querySelector("[aria-label=\\"Loading HR dashboard\\"]")');await shot('loading');await waitText('120');delay=0;
  const beforeRestrictedPhotos=photoCalls.length;limited=true;await go();await waitText('Access required');assert(!(await run(()=>document.body.textContent.includes('Test Employee'))));assert.equal(await run(()=>document.querySelectorAll('a[href="/hr/employees"]').length),0);await shot('restricted');
  await run(async()=>{const utils=await import('/src/modules/hr/utils/hrDashboard.ts');if(utils.todayInPakistan(new Date('2026-11-10T19:01:00Z'))!=='2026-11-11')throw Error('Karachi date boundary');if(utils.periodStart('2026-01-15',3)!=='2025-11-01')throw Error('Month rollover');const events=utils.upcomingEvents([{id:'a',date:'2026-11-13'}],[{id:'a',date:'2026-11-13'},{id:'b',date:'2026-11-12'}]);if(events.length!==2||events[0].id!=='b')throw Error('Event sort/deduplication');});
  assert.equal(photoCalls.length,beforeRestrictedPhotos,'Restricted views make no photo requests');
  assert.deepEqual(errors,[]);console.log('PASS responsive 1440/1280/1024/768/390/320, dark, loading, empty, failure, partial-source and restricted states');
  fs.writeFileSync(path.join(output,'result.txt'),'HR dashboard browser checks passed. API fixtures only; no live database queries.\n');
}finally{clearTimeout(guard);socket?.close();child.kill();}
