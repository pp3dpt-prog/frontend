import React, { useState, useEffect } from 'react';
import Scene3D from './components/Scene3D';
import './App.css'; // Importa o novo CSS

const App = () => {
  const [config, setConfig] = useState({
    nome: 'BOBI',
    telefone: '912345678',
    forma: 'osso',
    tamanho: 'M',
    temNFC: false
  });

  const [loading, setLoading] = useState(false);
  const [stlUrl, setStlUrl] = useState(null);
  const [podeComprar, setPodeComprar] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // REGRA: S não pode ter NFC e certas formas
  useEffect(() => {
    if (config.tamanho === 'S') {
      let novaForma = config.forma;
      // Se for S e estiver em Coração/Círculo, volta para Osso
      if (config.forma === 'coracao' || config.forma === 'circulo') {
        novaForma = 'osso';
      }
      setConfig(prev => ({ ...prev, temNFC: false, forma: novaForma }));
    }
  }, [config.tamanho]);

  const handleGerarPreview = async () => {
    setLoading(true);
    setStlUrl(null);
    setPodeComprar(false);
    try {
      const response = await fetch(`${API_URL}/gerar-tag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      if (response.ok && data.url) {
        setStlUrl(data.url);
        setPodeComprar(true);
      } else {
        alert("Erro ao gerar modelo.");
      }
    } catch (e) {
      alert("Erro de ligação.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarAoCarrinho = () => {
    console.log("Adicionado:", config);
    alert(`Sucesso! A medalha do ${config.nome} foi guardada.`);
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h1>PetTag <span style={{color: '#0071e3'}}>3D</span></h1>
        
        <div className="input-group">
          <label>Nome do Pet</label>
          <input 
            type="text" 
            maxLength={12} 
            value={config.nome} 
            onChange={e => setConfig({...config, nome: e.target.value.toUpperCase()})} 
          />
        </div>

        <div className="input-group">
          <label>Telefone (Verso)</label>
          <input 
            type="text" 
            disabled={config.temNFC}
            placeholder={config.temNFC ? "Gravado no Chip" : "Teu contacto"}
            value={config.telefone} 
            onChange={e => setConfig({...config, telefone: e.target.value})} 
          />
        </div>

        <div className="input-group">
          <label>Tamanho</label>
          <div className="size-grid">
            {['S', 'M', 'L'].map(t => (
              <button 
                key={t} 
                className={`btn-size ${config.tamanho === t ? 'active' : ''}`}
                onClick={() => setConfig({...config, tamanho: t})}
              >{t}</button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label>Forma</label>
          <select 
            value={config.forma} 
            onChange={e => setConfig({...config, forma: e.target.value})}
          >
            <option value="osso">🦴 Osso</option>
            <option value="coracao" disabled={config.tamanho === 'S'}>❤️ Coração (Apenas M/L)</option>
            <option value="circulo" disabled={config.tamanho === 'S'}>🔘 Círculo (Apenas M/L)</option>
          </select>
        </div>

        <div className="input-group">
          <label>Tecnologia</label>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <input 
              type="checkbox" 
              checked={config.temNFC} 
              disabled={config.tamanho === 'S'}
              onChange={e => setConfig({...config, temNFC: e.target.checked})}
            />
            <span style={{fontSize: '14px'}}>Incluir Chip NFC</span>
          </div>
          {config.tamanho === 'S' && <p className="restriction-text">* S não suporta NFC.</p>}
        </div>

        <button className="btn-primary" onClick={handleGerarPreview} disabled={loading}>
          {loading ? 'A PERSONALIZAR...' : 'VISUALIZAR EM 3D'}
        </button>

        {podeComprar && (
          <button className="btn-primary btn-cart" onClick={handleAdicionarAoCarrinho}>
            🛒 ADICIONAR AO CARRINHO
          </button>
        )}
      </div>

      <div className="viewport">
        {loading ? (
          <div style={{textAlign: 'center'}}>
            <div className="spinner"></div>
            <p style={{color: '#86868b', marginTop: '15px'}}>Criando o teu modelo único...</p>
          </div>
        ) : stlUrl ? (
          <Scene3D stlUrl={stlUrl} />
        ) : (
          <p style={{color: '#86868b'}}>Personaliza e clica em Visualizar</p>
        )}
      </div>
    </div>
  );
};

export default App;