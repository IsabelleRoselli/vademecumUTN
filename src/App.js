import React, { useState, useEffect } from 'react';
import './App.css';

// Componente de la Tarjeta (Demuestra manejo de Props)
const MedicationCard = ({ drug, alHacerClick }) => {
  const nombre = drug.openfda?.brand_name?.[0] || "Nombre no disponible";
  const laboratorio = drug.openfda?.manufacturer_name?.[0] || "Genérico";
  const via = drug.openfda?.route?.[0] || "Oral";
  const sustancia = drug.openfda?.substance_name?.[0] || "N/A";

  return (
    <div className="card" onClick={() => alHacerClick(drug)}>
      <span className="badge">METODO: {via}</span>
      <h3>{nombre}</h3>
      <div className="info-detalles">
        <p><strong>Laboratorio:</strong> {laboratorio.substring(0, 30)}</p>
        <p><strong>Sustancia:</strong> {sustancia.substring(0, 30)}</p>
        <p><strong>ID:</strong> {drug.id?.substring(0, 8) || "REF-882"}</p>
        <p><strong>Clase:</strong> Terapéutico</p>
      </div>
      <button className="btn-detail">VER FICHA TÉCNICA</button>
    </div>
  );
}

function App() {
  ;
  const [medicamentos, setMedicamentos] = useState([]);
  const [busqueda, setBusqueda] = useState(''); 
  const [seleccionado, setSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Lista de fármacos sugeridos para la interfaz inicial
  const sugerencias = ["Aspirin", "Ibuprofen", "Amoxicillin", "Paracetamol"];
useEffect(() => {
    const obtenerDatos = async () => {
      setCargando(true);
      // Si no hay búsqueda, usamos una sugerencia al azar para que la web no esté vacía
      const termino = busqueda || "Aspirin"; 
      try {
        const respuesta = await fetch(
          `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${termino}"&limit=8`
        );
        const data = await respuesta.json();
        setMedicamentos(data.results || []);
      } catch (error) {
        console.error("Error:", error);
      }
      setCargando(false);
    };
    obtenerDatos();
  }, [busqueda]);
  return (
    <div className="App">
      <header className="header">
        <h1>PharmaSearch <span>+</span></h1>
        <p>Vademecum Farmacológico | API FDA</p>
        
        <input 
          type="text" 
          placeholder="Buscar recurso por nombre..." 
          className="main-search"
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <div className="sugerencias-container">
          <span>Sugerencias: </span>
          {sugerencias.map(s => (
            <button key={s} className="tag-btn" onClick={() => setBusqueda(s)}>
              {s}
            </button>
          ))}
        </div>
      </header>

      <main>
        <h2 className="section-title">
          {busqueda ? `Resultados para: ${busqueda}` : "Destacados"}
        </h2>

        {cargando ? (
          <div className="loader">Sincronizando con base de datos...</div>
        ) : (
          <div className="grid">
            {medicamentos.map((item, index) => (
              <MedicationCard 
                key={index} 
                drug={item} 
                alHacerClick={setSeleccionado} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de Detalles (Mínimo 4 datos requeridos) */}
      {seleccionado && (
        <div className="modal-overlay" onClick={() => setSeleccionado(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>FICHA DE RECURSO</h2>
              <button className="close-x" onClick={() => setSeleccionado(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <h3>{seleccionado.openfda?.brand_name?.[0]}</h3>
              <div className="data-grid">
                <div className="data-item"><strong>Laboratorio:</strong> {seleccionado.openfda?.manufacturer_name?.[0]}</div>
                <div className="data-item"><strong>Sustancia:</strong> {seleccionado.openfda?.substance_name?.[0]}</div>
                <div className="data-item"><strong>Vía:</strong> {seleccionado.openfda?.route?.[0]}</div>
                <div className="data-item"><strong>Categoría:</strong> {seleccionado.openfda?.product_type?.[0] || "Medicamento"}</div>
              </div>
              <h4>Indicaciones y Uso:</h4>
              <p>{seleccionado.indications_and_usage?.[0] || "No disponible."}</p>
              <h4>Advertencias Especiales:</h4>
              <p>{seleccionado.warnings?.[0] || "Consulte a su médico."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;