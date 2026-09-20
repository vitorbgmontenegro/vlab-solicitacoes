<?php

namespace App\Enums;

/**
 * Status de uma solicitação e a máquina de transição entre eles.
 *
 * Esta é a implementação central da regra de transição exigida pelo desafio.
 * Controllers e validações perguntam a este enum o que é permitido; nenhum
 * outro lugar do sistema decide isso.
 */
enum Status: string
{
    case RECEBIDA   = 'RECEBIDA';
    case EM_ANALISE = 'EM_ANALISE';
    case AGENDADA   = 'AGENDADA';
    case CONCLUIDA  = 'CONCLUIDA';
    case CANCELADA  = 'CANCELADA';

    /**
     * Para quais status esta solicitação pode ir a partir daqui.
     *
     * CONCLUIDA e CANCELADA são finais: não permitem nova alteração.
     *
     * @return array<int, self>
     */
    public function proximosPermitidos(): array
    {
        return match ($this) {
            self::RECEBIDA   => [self::EM_ANALISE, self::CANCELADA],
            self::EM_ANALISE => [self::AGENDADA, self::CANCELADA],
            self::AGENDADA   => [self::CONCLUIDA, self::CANCELADA],
            self::CONCLUIDA  => [],
            self::CANCELADA  => [],
        };
    }

    /**
     * Esta transição é permitida?
     */
    public function podeTransicionarPara(self $novo): bool
    {
        return in_array($novo, $this->proximosPermitidos(), true);
    }
}