/**
 * Formatacao de valores para exibicao.
 */

/**
 * Converte a data ISO que a API devolve no formato lido no Brasil.
 *
 * Exemplo: "2026-09-21T12:33:26+00:00" vira "21/09/2026 09:33".
 */
export function formatarDataHora(iso: string): string {
  const data = new Date(iso);

  if (Number.isNaN(data.getTime())) {
    return '-';
  }

  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
