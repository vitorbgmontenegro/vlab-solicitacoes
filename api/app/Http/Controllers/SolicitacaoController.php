<?php

namespace App\Http\Controllers;

use App\Enums\Status;
use App\Http\Requests\AtualizarStatusRequest;
use App\Http\Requests\ListarSolicitacoesRequest;
use App\Http\Requests\StoreSolicitacaoRequest;
use App\Http\Resources\SolicitacaoResource;
use App\Models\Solicitacao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Endpoints de solicitações de atendimento.
 *
 * O controller é fino de propósito: a validação fica nos Form Requests, a
 * regra de transição fica no enum Status, e a formatação da resposta fica no
 * SolicitacaoResource. Aqui só resta orquestrar.
 */
class SolicitacaoController extends Controller
{
    /**
     * GET /api/v1/solicitacoes
     *
     * Lista com paginação e filtros opcionais por status, categoria e
     * prioridade.
     */
    public function index(ListarSolicitacoesRequest $request): AnonymousResourceCollection
    {
        $solicitacoes = Solicitacao::query()
            ->when($request->query('status'), fn ($consulta, $valor) => $consulta->where('status', $valor))
            ->when($request->query('categoria'), fn ($consulta, $valor) => $consulta->where('categoria', $valor))
            ->when($request->query('prioridade'), fn ($consulta, $valor) => $consulta->where('prioridade', $valor))
            ->orderByDesc('created_at')
            ->paginate((int) $request->query('per_page', 15));

        return SolicitacaoResource::collection($solicitacoes);
    }

    /**
     * POST /api/v1/solicitacoes
     *
     * Cria uma solicitação. O protocolo e o status inicial são definidos pelo
     * model, não por quem envia.
     */
    public function store(StoreSolicitacaoRequest $request): JsonResponse
    {
        $solicitacao = Solicitacao::create($request->validated());

        return SolicitacaoResource::make($solicitacao)
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/v1/solicitacoes/{solicitacao}
     *
     * Se o id não existir, o Laravel responde 404 antes de chegar aqui.
     */
    public function show(Solicitacao $solicitacao): SolicitacaoResource
    {
        return SolicitacaoResource::make($solicitacao);
    }

    /**
     * PATCH /api/v1/solicitacoes/{solicitacao}/status
     *
     * A permissão da transição já foi conferida pelo AtualizarStatusRequest,
     * que consulta o enum Status. Se o código chegou aqui, a mudança é válida.
     */
    public function atualizarStatus(
        AtualizarStatusRequest $request,
        Solicitacao $solicitacao,
    ): SolicitacaoResource {
        $solicitacao->status = Status::from($request->validated('status'));
        $solicitacao->save();

        return SolicitacaoResource::make($solicitacao);
    }
}
