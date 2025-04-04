const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Para servir imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar almacenamiento de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'SistemaEscolar'
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1);
    }
    console.log('Conexión exitosa a la base de datos MySQL');
});

// ------------------- ENDPOINTS -------------------

// ALUMNOS
app.get('/alumnos', (req, res) => {
    db.query('SELECT * FROM Alumno', (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        res.json(results);
    });
});

app.post('/alumnos', (req, res) => {
    const { nombre_completo, correo, password, matricula, grupo } = req.body;
    const query = 'INSERT INTO Alumno (nombre_completo, correo, password, matricula, grupo) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [nombre_completo, correo, password, matricula, grupo], (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        res.json({ message: 'Alumno creado', id: results.insertId });
    });
});

app.put('/alumnos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre_completo, correo, password, matricula, grupo } = req.body;
    const query = 'UPDATE Alumno SET nombre_completo = ?, correo = ?, password = ?, matricula = ?, grupo = ? WHERE id = ?';
    db.query(query, [nombre_completo, correo, password, matricula, grupo, id], (err) => {
        if (err) return res.status(500).send('Error en el servidor');
        res.json({ message: 'Alumno actualizado' });
    });
});

app.delete('/alumnos/:id', (req, res) => {
    db.query('DELETE FROM Alumno WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).send('Error en el servidor');
        res.json({ message: 'Alumno eliminado' });
    });
});

// ADMINISTRADORES
app.get('/administradores', (req, res) => {
    db.query('SELECT * FROM Administrador', (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        res.json(results);
    });
});

app.post('/administradores', (req, res) => {
    const { nombre_completo, matricula, password } = req.body;
    const query = 'INSERT INTO Administrador (nombre_completo, matricula, password) VALUES (?, ?, ?)';
    db.query(query, [nombre_completo, matricula, password], (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        res.json({ message: 'Administrador creado', id: results.insertId });
    });
});

app.post('/login-admin', (req, res) => {
    const { matricula, password } = req.body;
    const query = 'SELECT * FROM Administrador WHERE matricula = ? AND password = ?';
    db.query(query, [matricula, password], (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        if (results.length === 0) return res.status(401).send('Credenciales inválidas');
        res.status(200).json({ message: 'Autenticación exitosa' });
    });
});

app.post('/login-alumno', (req, res) => {
    const { matricula, password } = req.body;
    const query = 'SELECT * FROM Alumno WHERE matricula = ? AND password = ?';
    db.query(query, [matricula, password], (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        if (results.length === 0) return res.status(401).send('Credenciales inválidas');
        res.status(200).json({
            message: 'Autenticación exitosa',
            matricula: results[0].matricula
        });
    });
});

// LIBROS
app.get('/libros', (req, res) => {
    const query = 'SELECT id, ISBN, titulo, autor, stock, imagen FROM Libro';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al obtener los libros');
        res.json(results);
    });
});

app.get('/libros/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM Libro WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).send('Error al obtener el libro');
        if (results.length === 0) return res.status(404).send('Libro no encontrado');
        res.json(results[0]);
    });
});

app.post('/libros', upload.single('imagen'), (req, res) => {
    const { ISBN, titulo, autor, stock } = req.body;
    const imagen = req.file ? req.file.filename : null;

    const query = 'INSERT INTO Libro (ISBN, titulo, autor, stock, imagen) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [ISBN, titulo, autor, stock, imagen], (err, results) => {
        if (err) return res.status(500).send('Error al crear libro');
        res.json({ message: 'Libro creado', id: results.insertId });
    });
});

app.get('/libros', (req, res) => {
    const query = 'SELECT id, ISBN, titulo, autor, stock, imagen FROM Libro';
    db.query(query, (err, results) => {
      if (err) return res.status(500).send('Error al obtener los libros');
      const librosConImagenes = results.map(libro => ({
        ...libro,
        imagen: libro.imagen ? `http://localhost:5000/uploads/${libro.imagen}` : null
      }));
      res.json(librosConImagenes);
    });
  });

app.put('/libros/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, autor, stock } = req.body;
    const query = 'UPDATE Libro SET titulo = ?, autor = ?, stock = ? WHERE id = ?';
    db.query(query, [titulo, autor, stock, id], (err, results) => {
        if (err) return res.status(500).send('Error al actualizar libro');
        if (results.affectedRows === 0) return res.status(404).send('Libro no encontrado');
        res.status(200).send('Libro actualizado');
    });
});

app.delete('/libros/:id', (req, res) => {
    const { id } = req.params;

    const deletePrestamosQuery = `DELETE FROM Prestamo WHERE ISBN = (SELECT ISBN FROM Libro WHERE id = ?)`;
    db.query(deletePrestamosQuery, [id], (err) => {
        if (err) return res.status(500).send('Error al eliminar préstamos');

        const deleteLibroQuery = 'DELETE FROM Libro WHERE id = ?';
        db.query(deleteLibroQuery, [id], (err, results) => {
            if (err) return res.status(500).send('Error al eliminar libro');
            if (results.affectedRows === 0) return res.status(404).send('Libro no encontrado');
            res.status(200).send('Libro eliminado');
        });
    });
});

// PRÉSTAMOS
app.get('/prestamos', (req, res) => {
    const { matricula } = req.query;
    if (!matricula) return res.status(400).send('La matrícula es requerida');

    const query = `
        SELECT id, matricula, ISBN,
        DATE_FORMAT(fechaPrestamo, '%Y-%m-%d') AS fechaPrestamo,
        DATE_FORMAT(fechaDevolucion, '%Y-%m-%d') AS fechaDevolucion
        FROM Prestamo WHERE matricula = ?
    `;
    db.query(query, [matricula], (err, results) => {
        if (err) return res.status(500).send('Error al obtener préstamos');
        res.json(results);
    });
});

app.post('/prestamos', (req, res) => {
    const { fechaPrestamo, fechaDevolucion, matricula, ISBN } = req.body;
    const query = `INSERT INTO Prestamo (fechaPrestamo, fechaDevolucion, matricula, ISBN) VALUES (?, ?, ?, ?)`;
    db.query(query, [fechaPrestamo, fechaDevolucion, matricula, ISBN], (err, results) => {
        if (err) return res.status(500).send('Error al registrar préstamo');
        res.status(201).json({ message: 'Préstamo registrado', id: results.insertId });
    });
});

app.put('/prestamos/:id', (req, res) => {
    const { id } = req.params;
    const { returned } = req.body;
    db.query('UPDATE Prestamo SET returned = ? WHERE id = ?', [returned, id], (err, results) => {
        if (err) return res.status(500).send('Error al actualizar préstamo');
        if (results.affectedRows === 0) return res.status(404).send('Préstamo no encontrado');
        res.status(200).send('Préstamo actualizado');
    });
});

// Ruta raíz
app.get('/', (req, res) => {
    res.send('Bienvenido a la API del Sistema Escolar');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
