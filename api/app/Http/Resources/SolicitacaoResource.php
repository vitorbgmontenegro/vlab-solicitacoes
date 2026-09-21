<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Traduz um model Solicitacao no JSON que a API promete no contrato.
 *
 * É aqui que o desenho interno do banco deixa de vazar para fora: as colunas
 * created_at e updated_at do Laravel são expostas como data_criacao e
 * data_atualizacao, que são os nomes definidos pelo desafio.
 *
 * @mixin \App\Models\Solicitacao
 */
class SolicitacaoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                       => $this->id,
            'protocolo'                => $this->protocolo,
            'nome_solicitante'         => $this->nome_solicitante,
            'categoria'                => $this->categoria,
            'prioridade'               => $this->prioridade,
            'status'                   => $this->status,
            'descricao'                => $this->descricao,
            'justificativa_prioridade' => $this->justificativa_prioridade,

            // Deriva da máquina de estados. Permite que o frontend ofereça só
            // as transições válidas, sem reimplementar a regra do lado dele.
            'proximos_status_permitidos' => $this->status->proximosPermitidos(),

            'data_criacao'     => $this->created_at?->toIso8601String(),
            'data_atualizacao' => $this->updated_at?->toIso8601String(),
        ];
    }
}
