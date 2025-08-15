// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api', // 이 부분이 프록시 prefix 역할
    createProxyMiddleware({
      target: 'http://192.168.0.2:8000',
      changeOrigin: true,
    })
  );
};
