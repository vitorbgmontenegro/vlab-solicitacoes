import { useState } from 'react';

import { FormularioSolicitacao } from './features/solicitacoes/FormularioSolicitacao';
import { ListaSolicitacoes } from './features/solicitacoes/ListaSolicitacoes';

export default function App() {
  /*
   * Contador usado como `key` da listagem. Mudar a key faz o React descartar o
   * componente e montar outro, o que dispara a busca de novo.
   *
   * E a forma mais simples de dizer "a lista ficou desatualizada" sem subir o
   * estado da listagem para ca.
   */
  const [versaoDaLista, setVersaoDaLista] = useState(0);

  function aoCriarSolicitacao() {
    setVersaoDaLista((anterior) => anterior + 1);
  }

  return (
    <div className="pagina">
      <header className="topo">
        <div className="topo__conteudo">
          <h1>Solicitacoes de Atendimento</h1>
          <p className="topo__subtitulo">
            Registro e acompanhamento de solicitacoes encaminhadas a unidades
            publicas de saude
          </p>
        </div>
      </header>

      <main className="conteudo">
        <FormularioSolicitacao aoCriar={aoCriarSolicitacao} />
        <ListaSolicitacoes key={versaoDaLista} />
      </main>
    </div>
  );
}
