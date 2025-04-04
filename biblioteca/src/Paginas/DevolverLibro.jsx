import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Desings/DevolverDesing.css';

export const DevolverLibro = () => {
  const [loans, setLoans] = useState([]);
  const [matricula, setMatricula] = useState('');

  // Recuperar la matrícula del alumno que inició sesión
  useEffect(() => {
    const storedMatricula = localStorage.getItem('matricula');
    if (!storedMatricula) {
      alert('Por favor, inicia sesión para ver tus préstamos.');
      return;
    }
    setMatricula(storedMatricula);
  }, []);

  // Obtener los préstamos del alumno desde el backend
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await fetch(`http://localhost:5000/prestamos?matricula=${matricula}`);
        if (response.ok) {
          const data = await response.json();
          setLoans(data); // Guardar los préstamos en el estado
        } else {
          console.error('Error al obtener los préstamos:', response.statusText);
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
      }
    };

    if (matricula) {
      fetchLoans();
    }
  }, [matricula]);

  // Marcar un préstamo como devuelto
  const markAsReturned = async (loanId) => {
    try {
      const response = await fetch(`http://localhost:5000/prestamos/${loanId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ returned: true }),
      });

      if (response.ok) {
        alert('Préstamo marcado como devuelto.');
        // Actualizar la lista de préstamos
        setLoans(loans.map(loan => loan.id === loanId ? { ...loan, returned: true } : loan));
      } else {
        alert('Error al marcar el préstamo como devuelto.');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    }
  };

  // Filtrar los préstamos pendientes
  const pendingLoans = loans.filter(loan => !loan.returned);

  return (
    <motion.div
      className="devolver-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Devolver Libro</h2>
      {pendingLoans.length === 0 ? (
        <p>No hay libros pendientes de devolución.</p>
      ) : (
        <div className="devolver-list">
          {pendingLoans.map((loan) => (
            <div key={loan.id} className="devolver-item">
              <div className="info-left">
                <img src={loan.image} alt={loan.title} className="devolver-img" />
              </div>
              <div className="info-right">
                <p><strong>ID préstamo:</strong> {loan.id}</p>
                <p><strong>Matrícula:</strong> {loan.matricula}</p>
                <p><strong>ISBN:</strong> {loan.ISBN}</p>
                <p><strong>Fecha de préstamo:</strong> {loan.fechaPrestamo}</p>
                <p><strong>Fecha de devolución:</strong> {loan.fechaDevolucion}</p>
                <p><strong>Cantidad solicitada:</strong> {loan.cantidad}</p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => markAsReturned(loan.id)}
                >
                  Marcar como devuelto
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};