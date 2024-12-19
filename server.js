import express from 'express';
import mysql from 'mysql2/promise';

const app = express();
const port = 5000;

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'scraper',
  password: 'Jk8$Qe3#Zp2!BnL9',
  database: 'properties',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('[Database] Connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('[Database] Connection failed:', err.message);
  });

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/api/reservations', async (req, res) => {
  console.log('[API] Fetching reservations from database');
  try {
    const [rows] = await pool.execute(`
      SELECT 
        er.id,
        er.guestName,
        er.guestFullName,
        er.checkInDate,
        er.checkOutDate,
        CAST(er.bookingAmount AS DECIMAL(10,2)) as bookingAmount,
        CAST(er.remainingBalance AS DECIMAL(10,2)) as remainingBalance,
        er.status,
        er.cardNumber,
        er.expirationDate,
        er.cvv,
        er.card_status,
        er.reservationStatus,
        er.bookingDate,
        er.created_at,
        er.updated_at,
        h.name as Hotel
      FROM expedia_reservations er
      LEFT JOIN hotels h ON er.hotel_id = h.id 
      ORDER BY er.created_at DESC
    `);

    // Format the response data
    const formattedRows = rows.map(row => ({
      ...row,
      bookingAmount: row.bookingAmount ? Number(row.bookingAmount) : null,
      remainingBalance: row.remainingBalance ? Number(row.remainingBalance) : null,
      checkInDate: row.checkInDate ? row.checkInDate.toISOString().split('T')[0] : null,
      checkOutDate: row.checkOutDate ? row.checkOutDate.toISOString().split('T')[0] : null,
      bookingDate: row.bookingDate ? row.bookingDate.toISOString().split('T')[0] : null,
      created_at: row.created_at ? row.created_at.toISOString() : null,
      updated_at: row.updated_at ? row.updated_at.toISOString() : null
    }));

    console.log(`[API] Found ${formattedRows.length} reservations`);
    res.json(formattedRows);
  } catch (error) {
    console.error('[API] Database error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch reservations',
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`[Server] Started at http://localhost:${port}`);
  console.log('[Server] Press Ctrl+C to stop');
}); 