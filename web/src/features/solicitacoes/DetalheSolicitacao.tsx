import { useEffect, useState } from 'react';

import { ErroDaApi } from '../../api/cliente';
import { atualizarStatus } from '../../api/solicitacoes';
import { ROTULO_CATEGORIA, ROTULO_STATUS } from '../../types/solicitacao';
import type { Solicitacao, Status } from '../../types/solicitacao';
import { formatarDataHora } from '../../utils/formato';
import { EtiquetaPrioridade, EtiquetaStatus } from './Etiqueta';

type EstadoAcao =
  | { situacao: 'parado' }
  | { situacao: 'enviando'; destino: Status }
  | { situacao: 'erro'; mensagem: string };

/**
 * Painel de detalhe de uma solicitacao, com as acoes de mudanca de status.
 *
 * Os botoes de acao vem de `proximos_status_permitidos`, que a API calcula a
 * partir da maquina de estados. A tela nao conhece as regras de transicao e
 * nao precisa conhecer: ela so oferece o que o backend disse ser valido.
 */
export function DetalheSolicitacao({
  solicitacao,
  aoFechar,
  aoAtualizar,
}: {
  solicitacao: Solicitacao;
  aoFechar: () => void;
  aoAtualizar: (atualizada: Solicitacao) => void;
}) {
  const [acao, setAcao] = useState<EstadoAcao>({ situacao: 'parado' });

  // Fechar com Esc, que e o esperado em qualquer janela sobreposta.
  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        aoFechar();
      }
    }

    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aoFechar]);

  async function mudarPara(destino: Status) {
    setAcao({ situacao: 'enviando', destino });

    try {
      const atualizada = await atualizarStatus(solicitacao.id, destino);
      setAcao({ situacao: 'parado' });
      aoAtualizar(atualizada);
    } catch (erro: unknown) {
      setAcao({
        situacao: 'erro',
        mensagem:
          erro instanceof ErroDaApi
            ? erro.message
            : 'Nao foi possivel alterar o status.',
      });
    }
  }

  const encerrada = solicitacao.proximos_status_permitidos.length === 0;

  return (
    <div className="sobreposicao" onClick={aoFechar} role="presentation">
      {/*
        stopPropagation impede que um clique dentro do painel suba ate a
        sobreposicao e feche a janela sem querer.
      */}
      <div
        className="painel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-detalhe"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="painel__cabecalho">
          <h2 id="titulo-detalhe">Solicitacao {solicitacao.protocolo}</h2>
          <button
            type="button"
            className="botao-fechar"
            onClick={aoFechar}
            aria-label="Fechar detalhe"
          >
            &times;
          </button>
        </header>

        <div className="painel__corpo">
          <dl className="dados">
            <div className="dados__item">
              <dt>Solicitante</dt>
              <dd>{solicitacao.nome_solicitante}</dd>
            </div>

            <div className="dados__item">
              <dt>Categoria</dt>
              <dd>{ROTULO_CATEGORIA[solicitacao.categoria]}</dd>
            </div>

            <div className="dados__item">
              <dt>Prioridade</dt>
              <dd>
                <EtiquetaPrioridade prioridade={solicitacao.prioridade} />
              </dd>
            </div>

            <div className="dados__item">
              <dt>Status</dt>
              <dd>
                <EtiquetaStatus status={solicitacao.status} />
              </dd>
            </div>

            <div className="dados__item dados__item--largo">
              <dt>Descricao</dt>
              <dd>{solicitacao.descricao}</dd>
            </div>

            {solicitacao.justificativa_prioridade && (
              <div className="dados__item dados__item--largo">
                <dt>Justificativa da prioridade</dt>
                <dd>{solicitacao.justificativa_prioridade}</dd>
              </div>
            )}

            <div className="dados__item">
              <dt>Criada em</dt>
              <dd>{formatarDataHora(solicitacao.data_criacao)}</dd>
            </div>

            <div className="dados__item">
              <dt>Atualizada em</dt>
              <dd>{formatarDataHora(solicitacao.data_atualizacao)}</dd>
            </div>
          </dl>
        </div>

        <footer className="painel__rodape">
          {encerrada ? (
            <p className="painel__nota">
              Esta solicitacao esta encerrada e nao permite nova alteracao de
              status.
            </p>
          ) : (
            <>
              <p className="painel__nota">Mover para:</p>
              <div className="painel__acoes">
                {solicitacao.proximos_status_permitidos.map((destino) => (
                  <button
                    key={destino}
                    type="button"
                    className="botao botao--secundario"
                    disabled={acao.situacao === 'enviando'}
                    onClick={() => mudarPara(destino)}
                  >
                    {acao.situacao === 'enviando' && acao.destino === destino
                      ? 'Alterando...'
                      : ROTULO_STATUS[destino]}
                  </button>
                ))}
              </div>
            </>
          )}

          {acao.situacao === 'erro' && (
            <p
              className="formulario__aviso formulario__aviso--erro"
              role="alert"
            >
              {acao.mensagem}
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}
