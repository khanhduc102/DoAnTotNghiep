// Sinh va xac thuc JWT.
// Moi lan dang nhap cap 1 token duy nhat, song 7 ngay (JWT_EXPIRES_IN), chua { id, role, ver }.
// ver = users.tokenVersion luc ky. Logout tang tokenVersion -> token cu lech ver -> bi tu choi.
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role, ver: user.tokenVersion }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });

const verifyToken = (token) => jwt.verify(token, env.jwt.secret);

module.exports = { signToken, verifyToken };
