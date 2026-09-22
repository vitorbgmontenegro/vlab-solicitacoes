# Uso de ferramentas de inteligência artificial

O edital permite e encoraja o uso de IA, exige que o README descreva como as
ferramentas foram usadas e em quais partes do projeto, e exige que todo o
código entregue seja compreendido e explicável pelo candidato.

Este arquivo é o registro detalhado. O resumo está no README.

## Ferramenta utilizada

Uma única: **Claude (Anthropic)**, em conversa, ao longo de todo o
desenvolvimento. Nenhuma outra ferramenta de IA foi usada, incluindo
autocompletar de editor.

## Como foi usada

O modo de trabalho foi conversacional e incremental, e não geração de código em
bloco. A cada etapa:

1. Eu descrevia a próxima peça do projeto.
2. A ferramenta escrevia o código e explicava linha por linha, incluindo a
   sintaxe do PHP, que eu não conhecia antes deste desafio.
3. Eu lia, perguntava o que não tinha entendido, e só então o código era aceito.
4. As mensagens de commit foram escritas por mim.
5. As decisões de projeto foram apresentadas como decisões, com alternativas e
   custos, para que eu escolhesse. As escolhas e os motivos estão registrados
   no README.

Partes que eu digitei no editor em vez de aceitar prontas, por serem as mais
importantes de dominar: o enum `Status` com a máquina de transição, e casos de
teste dela.

## Onde a IA atuou

| Parte | Participação |
|---|---|
| Docker e Docker Compose | Escrito com a ferramenta |
| Migration, model, enums | Escrito com a ferramenta; o enum `Status` digitado por mim |
| Form Requests, controller, resource | Escrito com a ferramenta |
| Testes de backend | Escritos com a ferramenta; casos adicionais definidos por mim |
| Frontend | Escrito com a ferramenta |
| Documentação | Escrita com a ferramenta a partir das decisões tomadas na conversa |

Ou seja: a ferramenta participou de praticamente todo o código. A divisão
honesta não é "o que ela escreveu", e sim **o que eu entendo e consigo
explicar**, que é o projeto inteiro, com as ressalvas da seção seguinte.

## O que eu domino melhor e pior

**Domino bem:** o modelo de domínio e a máquina de transição de status, o
contrato da API e os códigos HTTP de cada caso, a separação de
responsabilidades entre as camadas, o frontend em React e TypeScript, e as
decisões registradas no README.

**Domino com limitação:** detalhes internos do Laravel, como o ciclo de vida da
aplicação, o container de serviços e o funcionamento interno do Eloquent. Este
foi meu primeiro projeto em PHP e Laravel. Sei onde cada coisa acontece no
projeto e sei como investigar, mas não tenho fluência no framework.

Essa limitação está declarada de propósito. Preferi registrá-la a fingir uma
familiaridade que eu não tenho.

## Erros reais que apareceram no caminho

Registrados porque mostram que o código foi executado, investigado e corrigido,
e não apenas gerado:

- O seeder padrão do Laravel violava a restrição de unicidade do e-mail a cada
  subida do container, causando reinício em laço.
- O `vendor/` foi resolvido por um PHP mais novo do que o da imagem, e o
  `platform_check` do Composer impedia a aplicação de subir.
- O `WithoutModelEvents` no seeder desligava o evento `creating` do model, e os
  registros nasciam sem protocolo. A restrição `not null` do PostgreSQL barrou
  a gravação.
- A suíte de testes rodava contra o banco de desenvolvimento e apagava os dados,
  porque variável de ambiente injetada pelo Docker vence a configuração do
  `phpunit.xml`.
- Um clone limpo não subia, porque nada instalava o `vendor/`.

Todos foram diagnosticados a partir da mensagem de erro e corrigidos. Os três
últimos estão explicados no README, na seção de decisões.
