// Kiem thu phan quyen tren route that: 3 vai tro x 3 nhom route /tenant, /owner, /admin.
// Chay: npm test
process.env.NODE_ENV = 'test';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');

const app = require('../src/app');
const prisma = require('../src/config/prisma');

const RUN_PREFIX = `test_role_${Date.now()}_`;

let server;
let baseUrl;
const tokens = {}; // { TENANT, OWNER, ADMIN }

const call = async (method, path, token) => {
  const res = await fetch(baseUrl + path, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return { status: res.status, body: await res.json() };
};

const post = async (path, body, token) => {
  const res = await fetch(baseUrl + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://localhost:${server.address().port}/api`;

  for (const role of ['TENANT', 'OWNER']) {
    const r = await post('/auth/register', {
      email: `${RUN_PREFIX}${role.toLowerCase()}@duchome.vn`,
      password: '123456',
      fullName: `Test ${role}`,
      role,
    });
    assert.equal(r.status, 201);
    tokens[role] = r.body.data.token;
  }

  const admin = await post('/auth/login', { email: 'admin@duchome.vn', password: '123456' });
  assert.equal(admin.status, 200, 'can tai khoan seed admin@duchome.vn / 123456');
  tokens.ADMIN = admin.body.data.token;
});

after(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: RUN_PREFIX } } });
  await prisma.$disconnect();
  await new Promise((resolve) => server.close(resolve));
});

// Ma tran: vai tro nao duoc vao nhom nao
const GROUPS = { '/tenant/dashboard': 'TENANT', '/owner/dashboard': 'OWNER', '/admin/dashboard': 'ADMIN' };

describe('Ma tran phan quyen 3 vai tro x 3 nhom route', () => {
  for (const role of ['TENANT', 'OWNER', 'ADMIN']) {
    for (const [path, allowed] of Object.entries(GROUPS)) {
      const expected = role === allowed ? 200 : 403;
      test(`${role.padEnd(6)} -> GET ${path} = ${expected}`, async () => {
        const r = await call('GET', path, tokens[role]);
        assert.equal(r.status, expected);
        assert.equal(r.body.success, expected === 200);
      });
    }
  }
});

describe('Truy cap khong hop le', () => {
  for (const path of Object.keys(GROUPS)) {
    test(`khong token -> GET ${path} = 401`, async () => {
      const r = await call('GET', path);
      assert.equal(r.status, 401);
    });
  }

  test('token da logout khong vao duoc nhom cua minh', async () => {
    const reg = await post('/auth/register', {
      email: `${RUN_PREFIX}logout@duchome.vn`,
      password: '123456',
      fullName: 'Test Logout',
      role: 'OWNER',
    });
    const token = reg.body.data.token;
    assert.equal((await call('GET', '/owner/dashboard', token)).status, 200);

    await post('/auth/logout', {}, token);
    assert.equal((await call('GET', '/owner/dashboard', token)).status, 401);
  });

  test('tai khoan bi khoa khong vao duoc nhom cua minh', async () => {
    const email = `${RUN_PREFIX}locked@duchome.vn`;
    const reg = await post('/auth/register', {
      email,
      password: '123456',
      fullName: 'Test Locked',
      role: 'TENANT',
    });
    await prisma.user.update({ where: { email }, data: { status: 'LOCKED' } });

    const r = await call('GET', '/tenant/dashboard', reg.body.data.token);
    assert.equal(r.status, 403);
  });
});

describe('Noi dung dashboard', () => {
  test('TENANT: dem yeu cau thue, hop dong, hoa don cua chinh minh', async () => {
    const { body } = await call('GET', '/tenant/dashboard', tokens.TENANT);
    assert.deepEqual(body.data, {
      rentalRequests: { PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 },
      activeContracts: 0,
      unpaidInvoices: 0,
    });
  });

  test('OWNER: dem nha tro, phong, yeu cau cho, hop dong cua chinh minh', async () => {
    const { body } = await call('GET', '/owner/dashboard', tokens.OWNER);
    assert.deepEqual(body.data, {
      properties: 0,
      rooms: { total: 0, AVAILABLE: 0, RENTED: 0, HIDDEN: 0 },
      pendingRequests: 0,
      activeContracts: 0,
    });
  });

  test('ADMIN: thong ke nguoi dung toan he thong', async () => {
    const { body } = await call('GET', '/admin/dashboard', tokens.ADMIN);
    const { users } = body.data;
    assert.ok(users.byRole.ADMIN >= 1);
    assert.ok(users.byRole.OWNER >= 1);
    assert.ok(users.byRole.TENANT >= 1);
    assert.equal(users.total, users.byRole.ADMIN + users.byRole.OWNER + users.byRole.TENANT);
    assert.equal(typeof body.data.pendingPosts, 'number');
  });
});
