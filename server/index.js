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

function getStudentInput(req) {
  const name = String(req.body.Name || req.body.name || '').trim();
  const className = String(req.body.ClassName || req.body.className || '').trim();

  return { name, className };
}

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

app.post('/api/students', async (req, res) => {
  const { name, className } = getStudentInput(req);

  if (!name || !className) {
    return res.status(400).json({ message: 'Name and ClassName are required.' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input('Name', sql.NVarChar(sql.MAX), name)
      .input('ClassName', sql.NVarChar(sql.MAX), className)
      .query(`
        INSERT INTO dbo.Students (Name, ClassName)
        OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.ClassName
        VALUES (@Name, @ClassName)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Failed to add student:', error);
    res.status(500).json({ message: 'Failed to add student.' });
  }
});

app.post('/api/students/sp', async (req, res) => {
  const { name, className } = getStudentInput(req);

  if (!name || !className) {
    return res.status(400).json({ message: 'Name and ClassName are required.' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input('Name', sql.NVarChar(sql.MAX), name)
      .input('ClassName', sql.NVarChar(sql.MAX), className)
      .execute('dbo.AddStudent');

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Failed to add student with stored procedure:', error);
    res.status(500).json({ message: 'Failed to add student.' });
  }
});

app.get('/api/menus', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT Id, Name, Path, ParentId
      FROM dbo.Menus
      ORDER BY ParentId, Id
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Failed to load menus:', error);
    res.status(500).json({ message: 'Failed to load menus.' });
  }
});

app.get('/api/menus/children/:parentId', async (req, res) => {
  const { parentId } = req.params;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input('ParentId', sql.Int, parseInt(parentId, 10))
      .query(`
        SELECT Id, Name, Path, ParentId
        FROM dbo.Menus
        WHERE ParentId = @ParentId
        ORDER BY Id
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Failed to load child menus:', error);
    res.status(500).json({ message: 'Failed to load child menus.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});