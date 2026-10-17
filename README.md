# Calendário de Turnos

Gerador de calendários para escalas rotativas de **4 dias de trabalho seguidos de 2 dias de folga**.

## Funcionalidades

- Nome personalizável do trabalhador.
- Configuração pela posição do ciclo numa data conhecida ou pela data do primeiro dia de trabalho.
- Calendário de outubro de 2026 a dezembro de 2027 (15 meses).
- Destaque de folgas com fundo cinzento, pensado para impressão a preto e branco.
- Impressão / guardar em PDF em duas páginas A4 horizontais.
- Aplicação estática, sem base de dados ou servidor de aplicação.

## Utilização

Aceda ao site publicado, indique o nome do trabalhador e configure uma referência correta para o ciclo. Depois, utilize **Imprimir / Guardar em PDF**.

A escala pressupõe um ciclo contínuo de quatro dias de trabalho e dois dias de folga. Confirme os dados de referência antes de utilizar o calendário como escala oficial.

## Publicação

O ficheiro `.github/workflows/pages.yml` publica automaticamente a aplicação no GitHub Pages sempre que há alterações na branch `main`.

No repositório, em **Settings → Pages**, a origem deve estar definida como **GitHub Actions**.
