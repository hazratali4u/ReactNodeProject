const express = require('express');
const cors = require('cors');
const sql = require('mssql/msnodesqlv8');

const app = express();
const PORT = process.env.PORT || 5001;

const dbConfig = {
  connectionString:
    'Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-Q07NSGI\\SQLEXPRESS;Database=SchoolDB;Trusted_Connection=Yes;TrustServerCertificate=Yes;',
};

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Node.js!' });
});
app.get('/api/ali', (req, res) => {
  res.json({ message: 'ali from Node.js!' });
});

app.get('/api/students', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT Id, Name, ClassName
      FROM dbo.Students
      ORDER BY Id
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Failed to load students:', error);
    res.status(500).json({ message: 'Failed to load students.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
