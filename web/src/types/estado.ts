/**
 * Os quatro estados que uma tela que busca dados pode assumir.
 *
 * Declarado como uniao discriminada: o campo `situacao` diz qual caso e, e o
 * TypeScript so deixa acessar `dados` depois de confirmar que a situacao e
 * 'sucesso'. Isso torna impossivel, por construcao, renderizar a lista antes
 * dela existir.
 *
 * O edital pede exatamente estes quatro: carregando, sucesso, vazio e erro.
 */
export type Estado<T> =
  | { situacao: 'carregando' }
  | { situacao: 'sucesso'; dados: T }
  | { situacao: 'vazio' }
  | { situacao: 'erro'; mensagem: string };
