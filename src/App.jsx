import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser'; 
import Scene3D from './components/Scene3D';
import './App.css';

const App = () => {
  // 1. ESTADOS (Mantidos exatamente como os teus)
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
  const [showModal, setShowModal] = useState(false);
  const [tipoForm, setTipoForm] = useState('orcamento'); 
  
  const [formDados, setFormDados] = useState({
    donoNome: '', donoTelefone: '', donoEmail: '', nif: '', morada: '',
    petRaca: '', petNascimento: '', petChip: '', petVacinas: '', 
    petVet: '', obs: '', contactoEmergencia: ''
  });

  // 2. LÓGICA DE NEGÓCIO (Mantida a tua restrição do Tamanho S)
  useEffect(() => {
    if (config.tamanho === 'S') {
      setConfig(prev => ({ 
        ...prev, 
        temNFC: false, 
        forma: (prev.forma === 'coracao' || prev.forma === 'circulo') ? 'osso' : prev.forma 
      }));
    }
  }, [config.tamanho]);

  // 3. FUNÇÃO GERAR PREVIEW (Movida para o sítio certo)
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

  // 4. FUNÇÃO DE ENVIO (WhatsApp + EmailJS)
  const finalizarEnvio = async (e) => {
    e.preventDefault();

    const templateParams = {
      dono_nome: formDados.donoNome,
      dono_email: formDados.donoEmail,
      dono_telefone: formDados.donoTelefone,
      nif: formDados.nif,
      morada: formDados.morada,
      nome_pet: config.nome,
      pet_raca: formDados.petRaca,
      pet_nascimento: formDados.petNascimento,
      pet_chip: formDados.petChip,
      pet_vacinas: formDados.petVacinas,
      pet_vet: formDados.petVet,
      tamanho: config.tamanho,
      forma: config.forma,
      tem_nfc: config.temNFC ? "Sim" : "Não",
      contacto_emergencia: formDados.contactoEmergencia,
      stl_url: stlUrl
    };

    // Envio do Email para Produção
    emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID, 
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID, 
      templateParams, 
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    ).then((response) => {
       console.log('EMAIL ENVIADO!', response.status);
    }, (err) => {
       console.log('ERRO EMAILJS...', err);
    });
        
    // Mensagem WhatsApp para o Cliente
    const msg = `*PP3D.PT - NOVO PEDIDO DE ${tipoForm.toUpperCase()}*%0A%0A` +
      `*Dono:* ${formDados.donoNome}%0A` +
      `*Pet:* ${config.nome}%0A` +
      `*NIF:* ${formDados.nif}%0A` +
      `_Envio agora a foto para a Pagina Eletrónica de Pet!_`;

    window.open(`https://wa.me/351961028106?text=${msg}`, '_blank');
    setShowModal(false);
  };

  // 5. INTERFACE (O Teu Visual)
  return (
    <div className="app-container">
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
             style={{opacity: config.tamanho === 'S' ? 0.5 : 1, marginBottom: '15px'}}>
          <input type="checkbox" id="nfc-toggle" checked={config.temNFC} disabled={config.tamanho === 'S'}
            onChange={e => setConfig({...config, temNFC: e.target.checked})} />
          <label htmlFor="nfc-toggle" style={{margin: 0, cursor: 'pointer', fontSize: '12px'}}>
            ATIVAR CHIP NFC INTEGRADO
          </label>
        </div>

        <button className="btn-main" onClick={handleGerarPreview} disabled={loading}>
          {loading ? 'A GERAR...' : 'VER PREVIEW 3D'}
        </button>

        {podeComprar && (
          <button className="btn-buy" onClick={() => setShowModal(true)} style={{marginTop: '10px'}}>
            🛒 FINALIZAR PEDIDO / ORÇAMENTO
          </button>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button className="btn-secondary" onClick={() => { setTipoForm('info'); setShowModal(true); }}>
            ℹ️ Informação
          </button>
          <button className="btn-secondary" onClick={() => { setTipoForm('sugestao'); setShowModal(true); }}>
            💡 Sugestão
          </button>
        </div>
      </div>

      <div className="viewport">
         {stlUrl ? <Scene3D stlUrl={stlUrl} /> : <p>Configura a tua PetTag</p>}
      </div>

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

              {config.temNFC && tipoForm === 'orcamento' && (
                <>
                  <h4 className="full-width">Ficha do Pet (Cartão Eletrónico)</h4>
                  <input type="text" placeholder="Raça" onChange={e => setFormDados({...formDados, petRaca: e.target.value})} />
                  <input type="date" onChange={e => setFormDados({...formDados, petNascimento: e.target.value})} />
                  <input type="text" placeholder="Nº Chip Veterinário" onChange={e => setFormDados({...formDados, petChip: e.target.value})} />
                  <input type="text" placeholder="Contacto p/ Botão Chamada" onChange={e => setFormDados({...formDados, contactoEmergencia: e.target.value})} />
                  <textarea placeholder="Dados Veterinários / Alergias" className="full-width"
                    onChange={e => setFormDados({...formDados, petVet: e.target.value})} />
                </>
              )}

              <textarea placeholder="Observações Adicionais" className="full-width"
                onChange={e => setFormDados({...formDados, obs: e.target.value})} />

              <div className="modal-actions full-width">
                <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-confirm">Enviar Pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;