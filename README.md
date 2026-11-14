# Rookie Rocket · demo local (3D, estilo jogo de blocos)

Demo navegável do jogo que está sendo criado no Roblox para o **NASA Space Apps Challenge 2026 · Space Mission Design Game**.

**Como abrir:** dê dois cliques em `index.html`. Não precisa de servidor, instalação nem internet: o motor 3D (`lib/three.min.js`), a fonte dos títulos (`lib/Michroma-Regular.ttf`) e as fotos (`nasa/`) já estão na pasta.

**Site publicado:** https://annacdiniz-dev.github.io/Rookie-Rocket-demo/

## Início do jogo

Um único card, nesta ordem:

1. **Idioma** (Português ou English, com caixa de seleção). A troca é instantânea: interface, falas do Marcos, exposições, placas 3D, missões e conquistas mudam de idioma.
2. **Nome de astronauta:** aparece sobre o personagem, no telão e nas falas.
3. **Personagem:** Feminino ou Masculino. O personagem começa **sem capacete**. Em português, as palavras com gênero acompanham a escolha (Estagiário/Estagiária, selecionado/selecionada).

No jogo, o botão **PT/EN** troca o idioma sem perder o lugar no mapa.

## Fase 1 · Projeto Mercury · Task 1: O Colapso do Piloto Automático

Ao embarcar pela escotilha no braço de acesso, o **capacete aparece automaticamente** e abre o briefing da missão. A cabine é **em primeira pessoa**, vista através da viseira:

1. A tela treme, fica vermelha e pisca o alerta laranja **FALHA NO SISTEMA AUTOMÁTICO**.
2. O jogador clica no botão vermelho **DESLIGAR AUTOPILOTO** (ou aperta Enter/Espaço).
3. A cruz do mostrador de atitude começa a deslizar sozinha. Com **← e →** (ou os botões na tela), o jogador leva a cruz até o **alvo verde** e segura ali. São **4 alvos**.
4. Cada toque gasta **combustível RCS** (40 toques no tanque). Segurar a tecla não dispara mais propulsores: cada toque conta. Em pânico, o combustível acaba em cerca de 10 s e a missão falha.
5. Com 4 alvos travados, o piloto automático volta, tudo se normaliza e a conquista **Piloto do Projeto Mercury** é liberada.

Testes automáticos com um "jogador calmo" venceram as 5 rodadas (27 a 34 s, sobrando de 28% a 50% de RCS). Com o "jogador em pânico", o combustível acabou em 10,2 s. Os ajustes de dificuldade ficam no topo do bloco da missão em `jogo.js` (`const AJ`).

**Base histórica (NASA):** Friendship 7 (9248362), Aurora 7 (62PC-52), treino de controle manual no ALFA (s62-01145) e o simulador MASTIF (GRC-1959-C-52235). A API da NASA **não** tem registros que descrevam a pane de piloto automático desses voos, então o briefing avisa que a pane é uma simulação do jogo, inspirada nessas missões e nesse treinamento.

## O que tem no mapa

| # | Área | Destaques |
|---|------|-----------|
| 01 | **Recepção** (lobby da agência) | Marcos Pontes com "!" de missão, balão de fala em 5 partes com o nome do jogador, telão "BEM-VINDO(A), NOME!", globo holográfico, 2 totens (Marcos Pontes e entrada do Visitor Complex) |
| → | Corredor 1 | Setas neon e placas "Museu KSC" |
| 02 | **Museu: Kennedy Space Center Visitor Complex** | 6 exposições: Rocket Garden, Sigma 7 sobre Redstone, Controle de Missão Mercury, Hall da Fama com estátua, **Atlantis erguido e inclinado 43,21° com as portas abertas**, **Saturn V suspenso na horizontal** |
| → | Corredor 2 (na parede **oposta** à entrada) | "Corredor de embarque" |
| 03 | **Hangar** | Nave RR-01, **escada à direita da nave** até a plataforma, **elevador** até o braço de acesso e a escotilha, que leva à **Fase 1** |

## Controles

- **WASD / setas**: andar. **Espaço**: pular. **E**: interagir com o prompt mais próximo.
- **Arrastar o mouse**: girar a câmera. **Roda do mouse**: zoom.
- **Clique** em personagens, totens, Atlantis, Saturn V ou na nave para abrir as informações.
- **M** ou 🗺️: mapa com teleporte rápido.
- **Celular**: joystick, botão de pulo e toque nos prompts.

O progresso (nome, missões, exposições vistas) fica salvo no navegador.

**Atalhos para apresentar** (pulam a tela inicial; `g=m` é feminino e `g=h` é masculino):
- `index.html#lang=pt&g=m&jogar&tp=museu` (ou `recepcao`, `hangar`, `elevador`, `braco`)
- `index.html#lang=en&g=h&jogar&expo=atlantis`
- `index.html#lang=pt&g=m&jogar&missao`: abre o briefing da Fase 1 (`missao=direto` pula o briefing)

## Regra de dados: só NASA

Todos os fatos e fotos das exposições vêm da **NASA Image and Video Library** (API oficial `images-api.nasa.gov`), consultada em 14/11/2026. Cada card mostra o ID, a data, o crédito e o link do registro:

| Exposição | Registros NASA |
|-----------|----------------|
| Marcos Pontes | iss012e22280, 20060409_exp12_11 |
| Entrada do Visitor Complex | KSC-03pd2164 |
| Rocket Garden | KSC-03pd2174 |
| Sigma 7 | KSC-20161107-PH_GEB02_0276 |
| Controle de Missão Mercury | KSC-20161107-PH_GEB02_0090 |
| Hall da Fama | KSC-20161107-PH_GEB02_0118 |
| Atlantis | KSC-2012-6136, KSC-2012-6362, 2013-2311 |
| Saturn V | KSC-98pc1004 |
| Artemis I (inspiração da nave) | NHQ202211160030, MAF_20221211_Splashdown02 |

Os textos estão em [dados.js](dados.js), em `idiomas.pt` e `idiomas.en`. Para trocar ou acrescentar uma exposição, edite só esse arquivo, sempre nos dois idiomas. Os textos em inglês seguem de perto as descrições originais da NASA.

## Pendências e avisos

- **A página do desafio não abriu daqui** (erro de certificado SSL/TLS). Por isso não confirmei a lista de recursos liberados pelo desafio. Até lá, usei apenas a API oficial da NASA, como pedido. Se puderem colar a lista de recursos da página, eu confiro e ajusto.
- **As falas do Marcos Pontes são fictícias** (aviso no balão e nos créditos). Os fatos citados nelas vêm dos registros da NASA acima.
- O museu **junta em um salão** atrações que no Visitor Complex real ficam em lugares diferentes (Rocket Garden, Heroes and Legends, Space Shuttle Atlantis, Apollo/Saturn V Center). É uma representação para o jogo, não uma réplica arquitetônica.
- A nave RR-01 é um **modelo original** inspirado no SLS com a Orion. O mapa-múndi do Controle Mercury é estilizado.
- O embarque na nave ainda não está implementado, como combinado ("por enquanto").

## Para quem vai montar no Roblox Studio

A demo foi feita em **studs**, com os valores padrão do Roblox, então dá para copiar as medidas direto:

- 1 unidade = 1 stud. Personagem R6 com ~5,2 studs de altura.
- WalkSpeed **16**, JumpPower **50**, Gravity **196,2**.
- Recepção 60×50 (pé-direito 22). Corredores 14×30 (altura 14). Museu 100×90 (altura 45). Hangar 80×60 (altura 60).
- Escada com 14 degraus (1 stud de altura × 2 de profundidade) até a plataforma em Y=14. Elevador de Y=14 até Y=41 a 6 studs/s.
- Prompts "E" = **ProximityPrompt**. Balão do Marcos = **BubbleChat** / `TextChatService`. Telão com o nome = **SurfaceGui**. Conquistas = **Badges**. Painel de progresso = **leaderstats**.

## Arquivos

- `index.html`: estrutura e HUD.
- `estilo.css`: visual da interface (HUD, balões, prompts, cards, celular).
- `dados.js`: textos em PT e EN (falas, exposições com fontes da NASA, placas, missões e conquistas).
- `jogo.js`: mundo 3D, personagens, física (escada e elevador), câmera, interações e salvamento.
- `lib/three.min.js`: three.js r128 (licença MIT).
- `lib/Michroma-Regular.ttf`: fonte dos títulos, no estilo do storyboard (SIL Open Font License, em `lib/Michroma-OFL.txt`).
- `nasa/`: 13 fotos baixadas da NASA Image and Video Library.
- `versao-anterior/`: a demo 2D anterior, guardada sem alterações.
