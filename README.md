# Calendário de Turnos

Gerador de calendários para escalas rotativas de **4 dias de trabalho seguidos de 2 dias de folga**.

## Funcionalidades

- Uma única caixa **Exibir Feriados** para ligar ou desligar todos os marcadores de feriado.
- Feriados nacionais obrigatórios de Portugal, incluindo feriados móveis calculados automaticamente.
- Feriado municipal de Lisboa (13 de junho, Santo António).
- Marcador próprio na célula do dia e nome do feriado disponível ao passar o cursor.
- O marcador não altera a cor de trabalho ou de folga e continua legível na impressão a preto e branco.
- A terça-feira de Carnaval também é identificada; é um feriado facultativo, sujeito ao enquadramento laboral aplicável.
- Nome personalizável do trabalhador.
- Configuração pela posição do ciclo numa data conhecida ou pela data do primeiro dia de trabalho.
- Calendário de outubro de 2026 a dezembro de 2027 (15 meses).
- Impressão / guardar em PDF em duas páginas A4 horizontais.
- Aplicação estática, sem base de dados ou servidor de aplicação.

## Utilização

Aceda ao site publicado, preencha o nome do trabalhador, configure uma referência correta para o ciclo e marque **Exibir Feriados** para mostrar os marcadores. Desmarque a caixa para ocultar todos os marcadores de feriado. Depois, utilize **Imprimir / Guardar em PDF**.

A escala pressupõe um ciclo contínuo de quatro dias de trabalho e dois dias de folga. Confirme os dados de referência antes de utilizar o calendário como escala oficial.

## Publicação

O ficheiro `.github/workflows/pages.yml` publica automaticamente a aplicação no GitHub Pages sempre que há alterações na branch `main`.

No repositório, em **Settings → Pages**, a origem deve estar definida como **GitHub Actions**.

## Referências de feriados

- [Código do Trabalho, artigo 234.º — feriados obrigatórios](https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2009-34546475-124446195)
- [Código do Trabalho, artigo 235.º — feriados facultativos](https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2009-34546475-46746875)
- [Câmara Municipal de Lisboa — 13 de junho, feriado municipal](https://informacao.lisboa.pt/noticias/arquivo/detalhe/procissao-de-santo-antonio-2)

O Carnaval e o feriado municipal são facultativos na aceção do artigo 235.º e podem depender do contrato de trabalho ou do instrumento de regulamentação coletiva aplicável. Os marcadores no calendário são informativos e não alteram a escala 4x2.
