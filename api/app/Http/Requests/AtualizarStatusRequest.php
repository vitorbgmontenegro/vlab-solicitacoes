<?php

namespace App\Http\Requests;

use App\Enums\Status;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validação da mudança de status.
 *
 * Duas checagens: o valor enviado precisa ser um status existente, e a
 * transição a partir do status atual precisa ser permitida.
 *
 * A regra de transição NÃO é reimplementada aqui. Este arquivo apenas pergunta
 * ao enum Status, que continua sendo a implementação central e testada.
 */
class AtualizarStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => [
                'required',
                Rule::enum(Status::class),
                function (string $atributo, mixed $valor, Closure $falhar): void {
                    $novo = Status::tryFrom((string) $valor);

                    // Valor inexistente já foi reprovado por Rule::enum acima;
                    // não faz sentido acusar duas vezes o mesmo problema.
                    if ($novo === null) {
                        return;
                    }

                    /** @var \App\Models\Solicitacao $solicitacao */
                    $solicitacao = $this->route('solicitacao');
                    $atual = $solicitacao->status;

                    if (! $atual->podeTransicionarPara($novo)) {
                        $falhar(sprintf(
                            'Não é possível alterar o status de %s para %s.',
                            $atual->value,
                            $novo->value,
                        ));
                    }
                },
            ],
        ];
    }
}
