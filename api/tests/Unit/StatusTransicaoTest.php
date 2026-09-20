<?php

namespace Tests\Unit;

use App\Enums\Status;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * Testes da máquina de transição de status.
 *
 * É um teste de unidade puro: não sobe o Laravel, não toca no banco, não faz
 * requisição. Só exercita a regra de domínio. Por isso roda em milissegundos e
 * é determinístico.
 */
class StatusTransicaoTest extends TestCase
{
    /**
     * As seis transições que o desafio permite.
     */
    public static function transicoesPermitidas(): array
    {
        return [
            'recebida entra em analise'    => [Status::RECEBIDA,   Status::EM_ANALISE],
            'recebida e cancelada'         => [Status::RECEBIDA,   Status::CANCELADA],
            'em analise e agendada'        => [Status::EM_ANALISE, Status::AGENDADA],
            'em analise e cancelada'       => [Status::EM_ANALISE, Status::CANCELADA],
            'agendada e concluida'         => [Status::AGENDADA,   Status::CONCLUIDA],
            'agendada e cancelada'         => [Status::AGENDADA,   Status::CANCELADA],
        ];
    }

    #[DataProvider('transicoesPermitidas')]
    public function test_permite_as_transicoes_previstas(Status $de, Status $para): void
    {
        $this->assertTrue(
            $de->podeTransicionarPara($para),
            "Esperava permitir {$de->value} -> {$para->value}",
        );
    }

    /**
     * Cenários proibidos que importam de verdade: pular etapa do fluxo,
     * voltar atrás, e mexer em solicitação já encerrada.
     */
    public static function transicoesProibidas(): array
    {
        return [
            'nao pula a analise'            => [Status::RECEBIDA,   Status::AGENDADA],
            'nao conclui sem passar pelo fluxo' => [Status::RECEBIDA, Status::CONCLUIDA],
            'nao conclui direto da analise' => [Status::EM_ANALISE, Status::CONCLUIDA],
            'nao volta de agendada para analise' => [Status::AGENDADA, Status::EM_ANALISE],
            'nao reabre uma concluida'      => [Status::CONCLUIDA,  Status::EM_ANALISE],
            'nao cancela uma concluida'     => [Status::CONCLUIDA,  Status::CANCELADA],
            'nao descancela'                => [Status::CANCELADA,  Status::RECEBIDA],

            'nao volta de analise para recebida' => [Status::EM_ANALISE, Status::RECEBIDA],
        ];
    }

    #[DataProvider('transicoesProibidas')]
    public function test_recusa_as_transicoes_proibidas(Status $de, Status $para): void
    {
        $this->assertFalse(
            $de->podeTransicionarPara($para),
            "Esperava recusar {$de->value} -> {$para->value}",
        );
    }
        /**
     * Invariante: nenhum status é transição válida para si mesmo.
     * Mudar de status significa, necessariamente, mudar de status.
     *
     * Escrito em laço sobre Status::cases() para que um status novo passe a
     * ser coberto automaticamente.
     */
    public function test_nenhum_status_transiciona_para_si_mesmo(): void
    {
        foreach (Status::cases() as $status) {
            $this->assertFalse(
                $status->podeTransicionarPara($status),
                "Esperava recusar {$status->value} -> {$status->value}",
            );
        }
    }

    /**
     * Invariante: status final é final mesmo, não tem saída.
     */
    public function test_status_finais_nao_tem_proximo_permitido(): void
    {
        $this->assertSame([], Status::CONCLUIDA->proximosPermitidos());
        $this->assertSame([], Status::CANCELADA->proximosPermitidos());
    }

    /**
     * Invariante do negócio: enquanto a solicitação não terminou, sempre é
     * possível cancelá-la. Este teste não repete a tabela; ele afirma uma
     * propriedade que precisa valer para todos os status não finais.
     */
    public function test_toda_solicitacao_em_andamento_pode_ser_cancelada(): void
    {
        $emAndamento = [Status::RECEBIDA, Status::EM_ANALISE, Status::AGENDADA];

        foreach ($emAndamento as $status) {
            $this->assertTrue(
                $status->podeTransicionarPara(Status::CANCELADA),
                "Esperava poder cancelar a partir de {$status->value}",
            );
        }
    }
}
