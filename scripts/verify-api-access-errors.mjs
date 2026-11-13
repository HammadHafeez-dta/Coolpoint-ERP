// Exercise the actual Axios response interceptor without a server or live account.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

let rejectResponse;
const api = { interceptors: {
  request: { use() {} },
  response: { use(_success, failure) { rejectResponse = failure; } },
} };
const events = [];
const location = { pathname: '/hr/dashboard', href: '/hr/dashboard' };
const storage = { getItem: key => key === 'token' ? 'limitedusr-token' : null };
const source = fs.readFileSync(new URL('../src/shared/services/axiosConfig.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
vm.runInNewContext(compiled, {
  exports: {}, Event,
  require: name => {
    if (name === 'axios') return { create: () => api };
    if (name === '@/shared/constants/config') return { API_BASE_URL: 'http://unused' };
    throw new Error(name);
  },
  window: { location, dispatchEvent: event => events.push(event.type) },
  localStorage: storage, sessionStorage: storage,
});

async function check(status, data, locked, url = '/hr/dashboard') {
  location.pathname = location.href = '/hr/dashboard';
  const error = { response: { status, data }, config: { url } };
  await assert.rejects(rejectResponse(error), thrown => thrown === error, 'Caller still receives the original error');
  assert.equal(location.href, locked ? '/locked' : '/hr/dashboard', `${status}: ${JSON.stringify(data)}`);
}
await check(403, undefined, false); // HR dashboard Forbid() response
await check(403, '', false);
await check(403, { statusCode: 403, message: 'Access Denied' }, false); // Legacy HR filter
await check(403, { code: 'permission_denied' }, false);
await check(403, { message: 'Administrator access is required' }, false);
await check(403, { code: 'unrelated_error' }, false);
await check(402, { message: 'License expired' }, true);
for (const code of ['license_expired', 'license_invalid', 'license_suspended', 'license_verification_failed']) {
  await check(403, { code }, true);
}
await check(401, {}, false);
assert.deepEqual(events, ['session-expired']);
await check(401, {}, false, '/auth/login');
assert.deepEqual(events, ['session-expired'], 'Bad login does not raise session expiration');
await check(500, {}, false);
console.log('PASS HRMS/legacy permission denials stay on-page; explicit license failures still lock; session expiration preserved');
