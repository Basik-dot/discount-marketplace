module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Server error';
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${status} ${message}`);
  res.status(status).json({ error: message });
};
