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
const output = path.resolve('../.taste-skill/sales-overview-check');
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


  const token='e30.'+Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.test';
  let mode='data', delay=0, limited=false;const calls=[],errors=[];
  const makeOverview=url=>{
    const from=url.searchParams.get('from'),to=url.searchParams.get('to'),currencyCode=url.searchParams.get('currency')||'PKR';
    const days=Math.round((Date.parse(to)-Date.parse(from))/86400000)+1;
    const trend=Array.from({length:days},(_,i)=>{const d=new Date(from+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+i);const win=i===days-3||(currencyCode==='PKR'&&i===Math.max(0,days-10));return {date:d.toISOString().slice(0,10),amount:win?(currencyCode==='PKR'?590000:500):0,deals:win?1:0,missingValues:0};});
    const zero=mode==='empty';
    return {currencyCode,availableCurrencies:['PKR','USD'],from,to,timeZone:'Asia/Karachi',asOf:new Date().toISOString(),openPipeline:zero?0:currencyCode==='PKR'?3600000:900,
      openOpportunities:zero?0:currencyCode==='PKR'?7:1,acceptedValue:zero?0:currencyCode==='PKR'?1180000:500,wonDeals:zero?0:currencyCode==='PKR'?2:1,missingWonValues:0,missingWonDates:0,
      trend:zero?trend.map(x=>({...x,amount:0,deals:0})):trend,funnel:zero?{inquiries:0,dealsCreated:0,quotationsSent:0,dealsWon:0}:{inquiries:12,dealsCreated:7,quotationsSent:4,dealsWon:2},
      inquiryDistribution:[],dealDistribution:zero?[]:currencyCode==='PKR'?[{status:'New',count:2},{status:'Contacted',count:2},{status:'Qualified',count:2},{status:'ProposalSent',count:1},{status:'Won',count:2},{status:'Lost',count:1}]:[{status:'Qualified',count:1},{status:'Won',count:1}],
      recentInquiries:limited?null:zero?[]:Array.from({length:5},(_,i)=>({id:i+1,title:['Chiller replacement','AHU supply and installation','Cold room upgrade','Process cooling system','Planned maintenance'][i],company:['Test Manufacturing','Test Commercial Tower','Test Cold Chain','Test Industrial Park','Test Healthcare'][i],lifecycleStatus:['New','Qualified','Contacted','Qualified','New'][i],createdAt:new Date().toISOString()})),
      recentActivity:limited?null:zero?[]:Array.from({length:4},(_,i)=>({id:i+1,leadId:i+1,summary:['Quotation marked Accepted','Quotation marked Sent','Inquiry created','Deal marked Won'][i],type:['QuotationAccepted','QuotationSent','LeadCreated','DealStageChanged'][i],actorUserId:'Test salesperson',occurredAt:new Date(Date.now()-i*3600000).toISOString(),inquiryTitle:'Chiller replacement',company:['Test Manufacturing','Test Commercial Tower','Test Cold Chain','Test Healthcare'][i]}))};
  };
  listeners.push(message=>{
    if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.text);
    if(message.method!=='Fetch.requestPaused')return;const {requestId,request}=message.params;
    if(request.url.startsWith(origin)&&!new URL(request.url).pathname.startsWith('/api')){void cdp('Fetch.continueRequest',{requestId});return;}
    void(async()=>{let data=[],status=200;const url=new URL(request.url),p=url.pathname.toLowerCase();
      if(request.method==='OPTIONS')data={};
      else if(p.includes('my-permissions'))data={userId:'tester',site:'TEST',userLevel:limited?'U':'A',isAdmin:!limited,accessibleModules:['CRM'],pages:limited?[{software:'CRM',pageName:'Sales Analytics',canView:true}]:[]};
      else if(p.endsWith('/crm/sales-overview')){calls.push(url);await sleep(delay);if(mode==='error'){status=503;data={message:'Sales overview temporarily unavailable'};}else data=makeOverview(url);}
      else if(p.endsWith('/crm/deals')){calls.push(url);data={items:[],totalCount:0,page:1,pageSize:25};}
      else if(p.endsWith('/detail'))data={lead:{id:1,title:'Chiller replacement',customerName:'Test Manufacturing',lifecycleStatus:'Qualified',currencyCode:'PKR',estimatedValue:0},deals:[],quotations:[]};
      else if(p.endsWith('/activities'))data={items:[],nextCursor:null};
      await cdp('Fetch.fulfillRequest',{requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:origin},{name:'Access-Control-Allow-Headers',value:request.headers['Access-Control-Request-Headers']||'*'},{name:'Access-Control-Allow-Methods',value:'GET,POST,OPTIONS'}],body:Buffer.from(JSON.stringify(data)).toString('base64')});
    })().catch(e=>{if(!String(e).includes('Invalid InterceptionId'))errors.push(String(e));});
  });
  await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Fetch.enable',{patterns:[{urlPattern:'*'}]});
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:'sessionStorage.setItem("token",'+JSON.stringify(token)+');sessionStorage.setItem("site","TEST");sessionStorage.setItem("user",JSON.stringify({username:"tester",site:"TEST",userLevel:"A"}));'});
  const run=(fn,...args)=>evaluate('('+fn.toString()+')(...'+JSON.stringify(args)+')');
  const waitText=text=>until('document.body.textContent.includes('+JSON.stringify(text)+')');
  const go=async route=>{await cdp('Page.navigate',{url:origin+route});await until('!!document.querySelector("nav[aria-label=\\"CRM navigation\\"]")');};
  const viewport=async(width,height)=>cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<768});
  const shot=async name=>{await sleep(200);const s=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(s.data,'base64'));};
  const choose=async(label,value)=>{await run((label,value)=>{const e=document.querySelector('select[aria-label="'+label+'"]');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(e,value);e.dispatchEvent(new Event('change',{bubbles:true}));},label,value);};
  const click=async text=>run(text=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===text);if(!e)throw Error('Missing button '+text);e.click();},text);
  await viewport(1680,1100);await go('/crm');await waitText('PKR 3,600,000');await shot('desktop-overview');
  assert.equal(await run(()=>document.querySelectorAll('nav[aria-label="CRM navigation"] a').length),6);
  assert(await run(()=>{const nav=document.querySelector('nav[aria-label="CRM navigation"]'),main=document.querySelector('main');return Math.abs(nav.getBoundingClientRect().top-main.getBoundingClientRect().top)<1&&Math.abs(nav.getBoundingClientRect().left-main.getBoundingClientRect().left)<1;}),'Navigation is flush with top and sidebar');
  await run(()=>document.querySelector('main').scrollTop=400);await sleep(100);
  assert.equal(await run(()=>document.querySelector('nav[aria-label="CRM navigation"]').getBoundingClientRect().top),0,'Navigation remains sticky');
  const scrollFrames=await run(async()=>{const main=document.querySelector('main'),start=main.scrollTop;document.querySelector('nav[aria-label="CRM navigation"] a').click();const positions=[];const time=performance.now();while(performance.now()-time<750){await new Promise(requestAnimationFrame);positions.push(main.scrollTop);}return {start,positions};});
  assert(scrollFrames.positions.some(p=>p>0&&p<scrollFrames.start),'Tab click smoothly scrolls content to top');
  await until('document.querySelector("main").scrollTop===0');

  await click('Deals');assert(await run(()=>[...document.querySelectorAll('button')].find(e=>e.textContent==='Deals').getAttribute('aria-pressed')==='true'));await click('Value');
  await choose('Dashboard currency','USD');await waitText('USD 900');assert.equal(calls.at(-1).searchParams.get('currency'),'USD');
  await choose('Dashboard date range','90');await until('document.body.textContent.includes("weekly close dates")');
  await choose('Dashboard date range','custom');await until('!!document.querySelector("input[name=from]")');
  const end=new Date().toISOString().slice(0,10),start=new Date(Date.now()-6*86400000).toISOString().slice(0,10);
  await run((start,end)=>{document.querySelector('input[name=from]').value=start;document.querySelector('input[name=to]').value=end;},start,end);await click('Apply dates');
  await until('document.body.textContent.includes("daily close dates")');assert.equal(calls.at(-1).searchParams.get('from'),start);
  await run(()=>[...document.querySelectorAll('a')].find(e=>e.textContent.startsWith('Won deals')).click());await until('location.pathname==="/crm/deals"');await waitText('Currency: USD.');
  assert.equal(await run(()=>new URLSearchParams(location.search).get('stage')),'Won');assert.equal(calls.at(-1).searchParams.get('currency'),'USD');
  console.log('PASS real UI controls: measure, currency, date range, and supported drilldown filters');
  await go('/crm');await waitText('PKR 3,600,000');await run(()=>[...document.querySelectorAll('table a')].find(e=>e.textContent==='Test Manufacturing').click());await until('location.pathname==="/crm/leads/1"');
  console.log('PASS recent inquiry links open the existing detail route');
  for(const [width,height]of [[1440,1000],[1024,900],[768,1024],[390,844]]){await viewport(width,height);await go('/crm');await waitText('PKR 3,600,000');await shot('overview-'+width);assert(await run(()=>{const nav=document.querySelector('nav[aria-label="CRM navigation"]');const bounds=nav.getBoundingClientRect();return [...nav.querySelectorAll('a')].every(a=>{const r=a.getBoundingClientRect();return r.left>=bounds.left&&r.right<=bounds.right&&r.bottom<=bounds.bottom;});}),'All navigation tabs visible at '+width);assert(await run(()=>document.documentElement.scrollWidth<=innerWidth),'No page overflow at '+width);}
  mode='empty';await go('/crm');await waitText('No recorded wins');await shot('empty-overview');assert(await run(()=>document.body.textContent.includes('No inquiries in this period')));
  mode='error';await go('/crm');await waitText('Sales overview temporarily unavailable');await shot('error-overview');assert(!(await run(()=>document.body.textContent.includes('PKR 0'))));
  mode='data';delay=1000;await cdp('Page.navigate',{url:origin+'/crm'});await until('!!document.querySelector("[aria-label=\\"Loading sales overview\\"]")');await shot('loading-overview');await waitText('PKR 3,600,000');delay=0;
  // Measure actual intermediate layout frames, not just declared transition styles.
  await viewport(1440,1000);await go('/crm');await waitText('PKR 3,600,000');
  const sampleToggle=()=>run(async()=>{
    document.querySelector('button[aria-label="Collapse Sidebar"]').click();
    const frames=[];const start=performance.now();
    while(performance.now()-start<360){await new Promise(requestAnimationFrame);frames.push({width:document.querySelector('.app-sidebar').getBoundingClientRect().width,left:document.querySelector('main').getBoundingClientRect().left});}
    return frames;
  });
  const frames=await sampleToggle();
  assert(frames.some(f=>f.width>70&&f.width<230),'Sidebar has intermediate animation frames');
  assert(frames.every(f=>Math.abs(f.width-f.left)<2),'Page remains aligned with animated sidebar');
  await sleep(120);assert(await run(()=>Math.abs(document.querySelector('.app-sidebar').getBoundingClientRect().width-parseFloat(getComputedStyle(document.documentElement).fontSize)*4)<0.1),'Collapsed rail ends at 4rem');
  await run(()=>document.querySelector('button[aria-label^="Expand "]').click());await sleep(350);
  assert(await run(()=>Math.abs(document.querySelector('.app-sidebar').getBoundingClientRect().width-parseFloat(getComputedStyle(document.documentElement).fontSize)*15)<0.1));
  await shot('sidebar-expanded');
  // Rapid reversal must finish in the latest requested state.
  await run(async()=>{document.querySelector('button[aria-label="Collapse Sidebar"]').click();await new Promise(r=>setTimeout(r,60));document.querySelector('button[aria-label^="Expand "]').click();});await sleep(350);
  assert(await run(()=>Math.abs(document.querySelector('.app-sidebar').getBoundingClientRect().width-parseFloat(getComputedStyle(document.documentElement).fontSize)*15)<0.1));
  await viewport(390,844);await go('/crm');await waitText('PKR 3,600,000');await sleep(350);
  await run(async()=>{const {useSidebarStore}=await import('/src/shared/stores/useSidebarStore.ts');useSidebarStore.getState().setOpen(true);});await sleep(350);await shot('sidebar-mobile-open');
  assert.equal(await run(()=>document.querySelector('.app-sidebar').getBoundingClientRect().left),0);
  await run(()=>document.querySelector('button[aria-label="Close navigation"]').click());await sleep(350);
  assert(await run(()=>document.querySelector('.app-sidebar').getBoundingClientRect().right<=0));
  assert.equal(await run(()=>getComputedStyle(document.querySelector('.app-sidebar-backdrop')).opacity),'0');
  await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await viewport(1440,1000);
  assert.equal(await run(()=>getComputedStyle(document.querySelector('.app-sidebar')).transitionDuration),'0s');
  await cdp('Emulation.setEmulatedMedia',{features:[]});
  console.log('PASS sidebar intermediate frames, page alignment, rapid reversal, mobile overlay, reduced motion');
  limited=true;await go('/crm');await waitText('Inquiry access is required');assert(!(await run(()=>document.body.textContent.includes('Test Manufacturing'))));assert.equal(await run(()=>document.querySelectorAll('a[href^="/crm/deals?"]').length),0);
  assert.deepEqual(errors,[]);console.log('PASS responsive 1680/1440/1024/768/390, loading, empty, failure and restricted record visibility');
  fs.writeFileSync(path.join(output,'result.txt'),'Sales overview browser checks passed. Aggregation endpoint mocked; no database changes.\n');
}finally{clearTimeout(guard);socket?.close();child.kill();}
