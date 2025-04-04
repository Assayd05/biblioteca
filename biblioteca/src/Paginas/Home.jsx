import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './Desings/HomeDesing.css';

export const Home = () => {
  const [imagen, setImagen] = useState(null);

  useEffect(() => {
    // Obtener la imagen desde la API
    const fetchImagen = async () => {
      try {
        const response = await fetch('http://localhost:5000/libros'); // Cambia la URL si es necesario
        const data = await response.json();
        if (data.length > 0) {
          const imageUrl = `http://localhost:5000/uploads/${libro.imagen}`; // Cambia 'libro.imagen' por la propiedad correcta que contiene el nombre de la imagen
          console.log('URL de la imagen:', imageUrl); // Depuración
          setImagen(imageUrl); // Construir la URL completa
        }
      } catch (error) {
        console.error('Error al obtener la imagen:', error);
      }
    };

    fetchImagen();
  }, []);

  return (
    <motion.div
      className="home-container"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <h1>Bienvenido a la Biblioteca</h1>
      {imagen ? (
        <img
          src={imagen} // Usar la URL completa de la imagen
          alt="Imagen de la Biblioteca"
          className="book-image"
        />
      ) : (
        <p>Cargando imagen...</p>
      )}
    </motion.div>
  );
};