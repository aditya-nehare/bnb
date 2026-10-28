const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);

  req.requestTime = timestamp;
  next();
};

module.exports = { logger };
