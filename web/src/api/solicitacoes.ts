/**
 * Funcoes que falam com os endpoints de solicitacoes.
 *
 * Uma funcao por endpoint. Os componentes chamam estas funcoes e nunca montam
 * URL nem verbo HTTP por conta propria.
 */

import { requisitar } from './cliente';
import type {
  FiltrosSolicitacao,
  NovaSolicitacao,
  Pagina,
  ResumoSolicitacoes,
  Solicitacao,
  Status,
} from '../types/solicitacao';

/** A API embrulha o recurso unico em { data: ... }. */
type Envelope<T> = { data: T };

/**
 * Monta a query string, ignorando filtros vazios.
 *
 * Sem isso, um filtro nao escolhido viraria `status=` na URL, e a API
 * responderia 422 por valor invalido.
 */
function montarQuery(filtros: FiltrosSolicitacao): string {
  const parametros = new URLSearchParams();

  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor === undefined || valor === null) {
      continue;
    }

    // O tipo FiltrosSolicitacao nao admite string vazia, entao esta checagem
    // existe so como defesa em tempo de execucao. Cabe ao componente converter
    // a opcao "todos" de um <select> em `undefined` antes de chamar.
    const texto = String(valor);
    if (texto === '') {
      continue;
    }

    parametros.set(chave, texto);
  }

  const query = parametros.toString();
  return query ? `?${query}` : '';
}

/** GET /solicitacoes */
export function listarSolicitacoes(
  filtros: FiltrosSolicitacao = {},
): Promise<Pagina<Solicitacao>> {
  return requisitar<Pagina<Solicitacao>>(`/solicitacoes${montarQuery(filtros)}`);
}

/** GET /solicitacoes/{id} */
export async function buscarSolicitacao(id: number): Promise<Solicitacao> {
  const resposta = await requisitar<Envelope<Solicitacao>>(`/solicitacoes/${id}`);
  return resposta.data;
}

/** POST /solicitacoes */
export async function criarSolicitacao(
  dados: NovaSolicitacao,
): Promise<Solicitacao> {
  const resposta = await requisitar<Envelope<Solicitacao>>('/solicitacoes', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
  return resposta.data;
}

/** PATCH /solicitacoes/{id}/status */
export async function atualizarStatus(
  id: number,
  status: Status,
): Promise<Solicitacao> {
  const resposta = await requisitar<Envelope<Solicitacao>>(
    `/solicitacoes/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
  );
  return resposta.data;
}

/** GET /solicitacoes/resumo */
export async function buscarResumo(): Promise<ResumoSolicitacoes> {
  const resposta = await requisitar<Envelope<ResumoSolicitacoes>>(
    '/solicitacoes/resumo',
  );
  return resposta.data;
}
