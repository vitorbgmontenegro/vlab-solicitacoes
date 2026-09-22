import { useEffect, useState } from 'react';

import { ErroDaApi } from '../../api/cliente';
import { buscarResumo } from '../../api/solicitacoes';
import { ROTULO_STATUS, STATUS } from '../../types/solicitacao';
import type { Estado } from '../../types/estado';
import type {
  ResumoSolicitacoes as Resumo,
  Status,
} from '../../types/solicitacao';

/**
 * Painel de resumo por status, no topo da tela.
 *
 * Cada numero tambem e um botao: clicar filtra a listagem por aquele status.
 * Isso liga o resumo ao resto da tela, em vez de deixa-lo como enfeite.
 *
 * A contagem vem de um endpoint proprio, e nao da listagem, porque a listagem
 * e paginada e daria o total da pagina.
 */
export function ResumoSolicitacoes({
  versao,
  statusSelecionado,
  aoSelecionar,
}: {
  /** Muda quando os dados mudam, para o resumo recontar. */
  versao: number;
  statusSelecionado?: Status;
  aoSelecionar: (status: Status | undefined) => void;
}) {
  const [estado, setEstado] = useState<Estado<Resumo>>({
    situacao: 'carregando',
  });

  useEffect(() => {
    let ativo = true;

    buscarResumo()
      .then((resumo) => {
        if (ativo) setEstado({ situacao: 'sucesso', dados: resumo });
      })
      .catch((erro: unknown) => {
        if (!ativo) return;
        setEstado({
          situacao: 'erro',
          mensagem:
            erro instanceof ErroDaApi
              ? erro.message
              : 'Não foi possível carregar o resumo.',
        });
      });

    return () => {
      ativo = false;
    };
  }, [versao]);

  // O resumo e informacao de apoio: se falhar, a tela continua util sem ele.
  if (estado.situacao !== 'sucesso') {
    return null;
  }

  const resumo = estado.dados;

  return (
    <section className="resumo" aria-label="Resumo por status">
      {STATUS.map((status) => {
        const selecionado = statusSelecionado === status;

        return (
          <button
            key={status}
            type="button"
            className={
              selecionado
                ? 'resumo__cartao resumo__cartao--ativo'
                : 'resumo__cartao'
            }
            aria-pressed={selecionado}
            onClick={() => aoSelecionar(selecionado ? undefined : status)}
          >
            <span className="resumo__numero">{resumo.por_status[status]}</span>
            <span className="resumo__rotulo">{ROTULO_STATUS[status]}</span>
          </button>
        );
      })}

      <div className="resumo__cartao resumo__cartao--total">
        <span className="resumo__numero">{resumo.total}</span>
        <span className="resumo__rotulo">Total</span>
      </div>
    </section>
  );
}
