<?php

namespace App\Http\Requests;

use App\Enums\Categoria;
use App\Enums\Prioridade;
use App\Enums\Status;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validação dos filtros e da paginação da listagem.
 *
 * Existe para que filtro inválido receba 422 com mensagem clara, em vez de ser
 * ignorado em silêncio. Mantém toda a validação de entrada da API no mesmo
 * lugar e no mesmo formato.
 */
class ListarSolicitacoesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status'     => ['sometimes', Rule::enum(Status::class)],
            'categoria'  => ['sometimes', Rule::enum(Categoria::class)],
            'prioridade' => ['sometimes', Rule::enum(Prioridade::class)],
            'per_page'   => ['sometimes', 'integer', 'min:1', 'max:100'],
            'page'       => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
