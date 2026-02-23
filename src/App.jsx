import React, { useState } from 'react';
import Scene3D from './components/Scene3D';

const App = () => {
  // 1. ESTADO INICIAL
  const [config, setConfig] = useState({
    nome: 'BOBI',
    telefone: '912345678',
    forma: 'osso',    // 'osso', 'coracao', 'circulo'
    tamanho: 'M',     // 'S', 'M', 'L'
    temNFC: false
  });

  const [loading, setLoading] = useState(false);
  const [stlUrl, setStlUrl] = useState(null);
  const [podeComprar, setPodeComprar] = useState(false);

  // Lembra-te de substituir pelo URL real do teu backend no Render
  const API_URL = "https://backend1-yegx.onrender.com/api/gerar-stl";

  // 2. LÓGICA DE ENVIO PARA O BACKEND
  const handleGerarPreview = async () => {
    setLoading(true);
    setStlUrl(null);
    setPodeComprar(false);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const data = await response.json();

      if (response.ok && data.url) {
        setStlUrl(data.url);
        setPodeComprar(true);
      } else {
        alert("Erro ao gerar o modelo. Verifica o servidor.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro de ligação. O backend está ligado?");
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarAoCarrinho = () => {
    const item = {
      ...config,
      linkFicheiro: stlUrl,
      preco: 14.90
    };
    console.log("Adicionado ao carrinho:", item);
    alert(`Sucesso! A medalha do ${config.nome} foi guardada.`);
  };

  return (
    <div style={containerStyle}>
      
      {/* MENU LATERAL DE CONFIGURAÇÃO */}
      <div style={sidebarStyle}>
        <h1 style={titleStyle}>PetTag <span style={{color: '#3b82f6'}}>3D</span></h1>
        
        <div style={inputGroup}>
          <label style={labelStyle}>NOME DO PET</label>
          <input 
            style={inputStyle}
            type="text" 
            maxLength={12} 
            value={config.nome} 
            onChange={e => setConfig({...config, nome: e.target.value.toUpperCase()})} 
          />
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>TELEFONE (VERSO)</label>
          <input 
            style={inputStyle}
            type="text" 
            disabled={config.temNFC}
            placeholder={config.temNFC ? "NFC Ativo" : "Teu contacto"}
            value={config.telefone} 
            onChange={e => setConfig({...config, telefone: e.target.value})} 
          />
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>FORMA</label>
          <select 
            style={inputStyle} 
            value={config.forma} 
            onChange={e => setConfig({...config, forma: e.target.value})}
          >
            <option value="osso">🦴 Osso</option>
            <option value="coracao">❤️ Coração</option>
            <option value="circulo">🔘 Círculo</option>
          </select>
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>TECNOLOGIA</label>
          <div 
            style={toggleStyle} 
            onClick={() => setConfig({...config, temNFC: !config.temNFC})}
          >
            <div style={{
              ...toggleCircle, 
              transform: config.temNFC ? 'translateX(20px)' : 'translateX(0)',
              background: config.temNFC ? '#3b82f6' : '#555'
            }} />
            <span style={{marginLeft: '40px', fontSize: '12px'}}>
              {config.temNFC ? "CHIP NFC ATIVO" : "APENAS GRAVAÇÃO"}
            </span>
          </div>
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>TAMANHO</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['S', 'M', 'L'].map(t => (
              <button 
                key={t} 
                onClick={() => setConfig({...config, tamanho: t})}
                style={{ 
                  ...sizeButtonStyle, 
                  background: config.tamanho === t ? '#3b82f6' : '#222' 
                }}
              >{t}</button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleGerarPreview} 
          disabled={loading} 
          style={{...btnGerar, opacity: loading ? 0.6 : 1}}
        >
          {loading ? 'A PROCESSAR...' : 'VER PREVIEW 3D'}
        </button>

        {podeComprar && (
          <button onClick={handleAdicionarAoCarrinho} style={btnCarrinho}>
            🛒 ADICIONAR AO CARRINHO
          </button>
        )}
      </div>

      {/* ÁREA DE VISUALIZAÇÃO 3D */}
      <div style={viewportStyle}>
        {loading ? (
          <div style={loaderContainer}>
            <div className="spinner"></div>
            <p style={{marginTop: '15px', color: '#888'}}>A personalizar o teu modelo no servidor...</p>
          </div>
        ) : stlUrl ? (
          <Scene3D url={stlUrl} />
        ) : (
          <div style={{color: '#444', textAlign: 'center'}}>
            <p>Configura os dados e clica em <b>Ver Preview</b></p>
            <small>Vais ver o ficheiro real que será impresso.</small>
          </div>
        )}
      </div>

      <style>{`
        .spinner {
          width: 40px; height: 40px;
          border: 4px solid #222;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// --- ESTILOS ---
const containerStyle = { display: 'flex', height: '100vh', background: '#050505', color: 'white', fontFamily: 'Inter, sans-serif' };
const sidebarStyle = { width: '340px', padding: '30px', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '5px', overflowY: 'auto' };
const viewportStyle = { flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const titleStyle = { fontSize: '22px', fontWeight: '800', marginBottom: '20px', letterSpacing: '-1px' };
const inputGroup = { marginBottom: '18px' };
const labelStyle = { display: 'block', fontSize: '10px', color: '#666', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '1px' };
const inputStyle = { width: '100%', padding: '12px', background: '#111', border: '1px solid #222', color: 'white', borderRadius: '6px', outline: 'none' };
const sizeButtonStyle = { flex: 1, padding: '10px', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' };
const btnGerar = { width: '100%', padding: '15px', background: 'white', color: 'black', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };
const btnCarrinho = { width: '100%', padding: '15px', background: '#f59e0b', color: 'black', border: 'none', borderRadius: '6px', fontWeight: '900', cursor: 'pointer', marginTop: '10px', animation: 'fadeIn 0.5s' };
const toggleStyle = { width: '100%', height: '40px', background: '#111', borderRadius: '6px', border: '1px solid #222', position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0 10px' };
const toggleCircle = { width: '16px', height: '16px', borderRadius: '50%', position: 'absolute', transition: '0.3s' };
const loaderContainer = { display: 'flex', flexDirection: 'column', alignItems: 'center' };

export default App;