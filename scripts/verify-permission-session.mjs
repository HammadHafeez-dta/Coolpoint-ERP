// Isolated lifecycle regressions; no server, browser, or live API required.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/modules/user-management/hooks/PermissionsProvider.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
}).outputText;
const bundle = userId => ({ userId, isAdmin: userId === 'admin', accessibleModules: ['CRM'], pages: [] });

function fixture(initialToken = 'admin', loaded = false) {
  let token = initialToken;
  const store = { bundle: loaded ? bundle(token) : null, isLoaded: loaded };
  store.setBundle = value => { store.bundle = value; store.isLoaded = true; };
  store.clearPermissions = () => { store.bundle = null; store.isLoaded = false; };
  const requests = [], timers = new Map(), effects = [];
  const events = new EventTarget();
  let nextTimer = 0, context;
  const react = {
    createContext: () => ({ Provider: 'Provider' }),
    createElement: (type, props) => { if (type === 'Provider') context = props.value; return null; },
    useContext: () => context,
    useCallback: fn => fn,
    useRef: value => ({ current: value }),
    useState: value => [value, () => {}],
    useEffect: fn => { effects.push(fn); },
  };
  const usePermissionsStore = Object.assign(() => store, { getState: () => store });
  const modules = {
    react,
    '../store/permissionsStore': { usePermissionsStore },
    '@/modules/auth/services/authService': { authService: { getToken: () => token } },
    '../services/userRightsService': { userRightsService: {
      getMyPermissions: signal => new Promise((resolve, reject) => requests.push({ signal, resolve, reject })),
    } },
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, require: name => { assert(name in modules, name); return modules[name]; },
    AbortController, window: events, console: { warn() {} },
    setTimeout: callback => { timers.set(++nextTimer, callback); return nextTimer; },
    clearTimeout: id => timers.delete(id),
  });
  exports.PermissionsProvider({ children: null });
  const cleanups = effects.map(effect => effect());
  return {
    store, requests, timers, refresh: () => context.refresh(),
    changeSession: next => { token = next; events.dispatchEvent(new Event('auth-changed')); },
    cleanup: () => cleanups.forEach(cleanup => cleanup?.()),
    runRetries: () => { const pending = [...timers.values()]; timers.clear(); pending.forEach(callback => callback()); },
  };
}
const settle = () => new Promise(resolve => setImmediate(resolve));

{
  const f = fixture();
  assert.equal(f.requests.length, 1);
  f.requests[0].resolve(bundle('admin')); await settle();
  assert.equal(f.store.bundle.userId, 'admin');
  f.changeSession(null);
  assert.equal(f.store.bundle, null);
  assert.equal(f.store.isLoaded, false);
  assert(f.requests[0].signal.aborted);
  await f.refresh();
  assert.equal(f.requests.length, 1, 'No permission fetch without a session');
  f.cleanup();
}
{
  const f = fixture();
  f.changeSession(null);
  f.requests[0].resolve(bundle('admin')); await settle();
  assert.equal(f.store.bundle, null, 'Late response cannot restore logged-out permissions');
  f.cleanup();
}
{
  const f = fixture();
  f.requests[0].reject(new Error('offline')); await settle();
  assert.equal(f.timers.size, 1);
  f.changeSession(null);
  assert.equal(f.timers.size, 0, 'Logout clears queued retry');
  f.runRetries(); await settle();
  assert.equal(f.requests.length, 1);
  f.cleanup();
}
{
  const f = fixture();
  f.changeSession('worker');
  assert(f.requests[0].signal.aborted);
  f.requests[1].resolve(bundle('worker')); await settle();
  f.requests[0].resolve(bundle('admin')); await settle();
  assert.equal(f.store.bundle.userId, 'worker', 'Previous user cannot overwrite the next session');
  f.cleanup();
}
{
  const f = fixture('admin', true);
  assert.equal(f.requests.length, 0, 'Loaded permissions survive navigation');
  const first = f.refresh();
  const second = f.refresh();
  assert(f.requests[0].signal.aborted);
  f.requests[1].resolve(bundle('updated')); await second;
  f.requests[0].resolve(bundle('stale')); await first;
  assert.equal(f.store.bundle.userId, 'updated', 'Latest refresh wins');
  f.cleanup();
}
{
  const f = fixture();
  f.requests[0].reject(new Error('offline')); await settle();
  f.runRetries();
  assert.equal(f.requests.length, 2, 'An active session still retries');
  f.cleanup();
  assert(f.requests[1].signal.aborted);
  f.requests[1].resolve(bundle('admin')); await settle();
  assert.equal(f.store.bundle, null, 'Unmounted provider cannot write stale permissions');
}
console.log('PASS permission lifecycle: logout, late responses, retry cancellation, account switch, refresh ordering, unmount');
