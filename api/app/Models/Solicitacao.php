<?php

namespace App\Models;

use App\Enums\Categoria;
use App\Enums\Prioridade;
use App\Enums\Status;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Solicitacao extends Model
{
    /** Habilita Solicitacao::factory(), usada nos testes e nos seeders. */
    use HasFactory;

    /**
     * O Eloquent deriva o nome da tabela pluralizando o nome da classe em
     * inglês, o que daria "solicitacaos". Por isso o nome é explícito aqui.
     */
    protected $table = 'solicitacoes';

    /**
     * Campos que podem ser preenchidos a partir da requisição.
     *
     * `protocolo` e `status` ficam deliberadamente de fora: quem decide esses
     * dois é a aplicação, não quem envia o formulário. Mesmo que cheguem no
     * corpo da requisição, o Eloquent os ignora.
     */
    protected $fillable = [
        'nome_solicitante',
        'categoria',
        'prioridade',
        'descricao',
        'justificativa_prioridade',
    ];

    /**
     * Converte as colunas de texto nos enums de domínio ao ler, e de volta
     * para texto ao gravar. É o que permite escrever
     * `$solicitacao->status->podeTransicionarPara($novo)` em vez de comparar
     * strings soltas pelo código.
     */
    protected function casts(): array
    {
        return [
            'categoria'  => Categoria::class,
            'prioridade' => Prioridade::class,
            'status'     => Status::class,
        ];
    }

    /**
     * Regras aplicadas no momento da criação.
     */
    protected static function booted(): void
    {
        static::creating(function (Solicitacao $solicitacao): void {
            $solicitacao->protocolo ??= self::gerarProtocolo();
            $solicitacao->status ??= Status::RECEBIDA;
        });
    }

    /**
     * Protocolo único gerado pela aplicação.
     *
     * Formato: SOL-<ano>-<8 caracteres aleatórios>, o que dá 36^8 combinações
     * por ano. A garantia real de unicidade é a restrição UNIQUE da coluna no
     * banco; este método apenas torna a colisão improvável.
     *
     * Alternativa considerada: número sequencial por ano. Descartada porque
     * exigiria consultar o último valor a cada criação, o que abre corrida
     * entre requisições simultâneas sem ganho real para o domínio.
     */
    private static function gerarProtocolo(): string
    {
        return sprintf('SOL-%s-%s', now()->format('Y'), Str::upper(Str::random(8)));
    }
}
