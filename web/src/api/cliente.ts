/**
 * Cliente HTTP da aplicacao.
 *
 * Todo acesso a API passa por aqui. Nenhum componente chama fetch direto.
 * Isso concentra num lugar so o endereco base, os cabecalhos e, principalmente,
 * a traducao de erro HTTP em algo que a tela consegue tratar.
 */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

/** Formato dos erros de validacao devolvidos pela API no 422. */
export type ErrosDeValidacao = Record<string, string[]>;

/**
 * Erro vindo da API.
 *
 * Nao e uma classe com parametros de construtor abreviados de proposito: o
 * tsconfig deste projeto usa `erasableSyntaxOnly`, que proibe esse atalho.
 */
export class ErroDaApi extends Error {
  status: number;
  erros: ErrosDeValidacao;

  constructor(mensagem: string, status: number, erros: ErrosDeValidacao = {}) {
    super(mensagem);
    this.name = 'ErroDaApi';
    this.status = status;
    this.erros = erros;
  }

  /** 422: a entrada foi recusada, e ha mensagens por campo. */
  get ehValidacao(): boolean {
    return this.status === 422;
  }

  /** 0: nao houve resposta, o servidor nao foi alcancado. */
  get ehFalhaDeRede(): boolean {
    return this.status === 0;
  }

  /** Primeira mensagem de um campo especifico, para exibir sob o input. */
  mensagemDoCampo(campo: string): string | undefined {
    return this.erros[campo]?.[0];
  }
}

type CorpoDeErro = {
  message?: string;
  errors?: ErrosDeValidacao;
};

/**
 * Faz uma requisicao e devolve o corpo ja convertido.
 *
 * Lanca ErroDaApi em qualquer caso que nao seja sucesso, inclusive quando o
 * servidor nao responde. Assim quem chama trata um tipo de erro so.
 */
export async function requisitar<T>(
  caminho: string,
  opcoes: RequestInit = {},
): Promise<T> {
  let resposta: Response;

  try {
    resposta = await fetch(`${BASE}${caminho}`, {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...opcoes.headers,
      },
    });
  } catch {
    // fetch so rejeita quando nao houve resposta: servidor fora do ar,
    // sem rede, ou bloqueio de CORS.
    throw new ErroDaApi(
      'Não foi possível falar com o servidor. Verifique se a API está no ar.',
      0,
    );
  }

  // 204 e outras respostas sem corpo.
  if (resposta.status === 204) {
    return undefined as T;
  }

  let corpo: unknown = null;
  try {
    corpo = await resposta.json();
  } catch {
    corpo = null;
  }

  if (!resposta.ok) {
    const erro = (corpo ?? {}) as CorpoDeErro;
    throw new ErroDaApi(
      erro.message ?? 'A requisição falhou.',
      resposta.status,
      erro.errors ?? {},
    );
  }

  return corpo as T;
}
