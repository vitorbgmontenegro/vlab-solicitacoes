<?php

use App\Http\Controllers\SolicitacaoController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

/*
 * Rotas da API v1.
 *
 * O prefixo "api/v1" é definido em bootstrap/app.php, então os caminhos
 * declarados aqui já respondem sob /api/v1.
 */

// Health check: confirma que a API está de pé e que o banco responde.
Route::get('/health', function () {
    try {
        // getPdo() força a abertura da conexão. Sem isso o Laravel conectaria
        // só na primeira consulta, e o health check passaria mesmo com o banco
        // fora do ar.
        DB::connection()->getPdo();
        $banco = 'ok';
    } catch (\Throwable $e) {
        $banco = 'indisponivel';
    }

    return response()->json([
        'api'   => 'ok',
        'banco' => $banco,
    ], $banco === 'ok' ? 200 : 503);
});

Route::get('/solicitacoes', [SolicitacaoController::class, 'index']);
Route::post('/solicitacoes', [SolicitacaoController::class, 'store']);
// Precisa vir antes da rota com {solicitacao}: declarada depois, a palavra
// "resumo" seria interpretada como um identificador e nao casaria.
Route::get('/solicitacoes/resumo', [SolicitacaoController::class, 'resumo']);
Route::get('/solicitacoes/{solicitacao}', [SolicitacaoController::class, 'show']);
Route::patch('/solicitacoes/{solicitacao}/status', [SolicitacaoController::class, 'atualizarStatus']);
