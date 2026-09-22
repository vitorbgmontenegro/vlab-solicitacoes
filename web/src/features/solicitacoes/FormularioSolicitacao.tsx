import { useState } from 'react';

import { ErroDaApi } from '../../api/cliente';
import type { ErrosDeValidacao } from '../../api/cliente';
import { criarSolicitacao } from '../../api/solicitacoes';
import {
  CATEGORIAS,
  PRIORIDADES,
  ROTULO_CATEGORIA,
  ROTULO_PRIORIDADE,
} from '../../types/solicitacao';
import type {
  Categoria,
  NovaSolicitacao,
  Prioridade,
} from '../../types/solicitacao';

/**
 * O formulario enquanto esta sendo preenchido.
 *
 * Nao e um NovaSolicitacao: um rascunho pode ter campos ainda vazios, e
 * NovaSolicitacao e o contrato do que a API aceita. Sao coisas diferentes, e
 * separa-las evita mentir para o TypeScript com um `as`.
 */
type Rascunho = {
  nome_solicitante: string;
  categoria: Categoria | '';
  prioridade: Prioridade | '';
  descricao: string;
  justificativa_prioridade: string;
};

const RASCUNHO_VAZIO: Rascunho = {
  nome_solicitante: '',
  categoria: '',
  prioridade: '',
  descricao: '',
  justificativa_prioridade: '',
};

type EstadoEnvio =
  | { situacao: 'parado' }
  | { situacao: 'enviando' }
  | { situacao: 'sucesso'; protocolo: string }
  | { situacao: 'erro'; mensagem: string; erros: ErrosDeValidacao };

/**
 * Validacao no navegador.
 *
 * Existe para a pessoa nao esperar uma ida ao servidor para descobrir que
 * esqueceu um campo. Nao e seguranca: a validacao que vale e a do backend,
 * porque qualquer um pode chamar a API sem passar por esta tela.
 */
function validarLocalmente(rascunho: Rascunho): ErrosDeValidacao {
  const erros: ErrosDeValidacao = {};

  if (rascunho.nome_solicitante.trim() === '') {
    erros.nome_solicitante = ['Informe o nome do solicitante.'];
  }

  if (rascunho.categoria === '') {
    erros.categoria = ['Escolha uma categoria.'];
  }

  if (rascunho.prioridade === '') {
    erros.prioridade = ['Escolha uma prioridade.'];
  }

  if (rascunho.descricao.trim() === '') {
    erros.descricao = ['Descreva a solicitação.'];
  }

  if (
    rascunho.prioridade === 'URGENTE' &&
    rascunho.justificativa_prioridade.trim() === ''
  ) {
    erros.justificativa_prioridade = [
      'A justificativa é obrigatória quando a prioridade for URGENTE.',
    ];
  }

  return erros;
}

export function FormularioSolicitacao({ aoCriar }: { aoCriar: () => void }) {
  const [rascunho, setRascunho] = useState<Rascunho>(RASCUNHO_VAZIO);
  const [envio, setEnvio] = useState<EstadoEnvio>({ situacao: 'parado' });
  const [errosLocais, setErrosLocais] = useState<ErrosDeValidacao>({});

  const errosDaApi = envio.situacao === 'erro' ? envio.erros : {};
  const enviando = envio.situacao === 'enviando';

  function erroDoCampo(campo: keyof Rascunho): string | undefined {
    return errosLocais[campo]?.[0] ?? errosDaApi[campo]?.[0];
  }

  function alterar(campo: keyof Rascunho, valor: string) {
    setRascunho((anterior) => ({ ...anterior, [campo]: valor }));

    // Some o erro do campo assim que a pessoa mexe nele.
    setErrosLocais((anterior) => {
      if (!(campo in anterior)) return anterior;
      const copia = { ...anterior };
      delete copia[campo];
      return copia;
    });
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();

    const erros = validarLocalmente(rascunho);
    setErrosLocais(erros);

    if (Object.keys(erros).length > 0) {
      return;
    }

    // Aqui o rascunho ja passou pela validacao, entao os campos obrigatorios
    // estao preenchidos e a conversao para o contrato da API e segura.
    const dados: NovaSolicitacao = {
      nome_solicitante: rascunho.nome_solicitante.trim(),
      categoria: rascunho.categoria as Categoria,
      prioridade: rascunho.prioridade as Prioridade,
      descricao: rascunho.descricao.trim(),
      justificativa_prioridade:
        rascunho.justificativa_prioridade.trim() || null,
    };

    setEnvio({ situacao: 'enviando' });

    try {
      const criada = await criarSolicitacao(dados);
      setRascunho(RASCUNHO_VAZIO);
      setEnvio({ situacao: 'sucesso', protocolo: criada.protocolo });
      aoCriar();
    } catch (erro: unknown) {
      if (erro instanceof ErroDaApi) {
        setEnvio({
          situacao: 'erro',
          mensagem: erro.message,
          erros: erro.erros,
        });
      } else {
        setEnvio({
          situacao: 'erro',
          mensagem: 'Ocorreu um erro inesperado ao enviar.',
          erros: {},
        });
      }
    }
  }

  return (
    <section className="cartao">
      <header className="cartao__cabecalho">
        <h2>Nova solicitação</h2>
      </header>

      <form className="formulario" onSubmit={enviar} noValidate>
        <div className="campo">
          <label htmlFor="nome_solicitante">Nome do solicitante</label>
          <input
            id="nome_solicitante"
            type="text"
            maxLength={150}
            value={rascunho.nome_solicitante}
            onChange={(e) => alterar('nome_solicitante', e.target.value)}
            aria-invalid={erroDoCampo('nome_solicitante') !== undefined}
            aria-describedby={
              erroDoCampo('nome_solicitante') ? 'erro-nome' : undefined
            }
          />
          {erroDoCampo('nome_solicitante') && (
            <p className="campo__erro" id="erro-nome">
              {erroDoCampo('nome_solicitante')}
            </p>
          )}
        </div>

        <div className="formulario__linha">
          <div className="campo">
            <label htmlFor="categoria">Categoria</label>
            <select
              id="categoria"
              value={rascunho.categoria}
              onChange={(e) => alterar('categoria', e.target.value)}
              aria-invalid={erroDoCampo('categoria') !== undefined}
            >
              <option value="">Selecione...</option>
              {CATEGORIAS.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {ROTULO_CATEGORIA[categoria]}
                </option>
              ))}
            </select>
            {erroDoCampo('categoria') && (
              <p className="campo__erro">{erroDoCampo('categoria')}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="prioridade">Prioridade</label>
            <select
              id="prioridade"
              value={rascunho.prioridade}
              onChange={(e) => alterar('prioridade', e.target.value)}
              aria-invalid={erroDoCampo('prioridade') !== undefined}
            >
              <option value="">Selecione...</option>
              {PRIORIDADES.map((prioridade) => (
                <option key={prioridade} value={prioridade}>
                  {ROTULO_PRIORIDADE[prioridade]}
                </option>
              ))}
            </select>
            {erroDoCampo('prioridade') && (
              <p className="campo__erro">{erroDoCampo('prioridade')}</p>
            )}
          </div>
        </div>

        <div className="campo">
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            rows={3}
            maxLength={1000}
            value={rascunho.descricao}
            onChange={(e) => alterar('descricao', e.target.value)}
            aria-invalid={erroDoCampo('descricao') !== undefined}
          />
          {erroDoCampo('descricao') && (
            <p className="campo__erro">{erroDoCampo('descricao')}</p>
          )}
        </div>

        {/*
          O campo so aparece quando faz sentido. A regra continua sendo
          garantida pelo backend; aqui e conforto para quem preenche.
        */}
        {rascunho.prioridade === 'URGENTE' && (
          <div className="campo">
            <label htmlFor="justificativa_prioridade">
              Justificativa da prioridade
            </label>
            <textarea
              id="justificativa_prioridade"
              rows={2}
              maxLength={500}
              value={rascunho.justificativa_prioridade}
              onChange={(e) =>
                alterar('justificativa_prioridade', e.target.value)
              }
              aria-invalid={
                erroDoCampo('justificativa_prioridade') !== undefined
              }
            />
            {erroDoCampo('justificativa_prioridade') && (
              <p className="campo__erro">
                {erroDoCampo('justificativa_prioridade')}
              </p>
            )}
          </div>
        )}

        {envio.situacao === 'erro' && Object.keys(envio.erros).length === 0 && (
          <p className="formulario__aviso formulario__aviso--erro" role="alert">
            {envio.mensagem}
          </p>
        )}

        {envio.situacao === 'sucesso' && (
          <p className="formulario__aviso formulario__aviso--sucesso" role="status">
            Solicitação criada com o protocolo <strong>{envio.protocolo}</strong>.
          </p>
        )}

        <div className="formulario__acoes">
          <button type="submit" className="botao" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Cadastrar solicitação'}
          </button>
        </div>
      </form>
    </section>
  );
}
