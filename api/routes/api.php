<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

/*
 * Rotas da API v1.
 *
 * O prefixo "api/v1" é definido em bootstrap/app.php, então a rota
 * "/health" declarada aqui responde em /api/v1/health.
 */

// Health check: confirma que a API está de pé e que o banco responde.
// Atende ao bônus do edital: "Health check da API e verificação da
// conexão com o PostgreSQL".
Route::get('/health', function () {
    try {
        // getPdo() força a abertura da conexão. Sem isso o Laravel
        // conectaria só na primeira consulta, e o health check passaria
        // mesmo com o banco fora do ar.
        DB::connection()->getPdo();
        $banco = 'ok';
    } catch (\Throwable $e) {
        $banco = 'indisponivel';
    }

    return response()->json([
        'api' => 'ok',
        'banco' => $banco,
    ], $banco === 'ok' ? 200 : 503);
});
