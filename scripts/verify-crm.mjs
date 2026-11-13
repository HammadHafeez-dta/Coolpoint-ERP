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
const output = path.resolve('../.taste-skill/crm-check');
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

  const token = 'e30.' + Buffer.from(JSON.stringify({exp: Math.floor(Date.now()/1000)+3600})).toString('base64url') + '.test';
  let failure = false, denied = false, lifecycleFails = false;
  const leads = [{id:1,leadNumber:'CP-2026-426963072ba34e0d8f978f9e9960552f',title:'Process cooling upgrade',customerName:'Test Manufacturing',category:'Industrial Chiller',estimatedValue:2000000,stage:'Qualified',lifecycleStatus:'Qualified',priority:'High',currencyCode:'PKR',ownerUserId:'tester',contactPerson:'Test Contact',createdAt:new Date().toISOString(),rowVersion:'AQ=='}];
  const deals = [{id:1,leadId:1,title:'Process cooling upgrade',stage:'Qualified',value:2000000,currencyCode:'PKR',rowVersion:'AQ=='}];
  const quotes = [{id:1,dealId:1,leadId:1,quotationNo:'QT-TEST-001',projectTitle:'Process cooling upgrade',customerName:'Test Manufacturing',status:'Sent',version:1,currencyCode:'PKR',subTotal:1000000,taxPercent:18,taxAmount:180000,totalAmount:1180000,validityDays:30,quotationDate:new Date().toISOString(),rowVersion:'AQ==',items:[{id:1,itemDescription:'Chiller installation',quantity:1,unitPrice:1000000,totalPrice:1000000}]}];
  const activities = [{id:1,summary:'Inquiry created',type:'LeadCreated',source:'System',channel:'Internal',actorUserId:'tester',occurredAt:new Date().toISOString()}];
  const events = [];
  const log = summary => activities.unshift({id:activities.length+1,summary,type:'Event',source:'System',channel:'Internal',actorUserId:'tester',occurredAt:new Date().toISOString()});
  listeners.push(message => {
    if (message.method === 'Runtime.exceptionThrown') events.push(message.params.exceptionDetails.text);
    if (message.method !== 'Fetch.requestPaused') return;
    const {requestId,request} = message.params;
    if (request.url.startsWith(origin) && !new URL(request.url).pathname.startsWith('/api')) {void cdp('Fetch.continueRequest',{requestId});return;}
    void (async()=>{
      let data = [], status = 200; const url = new URL(request.url); const p = url.pathname.toLowerCase();
      const body = request.postData ? JSON.parse(request.postData) : {};
      if (request.method === 'OPTIONS') data = {};
      else if (p.includes('my-permissions')) data={userId:'tester',site:'TEST',userLevel:denied?'U':'A',isAdmin:!denied,accessibleModules:['CRM'],pages:denied?[{software:'CRM',pageName:'HVAC Inquiries',canView:true,canEdit:false,canAdd:false}]:[]};
      else if (p.endsWith('/crm/owners')) data=[{userId:'tester',name:'Test Salesperson'}];
      else if (p.endsWith('/crm/leads') && request.method==='GET') {
        if(failure){status=503;data={message:'CRM database unavailable'};} else data=url.searchParams.has('page')?{items:leads,totalCount:leads.length,page:1,pageSize:25}:leads;
      } else if(p.endsWith('/crm/leads') && request.method==='POST') {const l={...body,id:leads.length+1,lifecycleStatus:body.lifecycleStatus||'New',leadNumber:'CP-TEST-NEW',rowVersion:'AQ==',createdAt:new Date().toISOString()};leads.push(l);log('Inquiry created');data=l;}
      else if(p.includes('/crm/leads/') && p.endsWith('/detail')) {const id=Number(p.split('/').at(-2));data={lead:leads.find(x=>x.id===id),deals:deals.filter(x=>x.leadId===id),quotations:quotes.filter(x=>x.leadId===id)};}
      else if(p.endsWith('/activities') && request.method==='GET') data={items:activities,nextCursor:null};
      else if(p.endsWith('/activities') && request.method==='POST'){log(body.body);data={message:'saved'};}
      else if(p.endsWith('/lifecycle')) {if(lifecycleFails){status=409;data={message:'This inquiry changed. Refresh and try again.'};}else{const l=leads.find(x=>x.id===Number(p.split('/').at(-2)));l.lifecycleStatus=body.stage;log('Inquiry marked '+body.stage);data=l;}}
      else if(p.includes('/crm/quotations/') && request.method==='POST') {
        const q=quotes.find(x=>x.id===Number(p.split('/').at(-2)));const action=p.split('/').at(-1);const d=deals.find(x=>x.id===q.dealId);
        if(action==='accept'){q.status='Accepted';d.stage='Won';d.wonValue=q.totalAmount;}
        if(action==='reject')q.status='Rejected';
        if(action==='request-revision'){q.status='RevisionRequested';quotes.push({...q,id:quotes.length+1,status:'Draft',version:q.version+1,quotationNo:'QT-TEST-REV',items:q.items.map(i=>({...i}))});}
        if(action==='send'){q.status='Sent';d.stage='ProposalSent';}
        log('Quotation marked '+q.status);data={quotation:q,deal:d};
      } else if(p.endsWith('/crm/deals')) data={items:deals,totalCount:deals.length,page:1,pageSize:25};
      else if(p.endsWith('/crm/quotations')) data=quotes;
      else if(p.endsWith('/dashboard-stats')) data={totalPipelineValue:2000000,activeInquiriesCount:1,totalWonValue:0,wonCount:0,conversionRate:0};
      await cdp('Fetch.fulfillRequest',{requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:origin},{name:'Access-Control-Allow-Headers',value:request.headers['Access-Control-Request-Headers']||'*'},{name:'Access-Control-Allow-Methods',value:'GET,POST,PATCH,OPTIONS'}],body:Buffer.from(JSON.stringify(data)).toString('base64')});
    })().catch(e=>{ if (!String(e).includes("Invalid InterceptionId")) events.push(String(e)); });
  });
  await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Fetch.enable',{patterns:[{urlPattern:'*'}]});
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:'sessionStorage.setItem("token",'+JSON.stringify(token)+');sessionStorage.setItem("site","TEST");sessionStorage.setItem("user",JSON.stringify({username:"tester",site:"TEST",userLevel:"A"}));'});
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  const go=async route=>{await cdp('Page.navigate',{url:origin+route});await until('!!document.querySelector("nav[aria-label=\\"CRM navigation\\"]")');await sleep(300);};
  const click=async text=>evaluate('(()=>{const b=[...document.querySelectorAll("button")].find(b=>b.textContent.trim()==='+JSON.stringify(text)+');if(!b)throw Error("Button missing: "+'+JSON.stringify(text)+');b.click()})()');
  const fill=async(label,value)=>{await evaluate('(()=>{const l=[...document.querySelectorAll("label")].find(l=>l.textContent.startsWith('+JSON.stringify(label)+'));const e=l?.querySelector("input,textarea,select");if(!e)throw Error("Field missing");const proto=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:e.tagName==="SELECT"?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,"value").set.call(e,'+JSON.stringify(value)+');e.dispatchEvent(new Event(e.tagName==="SELECT"?"change":"input",{bubbles:true}));})()');await sleep(50);};
  const shot=async name=>{const s=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(s.data,'base64'));};
  await go('/crm/leads');await until('document.body.textContent.includes("Test Manufacturing")');await shot('desktop-inquiries');
  assert(!(await evaluate('document.body.textContent.includes("CP-2026-426963072ba34e0d8f978f9e9960552f")')), 'Long inquiry number hidden in list');
  await evaluate('document.querySelector("tbody tr td:nth-child(4)").click()');
  await until('location.pathname==="/crm/leads/1"');
  await until('document.body.textContent.includes("Activity history")');
  assert(!(await evaluate('document.body.textContent.includes("CP-2026-426963072ba34e0d8f978f9e9960552f")')), 'Long inquiry number hidden in detail');
  await go('/crm/leads'); await until('!!document.querySelector("tbody tr a")');
  await evaluate('document.querySelector("tbody tr a").focus()');
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await until('location.pathname==="/crm/leads/1"');
  console.log('PASS inquiry row click, native keyboard navigation and hidden long IDs');
  await go('/crm/leads'); await until('document.body.textContent.includes("Test Manufacturing")');
  await click('Create inquiry');await fill('Inquiry title','New test inquiry');await fill('Company','New Test Client');await click('Save');
  await until('location.pathname==="/crm/leads/2"');await until('document.body.textContent.includes("New Test Client")');
  console.log('PASS inquiry creation: server result opens detail');
  const openLifecycle = async id => {
    const selector = 'a[href="/crm/leads/' + id + '"]';
    await until('!document.querySelector("[role=menu], [role=dialog]") && !document.querySelector(' + JSON.stringify(selector) + ').closest("tr").querySelector("button").disabled');
    await evaluate('document.querySelector(' + JSON.stringify('a[href="/crm/leads/' + id + '"]') + ').closest("tr").querySelector("button").focus()');
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowDown',code:'ArrowDown',windowsVirtualKeyCode:40});
    await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowDown',code:'ArrowDown',windowsVirtualKeyCode:40});
    await until('!!document.querySelector("[role=menuitem]")');
  };
  const chooseLifecycle = async text => evaluate('(()=>{const item=[...document.querySelectorAll("[role=menuitem]")].find(e=>e.textContent.trim()==='+JSON.stringify(text)+');if(!item)throw Error("Missing lifecycle action");item.click();})()');
  await go('/crm/leads'); await until('document.body.textContent.includes("New Test Client")');
  await openLifecycle(2); await shot('inline-lifecycle'); await chooseLifecycle('Contacted');
  await until('document.querySelectorAll("tbody tr")[1]?.textContent.includes("Contacted")');
  assert.equal(await evaluate('location.pathname'),'/crm/leads');assert.equal(leads[1].lifecycleStatus,'Contacted');
  lifecycleFails=true;await openLifecycle(2);await chooseLifecycle('Qualified');
  await until('document.body.textContent.includes("Lifecycle update failed")');assert.equal(leads[1].lifecycleStatus,'Contacted');
  lifecycleFails=false;await openLifecycle(2);await chooseLifecycle('Qualified');
  await until('document.querySelectorAll("tbody tr")[1]?.textContent.includes("Qualified")');
  await openLifecycle(2);await chooseLifecycle('Disqualified');await until('!!document.querySelector("[role=dialog]")');await click('Cancel');
  assert.equal(leads[1].lifecycleStatus,'Qualified');assert.equal(await evaluate('location.pathname'),'/crm/leads');
  console.log('PASS inline lifecycle: keyboard menu, saved state, failed-save recovery and disqualify cancellation');
  await openLifecycle(2);await chooseLifecycle('New (default)');
  await until('document.querySelectorAll("tbody tr")[1]?.textContent.includes("New")');assert.equal(leads[1].lifecycleStatus,'New');
  await openLifecycle(2);await chooseLifecycle('Qualified');
  await until('document.querySelectorAll("tbody tr")[1]?.textContent.includes("Qualified")');
  await openLifecycle(2);await chooseLifecycle('Disqualified');await until('!!document.querySelector("[role=dialog]")');await click('Disqualify inquiry');
  await until('document.querySelectorAll("tbody tr")[1]?.textContent.includes("Disqualified")');
  await openLifecycle(2);await chooseLifecycle('Qualified');await until('document.querySelectorAll("tbody tr")[1]?.textContent.includes("Qualified")');
  console.log('PASS all lifecycle assignments including default reset and reassignment from disqualified');


  await go('/crm/leads/1');await until('document.body.textContent.includes("QT-TEST-001")');
  await fill('Internal note','Customer requested a site survey');await click('Save note');await until('document.body.textContent.includes("Customer requested a site survey")');
  await shot('desktop-detail');
  await click('Revise');await click('Confirm');await until('document.body.textContent.includes("QT-TEST-REV")');
  assert.equal(quotes[0].status,'RevisionRequested');assert.equal(quotes[1].status,'Draft');assert.equal(quotes[1].items[0].unitPrice,1000000);
  await click('Edit draft');await until('!!document.querySelector("[role=dialog]")');await shot('quotation-editor');await click('Cancel');
  console.log('PASS activity logging and revision editor; original terms preserved');
  // Revisit a sent quotation to verify explicit acceptance and server-confirmed Won.
  quotes[1].status='Sent';quotes[0].status='Superseded';await go('/crm/leads/1');await until('document.body.textContent.includes("Mark accepted")');
  await click('Mark accepted');await until('document.body.textContent.includes("Accept quotation and win deal?")');
  assert.equal(deals[0].stage,'Qualified');await click('Confirm');await until('document.body.textContent.includes("Ready for onboarding")');
  assert.equal(deals[0].stage,'Won');assert.equal(quotes[1].status,'Accepted');
  await go('/crm/leads/1');await until('document.body.textContent.includes("Ready for onboarding")');
  console.log('PASS acceptance confirmation, Won result, refresh persistence (mock API)');
  for (let i=0;i<60;i++) log('History entry '+i);
  for (let i=0;i<10;i++) {
    quotes.push({...quotes[1],id:100+i,projectTitle:'Additional project quotation '+i,quotationNo:'QT-LONG-'+i});
    deals.push({...deals[0],id:100+i,title:'Additional opportunity '+i});
  }
  await go('/crm/leads/1');await until('document.getElementById("crm-activity-timeline")?.scrollHeight>600');
  const dimensions=await evaluate('(()=>{const timeline=document.getElementById("crm-activity-timeline");const quotes=[...document.querySelectorAll("[role=region]")].find(e=>e.getAttribute("aria-label")==="Project quotations");const deals=[...document.querySelectorAll("[role=region]")].find(e=>e.getAttribute("aria-label")==="Deals");return {historyScroll:timeline.scrollHeight>timeline.clientHeight,quotesScroll:quotes.scrollHeight>quotes.clientHeight,dealsScroll:deals.scrollHeight>deals.clientHeight,historyHeight:timeline.clientHeight};})()');
  assert(dimensions.historyScroll&&dimensions.quotesScroll&&dimensions.dealsScroll,'Long lists scroll inside their own panels');
  const noteTop=await evaluate('[...document.querySelectorAll("button")].find(b=>b.textContent==="Save note").getBoundingClientRect().top');
  await evaluate('document.getElementById("crm-activity-timeline").focus()');
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'End',code:'End',windowsVirtualKeyCode:35});
  await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'End',code:'End',windowsVirtualKeyCode:35});
  await until('document.getElementById("crm-activity-timeline").scrollTop>0');
  assert.equal(await evaluate('[...document.querySelectorAll("button")].find(b=>b.textContent==="Save note").getBoundingClientRect().top'),noteTop,'Composer stays outside scrolling history');
  await sleep(250);
  await evaluate('(()=>{const el=document.getElementById("crm-activity-timeline");el.blur();el.scrollTo({top:0,behavior:"instant"});})()');
  await sleep(150);
  assert(await evaluate('(()=>{const region=document.getElementById("crm-activity-timeline");const first=region.querySelector("li").getBoundingClientRect();return first.top>=region.getBoundingClientRect().top-2 && first.top<region.getBoundingClientRect().bottom;})()'),'First history entry is visible after scrolling to top');
  await shot('desktop-long-history');
  console.log('PASS long history, deals and quotations: bounded panel scrolling and fixed composer');

  await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await go('/crm/leads/1');await shot('mobile-detail');
  assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'No page horizontal overflow on mobile');
  failure=true;await go('/crm/leads');await until('document.body.textContent.includes("CRM database unavailable")');assert(!(await evaluate('document.body.textContent.includes("Test Manufacturing")')));await shot('mobile-error');
  console.log('PASS responsive detail and honest API failure');
  failure=false;denied=true;await go('/crm/leads');await until('document.body.textContent.includes("Test Manufacturing")');
  assert(!(await evaluate('[...document.querySelectorAll("button")].some(b=>b.textContent.includes("Create inquiry"))')));
  await go('/crm/quotations');await until('document.body.textContent.includes("You do not have access")');
  assert(!(await evaluate('[...document.querySelectorAll("button")].some(b=>b.getAttribute("aria-label")?.startsWith("Change lifecycle"))')));
  console.log('PASS non-admin view-only actions and denied route');
  assert.deepEqual(events,[]);fs.writeFileSync(path.join(output,'result.txt'),'CRM browser checks passed. API mocked; SQL scripts not executed.\n');
} finally {clearTimeout(guard);socket?.close();child.kill();}
