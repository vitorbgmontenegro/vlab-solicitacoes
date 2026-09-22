import { useState } from 'react';

import { ROTULO_CATEGORIA } from '../../types/solicitacao';
import type { FiltrosSolicitacao, Solicitacao } from '../../types/solicitacao';
import { formatarDataHora } from '../../utils/formato';
import { DetalheSolicitacao } from './DetalheSolicitacao';
import { EtiquetaPrioridade, EtiquetaStatus } from './Etiqueta';
import { useSolicitacoes } from './useSolicitacoes';

/**
 * Listagem paginada de solicitacoes.
 *
 * O componente nao busca nada por conta propria: recebe o estado pronto do
 * hook e decide o que desenhar em cada uma das quatro situacoes.
 *
 * O painel de detalhe e renderizado fora dos ramos de estado, para continuar
 * aberto enquanto a lista recarrega depois de uma mudanca de status.
 */
export function ListaSolicitacoes({
  filtros = {},
}: {
  filtros?: FiltrosSolicitacao;
}) {
  const { estado, recarregar } = useSolicitacoes(filtros);
  const [selecionada, setSelecionada] = useState<Solicitacao | null>(null);

  function aoAtualizarStatus(atualizada: Solicitacao) {
    setSelecionada(atualizada);
    recarregar();
  }

  let corpo;

  if (estado.situacao === 'carregando') {
    corpo = (
      <div className="aviso" role="status" aria-live="polite">
        <span className="girando" aria-hidden="true" />
        Carregando solicitacoes...
      </div>
    );
  } else if (estado.situacao === 'erro') {
    corpo = (
      <div className="aviso aviso--erro" role="alert">
        <p>{estado.mensagem}</p>
        <button type="button" className="botao" onClick={recarregar}>
          Tentar novamente
        </button>
      </div>
    );
  } else if (estado.situacao === 'vazio') {
    corpo = (
      <div className="aviso">
        <p>Nenhuma solicitacao encontrada.</p>
        <p className="aviso__detalhe">
          Ajuste os filtros ou cadastre uma nova solicitacao.
        </p>
      </div>
    );
  } else {
    const { data: solicitacoes, meta } = estado.dados;

    corpo = (
      <section className="lista">
        <header className="lista__cabecalho">
          <h2>Solicitacoes</h2>
          <p className="lista__contagem">
            {meta.total} {meta.total === 1 ? 'registro' : 'registros'}
          </p>
        </header>

        <div className="tabela-rolagem">
          <table className="tabela">
            <caption className="visualmente-oculto">
              Lista de solicitacoes de atendimento. Cada linha abre o detalhe.
            </caption>
            <thead>
              <tr>
                <th scope="col">Protocolo</th>
                <th scope="col">Solicitante</th>
                <th scope="col">Categoria</th>
                <th scope="col">Prioridade</th>
                <th scope="col">Status</th>
                <th scope="col">Criada em</th>
                <th scope="col">
                  <span className="visualmente-oculto">Acoes</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {solicitacoes.map((solicitacao) => (
                <tr key={solicitacao.id}>
                  <td className="celula--protocolo">{solicitacao.protocolo}</td>
                  <td>{solicitacao.nome_solicitante}</td>
                  <td>{ROTULO_CATEGORIA[solicitacao.categoria]}</td>
                  <td>
                    <EtiquetaPrioridade prioridade={solicitacao.prioridade} />
                  </td>
                  <td>
                    <EtiquetaStatus status={solicitacao.status} />
                  </td>
                  <td>{formatarDataHora(solicitacao.data_criacao)}</td>
                  <td>
                    {/*
                      Botao de verdade, e nao uma linha clicavel: so botao e
                      alcancavel pelo teclado e anunciado por leitor de tela.
                    */}
                    <button
                      type="button"
                      className="botao-link"
                      onClick={() => setSelecionada(solicitacao)}
                    >
                      Ver detalhe
                      <span className="visualmente-oculto">
                        {' '}
                        da solicitacao {solicitacao.protocolo}
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <>
      {corpo}

      {selecionada && (
        <DetalheSolicitacao
          solicitacao={selecionada}
          aoFechar={() => setSelecionada(null)}
          aoAtualizar={aoAtualizarStatus}
        />
      )}
    </>
  );
}
