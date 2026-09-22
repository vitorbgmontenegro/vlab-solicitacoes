/**
 * Contrato da API, espelhado em TypeScript.
 *
 * Este arquivo e a copia, do lado do frontend, do que esta em
 * docs/openapi.yaml. Se a API mudar um campo, e aqui que o ajuste acontece.
 *
 * Os valores sao declarados como listas `as const` e o tipo e derivado delas.
 * Assim o mesmo lugar serve para duas coisas: o TypeScript conhece os valores
 * validos, e a interface consegue percorrer a lista para montar os <select>
 * sem repetir os textos.
 */

export const STATUS = [
  'RECEBIDA',
  'EM_ANALISE',
  'AGENDADA',
  'CONCLUIDA',
  'CANCELADA',
] as const;

export type Status = (typeof STATUS)[number];

export const CATEGORIAS = ['CONSULTA', 'EXAME', 'VACINACAO', 'OUTRO'] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export const PRIORIDADES = ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'] as const;

export type Prioridade = (typeof PRIORIDADES)[number];

/**
 * Textos legiveis para a tela. A API trafega o valor tecnico; quem le a tela
 * ve o rotulo.
 */
export const ROTULO_STATUS: Record<Status, string> = {
  RECEBIDA: 'Recebida',
  EM_ANALISE: 'Em analise',
  AGENDADA: 'Agendada',
  CONCLUIDA: 'Concluida',
  CANCELADA: 'Cancelada',
};

export const ROTULO_CATEGORIA: Record<Categoria, string> = {
  CONSULTA: 'Consulta',
  EXAME: 'Exame',
  VACINACAO: 'Vacinacao',
  OUTRO: 'Outro',
};

export const ROTULO_PRIORIDADE: Record<Prioridade, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Media',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
};

/** Uma solicitacao como a API devolve. */
export type Solicitacao = {
  id: number;
  protocolo: string;
  nome_solicitante: string;
  categoria: Categoria;
  prioridade: Prioridade;
  status: Status;
  descricao: string;
  justificativa_prioridade: string | null;

  /**
   * Calculado pela API a partir da maquina de estados. A tela usa esta lista
   * para oferecer apenas as transicoes validas, sem reimplementar a regra.
   */
  proximos_status_permitidos: Status[];

  data_criacao: string;
  data_atualizacao: string;
};

/**
 * O que a tela envia ao criar.
 *
 * Nao inclui id, protocolo, status nem datas: todos sao definidos pela
 * aplicacao, e a API ignora se vierem.
 */
export type NovaSolicitacao = {
  nome_solicitante: string;
  categoria: Categoria;
  prioridade: Prioridade;
  descricao: string;
  justificativa_prioridade?: string | null;
};

/** Filtros aceitos pela listagem. Todos opcionais. */
export type FiltrosSolicitacao = {
  status?: Status;
  categoria?: Categoria;
  prioridade?: Prioridade;
  page?: number;
  per_page?: number;
};

/** Envelope de paginacao que o Laravel devolve na listagem. */
export type Pagina<T> = {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};
