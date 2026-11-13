import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const read = relative => fs.readFileSync(new URL('../src/' + relative, import.meta.url), 'utf8');
function load(relative, mocks = {}) {
  const exports = {};
  const compiled = ts.transpileModule(read(relative), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(compiled, { exports, require: name => mocks[name] ?? require(name) });
  return exports;
}
const access = load('modules/user-management/utils/hrPageAccess.ts');
const { restorePageRights } = load('modules/user-management/utils/restorePageRights.ts', { './hrPageAccess': access });
const persisted = [{ formName: 'Employees Page', enter: true, addition: true, updation: false, deletion: true }];
let restored = restorePageRights(persisted, 'HRMS', 'Employee');
assert(restored.enter && restored.addition && restored.deletion && !restored.updation, 'Editor restores API flags and legacy page names');
assert(!restorePageRights([], 'HRMS', 'Employee').enter, 'Missing saved page remains denied');
assert(!restorePageRights([{ formName: 'Employee', deletion: false, delition: true }], 'HRMS', 'Employee').deletion, 'Explicit deletion=false wins over legacy field');
const modules = load('modules/user-management/utils/moduleAccess.ts');
const { usePermissionsStore: store } = load('modules/user-management/store/permissionsStore.ts', {
  '../utils/moduleAccess': modules, '../utils/hrPageAccess': access,
});
const navigation = load('shared/components/layout/sidebar/config/sidebarLinks.ts');
const allLinks = ['hrDefineLinks', 'hrTransactionLinks', 'hrLeaveLinks', 'hrEmployeeReportLinks', 'hrSalaryReportLinks',
  'hrLeaveReportLinks', 'hrAttendanceReportLinks', 'hrLoanReportLinks', 'hrSettingLinks'].flatMap(key => navigation[key]);
const can = page => store.getState().canView('HRMS', page);
const setRights = pages => store.getState().setBundle({ userId: 'LimitedUsr', site: 'TEST', isAdmin: false,
  accessibleModules: ['HRMS'], pages: pages.map(pageName => ({ software: 'HRMS', pageName, canView: true })) });
const leaves = links => links.flatMap(link => link.children ? leaves(link.children) : [link]);

setRights(['Department Page', 'Leave Application']);
let visible = access.filterHrLinks(allLinks, can);
assert.deepEqual(Array.from(leaves(visible), link => link.label).sort(), ['Department', 'Leave Application']);
assert(visible.some(link => link.label === 'Leave Management'), 'Retain a parent with an allowed child');
assert(!visible.some(link => link.label === 'Attendance Report'), 'Remove groups with no allowed children');
assert(access.canViewHrRoute('/hr/departments', can));
assert(!access.canViewHrRoute('/hr/employees', can));
assert(!access.canViewHrRoute('/hr/dashboard', can));
assert(!access.canViewHrRoute('/hr/unknown', can));
setRights(['Daily Attendance Report']);
visible = access.filterHrLinks(allLinks, can);
assert.deepEqual(Array.from(leaves(visible), link => link.label), ['Daily Attendance Report']);
assert(access.canViewHrRoute('/hr/dashboard', can));
setRights(['Employees Page', 'Bank Page', 'Salary Report']);
assert(access.canViewHrRoute('/hr/employees', can), 'Legacy catalog name matches Employee');
assert(access.canViewHrRoute('/hr/banks', can), 'Bank menu uses its catalog name');
assert(leaves(access.filterHrLinks(allLinks, can)).some(link => link.label === 'Salary Reports'));
assert(!access.canViewHrRoute('/hr/reports/salary-summary-report', can), 'Reports retain separate grants');
setRights([]);
assert.equal(access.filterHrLinks(allLinks, can).length, 0, 'Module membership alone grants no pages');

let pathname = '/hr/employees';
const Navigate = () => null;
const { HrPageAccess } = load('modules/user-management/components/HrPageAccess.tsx', {
  'react-router-dom': { Navigate, useLocation: () => ({ pathname }) },
  '../store/permissionsStore': { usePermissionsStore: () => store.getState() },
  '../utils/hrPageAccess': access,
});
assert.equal(HrPageAccess({ children: 'PRIVATE PAGE' }).props.role, 'alert', 'Denied route never renders page children');
store.getState().clearPermissions();
assert.equal(HrPageAccess({ children: 'PRIVATE PAGE' }).props.role, 'status', 'Wait for permissions before rendering');
setRights(['Department']); pathname = '/hr/dashboard';
assert.equal(HrPageAccess({ children: 'PRIVATE PAGE' }).props.to, '/hr/departments', 'Default workspace opens an allowed page');
pathname = '/hr/departments';
assert.equal(HrPageAccess({ children: 'ALLOWED PAGE' }), 'ALLOWED PAGE');
store.getState().setBundle({ ...store.getState().bundle, isAdmin: true }); pathname = '/hr/employees';
assert.equal(HrPageAccess({ children: 'ADMIN PAGE' }), 'ADMIN PAGE');
assert.equal(leaves(access.filterHrLinks(allLinks, can)).length, leaves(allLinks).length, 'Admin keeps all menus');
for (const [, route] of read('app/App.tsx').matchAll(/path="(\/hr\/[^\"]+)"/g)) {
  assert(route === '/hr/dashboard' || access.HR_PAGE_ROUTES[route], 'Every HR route has a permission: ' + route);
}
console.log('PASS HR menus, nested groups, direct routes, loading, default landing, legacy names, admin access and route coverage');
