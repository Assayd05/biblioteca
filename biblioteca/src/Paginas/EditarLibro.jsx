import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom'; // Para obtener el ID de la URL y redirigir
import './Desings/AgregarLibroDesing.css'; // Reutilizamos el diseño de AgregarLibro

export const EditarLibro = () => {
  const { id } = useParams(); // Obtiene el ID desde la URL
  const navigate = useNavigate(); // Para redirigir después de editar
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [cantidad, setCantidad] = useState(1);

  // Función para obtener los datos del libro desde el backend
  const fetchLibro = async () => {
    try {
      const response = await fetch(`http://localhost:5000/libros/${id}`); // Endpoint para obtener un libro por ID
      if (response.ok) {
        const data = await response.json();
        setTitulo(data.titulo);
        setAutor(data.autor);
        setCantidad(data.stock); // Asegúrate de que el backend devuelva "stock"
      } else {
        alert('Error al obtener los datos del libro');
      }
    } catch (error) {
      console.error('Error al obtener los datos del libro:', error);
    }
  };

  useEffect(() => {
    fetchLibro(); // Llama a la función para obtener los datos del libro al montar el componente
  }, [id]);

  // Función para manejar la edición del libro
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo || !autor || cantidad < 1) {
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }

    const libroEditado = {
      titulo,
      autor,
      stock: cantidad, // Asegúrate de que el backend espere "stock"
    };

    try {
      const response = await fetch(`http://localhost:5000/libros/${id}`, {
        method: 'PUT', // Método PUT para actualizar
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(libroEditado),
      });

      if (response.ok) {
        alert('Libro editado exitosamente');
        navigate('/AdminIndex'); // Redirige a la página de administración
      } else {
        alert('Error al editar el libro');
      }
    } catch (error) {
      console.error('Error al editar el libro:', error);
      alert('Error al conectar con el servidor');
    }
  };

  return (
    <motion.div
      className="agregar-libro-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Editar Libro</h2>
      <form className="agregar-libro-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ID:</label>
          <input
            type="text"
            value={id}
            disabled // El ID no se puede editar
          />
        </div>
        <div className="form-group">
          <label>Título:</label>
          <input
            type="text"
            placeholder="Cambiar el título del libro"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Autor:</label>
          <input
            type="text"
            placeholder="Cambiar el autor del libro"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Cantidad:</label>
          <input
            type="number"
            min="1"
            placeholder="Cambiar la cantidad disponible"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            required
          />
        </div>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Editar Libro
        </motion.button>
      </form>
    </motion.div>
  );
};