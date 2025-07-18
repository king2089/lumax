module.exports = (req, res) => {
  res.json({
    message: 'API test endpoint working!',
    timestamp: new Date().toISOString(),
    status: 'success',
    path: req.url,
    method: req.method
  });
}; 