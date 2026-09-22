<?php

namespace App\Http\Requests;

use App\Enums\Categoria;
use App\Enums\Prioridade;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validação da criação de uma solicitação.
 *
 * Roda antes do controller. Se alguma regra falhar, o Laravel devolve 422 com
 * as mensagens, e o controller nem chega a ser chamado.
 *
 * `protocolo` e `status` não aparecem aqui: não são campos de entrada, são
 * decisões da aplicação (ver o model Solicitacao).
 */
class StoreSolicitacaoRequest extends FormRequest
{
    /**
     * Este projeto não tem autenticação, então toda requisição é autorizada.
     * O método precisa existir; devolver false faria o Laravel responder 403.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome_solicitante' => ['required', 'string', 'max:150'],
            'categoria'        => ['required', Rule::enum(Categoria::class)],
            'prioridade'       => ['required', Rule::enum(Prioridade::class)],
            'descricao'        => ['required', 'string', 'max:1000'],

            // Regra do desafio: justificativa obrigatória quando, e somente
            // quando, a prioridade for URGENTE.
            'justificativa_prioridade' => [
                'nullable',
                'required_if:prioridade,URGENTE',
                'string',
                'max:500',
            ],
        ];
    }

    /**
     * Mensagem específica para a regra mais importante deste formulário.
     *
     * Os nomes de campo e as demais mensagens vêm de lang/pt_BR/validation.php.
     * Esta sobrescrita existe porque a frase dedicada comunica melhor a regra
     * do que o texto genérico de required_if.
     */
    public function messages(): array
    {
        return [
            'justificativa_prioridade.required_if' =>
                'A justificativa é obrigatória quando a prioridade for URGENTE.',
        ];
    }
}
