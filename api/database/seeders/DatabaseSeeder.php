<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Popula o banco com dados ficticios.
     *
     * Este seeder roda a cada subida do container (ver o `command` do servico
     * `api` no docker-compose.yml), entao tudo aqui precisa ser idempotente:
     * rodar duas vezes nao pode quebrar nem duplicar dado.
     *
     * Nao usa WithoutModelEvents de proposito. Esse trait desliga os eventos
     * do Eloquent, e o model Solicitacao depende do evento `creating` para
     * gerar o protocolo e definir o status inicial. Com os eventos desligados,
     * os registros nasceriam sem protocolo.
     */
    public function run(): void
    {
        $this->call(SolicitacaoSeeder::class);
    }
}
