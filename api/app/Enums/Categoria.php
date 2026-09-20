<?php

namespace App\Enums;

/**
 * Categoria do atendimento solicitado.
 *
 * Backed enum de string: o valor guardado no banco e trafegado na API é
 * exatamente o texto de cada case.
 */
enum Categoria: string
{
    case CONSULTA  = 'CONSULTA';
    case EXAME     = 'EXAME';
    case VACINACAO = 'VACINACAO';
    case OUTRO     = 'OUTRO';
}
