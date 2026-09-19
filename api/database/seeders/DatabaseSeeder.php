<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Popula o banco com dados fictícios.
     *
     * Este seeder roda a cada subida do container (ver o `command` do serviço
     * `api` no docker-compose.yml), então tudo aqui precisa ser idempotente:
     * rodar duas vezes não pode quebrar nem duplicar dado.
     *
     * O seeder padrão do Laravel criava um usuário de teste fixo e violava a
     * restrição de unicidade do e-mail na segunda execução. Removido porque
     * este projeto não tem autenticação nem usuários.
     */
    public function run(): void
    {
        // $this->call(SolicitacaoSeeder::class);
    }
}
