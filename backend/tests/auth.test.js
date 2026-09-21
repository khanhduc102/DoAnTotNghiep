// Kiem thu module xac thuc. Chay: npm test
// Test dung app that + database that (DATABASE_URL trong .env).
// Moi user do test tao ra co email bat dau bang RUN_PREFIX va duoc xoa sau khi chay xong.
// Dat truoc khi nap app: tat log morgan (chi bat o development). dotenv khong ghi de bien nay.
process.env.NODE_ENV = 'test';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');

const app = require('../src/app');
const prisma = require('../src/config/prisma');
const { authenticate, authorize } = require('../src/middlewares/auth.middleware');
const { errorHandler } = require('../src/middlewares/error.middleware');

const RUN_PREFIX = `test_${Date.now()}_`;
const PASSWORD = '123456';

let server;
let baseUrl;

// Goi API va tra ve { status, body }
const call = async (method, path, { body, token } = {}) => {
  const res = await fetch(baseUrl + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: res.status, body: await res.json() };
};

const registerUser = (suffix, role = 'TENANT') =>
  call('POST', '/api/auth/register', {
    body: { email: `${RUN_PREFIX}${suffix}@duchome.vn`, password: PASSWORD, fullName: 'Nguoi Dung Test', role },
  });

const login = (email, password = PASSWORD) =>
  call('POST', '/api/auth/login', { body: { email, password } });

before(async () => {
  // Router chi dung cho test: gan middleware that de kiem tra authorize.
  // Khong dang ky vao code chinh.
  const guarded = express.Router();
  guarded.get('/admin-only', authenticate, authorize('ADMIN'), (req, res) => {
    res.json({ success: true, data: { role: req.user.role }, message: 'ok' });
  });
  guarded.get('/owner-or-admin', authenticate, authorize('OWNER', 'ADMIN'), (req, res) => {
    res.json({ success: true, data: { role: req.user.role }, message: 'ok' });
  });
  const testApp = express();
  testApp.use('/__test', guarded);
  testApp.use(app);
  testApp.use(errorHandler);

  await new Promise((resolve) => {
    server = testApp.listen(0, resolve);
  });
  baseUrl = `http://localhost:${server.address().port}`;
});

after(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: RUN_PREFIX } } });
  await prisma.$disconnect();
  await new Promise((resolve) => server.close(resolve));
});

describe('POST /api/auth/register', () => {
  test('dang ky TENANT thanh cong', async () => {
    const r = await registerUser('tenant');
    assert.equal(r.status, 201);
    assert.equal(r.body.success, true);
    assert.equal(r.body.data.user.role, 'TENANT');
    assert.equal(typeof r.body.data.token, 'string');
    assert.equal(r.body.data.user.password, undefined, 'khong duoc tra ve mat khau');
  });

  test('dang ky OWNER thanh cong', async () => {
    const r = await registerUser('owner', 'OWNER');
    assert.equal(r.status, 201);
    assert.equal(r.body.data.user.role, 'OWNER');
  });

  test('khong cho dang ky ADMIN', async () => {
    const r = await registerUser('fakeadmin', 'ADMIN');
    assert.equal(r.status, 400);
    assert.equal(r.body.success, false);
    assert.ok(r.body.errors.some((e) => e.field === 'role'));
  });

  test('trung email bi chan 409', async () => {
    await registerUser('dup');
    const r = await registerUser('dup');
    assert.equal(r.status, 409);
    assert.equal(r.body.success, false);
  });

  test('thong bao loi nhap lieu bang tieng Viet co dau, khong lot tieng Anh', async () => {
    const r = await call('POST', '/api/auth/register', { body: { role: 'ADMIN' } });
    assert.equal(r.status, 400);
    const byField = Object.fromEntries(r.body.errors.map((e) => [e.field, e.message]));
    assert.equal(byField.email, 'Vui lòng nhập email');
    assert.equal(byField.password, 'Vui lòng nhập mật khẩu');
    assert.equal(byField.fullName, 'Vui lòng nhập họ tên');
    assert.equal(byField.role, 'Vai trò chỉ được là TENANT hoặc OWNER');
    assert.equal(r.body.message, 'Dữ liệu không hợp lệ');
  });

  test('du lieu sai tra loi tung truong', async () => {
    const r = await call('POST', '/api/auth/register', {
      body: { email: 'khong-phai-email', password: '12', fullName: 'A' },
    });
    assert.equal(r.status, 400);
    const fields = r.body.errors.map((e) => e.field);
    assert.ok(fields.includes('email'));
    assert.ok(fields.includes('password'));
    assert.ok(fields.includes('fullName'));
  });
});

describe('POST /api/auth/login', () => {
  test('dang nhap thanh cong, JWT chua id + role, han 7 ngay', async () => {
    const reg = await registerUser('login');
    const r = await login(`${RUN_PREFIX}login@duchome.vn`);
    assert.equal(r.status, 200);

    const payload = jwt.decode(r.body.data.token);
    assert.equal(payload.id, reg.body.data.user.id);
    assert.equal(payload.role, 'TENANT');
    assert.equal(payload.exp - payload.iat, 7 * 24 * 60 * 60, 'token phai song dung 7 ngay');
  });

  test('sai mat khau bi chan 401', async () => {
    await registerUser('wrongpass');
    const r = await login(`${RUN_PREFIX}wrongpass@duchome.vn`, 'sai-mat-khau');
    assert.equal(r.status, 401);
    assert.equal(r.body.success, false);
  });

  test('email khong ton tai tra cung thong bao voi sai mat khau', async () => {
    const r = await login(`${RUN_PREFIX}khongtontai@duchome.vn`);
    assert.equal(r.status, 401);
    assert.equal(r.body.message, 'Email hoặc mật khẩu không chính xác');
  });

  test('tai khoan bi khoa khong dang nhap duoc (403)', async () => {
    await registerUser('locked-login');
    const email = `${RUN_PREFIX}locked-login@duchome.vn`;
    await prisma.user.update({ where: { email }, data: { status: 'LOCKED' } });

    const r = await login(email);
    assert.equal(r.status, 403);
    assert.match(r.body.message, /bị khóa/);
  });
});

describe('GET /api/auth/me', () => {
  test('co token hop le thi lay duoc ho so', async () => {
    const reg = await registerUser('me');
    const r = await call('GET', '/api/auth/me', { token: reg.body.data.token });
    assert.equal(r.status, 200);
    assert.equal(r.body.data.email, `${RUN_PREFIX}me@duchome.vn`);
    assert.equal(r.body.data.password, undefined);
  });

  test('khong co token bi chan 401', async () => {
    const r = await call('GET', '/api/auth/me');
    assert.equal(r.status, 401);
    assert.equal(r.body.success, false);
  });

  test('token gia bi chan 401', async () => {
    const r = await call('GET', '/api/auth/me', { token: 'day.la.token-gia' });
    assert.equal(r.status, 401);
  });

  test('token cap truoc khi bi khoa cung mat hieu luc (403)', async () => {
    const reg = await registerUser('locked-me');
    const token = reg.body.data.token;
    await prisma.user.update({
      where: { email: `${RUN_PREFIX}locked-me@duchome.vn` },
      data: { status: 'LOCKED' },
    });

    const r = await call('GET', '/api/auth/me', { token });
    assert.equal(r.status, 403);
  });
});

describe('POST /api/auth/logout', () => {
  test('dang xuat thanh cong va token cu het hieu luc', async () => {
    const reg = await registerUser('logout');
    const token = reg.body.data.token;

    const out = await call('POST', '/api/auth/logout', { token });
    assert.equal(out.status, 200);
    assert.equal(out.body.success, true);

    const me = await call('GET', '/api/auth/me', { token });
    assert.equal(me.status, 401, 'token da logout khong duoc dung tiep');
    assert.match(me.body.message, /kết thúc/);
  });

  test('dang nhap lai sau khi logout thi dung binh thuong', async () => {
    await registerUser('relogin');
    const email = `${RUN_PREFIX}relogin@duchome.vn`;
    const first = await login(email);
    await call('POST', '/api/auth/logout', { token: first.body.data.token });

    const second = await login(email);
    const me = await call('GET', '/api/auth/me', { token: second.body.data.token });
    assert.equal(me.status, 200);
  });

  test('logout o mot thiet bi thi token o thiet bi khac cung het hieu luc', async () => {
    await registerUser('two-devices');
    const email = `${RUN_PREFIX}two-devices@duchome.vn`;
    const phone = await login(email);
    const laptop = await login(email);

    await call('POST', '/api/auth/logout', { token: phone.body.data.token });
    const r = await call('GET', '/api/auth/me', { token: laptop.body.data.token });
    assert.equal(r.status, 401);
  });

  test('logout khong co token bi chan 401', async () => {
    const r = await call('POST', '/api/auth/logout');
    assert.equal(r.status, 401);
  });

  test('tokenVersion khong bi lo ra ngoai', async () => {
    const reg = await registerUser('no-leak');
    assert.equal(reg.body.data.user.tokenVersion, undefined);
    const lg = await login(`${RUN_PREFIX}no-leak@duchome.vn`);
    assert.equal(lg.body.data.user.tokenVersion, undefined);
    const me = await call('GET', '/api/auth/me', { token: lg.body.data.token });
    assert.equal(me.body.data.tokenVersion, undefined);
  });
});

describe('authorize(...roles)', () => {
  test('TENANT goi route chi danh cho ADMIN bi chan 403', async () => {
    const reg = await registerUser('role-tenant');
    const r = await call('GET', '/__test/admin-only', { token: reg.body.data.token });
    assert.equal(r.status, 403);
    assert.equal(r.body.success, false);
  });

  test('OWNER goi route chi danh cho ADMIN bi chan 403', async () => {
    const reg = await registerUser('role-owner', 'OWNER');
    const r = await call('GET', '/__test/admin-only', { token: reg.body.data.token });
    assert.equal(r.status, 403);
  });

  test('ADMIN goi route ADMIN thanh cong', async () => {
    const adminLogin = await login('admin@duchome.vn');
    assert.equal(adminLogin.status, 200, 'can tai khoan seed admin@duchome.vn');
    const r = await call('GET', '/__test/admin-only', { token: adminLogin.body.data.token });
    assert.equal(r.status, 200);
    assert.equal(r.body.data.role, 'ADMIN');
  });

  test('authorize nhan nhieu role: OWNER vao duoc, TENANT bi chan', async () => {
    const owner = await registerUser('multi-owner', 'OWNER');
    const tenant = await registerUser('multi-tenant');
    const ok = await call('GET', '/__test/owner-or-admin', { token: owner.body.data.token });
    const denied = await call('GET', '/__test/owner-or-admin', { token: tenant.body.data.token });
    assert.equal(ok.status, 200);
    assert.equal(denied.status, 403);
  });

  test('khong token thi authorize khong duoc chay, tra 401', async () => {
    const r = await call('GET', '/__test/admin-only');
    assert.equal(r.status, 401);
  });
});

describe('Da bo refresh token', () => {
  test('POST /api/auth/refresh khong con ton tai (404)', async () => {
    const r = await call('POST', '/api/auth/refresh', { body: { refreshToken: 'x' } });
    assert.equal(r.status, 404);
  });
});
