import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5169', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(join(__dirname, '../dist')));

const pool = mysql.createPool({
  host: 'localhost',
  user: 'scraper',
  password: 'Jk8$Qe3#Zp2!BnL9',
  database: 'properties',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Validate database connection
const validateConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

// API Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

app.get('/api/reservations', async (req, res) => {
  try {
    console.log('Attempting to fetch reservations...');
    
    const query = `
      SELECT 
        er.*,
        h.name as Hotel,
        h.id as hotel_table_id,
        er.hotel_id as reservation_hotel_id,
        er.fullSidePanelText
      FROM expedia_reservations er
      LEFT JOIN hotels h ON er.hotel_id = h.id
      WHERE er.remainingBalance >= 0.5
      AND er.checkInDate >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
      ORDER BY er.checkInDate DESC
    `;
    
    console.log('Executing query:', query);
    
    const [rows] = await pool.query(query);
    
    console.log(`Successfully retrieved ${rows.length} reservations`);
    if (rows.length > 0) {
      console.log('Sample row:', JSON.stringify(rows[0], null, 2));
    }
    
    const formattedRows = rows.map(row => ({
      ...row,
      Hotel: row.Hotel || 'Unknown Hotel',
      checkInDate: row.checkInDate ? new Date(row.checkInDate).toISOString().split('T')[0] : null,
      checkOutDate: row.checkOutDate ? new Date(row.checkOutDate).toISOString().split('T')[0] : null,
      remainingBalance: parseFloat(row.remainingBalance || 0),
      status: row.reservationStatus || row.status || 'pending',
      bookingSource: row.bookingSource || 'Expedia',
      currency: row.currency || 'USD'
    }));

    console.log('First formatted row:', JSON.stringify(formattedRows[0], null, 2));
    res.json(formattedRows);
  } catch (error) {
    console.error('Detailed error in /api/reservations:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      sql: error.sql,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to fetch reservations',
      details: error.message,
      sqlMessage: error.sqlMessage 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Serve index.html for all non-API routes (must be after API routes)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;

// Start server only if database connection is successful
const startServer = async () => {
  const isConnected = await validateConnection();
  if (isConnected) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('API endpoints:');
      console.log(`- GET http://localhost:${PORT}/api/reservations`);
      console.log(`- GET http://localhost:${PORT}/api/test`);
    });
  } else {
    console.error('Server startup failed due to database connection issues');
    process.exit(1);
  }
};

startServer(); 