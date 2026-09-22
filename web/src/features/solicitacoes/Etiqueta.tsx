import type { Prioridade, Status } from '../../types/solicitacao';
import { ROTULO_PRIORIDADE, ROTULO_STATUS } from '../../types/solicitacao';

/**
 * Etiqueta colorida de status ou prioridade.
 *
 * A cor vem de uma classe derivada do valor, definida no index.css. Assim a
 * paleta fica num lugar so e o componente nao carrega estilo embutido.
 */

export function EtiquetaStatus({ status }: { status: Status }) {
  return (
    <span className={`etiqueta etiqueta--status-${status.toLowerCase()}`}>
      {ROTULO_STATUS[status]}
    </span>
  );
}

export function EtiquetaPrioridade({ prioridade }: { prioridade: Prioridade }) {
  return (
    <span className={`etiqueta etiqueta--prioridade-${prioridade.toLowerCase()}`}>
      {ROTULO_PRIORIDADE[prioridade]}
    </span>
  );
}
