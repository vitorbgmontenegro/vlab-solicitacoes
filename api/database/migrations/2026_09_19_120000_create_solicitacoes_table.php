<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitacoes', function (Blueprint $table) {
            $table->id();

            // Gerado pela aplicação, nunca informado por quem cadastra.
            // O unique() é a garantia no nível do banco: mesmo que a aplicação
            // falhe, o Postgres recusa um protocolo repetido.
            $table->string('protocolo', 30)->unique();

            $table->string('nome_solicitante', 150);

            // Enums do domínio, guardados como texto curto.
            // A lista de valores válidos é garantida pela validação na
            // aplicação (PHP backed enums), não por tipo nativo do Postgres.
            $table->string('categoria', 20);
            $table->string('prioridade', 20);
            $table->string('status', 20)->default('RECEBIDA');

            $table->text('descricao');

            // Obrigatória apenas quando prioridade = URGENTE. Essa é uma regra
            // condicional de negócio, então vive na aplicação; no banco a
            // coluna é simplesmente opcional.
            $table->text('justificativa_prioridade')->nullable();

            // Cria created_at e updated_at, mantidos automaticamente pelo
            // Eloquent. A API expõe esses valores como data_criacao e
            // data_atualizacao, conforme o contrato do desafio.
            $table->timestamps();

            // Índices para os três filtros previstos na listagem.
            $table->index('status');
            $table->index('categoria');
            $table->index('prioridade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitacoes');
    }
};
