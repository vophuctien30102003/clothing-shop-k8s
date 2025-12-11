require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'clothing-shop-backend',
    version: '1.0.0'
  });
});

// Liveness probe
app.get('/api/liveness', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

// Routes (to be implemented)
// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/products', require('./routes/productRoutes'));
// app.use('/api/reports', require('./routes/reportRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  
  // Log environment variables (without sensitive data)
  console.log('Environment:');
  console.log(`  DB_HOST: ${process.env.DB_HOST || 'not set'}`);
  console.log(`  DB_NAME: ${process.env.DB_NAME || 'not set'}`);
  console.log(`  MINIO_ENDPOINT: ${process.env.MINIO_ENDPOINT || 'not set'}`);
});

