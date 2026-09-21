// Sinh va xac thuc JWT.
// Moi lan dang nhap cap 1 token duy nhat, song 7 ngay (JWT_EXPIRES_IN), chua { id, role }.
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });

const verifyToken = (token) => jwt.verify(token, env.jwt.secret);

module.exports = { signToken, verifyToken };
