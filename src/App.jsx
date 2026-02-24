import React, { useState, useEffect } from 'react';
import Scene3D from './components/Scene3D';
import './App.css';

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

  // LÓGICA DE NEGÓCIO: Restrições de Produção
  useEffect(() => {
    if (config.tamanho === 'S') {
      // S é demasiado pequeno para o chip ou formas complexas
      setConfig(prev => ({ 
        ...prev, 
        temNFC: false, 
        forma: (prev.forma === 'coracao' || prev.forma === 'circulo') ? 'osso' : prev.forma 
      }));
    }
  }, [config.tamanho]);

  const handleGerarPreview = async () => {
    setLoading(true); setStlUrl(null); setPodeComprar(false);
    try {
      const response = await fetch(`${API_URL}/gerar-tag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      if (response.ok && data.url) { setStlUrl(data.url); setPodeComprar(true); }
    } catch (e) { alert("Erro de ligação ao servidor."); }
    finally { setLoading(false); }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="logo-brand">PP3D<span style={{color: '#3b82f6'}}>.PT</span></div>

        <div className="input-block">
          <label>NOME DO PET (FRENTE)</label>
          <input type="text" maxLength={12} value={config.nome} 
            onChange={e => setConfig({...config, nome: e.target.value.toUpperCase()})} />
        </div>

        <div className="input-block">
          <label>TELEFONE (VERSO)</label>
          <input type="text" disabled={config.temNFC} 
            placeholder={config.temNFC ? "DADOS NO CHIP NFC" : "CONTACTO GRAVADO"}
            value={config.telefone} onChange={e => setConfig({...config, telefone: e.target.value})} />
        </div>

        <div className="input-block">
          <label>TAMANHO DA TAG</label>
          <div className="size-selector">
            {['S', 'M', 'L'].map(t => (
              <button key={t} className={`btn-size ${config.tamanho === t ? 'active' : ''}`}
                onClick={() => setConfig({...config, tamanho: t})}>{t}</button>
            ))}
          </div>
          <div style={{fontSize: '10px', color: '#94a3b8', textAlign: 'center'}}>
            {config.tamanho === 'S' && "25mm x 15mm - Ideal para Cães Pequenos"}
            {config.tamanho === 'M' && "40mm x 25mm - Ideal para Cães Médios"}
            {config.tamanho === 'L' && "55mm x 35mm - Ideal para Cães Grandes"}
          </div>
        </div>

        <div className="input-block">
          <label>FORMA GEOMÉTRICA</label>
          <select value={config.forma} onChange={e => setConfig({...config, forma: e.target.value})}>
            <option value="osso">🦴 Osso</option>
            <option value="coracao" disabled={config.tamanho === 'S'}>❤️ Coração (Apenas M)</option>
            <option value="circulo" disabled={config.tamanho === 'S'}>🔘 Círculo (Apenas M)</option>
          </select>
        </div>

        <div className={`nfc-panel ${config.tamanho === 'S' ? 'disabled' : ''}`} 
             style={{opacity: config.tamanho === 'S' ? 0.5 : 1}}>
          <input type="checkbox" id="nfc-toggle" checked={config.temNFC} disabled={config.tamanho === 'S'}
            onChange={e => setConfig({...config, temNFC: e.target.checked})} />
          <label htmlFor="nfc-toggle" style={{margin: 0, cursor: 'pointer', fontSize: '12px'}}>
            ATIVAR CHIP NFC INTEGRADO
          </label>
        </div>

        <button className="btn-main" onClick={handleGerarPreview} disabled={loading}>
          {loading ? 'A GERAR MODELO...' : 'VER PREVIEW 3D'}
        </button>

        {podeComprar && (
          <button className="btn-main btn-cart" onClick={() => alert("Adicionado ao carrinho!")}>
            🛒 FAZER PEDIDO
          </button>
        )}
      </div>

      <div className="viewport">
        {loading ? (
          <div style={{textAlign: 'center'}}><div className="spinner" style={{margin: '0 auto'}}></div><p style={{color:'#64748b', marginTop: '10px'}}>Personalizando o teu STL...</p></div>
        ) : stlUrl ? (
          <Scene3D stlUrl={stlUrl} />
        ) : (
          <div style={{color: '#94a3b8', textAlign: 'center'}}>
            <p>Os teus ajustes aparecerão aqui em tempo real.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;