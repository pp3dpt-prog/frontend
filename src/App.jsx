import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser'; // Certifica-te de que instalaste: npm install @emailjs/browser
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
  const [showModal, setShowModal] = useState(false);
  const [tipoForm, setTipoForm] = useState('orcamento'); // orcamento, info, sugestao
  

  // NOVOS ESTADOS: Modal e Dados do Pedido
  
  const [formDados, setFormDados] = useState({
    donoNome: '', donoTelefone: '', donoEmail: '', nif: '', morada: '',
    petRaca: '', petNascimento: '', petChip: '', petVacinas: '', 
    petVet: '', obs: '', contactoEmergencia: ''
  });

  // 2. FUNÇÃO GERAR PREVIEW (Corrigida e dentro do componente)
  const handleGerarPreview = async () => {
    setLoading(true);
    setStlUrl(null);
    setPodeComprar(false);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/gerar-tag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      if (response.ok && data.url) {
        setStlUrl(data.url);
        setPodeComprar(true);
      }
    } catch (error) {
      console.error("Erro ao gerar preview:", error);
      alert("Erro de ligação ao servidor.");
    } finally {
      setLoading(false);
    }
  };

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

  // 3. FUNÇÃO ENVIAR PEDIDO (Email + WhatsApp)
  const finalizarEnvio = async (e) => {
    e.preventDefault();

    const templateParams = {
      dono_nome: formDados.donoNome,
      dono_email: formDados.donoEmail,
      nome_pet: config.nome,
      stl_url: stlUrl,
      tamanho: config.tamanho,
      forma: config.forma,
      tem_nfc: config.temNFC ? "Sim" : "Não"
    };

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      const msg = `*PP3D.PT - NOVO PEDIDO*%0A*Dono:* ${formDados.donoNome}%0A*Pet:* ${config.nome}`;
      window.open(`https://wa.me/351912345678?text=${msg}`, '_blank');
      setShowModal(false);
    } catch (err) {
      alert("Erro ao enviar. Verifique as configurações.");
    }
  };

  return (
    <div className="app-container">
      {/* SIDEBAR COM LOGO */}
      <div className="sidebar">
        <div className="logo-header">
           <img src="/logo_pp3d.webp" alt="PP3D.PT" className="main-logo" />
           <h2>PP3D<span>.PT</span></h2>
        </div>

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

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button className="btn-secondary" onClick={() => { setTipoForm('info'); setShowModal(true); }}>
            Pedir Informação
          </button>
          <button className="btn-secondary" onClick={() => { setTipoForm('sugestao'); setShowModal(true); }}>
            Dar Sugestão
          </button>
        </div>

        {podeComprar && (
          <button className="btn-buy" onClick={() => setShowModal(true)}>
            🛒 FINALIZAR PEDIDO / ORÇAMENTO
          </button>
        )}

        <div className="extra-buttons">
          <button onClick={() => { setTipoForm('info'); setShowModal(true); }}>ℹ️ Informação</button>
          <button onClick={() => { setTipoForm('sugestao'); setShowModal(true); }}>💡 Sugestão</button>
        </div>
      </div>

      <div className="viewport">
         {/* Visualizador 3D */}
         {stlUrl ? <Scene3D stlUrl={stlUrl} /> : <p>Configura a tua PetTag</p>}
      </div>

      {/* MODAL PROFISSIONAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{tipoForm === 'orcamento' ? 'Dados para Faturação e NFC' : 'Contacto'}</h3>
            <form onSubmit={finalizarEnvio} className="grid-form">
              <input type="text" placeholder="Nome do Dono" required 
                onChange={e => setFormDados({...formDados, donoNome: e.target.value})} />
              <input type="text" placeholder="NIF (Opcional)" 
                onChange={e => setFormDados({...formDados, nif: e.target.value})} />
              <input type="email" placeholder="Teu Email" className="full-width" required
                onChange={e => setFormDados({...formDados, donoEmail: e.target.value})} />
              <input type="text" placeholder="Morada Completa de Envio" className="full-width"
                onChange={e => setFormDados({...formDados, morada: e.target.value})} />

              {/* CAMPOS NFC - Só aparecem se o chip estiver ativo */}
              {config.temNFC && tipoForm === 'orcamento' && (
                <>
                  <h4 className="full-width">Ficha do Pet (Cartão Eletrónico)</h4>
                  <input type="text" placeholder="Raça" onChange={e => setFormDados({...formDados, petRaca: e.target.value})} />
                  <input type="date" title="Data de Nascimento" onChange={e => setFormDados({...formDados, petNascimento: e.target.value})} />
                  <input type="text" placeholder="Nº Chip Veterinário" onChange={e => setFormDados({...formDados, petChip: e.target.value})} />
                  <input type="text" placeholder="Contacto p/ Botão Chamada" onChange={e => setFormDados({...formDados, contactoEmergencia: e.target.value})} />
                  <textarea placeholder="Dados Veterinários / Alergias" className="full-width"
                    onChange={e => setFormDados({...formDados, vet: e.target.value})} />
                </>
              )}

              <textarea placeholder="Observações Adicionais" className="full-width"
                onChange={e => setFormDados({...formDados, obs: e.target.value})} />

              <div className="modal-actions full-width">
                <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-confirm">Enviar para WhatsApp</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;