<?php

namespace Tests\Feature;

use App\Enums\Status;
use App\Models\Solicitacao;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Testes de integracao da API.
 *
 * Diferente do StatusTransicaoTest, que exercita a regra isolada, aqui a
 * requisicao HTTP atravessa rota, Form Request, controller, model, banco e
 * Resource. E o caminho completo que o edital chama de integracao real.
 *
 * RefreshDatabase recria o banco a cada teste, entao um teste nunca depende do
 * que outro deixou para tras.
 */
class SolicitacaoApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_cria_solicitacao_com_protocolo_e_status_inicial(): void
    {
        $resposta = $this->postJson('/api/v1/solicitacoes', [
            'nome_solicitante' => 'Maria Ficticia',
            'categoria'        => 'CONSULTA',
            'prioridade'       => 'MEDIA',
            'descricao'        => 'Consulta de rotina.',
        ]);

        $resposta->assertCreated();
        $resposta->assertJsonPath('data.status', 'RECEBIDA');

        // O protocolo e gerado pela aplicacao, entao so da para afirmar que
        // existe e nao esta vazio.
        $this->assertNotEmpty($resposta->json('data.protocolo'));

        $this->assertDatabaseCount('solicitacoes', 1);
    }

    public function test_recusa_prioridade_urgente_sem_justificativa(): void
    {
        $resposta = $this->postJson('/api/v1/solicitacoes', [
            'nome_solicitante' => 'Joao Ficticio',
            'categoria'        => 'EXAME',
            'prioridade'       => 'URGENTE',
            'descricao'        => 'Sem justificativa.',
        ]);

        $resposta->assertStatus(422);
        $resposta->assertJsonValidationErrors('justificativa_prioridade');

        $this->assertDatabaseCount('solicitacoes', 0);
    }

    public function test_ignora_protocolo_e_status_enviados_na_criacao(): void
    {
        $resposta = $this->postJson('/api/v1/solicitacoes', [
            'nome_solicitante' => 'Tentativa Ficticia',
            'categoria'        => 'EXAME',
            'prioridade'       => 'BAIXA',
            'descricao'        => 'Tentando definir campos que nao sao de entrada.',
            'status'           => 'CONCLUIDA',
            'protocolo'        => 'ESCOLHIDO-POR-MIM',
        ]);

        $resposta->assertCreated();
        $resposta->assertJsonPath('data.status', 'RECEBIDA');
        $this->assertNotSame('ESCOLHIDO-POR-MIM', $resposta->json('data.protocolo'));
    }

    public function test_aplica_transicao_de_status_permitida(): void
    {
        $solicitacao = Solicitacao::factory()->create();

        $resposta = $this->patchJson(
            "/api/v1/solicitacoes/{$solicitacao->id}/status",
            ['status' => 'EM_ANALISE'],
        );

        $resposta->assertOk();
        $resposta->assertJsonPath('data.status', 'EM_ANALISE');

        $this->assertSame(Status::EM_ANALISE, $solicitacao->fresh()->status);
    }

    public function test_recusa_transicao_de_status_proibida_e_nao_altera_o_registro(): void
    {
        $solicitacao = Solicitacao::factory()->create();

        $resposta = $this->patchJson(
            "/api/v1/solicitacoes/{$solicitacao->id}/status",
            ['status' => 'CONCLUIDA'],
        );

        $resposta->assertStatus(422);
        $resposta->assertJsonValidationErrors('status');

        // O que mais importa: a recusa precisa ser completa, sem efeito
        // colateral no banco.
        $this->assertSame(Status::RECEBIDA, $solicitacao->fresh()->status);
    }

    public function test_filtra_a_listagem_por_status(): void
    {
        $emAnalise = Solicitacao::factory()->create();
        $emAnalise->status = Status::EM_ANALISE;
        $emAnalise->save();

        Solicitacao::factory()->count(3)->create();

        $resposta = $this->getJson('/api/v1/solicitacoes?status=EM_ANALISE');

        $resposta->assertOk();
        $resposta->assertJsonCount(1, 'data');
        $resposta->assertJsonPath('data.0.id', $emAnalise->id);
    }

    public function test_recusa_filtro_com_valor_invalido(): void
    {
        $resposta = $this->getJson('/api/v1/solicitacoes?status=BANANA');

        $resposta->assertStatus(422);
        $resposta->assertJsonValidationErrors('status');
    }

    public function test_responde_404_sem_expor_detalhes_internos(): void
    {
        $resposta = $this->getJson('/api/v1/solicitacoes/999');

        $resposta->assertNotFound();
        $resposta->assertExactJson(['message' => 'Recurso não encontrado.']);
    }
}
