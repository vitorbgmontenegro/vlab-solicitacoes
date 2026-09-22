<?php

namespace Database\Seeders;

use App\Enums\Categoria;
use App\Enums\Prioridade;
use App\Enums\Status;
use App\Models\Solicitacao;
use Illuminate\Database\Seeder;

/**
 * Dados iniciais fictícios, para quem for avaliar abrir a aplicação e já
 * encontrar conteúdo em todos os filtros.
 *
 * Os registros são fixos, e não aleatórios, por dois motivos: garantem que
 * todos os status, categorias e prioridades apareçam pelo menos uma vez, e
 * fazem a tela ser sempre a mesma em qualquer máquina.
 *
 * Idempotente: se a tabela já tiver qualquer linha, não faz nada. Isso é
 * necessário porque o seeder roda a cada subida do container.
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

            // Toda solicitação nasce RECEBIDA, pela regra do model. Aqui o
            // status é ajustado diretamente porque isto é carga de dados de
            // exemplo, e não uma ação de usuário passando pela API.
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
                'descricao'        => 'Solicitação de consulta com clínico geral para avaliação de rotina.',
                'justificativa_prioridade' => null,
                'status'           => Status::RECEBIDA,
            ],
            [
                'nome_solicitante' => 'Joao Batista de Oliveira',
                'categoria'        => Categoria::EXAME,
                'prioridade'       => Prioridade::URGENTE,
                'descricao'        => 'Exame de imagem solicitado após atendimento em pronto-socorro.',
                'justificativa_prioridade' => 'Encaminhamento com caráter de urgência emitido pela unidade.',
                'status'           => Status::EM_ANALISE,
            ],
            [
                'nome_solicitante' => 'Ana Lucia Ferreira',
                'categoria'        => Categoria::VACINACAO,
                'prioridade'       => Prioridade::BAIXA,
                'descricao'        => 'Atualização do calendário vacinal.',
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
                'descricao'        => 'Solicitação de segunda via de documento de atendimento.',
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
                'descricao'        => 'Vacinação pós-exposição com prazo definido.',
                'justificativa_prioridade' => 'Prazo clínico curto informado pela unidade de origem.',
                'status'           => Status::AGENDADA,
            ],
            [
                'nome_solicitante' => 'Paulo Henrique Ribeiro',
                'categoria'        => Categoria::CONSULTA,
                'prioridade'       => Prioridade::BAIXA,
                'descricao'        => 'Primeira consulta para avaliação geral.',
                'justificativa_prioridade' => null,
                'status'           => Status::RECEBIDA,
            ],
        ];
    }
}
