import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { criarSolicitacao } from '../../api/solicitacoes';
import { FormularioSolicitacao } from './FormularioSolicitacao';

/*
 * A API e substituida por uma versao falsa. O objetivo aqui e testar o
 * comportamento do formulario, nao a integracao com o backend, que ja tem
 * cobertura propria em tests/Feature/SolicitacaoApiTest.php no lado do PHP.
 */
vi.mock('../../api/solicitacoes', () => ({
  criarSolicitacao: vi.fn(),
}));

const criarSolicitacaoFalsa = vi.mocked(criarSolicitacao);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('FormularioSolicitacao', () => {
  it('nao envia nada quando os campos obrigatorios estao vazios', async () => {
    const usuario = userEvent.setup();
    render(<FormularioSolicitacao aoCriar={() => {}} />);

    await usuario.click(
      screen.getByRole('button', { name: /cadastrar solicitacao/i }),
    );

    expect(screen.getByText(/informe o nome do solicitante/i)).toBeInTheDocument();
    expect(screen.getByText(/escolha uma categoria/i)).toBeInTheDocument();

    // O mais importante: nada saiu para a API.
    expect(criarSolicitacaoFalsa).not.toHaveBeenCalled();
  });

  it('mostra o campo de justificativa somente quando a prioridade e urgente', async () => {
    const usuario = userEvent.setup();
    render(<FormularioSolicitacao aoCriar={() => {}} />);

    // A expressao do <select> e ancorada com ^ e $ porque /prioridade/i
    // tambem casaria com "Justificativa da prioridade" depois que esse campo
    // aparece, e a consulta falharia por encontrar dois elementos.
    const rotulo = /justificativa da prioridade/i;
    expect(screen.queryByLabelText(rotulo)).not.toBeInTheDocument();

    await usuario.selectOptions(screen.getByLabelText(/^prioridade$/i), 'URGENTE');
    expect(screen.getByLabelText(rotulo)).toBeInTheDocument();

    await usuario.selectOptions(screen.getByLabelText(/^prioridade$/i), 'BAIXA');
    expect(screen.queryByLabelText(rotulo)).not.toBeInTheDocument();
  });

  it('exige justificativa quando a prioridade e urgente', async () => {
    const usuario = userEvent.setup();
    render(<FormularioSolicitacao aoCriar={() => {}} />);

    await usuario.type(screen.getByLabelText(/nome do solicitante/i), 'Maria Ficticia');
    await usuario.selectOptions(screen.getByLabelText(/categoria/i), 'EXAME');
    await usuario.selectOptions(screen.getByLabelText(/^prioridade$/i), 'URGENTE');
    await usuario.type(screen.getByLabelText(/descricao/i), 'Exame com urgencia.');

    await usuario.click(
      screen.getByRole('button', { name: /cadastrar solicitacao/i }),
    );

    expect(
      screen.getByText(/justificativa e obrigatoria quando a prioridade for urgente/i),
    ).toBeInTheDocument();
    expect(criarSolicitacaoFalsa).not.toHaveBeenCalled();
  });

  it('envia os dados preenchidos quando o formulario esta valido', async () => {
    const usuario = userEvent.setup();

    criarSolicitacaoFalsa.mockResolvedValue({
      id: 1,
      protocolo: 'SOL-2026-TESTE01',
      nome_solicitante: 'Maria Ficticia',
      categoria: 'CONSULTA',
      prioridade: 'MEDIA',
      status: 'RECEBIDA',
      descricao: 'Consulta de rotina.',
      justificativa_prioridade: null,
      proximos_status_permitidos: ['EM_ANALISE', 'CANCELADA'],
      data_criacao: '2026-09-22T12:00:00+00:00',
      data_atualizacao: '2026-09-22T12:00:00+00:00',
    });

    const aoCriar = vi.fn();
    render(<FormularioSolicitacao aoCriar={aoCriar} />);

    await usuario.type(screen.getByLabelText(/nome do solicitante/i), 'Maria Ficticia');
    await usuario.selectOptions(screen.getByLabelText(/categoria/i), 'CONSULTA');
    await usuario.selectOptions(screen.getByLabelText(/^prioridade$/i), 'MEDIA');
    await usuario.type(screen.getByLabelText(/descricao/i), 'Consulta de rotina.');

    await usuario.click(
      screen.getByRole('button', { name: /cadastrar solicitacao/i }),
    );

    expect(criarSolicitacaoFalsa).toHaveBeenCalledWith({
      nome_solicitante: 'Maria Ficticia',
      categoria: 'CONSULTA',
      prioridade: 'MEDIA',
      descricao: 'Consulta de rotina.',
      justificativa_prioridade: null,
    });

    // O protocolo devolvido pela API aparece na confirmacao, e o pai e avisado
    // para recarregar a listagem.
    expect(await screen.findByText(/SOL-2026-TESTE01/)).toBeInTheDocument();
    expect(aoCriar).toHaveBeenCalledOnce();
  });
});
