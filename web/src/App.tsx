import { useState } from 'react';

import { FiltrosSolicitacoes } from './features/solicitacoes/FiltrosSolicitacoes';
import { FormularioSolicitacao } from './features/solicitacoes/FormularioSolicitacao';
import { ListaSolicitacoes } from './features/solicitacoes/ListaSolicitacoes';
import { ResumoSolicitacoes } from './features/solicitacoes/ResumoSolicitacoes';
import type { FiltrosSolicitacao, Status } from './types/solicitacao';

export default function App() {
  /*
   * Filtros e pagina vivem aqui porque tres componentes dependem deles: o
   * resumo, os controles de filtro e a listagem.
   */
  const [filtros, setFiltros] = useState<FiltrosSolicitacao>({});

  /*
   * Dois contadores, com papeis diferentes.
   *
   * `chaveDaLista` e usado como `key` da listagem: mudar a key faz o React
   * descartar o componente e montar outro, refazendo a busca. Serve para
   * depois de uma criacao.
   *
   * `versaoDosDados` apenas avisa o resumo que a contagem mudou. E separado
   * porque mudar a key da listagem tambem fecharia o painel de detalhe, o que
   * seria ruim logo depois de alterar um status.
   */
  const [chaveDaLista, setChaveDaLista] = useState(0);
  const [versaoDosDados, setVersaoDosDados] = useState(0);

  function aoCriarSolicitacao() {
    setChaveDaLista((anterior) => anterior + 1);
    setVersaoDosDados((anterior) => anterior + 1);
  }

  function aoMudarDados() {
    setVersaoDosDados((anterior) => anterior + 1);
  }

  function aoMudarPagina(pagina: number) {
    setFiltros((anteriores) => ({ ...anteriores, page: pagina }));
  }

  function aoSelecionarStatus(status: Status | undefined) {
    setFiltros((anteriores) => ({ ...anteriores, status, page: 1 }));
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
        <ResumoSolicitacoes
          versao={versaoDosDados}
          statusSelecionado={filtros.status}
          aoSelecionar={aoSelecionarStatus}
        />
        <FormularioSolicitacao aoCriar={aoCriarSolicitacao} />
        <FiltrosSolicitacoes filtros={filtros} aoMudar={setFiltros} />
        <ListaSolicitacoes
          key={chaveDaLista}
          filtros={filtros}
          aoMudarPagina={aoMudarPagina}
          aoMudarDados={aoMudarDados}
        />
      </main>
    </div>
  );
}
