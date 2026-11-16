# Rookie Rocket · demo local

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

## Fase 1 · Missão 1: Projeto Mercury (Friendship 7)

A missão segue a spec do jogo no Roblox, adaptada para um jogador (a demo não tem co-op nem login).

```
Manifesto de voo (missão → equipamentos) → contagem de 12 s
  → Task 1 → Task 2 → Task 3 → parabéns + aprendizado → resultado + estrelas → card da missão real
  Falha em qualquer ponto: o Marcos explica → Repetir task | Reiniciar missão | Sair para o mapa
```

Ao embarcar pela escotilha, o **capacete aparece sozinho** e abre o **Manifesto de voo**.

### Manifesto de voo

Duas abas:

1. **Missão:** descrição da Friendship 7 e o guia das 3 tasks.
2. **Equipamentos:** itens com ícone e peso, barra de peso e checklist (traje, itens, peso). O botão 🚀 **Embarcar** fica sempre habilitado, para o erro de peso acontecer.

| Equipamento | Peso | Task | Efeito |
|---|---|---|---|
| 🧭 Giroscópio | 15 kg | 1 | travar cada alvo leva **1,2 s** (em vez de 2,0 s). Na demo ele também tem o **ímã**: quando o "+" encosta no círculo cinza, a mira pula para o centro do ponto |
| 📘 Manual de bordo | 20 kg | 2 | destaca o código na prancheta e dá **+15 s** (30 s → 45 s) |
| 🛡️ Escudo reforçado | 25 kg | 3 | segurar o retropack leva **6 s** (em vez de 10 s) e a cabine treme menos |

**Regra de peso:**
- A nave pesa **20 kg** e o foguete leva no máximo **60 kg**.
- No máximo **2 equipamentos**. Tentar marcar o terceiro mostra um aviso.
- 15 + 20 = 55 kg e 15 + 25 = 60 kg são válidos. **20 + 25 = 65 kg é o erro didático.**
- Barra: verde até 50 kg, amarela de 51 a 60 kg, vermelha acima de 60 kg.
- **Bônus de leveza** = ⌊(60 − peso) ÷ 10⌋ × 2 s.
- **Acima de 60 kg:** o jogador entra na cápsula, mas o lançamento é cancelado. Depois de 1,4 s o alerta **PESO ACIMA DO LIMITE** dispara e a cabine sacode; aos 3,4 s o banner **MISSÃO FALHOU** abre por cima da cena. O foguete não sai da plataforma.

### Lançamento

Contagem regressiva de **12 s** dentro da cápsula, com céu azul na janela (há um botão **Pular**). Nos 3 s finais os motores ligam e a cabine treme. Na decolagem o céu escurece até virar espaço e começa a Task 1.

### As 3 tasks

Cada task abre com um aviso "TASK n/3" e tem cronômetro próprio, que só corre com a task ativa.

**Task 1 · A Falha do Piloto Automático**
- Alerta: **FALHA NO CONTROLE AUTOMÁTICO**, com tremor leve e luz vermelha.
- O jogador leva a mira **+** até 4 pontos vermelhos no espaço e segura até o círculo branco completar (2,0 s; 1,2 s com o giroscópio).
- Controles: mouse, setas/WASD ou arrastar no celular.
- **Falha:** passar de 40 s.

**Task 2 · O Blackout de Comunicação**
- Alerta: **PERDA DE CONTATO COM A TERRA**, com estática no rádio.
- Duas estações, em abas: a **Mesa de navegação** tem a prancheta com 5 códigos (o certo é o "REINÍCIO DO RÁDIO", sorteado a cada tentativa) e o **Rádio** tem o teclado. O jogador lê em uma e digita na outra.
- Com o manual de bordo, a linha certa aparece destacada.
- Código errado mostra só **"Código inválido"**. Código certo: a estática para e chega a mensagem "Friendship 7, estamos ouvindo você. Bem-vindo de volta."
- Ao lado do visor pisca o botão vermelho **EJETAR CÁPSULA**.
- No teclado do computador: números, Backspace, Enter, e ← → para trocar de estação.
- **Falha:** apertar EJETAR CÁPSULA ou o tempo acabar (30 s; 45 s com o manual).

**Task 3 · O Alarme do Escudo Térmico**
- Alerta: **PERIGO: SENSOR DO ESCUDO TÉRMICO INSTÁVEL**, com **10 s para decidir**.
- Dois botões: **EJETAR CÁPSULA** (vermelho) e **MANTER RETROPACK** (verde).
- Mantendo, a cabine fica vermelha de calor, treme e o plasma laranja passa pelas janelas. O jogador **segura** o botão verde até a barra encher (10 s; 6 s com o escudo). **Soltar só pausa.**
- **Falha:** apertar EJETAR CÁPSULA ou não decidir nos 10 s.

### Painel durante a missão

- **Barra das estrelas:** mostra quantas estrelas ainda dá para ganhar. Tem 3 trechos e esvazia com o tempo final: cheia até 2/3 nos primeiros 45 s (⭐⭐⭐), até 1/3 aos 70 s (⭐⭐) e vazia aos 100 s (⭐). Ao perder uma estrela, a barra dá um tranco, toca um som e o celular vibra.
- **TEMPO:** soma das tasks até agora, com o bônus de leveza embaixo.
- **LIMITE:** quanto falta para a task atual falhar por tempo.
- No computador o painel fica à direita e a barra das estrelas no alto. No celular tudo vira uma faixa embaixo; com o aparelho deitado, o teclado do rádio passa a ter 2 fileiras.

### Pontuação

`Tempo final = max(0, T1 + T2 + T3 − bônus de leveza)`

| Tempo final | Estrelas |
|---|---|
| até 45 s | ⭐⭐⭐ |
| 46 a 70 s | ⭐⭐ |
| 71 a 100 s | ⭐ |
| acima de 100 s | nenhuma: missão falhou ("demorou demais") |

Exemplo do resultado: "T1 12,0 s + T2 18,0 s + T3 15,0 s − 4 s de leveza = 41,0 s · ⭐⭐⭐".

### Falhas e falas do Marcos

Toda falha interrompe a partida e abre o banner **MISSÃO FALHOU** com o Marcos explicando. As falas são fictícias.

| Gatilho | Fala |
|---|---|
| Peso acima de 60 kg | "o foguete só leva 60 kg e a nave estava com {peso} kg. Ele nem saiu da plataforma!…" |
| Ejetar na Task 2 | "Ejetar durante a reentrada seria fatal. O John Glenn ficou 4 minutos sem rádio e confiou no treinamento…" |
| Ejetar na Task 3 | "Era um erro do sensor! O escudo estava preso… Manter o retropack foi a decisão real da NASA." |
| Tempo esgotado sem o item da task | "Faltou tempo, {nome}. O {equipamento} teria ajudado justamente aqui…" |
| Tempo esgotado com o item da task | "Quase lá, {nome}! Mesmo com o {equipamento}, o tempo apertou…" |
| Tempo final acima de 100 s | "Você trouxe a nave de volta, mas o tempo final foi de {tempo}…" |
| Sucesso | "Excelente trabalho, {nome}! Você tomou decisões de verdadeiro astronauta da NASA…" |

Botões do banner de falha:
- **Repetir task:** zera só o tempo daquela task e mantém os itens. Não aparece na falha por peso nem no "demorou demais".
- **Reiniciar missão:** volta ao Manifesto de voo, na aba de equipamentos, e libera a troca de itens.
- **Sair para o mapa.**

### Fim da missão

1. **Parabéns + aprendizado:** para cada task, as áreas (Física e Engenharia), um texto de ciência e o fato real ligado a ela.
2. **Resultado:** a conta do tempo, as estrelas e a fala do Marcos.
3. **Card da missão real** (Friendship 7, 20/02/1962), que entra no **Álbum espacial**. **Voltar a explorar** volta ao mapa e **Próxima fase** abre o banner do Roblox.

Embarcar de novo depois de concluir mostra o melhor resultado em estrelas e as opções **Refazer fase 1** e **Próxima fase**.

O capacete sai da cabeça quando o jogador desce da plataforma de cima (pulando ou de elevador) e volta quando ele sobe de novo.

### Onde mexer

Todos os números ficam no [dados.js](dados.js): `regrasPeso`, `equipamentos` e `missao1` (contagem, limites das tasks e das estrelas). São **valores didáticos** simplificados para jogabilidade e aprendizado, não dados reais da NASA; isso aparece nos créditos. Os textos ficam em `idiomas.pt` e `idiomas.en`, em `missao`, `marcosResultado` e `preparo`.

### O que a demo não tem (em relação ao Roblox)

- **Co-op:** a demo é para um jogador. As falas do Marcos foram passadas para o singular.
- **Andar dentro da cápsula:** as estações da Task 2 são abas, e a câmera vira sozinha para cada uma.
- **Ana, armário do traje e cutscene da decolagem:** o Manifesto de voo abre direto na escotilha, o jogador já está de traje e a decolagem acontece vista de dentro da cabine.

**Fontes do card e dos fatos:** foto do registro NASA 9248362 e relatório oficial no NTRS (20040110111). Fatos usados: Friendship 7 em 20/02/1962, 3 órbitas em 4 h 55 min; Glenn guiou a cápsula à mão quando ela saiu de atitude; apagão de rádio de 4 min 20 s; o sinal de escudo solto era um interruptor com defeito e o retropack ficou preso. A descrição da missão, o guia das tasks e os textos da tela de aprendizado são os do jogo no Roblox (`rookie-rocket-roblox/build/rookie/shared/Missoes.luau`): em inglês, iguais; em português, traduzidos.

A pasta [rookie-rocket-roblox/](rookie-rocket-roblox/) guarda o projeto do Roblox (scripts Luau, specs e o place). A demo web não depende dela.

## Fase 2 · Missão 2: Estação Espacial Internacional (ISS)

Usa o mesmo fluxo, o mesmo peso (20 kg de nave, limite de 60 kg, até 2 itens), o mesmo bônus de leveza e as mesmas estrelas (45 / 70 / 100 s) da Fase 1. Só mudam os equipamentos e as 3 tasks.

**Desbloqueio:** a ISS fica bloqueada até o jogador ganhar ao menos 1 estrela na Mercury. No Manifesto de voo, a aba **Missão** tem um seletor com as duas fases; a ISS bloqueada mostra "🔒 BLOQUEADA · Ganhe 1★ na Mercury". Depois de concluir a Fase 1, **Próxima fase** abre o manifesto já na ISS.

| Equipamento | Peso | Task | Efeito |
|---|---|---|---|
| ⏲️ Sensor de pressão | 15 kg | 1 | zona verde do controle de pressão **50% maior** |
| 🧤 Luvas aderentes | 20 kg | 2 | arrasta os cabos **2× mais rápido** sem escorregar |
| 🧰 Kit de vedação | 25 kg | 3 | perda de ar **40% menor** e vedação em **2,0 s** (em vez de 3,0 s) |

**Chegada:** contagem de 12 s (com Pular) e o aviso "ACOPLADO À ESTAÇÃO!".

**Task 1 · O Acoplamento (STS-88, 1998)**
- Alerta: **PRESSÃO DO BRAÇO ALTA DEMAIS**.
- No console do braço robótico, o jogador arrasta **4 esferas** até 4 alvos (✕) e mantém a **pressão na zona verde** (centro em 0,5; meia largura de 0,1, ou 0,15 com o sensor), ajustando a válvula.
- A pressão segue a válvula com atraso e sofre uma deriva que obriga a reajustar. Fora do verde o braço não obedece: a esfera que estava sendo carregada escorrega e volta.
- Ao completar, a Zarya desliza e trava no Unity do lado de fora.
- **Falha:** pressão no máximo (≥ 0,95) por 3 s seguidos, ou passar de 40 s.

**Task 2 · O Painel Solar Preso (STS-97, 2000)**
- Alerta: **CABOS DO PAINEL SOLAR SOLTOS**.
- Caminhada espacial: a cabine some e fica só o espaço, com a Terra ao fundo. O jogador arrasta **2 cabos** soltos, cada um até a sua polia verde.
- O cabo segue o dedo a no máximo 12 studs/s (os propulsores). Acima de 6 studs/s (12 com as luvas) por mais de 0,3 s, ele **escorrega e volta ao lugar**, sem fim de jogo. Uma barra de velocidade mostra o limite.
- **Falha:** passar de 45 s.

**Task 3 · O Vazamento de 2 mm (Soyuz MS-09, 2018)**
- Alerta: **PRESSÃO DA CABINE CAINDO**; o ar cai 2,5% por segundo.
- Em ordem: **fechar a escotilha** do módulo ao lado (corta a perda pela metade); **achar o furo** entre 4 painéis da parede (sorteado a cada tentativa, marcado por partículas de ar sendo sugadas); **pegar a gaze com epóxi** na caixa de ferramentas e **segurar** sobre o furo (3,0 s; 2,0 s com o kit). Soltar só pausa.
- **Falha:** a pressão da cabine chegar a 0%.

**Falas do Marcos na Fase 2:** as mesmas da Fase 1 para peso, tempo esgotado (com e sem o item) e sucesso, mais uma própria para a pressão no máximo na Task 1 ("Força demais esmaga o módulo! Na STS-88, a solução foi aliviar a pressão no braço…"). Na Task 3, ficar sem ar usa as falas de tempo esgotado.

**Fim:** parabéns com a ciência e o fato real de cada task, resultado com a conta e as estrelas, e o card **Construindo a ISS** (STS-88 · STS-97 · Soyuz MS-09; 1998 · 2000 · 2018), com a foto oficial `iss020e005813`, o que aconteceu, a ligação com as três tasks, o trade-off de massa e os links das três páginas da NASA. O card entra no Álbum espacial. **Próxima fase** abre o banner do Roblox (Fase 3).

**Onde mexer:** `missao2` e os itens com `missao: 2` em `equipamentos`, no [dados.js](dados.js); textos em `missao2` de cada idioma. A deriva da pressão é 0,25 na demo (0,32 no Roblox), porque aqui um jogador cuida das esferas e da pressão ao mesmo tempo.

**O que a demo não tem:** co-op, andar pela estação (Cupola, Airlock e túnel viram painéis) e flutuar com propulsores (na Task 2 o jogador arrasta os cabos em um quadro). No Roblox a Missão 2 ainda aguarda playtest completo, então a demo segue a spec, não um comportamento já validado no jogo.

## Link do Roblox

O link do jogo oficial fica em `linkRoblox`, no topo do [dados.js](dados.js). Se ficar vazio, o botão mostra "Link do jogo em breve". O botão **Jogar no Roblox** aparece em três lugares:

- no **totem "JOGO OFICIAL"** da recepção (à direita de quem entra): chegar perto e apertar **E**, ou tocar nele;
- no banner de **Próxima fase**, depois de concluir a **Fase 2** (a Fase 3 é no Roblox);
- no Manifesto de voo, como card "Fase 3", depois que a Fase 2 foi concluída.

O nome do desafio (**Space Mission Design Game**) aparece em destaque no botão **i** (créditos) e leva à página do desafio. Nome, evento e link ficam em `desafio`, no dados.js.

## O que tem no mapa

| # | Área | Destaques |
|---|------|-----------|
| 01 | **Recepção** (lobby da agência) | Marcos Pontes com "!" de missão, balão de fala em 5 partes com o nome do jogador, telão "BEM-VINDO(A), NOME!", globo holográfico, 2 totens (Marcos Pontes e entrada do Visitor Complex), **totem do jogo oficial no Roblox** |
| → | Corredor 1 | Setas neon e placas "Museu KSC" |
| 02 | **Museu: Kennedy Space Center Visitor Complex** | 6 exposições: Rocket Garden, Sigma 7 sobre Redstone, Controle de Missão Mercury, Hall da Fama com estátua, **Atlantis erguido e inclinado 43,21° com as portas abertas**, **Saturn V suspenso na horizontal** |
| → | Corredor 2 (na parede **oposta** à entrada) | "Corredor de embarque" |
| 03 | **Hangar** | Nave RR-01, **escada à direita da nave** até a plataforma, **elevador** (com botões de chamada no chão, embaixo e em cima) até o braço de acesso e a escotilha, que leva à **Fase 1** |

## Controles

- **WASD / setas**: andar. **Espaço**: pular. **E**: interagir com o prompt mais próximo.
- **Arrastar o mouse**: girar a câmera. **Roda do mouse**: zoom, de 48 até 6 studs. No mínimo, mais um passo da roda entra em **primeira pessoa**; rolar para trás volta.
- **Clique** em personagens, totens, Atlantis ou Saturn V para abrir as informações. A nave do hangar não é clicável (as informações dela ficam no totem ao lado).
- Os textos da interface não são selecionáveis nem copiáveis; só o campo do nome aceita edição.
- **Celular**: joystick, botão de pulo e toque nos prompts. Um dedo gira a câmera. **Pinça com dois dedos** dá zoom: afastar os dedos aproxima até a primeira pessoa, juntar os dedos volta. Não há botão para isso.
- Em primeira pessoa o boneco some, o corpo acompanha o olhar e dá para olhar para cima.

O progresso (nome, missões, exposições vistas) fica salvo no navegador.

**Atalhos para apresentar** (pulam a tela inicial; `g=m` é feminino e `g=h` é masculino):
- `index.html#lang=pt&g=m&jogar&tp=museu` (ou `recepcao`, `totem`, `hangar`, `elevador`, `braco`) · acrescente `&pp` para já começar em primeira pessoa
- `index.html#lang=en&g=h&jogar&expo=atlantis`
- `index.html#lang=pt&g=m&jogar&preparo=falha`: abre o Manifesto de voo com manual + escudo (65 kg: ao embarcar, o lançamento é cancelado) · `preparo=bom`: só o Giroscópio · `preparo=nada`: sem itens · `preparo`: últimas escolhas
- `index.html#lang=pt&g=m&jogar&missao`: abre a missão pela contagem · `missao=1`, `missao=2` ou `missao=3` pula direto para aquela task (acrescente `&abrir` para já passar do aviso inicial)
- `…&missao=fim&t=41`: mostra o aprendizado e o resultado com tempo total de 41 s (`t=120` mostra a falha por demora)
- **Fase 2 (ISS):** acrescente `&m=2` a qualquer atalho de missão ou de manifesto, por exemplo `…&missao=1&abrir&m=2` (Task 1 da ISS), `…&missao=fim&t=50&m=2` (resultado da ISS) ou `…&preparo&m=2` (manifesto da ISS). O atalho libera a ISS sem precisar da estrela.
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
| Card da Fase 1 (Friendship 7) | 9248362 |
| Card da Fase 2 (Construindo a ISS) | iss020e005813 |

Os textos estão em [dados.js](dados.js), em `idiomas.pt` e `idiomas.en`. Para trocar ou acrescentar uma exposição, edite só esse arquivo, sempre nos dois idiomas. Os textos em inglês seguem de perto as descrições originais da NASA.

## Pendências e avisos

- **A página do desafio não abriu daqui** (erro de certificado SSL/TLS). Por isso não confirmei a lista de recursos liberados pelo desafio. Até lá, usei apenas a API oficial da NASA, como pedido. Se puderem colar a lista de recursos da página, eu confiro e ajusto.
- **As falas do Marcos Pontes são fictícias** (aviso no balão e nos créditos). Os fatos citados nelas vêm dos registros da NASA acima.
- O museu **junta em um salão** atrações que no Visitor Complex real ficam em lugares diferentes (Rocket Garden, Heroes and Legends, Space Shuttle Atlantis, Apollo/Saturn V Center). É uma representação para o jogo, não uma réplica arquitetônica.
- A nave RR-01 é um **modelo original** inspirado no SLS com a Orion. O mapa-múndi do Controle Mercury é estilizado.
- A demo cobre as Missões 1 e 2 inteiras (3 tasks cada). A Fase 3 em diante fica só no jogo do Roblox.

## Para quem vai montar no Roblox Studio

A demo foi feita em **studs**, com os valores padrão do Roblox, então dá para copiar as medidas direto:

- 1 unidade = 1 stud. Personagem R6 com ~5,2 studs de altura.
- WalkSpeed **22** (um pouco acima do padrão 16 do Roblox), JumpPower **50**, Gravity **196,2**.
- Recepção 60×50 (pé-direito 22). Corredores 14×30 (altura 14). Museu 100×90 (altura 45). Hangar 80×60 (altura 60).
- Escada com 14 degraus (1 stud de altura × 2 de profundidade) até a plataforma em Y=14. Elevador de Y=14 até Y=41 a 6 studs/s.
- Prompts "E" = **ProximityPrompt**. Balão do Marcos = **BubbleChat** / `TextChatService`. Telão com o nome = **SurfaceGui**. Conquistas = **Badges**. Painel de progresso = **leaderstats**.

## Arquivos

- `index.html`: estrutura e HUD.
- `estilo.css`: visual da interface (HUD, balões, prompts, cards, celular).
- `dados.js`: textos em PT e EN (falas, exposições com fontes da NASA, placas, missões e conquistas) e os números da Preparação (`regrasPeso`, `equipamentos`).
- `jogo.js`: mundo 3D, personagens, física (escada e elevador), câmera, interações e salvamento.
- `lib/three.min.js`: three.js r128 (licença MIT).
- `lib/Michroma-Regular.ttf`: fonte dos títulos, no estilo do storyboard (SIL Open Font License, em `lib/Michroma-OFL.txt`).
- `nasa/`: 13 fotos baixadas da NASA Image and Video Library.
- `versao-anterior/`: a demo 2D anterior, guardada sem alterações.
