<?php

namespace Database\Seeders;

use App\Enums\Categoria;
use App\Enums\Prioridade;
use App\Enums\Status;
use App\Models\Solicitacao;
use Illuminate\Database\Seeder;

/**
 * Dados iniciais ficticios, para quem for avaliar abrir a aplicacao e ja
 * encontrar conteudo em todos os filtros.
 *
 * Os registros sao fixos, e nao aleatorios, por dois motivos: garantem que
 * todos os status, categorias e prioridades aparecam pelo menos uma vez, e
 * fazem a tela ser sempre a mesma em qualquer maquina.
 *
 * Idempotente: se a tabela ja tiver qualquer linha, nao faz nada. Isso e
 * necessario porque o seeder roda a cada subida do container.
 */
class SolicitacaoSeeder extends Seeder
{
    public function run(): void
    {
        if (Solicitacao::query()->exists()) {
            return;
        }

        foreach ($this->registros() as $registro) {
            $statusFinal = $registro['status'];
            unset($registro['status']);

            $solicitacao = Solicitacao::create($registro);

            // Toda solicitacao nasce RECEBIDA, pela regra do model. Aqui o
            // status e ajustado diretamente porque isto e carga de dados de
            // exemplo, e nao uma acao de usuario passando pela API.
            if ($statusFinal !== Status::RECEBIDA) {
                $solicitacao->status = $statusFinal;
                $solicitacao->save();
            }
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function registros(): array
    {
        return [
            [
                'nome_solicitante' => 'Maria Aparecida dos Santos',
                'categoria'        => Categoria::CONSULTA,
                'prioridade'       => Prioridade::MEDIA,
                'descricao'        => 'Solicitacao de consulta com clinico geral para avaliacao de rotina.',
                'justificativa_prioridade' => null,
                'status'           => Status::RECEBIDA,
            ],
            [
                'nome_solicitante' => 'Joao Batista de Oliveira',
                'categoria'        => Categoria::EXAME,
                'prioridade'       => Prioridade::URGENTE,
                'descricao'        => 'Exame de imagem solicitado apos atendimento em pronto-socorro.',
                'justificativa_prioridade' => 'Encaminhamento com carater de urgencia emitido pela unidade.',
                'status'           => Status::EM_ANALISE,
            ],
            [
                'nome_solicitante' => 'Ana Lucia Ferreira',
                'categoria'        => Categoria::VACINACAO,
                'prioridade'       => Prioridade::BAIXA,
                'descricao'        => 'Atualizacao do calendario vacinal.',
                'justificativa_prioridade' => null,
                'status'           => Status::AGENDADA,
            ],
            [
                'nome_solicitante' => 'Carlos Eduardo Nunes',
                'categoria'        => Categoria::CONSULTA,
                'prioridade'       => Prioridade::ALTA,
                'descricao'        => 'Retorno de acompanhamento com especialista.',
                'justificativa_prioridade' => null,
                'status'           => Status::CONCLUIDA,
            ],
            [
                'nome_solicitante' => 'Beatriz Almeida Rocha',
                'categoria'        => Categoria::OUTRO,
                'prioridade'       => Prioridade::BAIXA,
                'descricao'        => 'Solicitacao de segunda via de documento de atendimento.',
                'justificativa_prioridade' => null,
                'status'           => Status::CANCELADA,
            ],
            [
                'nome_solicitante' => 'Roberto Carvalho Lima',
                'categoria'        => Categoria::EXAME,
                'prioridade'       => Prioridade::MEDIA,
                'descricao'        => 'Exame laboratorial de rotina solicitado em consulta anterior.',
                'justificativa_prioridade' => null,
                'status'           => Status::EM_ANALISE,
            ],
            [
                'nome_solicitante' => 'Fernanda Souza Martins',
                'categoria'        => Categoria::VACINACAO,
                'prioridade'       => Prioridade::URGENTE,
                'descricao'        => 'Vacinacao pos-exposicao com prazo definido.',
                'justificativa_prioridade' => 'Prazo clinico curto informado pela unidade de origem.',
                'status'           => Status::AGENDADA,
            ],
            [
                'nome_solicitante' => 'Paulo Henrique Ribeiro',
                'categoria'        => Categoria::CONSULTA,
                'prioridade'       => Prioridade::BAIXA,
                'descricao'        => 'Primeira consulta para avaliacao geral.',
                'justificativa_prioridade' => null,
                'status'           => Status::RECEBIDA,
            ],
        ];
    }
}
