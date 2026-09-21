const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.isDev) {
  app.use(morgan('dev'));
}

// Phuc vu anh phong da upload: /uploads/<ten-file>
app.use('/uploads', express.static(path.join(__dirname, '..', env.upload.dir)));

// Kiem tra server con song
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'DucHome API đang chạy', timestamp: new Date() });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
