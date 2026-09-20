<?php

namespace App\Enums;

/**
 * Prioridade da solicitação.
 *
 * A regra de que URGENTE exige justificativa não mora aqui: ela é uma regra de
 * validação de entrada e vive no Form Request, num lugar só.
 */
enum Prioridade: string
{
    case BAIXA   = 'BAIXA';
    case MEDIA   = 'MEDIA';
    case ALTA    = 'ALTA';
    case URGENTE = 'URGENTE';
}
