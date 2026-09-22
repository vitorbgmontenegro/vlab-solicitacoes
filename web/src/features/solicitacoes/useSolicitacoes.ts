import { useCallback, useEffect, useState } from 'react';

import { ErroDaApi } from '../../api/cliente';
import { listarSolicitacoes } from '../../api/solicitacoes';
import type { Estado } from '../../types/estado';
import type {
  FiltrosSolicitacao,
  Pagina,
  Solicitacao,
} from '../../types/solicitacao';

/**
 * Busca a listagem de solicitacoes e devolve o estado da tela.
 *
 * Toda a conversa com a API e todo o controle de estado ficam aqui. O
 * componente que usa este hook so decide o que desenhar para cada situacao.
 */
export function useSolicitacoes(filtros: FiltrosSolicitacao) {
  const [estado, setEstado] = useState<Estado<Pagina<Solicitacao>>>({
    situacao: 'carregando',
  });

  // Incrementado pelo `recarregar`, para refazer a busca sem mudar filtro.
  const [gatilho, setGatilho] = useState(0);

  /*
   * `filtros` e um objeto, e objeto novo a cada render tem identidade
   * diferente mesmo com o mesmo conteudo. Usar ele direto como dependencia do
   * efeito causaria busca infinita. Serializar resolve: a chave so muda quando
   * o conteudo muda de verdade.
   */
  const chaveDosFiltros = JSON.stringify(filtros);

  useEffect(() => {
    // Protege contra respostas fora de ordem: se os filtros mudarem antes da
    // resposta anterior chegar, a resposta velha e descartada.
    let ativo = true;

    const filtrosAtuais = JSON.parse(chaveDosFiltros) as FiltrosSolicitacao;

    setEstado({ situacao: 'carregando' });

    listarSolicitacoes(filtrosAtuais)
      .then((pagina) => {
        if (!ativo) return;

        setEstado(
          pagina.data.length === 0
            ? { situacao: 'vazio' }
            : { situacao: 'sucesso', dados: pagina },
        );
      })
      .catch((erro: unknown) => {
        if (!ativo) return;

        setEstado({
          situacao: 'erro',
          mensagem:
            erro instanceof ErroDaApi
              ? erro.message
              : 'Ocorreu um erro inesperado ao carregar as solicitacoes.',
        });
      });

    return () => {
      ativo = false;
    };
  }, [chaveDosFiltros, gatilho]);

  const recarregar = useCallback(() => {
    setGatilho((anterior) => anterior + 1);
  }, []);

  return { estado, recarregar };
}
