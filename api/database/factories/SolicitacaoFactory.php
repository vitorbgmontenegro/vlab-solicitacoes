<?php

namespace Database\Factories;

use App\Enums\Categoria;
use App\Enums\Prioridade;
use App\Models\Solicitacao;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Gerador de solicitações fictícias para os testes.
 *
 * Respeita a regra do domínio: só preenche justificativa quando a prioridade
 * sorteada é URGENTE, e nunca define protocolo nem status, que são decisão do
 * model.
 *
 * @extends Factory<Solicitacao>
 */
class SolicitacaoFactory extends Factory
{
    protected $model = Solicitacao::class;

    public function definition(): array
    {
        $prioridade = fake()->randomElement(Prioridade::cases());

        return [
            'nome_solicitante' => fake()->name(),
            'categoria'        => fake()->randomElement(Categoria::cases()),
            'prioridade'       => $prioridade,
            'descricao'        => fake()->sentence(10),
            'justificativa_prioridade' => $prioridade === Prioridade::URGENTE
                ? fake()->sentence(8)
                : null,
        ];
    }

    /**
     * Variante explícita para o caso que mais importa nos testes.
     */
    public function urgente(): static
    {
        return $this->state(fn () => [
            'prioridade'               => Prioridade::URGENTE,
            'justificativa_prioridade' => 'Caso grave, necessita atendimento imediato.',
        ]);
    }
}
