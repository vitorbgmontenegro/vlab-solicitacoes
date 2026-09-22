import {
  CATEGORIAS,
  PRIORIDADES,
  ROTULO_CATEGORIA,
  ROTULO_PRIORIDADE,
  ROTULO_STATUS,
  STATUS,
} from '../../types/solicitacao';
import type { FiltrosSolicitacao } from '../../types/solicitacao';

/**
 * Converte o texto de um <select> em um valor da lista, ou undefined.
 *
 * A opcao "Todos" tem value="" e precisa virar undefined, senao a URL ficaria
 * com `status=` e a API responderia 422. A checagem contra a lista garante que
 * a conversao de tipo logo abaixo seja verdadeira, e nao uma promessa vazia.
 */
function opcaoValida<T extends string>(
  lista: readonly T[],
  valor: string,
): T | undefined {
  return lista.includes(valor as T) ? (valor as T) : undefined;
}

export function FiltrosSolicitacoes({
  filtros,
  aoMudar,
}: {
  filtros: FiltrosSolicitacao;
  aoMudar: (novos: FiltrosSolicitacao) => void;
}) {
  /**
   * Toda mudanca de filtro volta para a primeira pagina. Sem isso, filtrar
   * estando na pagina 3 poderia cair num resultado vazio sem motivo aparente.
   */
  function aplicar(parcial: Partial<FiltrosSolicitacao>) {
    aoMudar({ ...filtros, ...parcial, page: 1 });
  }

  const temFiltro =
    filtros.status !== undefined ||
    filtros.categoria !== undefined ||
    filtros.prioridade !== undefined;

  return (
    <section className="cartao">
      <div className="filtros">
        <div className="campo">
          <label htmlFor="filtro-status">Status</label>
          <select
            id="filtro-status"
            value={filtros.status ?? ''}
            onChange={(e) =>
              aplicar({ status: opcaoValida(STATUS, e.target.value) })
            }
          >
            <option value="">Todos</option>
            {STATUS.map((status) => (
              <option key={status} value={status}>
                {ROTULO_STATUS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="filtro-categoria">Categoria</label>
          <select
            id="filtro-categoria"
            value={filtros.categoria ?? ''}
            onChange={(e) =>
              aplicar({ categoria: opcaoValida(CATEGORIAS, e.target.value) })
            }
          >
            <option value="">Todas</option>
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {ROTULO_CATEGORIA[categoria]}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="filtro-prioridade">Prioridade</label>
          <select
            id="filtro-prioridade"
            value={filtros.prioridade ?? ''}
            onChange={(e) =>
              aplicar({ prioridade: opcaoValida(PRIORIDADES, e.target.value) })
            }
          >
            <option value="">Todas</option>
            {PRIORIDADES.map((prioridade) => (
              <option key={prioridade} value={prioridade}>
                {ROTULO_PRIORIDADE[prioridade]}
              </option>
            ))}
          </select>
        </div>

        <div className="filtros__acoes">
          <button
            type="button"
            className="botao botao--secundario"
            onClick={() => aoMudar({ page: 1 })}
            disabled={!temFiltro}
          >
            Limpar filtros
          </button>
        </div>
      </div>
    </section>
  );
}
