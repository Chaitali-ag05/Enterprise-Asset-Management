import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });

let adminToken, managerToken, techToken, empToken;
let adminId, managerId, techId, empId;
let deptId, vendorId;

async function runTests() {
  try {
    let suffix = Date.now();
    let adminEmail = 'admin' + suffix + '@test.com';
    let mgrEmail = 'mgr' + suffix + '@test.com';
    let techEmail = 'tech' + suffix + '@test.com';
    let empEmail = 'emp' + suffix + '@test.com';

    let adminUser = 'adminUser' + suffix;
    let mgrUser = 'mgrUser' + suffix;
    let techUser = 'techUser' + suffix;
    let empUser = 'empUser' + suffix;

    console.log('--- REGISTER & LOGIN ---');
    // Admin
    await api.post('/auth/register', { username: adminUser, email: adminEmail, password: 'password', role: 'ROLE_ADMIN' }).catch(e => {});
    let res = await api.post('/auth/login', { usernameOrEmail: adminUser, password: 'password' });
    adminToken = res.data.token;
    
    // Manager
    await api.post('/auth/register', { username: mgrUser, email: mgrEmail, password: 'password', role: 'ROLE_MANAGER' }).catch(e => {});
    res = await api.post('/auth/login', { usernameOrEmail: mgrUser, password: 'password' });
    managerToken = res.data.token;
    
    // Tech
    await api.post('/auth/register', { username: techUser, email: techEmail, password: 'password', role: 'ROLE_TECHNICIAN' }).catch(e => {});
    res = await api.post('/auth/login', { usernameOrEmail: techUser, password: 'password' });
    techToken = res.data.token;

    // Emp
    await api.post('/auth/register', { username: empUser, email: empEmail, password: 'password', role: 'ROLE_EMPLOYEE' }).catch(e => {});
    res = await api.post('/auth/login', { usernameOrEmail: empUser, password: 'password' });
    empToken = res.data.token;

    console.log('Login successful. Distinct usernames and emails used.');

    // 1. ADMIN creates Dept and Employees
    console.log('--- ADMIN WORKFLOW ---');
    api.defaults.headers.common['Authorization'] = 'Bearer ' + adminToken;
    let deptRes = await api.post('/departments', { name: 'IT Dept ' + suffix });
    deptId = deptRes.data.id; 
    
    let vendorRes = await api.post('/vendors', { name: 'Dell ' + suffix, email: suffix+'@test.com', phone: '123' + suffix, contactPerson: 'John', address: '123' });
    vendorId = vendorRes.data.id;

    let mgrEmp = await api.post('/employees', { firstName: 'Manager', lastName: 'Test', email: mgrEmail, phone: '111' + suffix, designation: 'MANAGER', departmentId: deptId });
    managerId = mgrEmp.data.id;
    let techEmp = await api.post('/employees', { firstName: 'Tech', lastName: 'Test', email: techEmail, phone: '222' + suffix, designation: 'SOFTWARE_ENGINEER', departmentId: deptId });
    techId = techEmp.data.id;
    let empEmp = await api.post('/employees', { firstName: 'Employee', lastName: 'Test', email: empEmail, phone: '333' + suffix, designation: 'SOFTWARE_ENGINEER', departmentId: deptId });
    empId = empEmp.data.id;

    console.log('Admin setup successful.');

    // 2. MANAGER creates asset, assigns it
    console.log('--- MANAGER WORKFLOW ---');
    api.defaults.headers.common['Authorization'] = 'Bearer ' + managerToken;
    let assetRes = await api.post('/assets', { 
        assetName: 'MacBook ' + suffix, 
        serialNumber: 'SN-' + suffix, 
        brand: 'Apple', model: 'Pro', 
        purchaseDate: '2025-01-01',
        warrantyExpiry: '2028-01-01',
        purchaseCost: 2000, 
        category: 'LAPTOP', 
        departmentId: deptId, 
        vendorId: vendorId 
    });
    let assetId = assetRes.data.id;
    console.log('Asset created: ' + assetId);

    let assignRes = await api.post('/assignments', {
        employeeId: empId,
        assetIds: [assetId],
        expectedReturnDate: '2027-01-01',
        notes: 'Test'
    });
    let assignmentId = assignRes.data.id;
    
    console.log('Asset assigned to Employee.');

    // 3. EMPLOYEE views and reports issue
    console.log('--- EMPLOYEE WORKFLOW ---');
    api.defaults.headers.common['Authorization'] = 'Bearer ' + empToken;
    
    let myAssets = await api.get('/assets/employee/' + empId);
    console.log('Employee fetched assets successfully, count: ' + myAssets.data.length);
    if(myAssets.data.length === 0) throw new Error('Employee has no assets!');
    
    let issueRes = await api.post('/maintenance/issues', {
        assetId: assetId,
        reportedById: empId,
        title: 'Screen broke',
        description: 'Screen broken',
        priority: 'HIGH'
    });
    let issueId = issueRes.data.id;
    console.log('Employee reported issue: ' + issueId);

    // 4. MANAGER assigns tech
    console.log('--- MAINTENANCE (MANAGER -> TECH) ---');
    api.defaults.headers.common['Authorization'] = 'Bearer ' + managerToken;
    let woRes = await api.post('/maintenance/issues/' + issueId + '/work-orders', {
        technicianId: techId,
        instructions: 'Fix it'
    });
    let woId = woRes.data.id;
    console.log('Manager created work order: ' + woId);

    // 5. TECHNICIAN completes work
    console.log('--- TECHNICIAN WORKFLOW ---');
    api.defaults.headers.common['Authorization'] = 'Bearer ' + techToken;
    await api.put('/maintenance/work-orders/' + woId + '/respond', { action: 'ACCEPT' });
    await api.put('/maintenance/work-orders/' + woId + '/complete', {
        isRepairable: true,
        resolutionNotes: 'Fixed screen',
        diagnosis: 'Screen was broken',
        actionTaken: 'Replaced screen',
        partsReplaced: 'Screen part #1',
        repairCost: 100
    });
    console.log('Technician completed work (without technicianId).');

    // 6. MANAGER approves repair
    console.log('--- MANAGER APPROVES ---');
    api.defaults.headers.common['Authorization'] = 'Bearer ' + managerToken;
    await api.put('/maintenance/issues/' + issueId + '/decision', {
        decision: 'APPROVE_REPAIR',
        notes: 'Good job'
    });
    console.log('Manager workflow finished.');

    console.log('--- NEGATIVE TESTING ---');
    api.defaults.headers.common['Authorization'] = 'Bearer ' + empToken;
    let noAccess = false;
    try {
        await api.get('/assets');
    } catch(e) {
        if(e.response && (e.response.status === 403 || e.response.status === 401)) noAccess = true;
    }
    if(noAccess) {
        console.log('NEGATIVE TEST PASS: Employee cannot access /assets');
    } else {
        console.error('NEGATIVE TEST FAIL: Employee could access /assets!');
    }

    // EXTRA SECURITY: Tech A cannot act on Tech B's work order.
    // Register Tech B, assign a WO to Tech B, and let Tech A try to complete it.
    let techBUser = 'techBUser' + suffix;
    let techBEmail = 'techB' + suffix + '@test.com';
    await api.post('/auth/register', { username: techBUser, email: techBEmail, password: 'password', role: 'ROLE_TECHNICIAN' });
    let techBRes = await api.post('/auth/login', { usernameOrEmail: techBUser, password: 'password' });
    let techBToken = techBRes.data.token;

    api.defaults.headers.common['Authorization'] = 'Bearer ' + adminToken;
    let techBEmp = await api.post('/employees', { firstName: 'TechB', lastName: 'Test', email: techBEmail, phone: '444' + suffix, designation: 'SOFTWARE_ENGINEER', departmentId: deptId });
    let techBId = techBEmp.data.id;

    api.defaults.headers.common['Authorization'] = 'Bearer ' + managerToken;
    let issueBRes = await api.post('/maintenance/issues', { assetId: assetId, reportedById: managerId, title: 'Network', description: 'No wifi', priority: 'LOW' });
    let woBRes = await api.post('/maintenance/issues/' + issueBRes.data.id + '/work-orders', { technicianId: techBId, instructions: 'Fix wifi' });
    let woBId = woBRes.data.id;
    
    // Tech A tries to respond to Tech B's work order
    api.defaults.headers.common['Authorization'] = 'Bearer ' + techToken;
    try {
        await api.put('/maintenance/work-orders/' + woBId + '/respond', { action: 'ACCEPT' });
        console.error('FAIL: Tech A was able to accept Tech B work order!');
    } catch(e) {
        if(e.response && e.response.status === 403) {
            console.log('NEGATIVE TEST PASS: Tech A cannot accept Tech B work order.');
        } else {
            console.error('FAIL: Expected 403, got ' + (e.response ? e.response.status : e.message));
        }
    }

    console.log('ALL WORKFLOWS SUCCESSFUL');
    
  } catch(e) {
    console.error('ERROR:', e.response ? JSON.stringify(e.response.data, null, 2) : e.message);
  }
}
runTests();