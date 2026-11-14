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

## HUD

- **Canto esquerdo:** idioma (🌐 PT/EN), **i** (fontes, créditos e a equipe em destaque) e 📖 (**Álbum espacial**). O canto direito fica livre.
- O nome do Marcos, o "!" e a seta vermelha de objetivo somem quando há parede entre a câmera e eles.

**Equipe:** Anna Clara Diniz, Hurias Felipe Silveira, Luis Renato Fernandes, Nando Nogueira, Túlio Amaral e Valter Cauã Alves.

## Fase 1 · Projeto Mercury: O Colapso do Piloto Automático

Ao embarcar pela escotilha, o **capacete aparece sozinho** e a cabine abre **em primeira pessoa**, já com o piloto automático desligado. Na tela aparece só o título da fase.

1. A tela treme e fica vermelha, e pisca o alerta **FALHA NO PILOTO AUTOMÁTICO**.
2. Há um **+** no centro da visão e **4 pontos vermelhos no espaço**, fora da nave.
3. O jogador move a câmera (mouse, setas/WASD ou arrastar no celular) até o + ficar sobre um ponto e **segura 2 s**. Um **círculo branco** em volta do ponto mostra o tempo.
4. Com os 4 pontos travados, o piloto automático volta e tudo se normaliza.
5. A nota vem em **estrelas**, pelo tempo para estabilizar a nave (cronômetro `M.t`):

   | Tempo | Estrelas |
   |-------|----------|
   | até 13,0 s | ⭐⭐⭐ |
   | 13,1 a 25,0 s | ⭐⭐ |
   | 25,1 a 40,0 s | ⭐ |
   | mais de 40,0 s | nenhuma: a missão falha na hora |

6. **Com 1 a 3 estrelas:** banner **Missão concluída com sucesso!**, estrelas douradas, **card da missão real** (Friendship 7, 1962: objetivo, o que aconteceu e foto oficial da NASA) e selo. O card entra no **Álbum espacial**. **Voltar a explorar** volta ao mapa e **Próxima fase** abre o banner **A aventura continua no Roblox!**.
7. **Com 0 estrelas:** **MISSÃO FALHOU** em vermelho, estrelas apagadas, sem card e sem selo. **Tentar novamente** reinicia a fase com o tempo zerado; **Sair para o mapa** volta ao hangar.
8. Embarcar de novo depois de concluir a Fase 1 mostra o melhor resultado em estrelas e as opções **Refazer fase 1** e **Próxima fase** (Roblox).

Os limites das estrelas ficam em `LIMITE_ESTRELAS`, no [jogo.js](jogo.js).

O capacete sai da cabeça quando o jogador desce da plataforma de cima (pulando ou de elevador) e volta quando ele sobe de novo.

**Fontes do card:** foto e objetivo do registro NASA 9248362; "o que aconteceu" do relatório oficial da NASA no NTRS (20040110111), que registra dificuldades no voo e mudanças na sequência planejada.

## Link do Roblox

Quando o jogo estiver pronto, cole o link em `linkRoblox`, no topo do [dados.js](dados.js). Enquanto estiver vazio, o botão mostra "Link do jogo em breve".

## O que tem no mapa

| # | Área | Destaques |
|---|------|-----------|
| 01 | **Recepção** (lobby da agência) | Marcos Pontes com "!" de missão, balão de fala em 5 partes com o nome do jogador, telão "BEM-VINDO(A), NOME!", globo holográfico, 2 totens (Marcos Pontes e entrada do Visitor Complex) |
| → | Corredor 1 | Setas neon e placas "Museu KSC" |
| 02 | **Museu: Kennedy Space Center Visitor Complex** | 6 exposições: Rocket Garden, Sigma 7 sobre Redstone, Controle de Missão Mercury, Hall da Fama com estátua, **Atlantis erguido e inclinado 43,21° com as portas abertas**, **Saturn V suspenso na horizontal** |
| → | Corredor 2 (na parede **oposta** à entrada) | "Corredor de embarque" |
| 03 | **Hangar** | Nave RR-01, **escada à direita da nave** até a plataforma, **elevador** (com botões de chamada no chão, embaixo e em cima) até o braço de acesso e a escotilha, que leva à **Fase 1** |

## Controles

- **WASD / setas**: andar. **Espaço**: pular. **E**: interagir com o prompt mais próximo.
- **Arrastar o mouse**: girar a câmera. **Roda do mouse**: zoom.
- **Clique** em personagens, totens, Atlantis, Saturn V ou na nave para abrir as informações.
- **Celular**: joystick, botão de pulo e toque nos prompts.

O progresso (nome, missões, exposições vistas) fica salvo no navegador.

**Atalhos para apresentar** (pulam a tela inicial; `g=m` é feminino e `g=h` é masculino):
- `index.html#lang=pt&g=m&jogar&tp=museu` (ou `recepcao`, `hangar`, `elevador`, `braco`)
- `index.html#lang=en&g=h&jogar&expo=atlantis`
- `index.html#lang=pt&g=m&jogar&missao`: abre a Fase 1 · `missao=fim&t=18` mostra o banner com o tempo informado (`t=41` mostra a falha) · `missao=escolha` mostra a escolha ao reembarcar
- `index.html#lang=pt&g=m&jogar&album` e `…&roblox`: abrem o álbum e o banner do Roblox

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
