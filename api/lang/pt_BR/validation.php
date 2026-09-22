<?php

/*
 * Mensagens de validação em português.
 *
 * Só as regras efetivamente usadas pela API estão aqui. O Laravel cai no
 * idioma padrão para qualquer chave ausente.
 *
 * O idioma é definido por APP_LOCALE, no docker-compose.yml.
 */

return [
    'required'    => 'O campo :attribute é obrigatório.',
    'required_if' => 'O campo :attribute é obrigatório quando :other for :value.',
    'string'      => 'O campo :attribute deve ser um texto.',
    'integer'     => 'O campo :attribute deve ser um número inteiro.',
    'enum'        => 'O valor informado em :attribute não é válido.',

    'max' => [
        'string'  => 'O campo :attribute não pode ter mais de :max caracteres.',
        'numeric' => 'O campo :attribute não pode ser maior que :max.',
    ],

    'min' => [
        'string'  => 'O campo :attribute deve ter no mínimo :min caracteres.',
        'numeric' => 'O campo :attribute deve ser no mínimo :min.',
    ],

    /*
     * Nomes legíveis dos campos, usados no lugar de :attribute.
     */
    'attributes' => [
        'nome_solicitante'         => 'nome do solicitante',
        'justificativa_prioridade' => 'justificativa de prioridade',
        'descricao'                => 'descrição',
        'categoria'                => 'categoria',
        'prioridade'               => 'prioridade',
        'status'                   => 'status',
        'per_page'                 => 'itens por página',
        'page'                     => 'página',
    ],
];
