// =====================================================================
// ROOKIE ROCKET · conteúdo da demo (Português + English)
// ---------------------------------------------------------------------
// Regra do projeto: só usar dados liberados pelo desafio Space Apps ou
// dados de APIs oficiais da NASA.
//
// Todos os fatos e fotos das exposições vêm da NASA Image and Video
// Library (API oficial https://images-api.nasa.gov), consultada em
// 14/11/2026. Os textos em inglês seguem de perto as descrições originais
// da NASA; os em português são traduções. Conversões de unidade são só
// aritmética.
//
// As falas de Marcos Pontes são FICTÍCIAS, escritas para o jogo. Os fatos
// citados nelas vêm dos registros iss012e22280 e 20060409_exp12_11.
//
// Marcadores nos textos:  {nome} = nome do jogador
//                         {o}    = "o" ou "a" conforme o avatar (só PT)
// =====================================================================

const FONTE_API = 'NASA Image and Video Library (images-api.nasa.gov)';

const DADOS = {
  desafio: { url: 'https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/' },

  // Registros oficiais usados em cada exposição (iguais nos dois idiomas)
  registros: {
    pontes: [
      { id: 'iss012e22280', data: '2006-04-03', credito: 'NASA', foto: 'nasa/iss012e22280.jpg' },
      { id: '20060409_exp12_11', data: '2006-04-08', credito: 'NASA/Bill Ingalls', foto: 'nasa/20060409_exp12_11.jpg' }
    ],
    recepcao: [{ id: 'KSC-03pd2164', data: '2003-07-22', credito: 'NASA', foto: 'nasa/KSC-03pd2164.jpg' }],
    jardim: [{ id: 'KSC-03pd2174', data: '2003-07-22', credito: 'NASA', foto: 'nasa/KSC-03pd2174.jpg' }],
    sigma7: [{ id: 'KSC-20161107-PH_GEB02_0276', data: '2016-11-07', credito: 'NASA/Glenn Benson', foto: 'nasa/KSC-20161107-PH_GEB02_0276.jpg' }],
    controle: [{ id: 'KSC-20161107-PH_GEB02_0090', data: '2016-11-07', credito: 'NASA/Glenn Benson', foto: 'nasa/KSC-20161107-PH_GEB02_0090.jpg' }],
    halldafama: [{ id: 'KSC-20161107-PH_GEB02_0118', data: '2016-11-07', credito: 'NASA/Glenn Benson', foto: 'nasa/KSC-20161107-PH_GEB02_0118.jpg' }],
    atlantis: [
      { id: 'KSC-2012-6136', data: '2012-11-02', credito: 'NASA/Jim Grossmann', foto: 'nasa/KSC-2012-6136.jpg' },
      { id: 'KSC-2012-6362', data: '2012-11-29', credito: 'NASA/Dimitri Gerondidakis', foto: 'nasa/KSC-2012-6362.jpg' },
      { id: '2013-2311', data: '2013-05-10', credito: 'NASA/Kim Shiflett', foto: 'nasa/2013-2311.jpg' }
    ],
    saturnv: [{ id: 'KSC-98pc1004', data: '1998-08-07', credito: 'NASA', foto: 'nasa/KSC-98pc1004.jpg' }],
    artemis: [
      { id: 'NHQ202211160030', data: '2022-11-16', credito: 'NASA/Joel Kowsky', foto: 'nasa/NHQ202211160030.jpg' },
      { id: 'MAF_20221211_Splashdown02', data: '2022-12-11', credito: 'NASA/Michael DeMocker', foto: 'nasa/MAF_20221211_Splashdown02.jpg' }
    ]
  },

  // >>> LINK DO JOGO NO ROBLOX <<<
  // Quando o jogo oficial estiver pronto, cole o link entre as aspas (ex.: 'https://www.roblox.com/games/123456/Rookie-Rocket').
  // Enquanto estiver vazio, o banner mostra "link em breve".
  linkRoblox: '',

  // =====================================================================
  // PREPARAÇÃO DA FASE 1: equipamentos e peso
  // ATENÇÃO: são VALORES DIDÁTICOS para balancear o jogo, não dados reais da NASA.
  // Pode ajustar à vontade. O jogo.js lê tudo daqui.
  // =====================================================================
  regrasPeso: {
    pesoNave: 20,          // kg: peso da cápsula vazia
    limite: 60,            // kg: o máximo que o foguete Atlas consegue levar (acima disso não decola)
    faixaVerde: 50,        // kg: barra verde até aqui · amarela até o limite · vermelha acima do limite
    kgPorBonus: 10,        // a cada 10 kg livres (limite − peso)...
    segundosPorBonus: 1    // ...o jogador ganha 1 s de desconto no tempo final
  },
  equipamentos: [
    // efeito.tremorFator: multiplica o tremor da cabine (0.3 = 70% menos)
    // efeito.raioFator: multiplica o raio de acerto dos pontos (1.3 = 30% maior)
    { id: 'amortecedor', icone: '🛡️', peso: 25, efeito: { tremorFator: 0.3, raioFator: 1.3 } },
    // efeito.limiteTempo: novo tempo máximo da missão, em segundos (o normal é 40)
    { id: 'combustivel', icone: '⛽', peso: 20, efeito: { limiteTempo: 55 } },
    // efeito.segurar: segundos segurando a mira para travar cada ponto (o normal é 2)
    { id: 'giroscopio', icone: '🧭', peso: 15, efeito: { segurar: 1.3 } }
  ],

  equipe: ['Anna Clara Diniz', 'Hurias Felipe Silveira', 'Luis Renato Fernandes', 'Nando Nogueira', 'Túlio Amaral', 'Valter Cauã Alves'],

  // Álbum espacial: um card de missão real por fase concluída. O total de espaços define o "Missões 0/2".
  // Fase 1 → Friendship 7 (foto: NASA Image and Video Library 9248362; "o que aconteceu": relatório NTRS abaixo).
  album: [
    { id: 'missao1', ano: '1962', foto: 'nasa/9248362.jpg', registro: { id: '9248362', data: '1962-02-20', credito: 'NASA/MSFC' } },
    { id: 'missao2' } // espaço reservado para o card da próxima fase
  ],
  // NASA Technical Reports Server (API oficial https://ntrs.nasa.gov/api): "Summary results of the first United States manned orbital space flight"
  ntrs: { id: '20040110111', url: 'https://ntrs.nasa.gov/citations/20040110111' },

  exposMuseu: ['jardim', 'sigma7', 'controle', 'halldafama', 'atlantis', 'saturnv'],
  missoes: [{ id: 'falar' }, { id: 'museu' }, { id: 'expo', meta: 6 }, { id: 'hangar' }, { id: 'escada' }, { id: 'elevador' }, { id: 'missao1' }],

  idiomas: {
    /* ============================== PORTUGUÊS ============================== */
    pt: {
      codigo: 'pt-BR',
      nomePadrao: 'Estagiári{o}',
      ui: {
        tagline: 'PROGRAMA ESTAGIÁRIO ASTRONAUTA',
        idioma_label: 'IDIOMA', nome_titulo: 'NOME DE ASTRONAUTA', genero_label: 'PERSONAGEM', fem: 'Feminino', masc: 'Masculino',
        nome_label: 'Qual é o seu nome de astronauta?', nome_ph: 'Digite seu nome',
        jogar: '▶ JOGAR', carregando: 'Carregando a base…', escolha_genero: 'Escolha Feminino ou Masculino para jogar',
        start_texto: 'Seu primeiro dia na agência espacial começa agora. Fale com o guia, explore o museu do Kennedy Space Center e encontre sua nave no hangar.',
        start_nota: 'Demo local do jogo que está sendo criado no Roblox · Fatos e fotos: NASA Image and Video Library',
        missoes_titulo: 'OBJETIVOS', ls_nome: 'Astronauta', ls_miss: 'Missões', btn_album: 'Álbum espacial', cr_equipe: 'EQUIPE',
        hint_andar: 'andar', hint_pular: 'pular', hint_interagir: 'interagir', hint_capacete: 'capacete', hint_camera: 'arraste para girar · roda = zoom',
        conquista: 'CONQUISTA DESBLOQUEADA',
        mapa_tag: 'TELEPORTE RÁPIDO', mapa_titulo: 'Mapa da base',
        tp_recepcao: 'Recepção', tp_recepcao_s: 'Lobby da agência + Marcos Pontes',
        tp_museu: 'Museu KSC', tp_museu_s: 'Kennedy Space Center Visitor Complex',
        tp_hangar: 'Hangar', tp_hangar_s: 'Nave RR-01 e escada',
        tp_elevador: 'Plataforma', tp_elevador_s: 'Elevador para o braço de acesso',
        tp_braco: 'Embarque', tp_braco_s: 'Escotilha da nave · Fase 1',
        mapa_nota: 'A recepção leva ao museu por um corredor. Na parede oposta do museu, outro corredor leva ao hangar.',
        cr_tag: 'TRANSPARÊNCIA', cr_titulo: 'Fontes e créditos',
        cr_p1: 'Esta é uma <b>demo local</b> de um jogo em desenvolvimento no Roblox para o NASA Space Apps Challenge 2026 · Space Mission Design Game. Não é um produto oficial da NASA nem do Kennedy Space Center Visitor Complex.',
        cr_p2: 'Todos os fatos e fotos das exposições vêm da <b>NASA Image and Video Library</b> (API oficial images-api.nasa.gov). Cada card mostra o ID do registro, a data e o crédito.',
        cr_p3: 'Cenários, personagens, trajes e a nave RR-01 são criações originais em estilo de blocos. O museu é uma representação simplificada, não uma réplica arquitetônica.',
        cr_p4: 'As falas do personagem Marcos Pontes são <b>fictícias</b>, escritas para o jogo. Os fatos citados nelas vêm dos registros da NASA iss012e22280 e 20060409_exp12_11.',
        cr_p5: 'Motor 3D: three.js r128 (licença MIT). Fontes: Outfit e Michroma (SIL Open Font License). Tudo incluído na pasta lib.',
        cr_p6: 'Pesos e efeitos dos equipamentos são valores didáticos simplificados, não dados reais da NASA.',
        cr_desafio: 'Página do desafio',
        continuar: 'Continuar explorando', fechar: 'Fechar',
        btn_mapa: 'Mapa (M)', btn_creditos: 'Fontes e créditos', btn_idioma: 'Trocar idioma', btn_capacete: 'Capacete (H)',
        fonte: 'Fonte', credito: 'Crédito', foto: 'Foto', foto_nasa: 'foto NASA'
      },
      marcos: [
        'E aí, {nome}! 👋 Aqui é o Marcos Pontes, o primeiro astronauta brasileiro a ir para o espaço.',
        'Tenho uma notícia incrível: você foi selecionad{o} para o Programa Estagiário Astronauta! A partir de hoje, você faz parte da tripulação. 🚀',
        'Em 2006 eu vivi um pouco mais de uma semana na Estação Espacial Internacional. Tudo começou com curiosidade, igualzinho a você agora.',
        'Sua primeira missão: atravesse o corredor e explore o museu do Kennedy Space Center. Lá tem foguete de verdade, cápsula histórica e até um ônibus espacial!',
        'Depois, siga pelo corredor do outro lado do museu até o hangar. Sua nave está te esperando lá. Bora decolar, {nome}? 🌎✨'
      ],
      balao: { quem: 'MARCOS PONTES', proximo: 'clique ou E ▶', fim: 'fala fictícia criada para o jogo · fechar ✕', guia: 'GUIA DE MISSÃO' },
      expos: {
        pontes: { titulo: 'Quem é Marcos Pontes?', sala: 'Recepção', fatos: [
          'Foi o primeiro astronauta do Brasil a ir ao espaço, pela Agência Espacial Brasileira.',
          'Em 3 de abril de 2006 trabalhou no laboratório Destiny da Estação Espacial Internacional, logo depois de chegar.',
          'Voltou à Terra em 9 de abril de 2006, na nave Soyuz TMA-7, pousando nas estepes do Cazaquistão depois de um pouco mais de uma semana na estação.'] },
        recepcao: { titulo: 'A entrada do Visitor Complex', sala: 'Recepção', fatos: [
          'A praça de ingressos é a porta de entrada do Kennedy Space Center Visitor Complex.',
          'Lá dentro, um centro de orientação tem equipe que atende visitantes em vários idiomas. É a inspiração para esta recepção!'] },
        jardim: { titulo: 'Rocket Garden · Jardim de Foguetes', sala: 'Museu', fatos: [
          'O Rocket Garden reúne oito foguetes autênticos do passado, incluindo um Mercury-Atlas.',
          'Tem réplicas das cápsulas Mercury, Gemini e Apollo em que dá para entrar, além de painéis informativos.'] },
        sigma7: { titulo: 'Sigma 7 · Projeto Mercury', sala: 'Museu · Heroes and Legends', fatos: [
          'A cápsula Sigma 7 foi pilotada por Wally Schirra numa missão de seis órbitas em 3 de outubro de 1962.',
          'No museu ela aparece sobre um foguete Redstone, como o que levou Alan Shepard e Gus Grissom em voos suborbitais em 1961.',
          'Na vida real, a Sigma 7 foi lançada por um Atlas, mais potente, para conseguir chegar à órbita.'] },
        controle: { titulo: 'Controle de Missão Mercury', sala: 'Museu · Heroes and Legends', fatos: [
          'A exposição tem os consoles originais da sala de Controle de Missão do Projeto Mercury.',
          'No mapa-múndi, a equipe acompanhava o caminho das cápsulas entre as estações de rastreamento.'] },
        halldafama: { titulo: 'Hall da Fama dos Astronautas', sala: 'Museu · Heroes and Legends', fatos: [
          'Uma estátua de Alan Shepard, a primeira pessoa dos Estados Unidos a ir ao espaço, fica logo na entrada do U.S. Astronaut Hall of Fame.',
          'A área Heroes and Legends homenageia os pioneiros dos programas Mercury, Gemini e Apollo.'] },
        atlantis: { titulo: 'Ônibus espacial Atlantis', sala: 'Museu · Space Shuttle Atlantis', fatos: [
          'Em 26 anos de carreira, o Atlantis voou 33 missões, passou 307 dias no espaço e percorreu 125.935.769 milhas (cerca de 202,7 milhões de km).',
          'Em novembro de 2012 viajou 10 milhas (16 km) do Vehicle Assembly Building até o Visitor Complex, e foi recebido com fogos de artifício.',
          'Fica erguido a 26 pés (7,9 m) do chão e inclinado exatamente 43,21° para o lado, com as portas do compartimento de carga abertas, como no espaço. É o que você vê aqui!',
          'A exposição tem 90.000 pés² (cerca de 8.400 m²) e abriu em 29 de junho de 2013.'] },
        saturnv: { titulo: 'Saturn V · Apollo/Saturn V Center', sala: 'Museu · Apollo/Saturn V Center', fatos: [
          'O Apollo/Saturn V Center exibe um foguete Saturn V da era Apollo, restaurado, com 363 pés de comprimento (cerca de 110 m).',
          'Ele fica deitado, na horizontal, dentro de um prédio de 100.000 pés² (cerca de 9.300 m²), com artefatos históricos e dois cinemas.',
          'O centro fica a cerca de 2 milhas (3 km) ao norte do Vehicle Assembly Building.'] },
        artemis: { titulo: 'Inspiração da nave: Artemis I', sala: 'Hangar', fatos: [
          'A nave RR-01 do jogo é um modelo original inspirado no foguete SLS com a cápsula Orion.',
          'Na Artemis I, o SLS e a Orion decolaram em 16 de novembro de 2022, à 1h47 no horário da Flórida (3h47 em Brasília), da plataforma 39B do Kennedy Space Center.',
          'Foi o primeiro voo de teste integrado dos sistemas de exploração do espaço profundo da NASA: Orion, SLS e sistemas de solo.',
          'A Orion voltou em 11 de dezembro de 2022, depois de 25,5 dias. Nenhuma nave feita para humanos tinha ido tão longe no espaço profundo.'] }
      },
      missoes: { falar: 'Fale com Marcos Pontes', museu: 'Entre no museu do Kennedy Space Center', expo: 'Explore as exposições do museu', expo_cont: 'exposições', hangar: 'Chegue ao hangar da nave', escada: 'Suba a escada da plataforma', elevador: 'Use o elevador até o braço de acesso', missao1: 'Embarque na nave e conclua a Fase 1' },
      conquistas: { falar: 'Recrutad{o}!', museu: 'Visitante do KSC', expo: 'Historiador{a} Espacial', hangar: 'Dentro do Hangar', escada: 'Fôlego de Astronauta', elevador: 'Pront{o} para Embarcar', missao1: 'Pilot{o} do Projeto Mercury' },
      zonas: {
        recepcao: ['AGÊNCIA ROOKIE ROCKET', 'Recepção'], c1: ['EM TRÂNSITO', 'Corredor para o museu'],
        museu: ['KENNEDY SPACE CENTER VISITOR COMPLEX', 'Museu'], c2: ['EM TRÂNSITO', 'Corredor de embarque'], hangar: ['SETOR DE LANÇAMENTO', 'Hangar da nave']
      },
      prompt: {
        ver: 'Ver exposição', conversar: 'Conversar', proxima: 'Próxima fala', marcos: 'Marcos Pontes · Guia',
        embarcar: 'Embarcar', escotilha: 'Fase 1 · Projeto Mercury', subir: 'Subir', descer: 'Descer', chamar: 'Chamar elevador', elevador: 'Elevador', movendo: 'Em movimento…', tocar: 'Tocar'
      },
      msg: {
        chamado: '👋 Marcos Pontes quer falar com você! Vá até ele e aperte E.',
        chamado_toque: '👋 Marcos Pontes quer falar com você! Vá até ele e toque no botão.',
        subindo: '⬆️ Subindo para o braço de acesso…', descendo: '⬇️ Descendo para a plataforma…',
        perto: 'Chegue mais perto para interagir! 🚶', capacete: '🪖 Capacete travado! Preparando o embarque…'
      },
      missao: {
        fase: 'FASE 1 · PROJETO MERCURY', task: 'O Colapso do Piloto Automático', sair: 'Sair',
        alerta: '⚠ FALHA NO PILOTO AUTOMÁTICO', restaurado: '✔ PILOTO AUTOMÁTICO RESTAURADO',
        dica: 'Mova a câmera: leve o + até um ponto vermelho e segure {s} s',
        dica_toque: 'Arraste a tela: leve o + até um ponto vermelho e segure {s} s',
        segure: 'Segure firme…', pontos: 'PONTOS', tempo: 'TEMPO',
        sucesso_titulo: 'Missão concluída com sucesso!', novo_card: 'Novo card no seu Álbum Espacial',
        voltar: 'Voltar a explorar', proxima: 'Próxima fase',
        // estrelas: 3 ≤ 10 s · 2 ≤ 17 s · 1 ≤ 25 s · mais que isso = falhou (aos 40 s a missão é encerrada)
        falhou_titulo: 'MISSÃO FALHOU',
        tentar: 'Tentar de novo', sair_mapa: 'Sair para o mapa', trocar: 'Trocar equipamentos',
        // conta do resultado. {t} tempo · {b} bônus · {f} tempo final · {e} estrelas
        conta: 'Tempo {t} − {b} s de bônus de leveza = {f} · {e}',
        conta_peso: 'Peso {p} kg · limite {l} kg · o foguete não decolou',
        sem_estrelas: 'sem estrelas', bonus_hud: 'BÔNUS',
        escolha_titulo: 'Fase 1 concluída!', escolha_txt: 'Seu melhor resultado:', refazer: 'Refazer fase 1'
      },
      // Falas do Marcos no resultado (fictícias, escritas para o jogo).
      // Marcadores: {nome} {o} {peso} {limite} {tempo} {limiteTempo} {extra} {estrelas} {bonusKg} {bonusS}
      marcosResultado: {
        peso: '{nome}, o foguete Atlas só consegue levar {limite} kg e a sua nave estava com {peso} kg. Pesado demais, ele nem saiu da plataforma! Na engenharia espacial, cada quilo conta: escolha os equipamentos que mais ajudam e deixe o resto em terra.',
        tempo: 'A nave ficou fora de controle por tempo demais, {nome}. No Projeto Mercury, o astronauta precisava agir rápido quando o piloto automático falhava.',
        lento: 'Você salvou a nave, mas demorou {tempo}. Para ganhar estrelas, o tempo final precisa ficar abaixo de {limiteEstrela} s.',
        // dicas: o jogo escolhe só UMA, a mais útil para a tentativa
        dica_combustivel: 'Dica: o combustível extra teria te dado mais {extra} segundos.',
        dica_proximos: 'Dica: tente travar primeiro os pontos mais próximos da mira.',
        dica_giroscopio: 'Dica: o giroscópio trava cada ponto mais rápido.',
        dica_leveza: 'Dica: uma nave mais leve ganha bônus de tempo: cada {bonusKg} kg livres valem {bonusS} s.',
        sucesso: 'Mandou bem, {nome}! Tempo final de {tempo} e {estrelas} de 3 estrelas. Você pilotou como um{a} verdadeir{o} astronauta do Projeto Mercury!'
      },
      preparo: {
        titulo: 'Preparação da missão',
        objetivo: 'Escolha o que levar na nave. Depois, trave os 4 pontos vermelhos com a mira + o mais rápido que puder.',
        nave: 'Peso da nave: {n} kg', limite: 'Limite do foguete Atlas: {n} kg',
        peso: 'Peso: {p} / {l} kg · Livre: {f} kg', acima: 'Peso: {p} / {l} kg · {x} kg acima do limite!',
        bonus: 'Bônus de leveza: −{b} s',
        dica: 'Nave mais leve manobra melhor: cada {kg} kg livres tiram {s} s do seu tempo final.',
        lancar: '🚀 Lançar',
        itens: {
          amortecedor: { nome: 'Amortecedor', txt: 'A cabine treme menos e fica mais fácil mirar.' },
          combustivel: { nome: 'Combustível extra', txt: 'Mais tempo antes da nave sair de controle.' },
          giroscopio: { nome: 'Giroscópio', txt: 'Trava cada ponto mais rápido.' }
        }
      },
      // Cards das missões reais (álbum). Fase 1: foto e objetivo do registro NASA 9248362; "o que aconteceu" do relatório NTRS 20040110111.
      cards: {
        missao1: {
          nome: 'Friendship 7 · Mercury-Atlas 6',
          objetivo: 'Fazer o primeiro voo orbital tripulado dos EUA: John Glenn deu três voltas na Terra em cerca de 5 horas.',
          aconteceu: 'O relatório da NASA registra dificuldades durante o voo e mudanças na sequência planejada. A conclusão: o astronauta ajuda a missão a dar certo com sua capacidade de controlar a nave e seus sistemas.',
          vazio: 'Conclua a Fase 1'
        },
        missao2: { nome: 'Fase 2', vazio: 'Card da Fase 2' }
      },
      album: { titulo: 'Álbum Espacial', sub: 'Conclua as fases para colecionar os cards das missões reais.', real: 'MISSÃO REAL', objetivo: 'Objetivo: ', aconteceu: 'O que aconteceu: ' },
      roblox: { titulo: 'A aventura continua no Roblox!', texto: 'As próximas fases estão no jogo oficial do Rookie Rocket.', botao: 'Jogar no Roblox', em_breve: 'Link do jogo em breve' },
      placas: {
        totem_topo: '★ EXPOSIÇÃO ★', totem_pe: 'Aperte E para ver',
        recepcao: 'RECEPÇÃO', programa: 'PROGRAMA ESTAGIÁRIO ASTRONAUTA',
        telao_topo: 'PRIMEIRO DIA · PROGRAMA ESTAGIÁRIO ASTRONAUTA', telao_bemvindo: 'BEM-VIND{O}, ', telao_pe: '↓ Corredor para o museu do Kennedy Space Center',
        poster1a: 'SEU PRIMEIRO', poster1b: 'DIA NO ESPAÇO', poster2a: 'CURIOSIDADE', poster2b: 'É COMBUSTÍVEL',
        c1a1: 'PRÓXIMA PARADA', c1a2: 'MUSEU KSC', c1a3: 'Kennedy Space Center · Flórida', c1b1: 'VISITOR', c1b2: 'COMPLEX', c1b3: '→ siga as setas',
        museu1: 'KENNEDY SPACE CENTER', museu2: 'VISITOR COMPLEX · FLÓRIDA', museu3: 'museu representado no jogo · explore as 6 exposições ★',
        voltar: '↩ RECEPÇÃO', hangar1: '→ HANGAR DA NAVE', hangar2: 'Corredor de embarque',
        heroes2: 'Mercury · Gemini · Apollo', sigma2: 'Mercury · 1962',
        mapa: 'MERCURY CONTROL · MAPA DE RASTREAMENTO (estilizado)',
        estatua1: 'ESTÁTUA DE ALAN SHEPARD', estatua2: 'representação',
        atlantis2: 'inclinado 43,21° · portas abertas',
        c2a1: 'CORREDOR DE EMBARQUE', c2b2: '→ escada e elevador',
        nave1: 'NAVE DE TREINAMENTO RR-01', nave2: 'modelo original do jogo · inspirado no SLS + Orion',
        escada1: 'ESCADA ↑', escada2: 'plataforma do elevador',
        braco1: 'BRAÇO DE ACESSO', braco2: 'FASE 1 · PROJETO MERCURY', elevador: 'ELEVADOR'
      }
    },

    /* =============================== ENGLISH =============================== */
    en: {
      codigo: 'en-US',
      nomePadrao: 'Rookie',
      ui: {
        tagline: 'ROOKIE ASTRONAUT PROGRAM',
        idioma_label: 'LANGUAGE', nome_titulo: 'ASTRONAUT NAME', genero_label: 'CHARACTER', fem: 'Female', masc: 'Male',
        nome_label: 'What is your astronaut name?', nome_ph: 'Type your name',
        jogar: '▶ PLAY', carregando: 'Loading the base…', escolha_genero: 'Choose Female or Male to play',
        start_texto: 'Your first day at the space agency starts now. Talk to your guide, explore the Kennedy Space Center museum and find your ship in the hangar.',
        start_nota: 'Local demo of the game being built on Roblox · Facts and photos: NASA Image and Video Library',
        missoes_titulo: 'OBJECTIVES', ls_nome: 'Astronaut', ls_miss: 'Missions', btn_album: 'Space album', cr_equipe: 'TEAM',
        hint_andar: 'walk', hint_pular: 'jump', hint_interagir: 'interact', hint_capacete: 'helmet', hint_camera: 'drag to turn · wheel = zoom',
        conquista: 'BADGE UNLOCKED',
        mapa_tag: 'QUICK TELEPORT', mapa_titulo: 'Base map',
        tp_recepcao: 'Reception', tp_recepcao_s: 'Agency lobby + Marcos Pontes',
        tp_museu: 'KSC Museum', tp_museu_s: 'Kennedy Space Center Visitor Complex',
        tp_hangar: 'Hangar', tp_hangar_s: 'RR-01 ship and stairs',
        tp_elevador: 'Platform', tp_elevador_s: 'Elevator to the access arm',
        tp_braco: 'Boarding', tp_braco_s: 'Ship hatch · Phase 1',
        mapa_nota: 'The reception leads to the museum through a hallway. On the opposite wall of the museum, another hallway leads to the hangar.',
        cr_tag: 'TRANSPARENCY', cr_titulo: 'Sources and credits',
        cr_p1: 'This is a <b>local demo</b> of a game in development on Roblox for the NASA Space Apps Challenge 2026 · Space Mission Design Game. It is not an official product of NASA or the Kennedy Space Center Visitor Complex.',
        cr_p2: 'All exhibit facts and photos come from the <b>NASA Image and Video Library</b> (official API images-api.nasa.gov). Each card shows the record ID, date and credit.',
        cr_p3: 'Scenery, characters, suits and the RR-01 ship are original block-style creations. The museum is a simplified representation, not an architectural replica.',
        cr_p4: 'The lines spoken by the Marcos Pontes character are <b>fictional</b>, written for the game. The facts they mention come from NASA records iss012e22280 and 20060409_exp12_11.',
        cr_p5: '3D engine: three.js r128 (MIT license). Fonts: Outfit and Michroma (SIL Open Font License). All included in the lib folder.',
        cr_p6: 'Equipment weights and effects are simplified teaching values, not real NASA data.',
        cr_desafio: 'Challenge page',
        continuar: 'Keep exploring', fechar: 'Close',
        btn_mapa: 'Map (M)', btn_creditos: 'Sources and credits', btn_idioma: 'Change language', btn_capacete: 'Helmet (H)',
        fonte: 'Source', credito: 'Credit', foto: 'Photo', foto_nasa: 'NASA photo'
      },
      marcos: [
        'Hey, {nome}! 👋 Marcos Pontes here, Brazil’s first astronaut in space.',
        'Big news: you’ve been selected for the Rookie Astronaut Program! Starting today, you’re part of the crew. 🚀',
        'In 2006 I spent a little over a week aboard the International Space Station. It all started with curiosity, just like yours right now.',
        'Your first mission: cross the hallway and explore the Kennedy Space Center museum. There are real rockets, a historic capsule and even a space shuttle!',
        'Then take the hallway on the other side of the museum to the hangar. Your ship is waiting for you. Ready for liftoff, {nome}? 🌎✨'
      ],
      balao: { quem: 'MARCOS PONTES', proximo: 'click or E ▶', fim: 'fictional line written for the game · close ✕', guia: 'MISSION GUIDE' },
      expos: {
        pontes: { titulo: 'Who is Marcos Pontes?', sala: 'Reception', fatos: [
          'Brazil’s first astronaut in space, flying for the Brazilian Space Agency.',
          'On April 3, 2006, he worked in the Destiny laboratory of the International Space Station soon after his arrival.',
          'He returned to Earth on April 9, 2006, aboard the Soyuz TMA-7 spacecraft, landing on the steppes of Kazakhstan after a little over a week on the station.'] },
        recepcao: { titulo: 'The Visitor Complex entrance', sala: 'Reception', fatos: [
          'The ticket plaza is the entrance to the Kennedy Space Center Visitor Complex.',
          'Inside, an orientation center has a multilingual guest service staff to greet guests. It inspired this reception!'] },
        jardim: { titulo: 'Rocket Garden', sala: 'Museum', fatos: [
          'The Rocket Garden features eight authentic rockets from the past, including a Mercury-Atlas rocket.',
          'It also has climb-in Mercury, Gemini and Apollo capsule replicas, seating pods and informative graphics.'] },
        sigma7: { titulo: 'Sigma 7 · Project Mercury', sala: 'Museum · Heroes and Legends', fatos: [
          'The Sigma 7 Mercury spacecraft was piloted by astronaut Wally Schirra during his six-orbit mission on Oct. 3, 1962.',
          'For display, it sits on a Redstone launch vehicle like the one that boosted Alan Shepard and Gus Grissom on sub-orbital flights in 1961.',
          'In real life, Sigma 7 was launched by the more powerful Atlas rocket in order to reach orbit.'] },
        controle: { titulo: 'Mercury Mission Control', sala: 'Museum · Heroes and Legends', fatos: [
          'The exhibit includes the original consoles of the Mercury Mission Control room.',
          'On the world map, the team followed the capsules’ paths between tracking stations.'] },
        halldafama: { titulo: 'Astronaut Hall of Fame', sala: 'Museum · Heroes and Legends', fatos: [
          'A statue of Alan Shepard, America’s first person in space, stands just inside the doors to the U.S. Astronaut Hall of Fame.',
          'Heroes and Legends honors the pioneering efforts of Mercury, Gemini and Apollo.'] },
        atlantis: { titulo: 'Space Shuttle Atlantis', sala: 'Museum · Space Shuttle Atlantis', fatos: [
          'Over its 26-year career, Atlantis flew 33 missions, spent 307 days in space and traveled 125,935,769 miles.',
          'In November 2012 it made the 10-mile trip from the Vehicle Assembly Building to the Visitor Complex, celebrated with fireworks.',
          'It is lifted 26 feet off the ground and tilted exactly 43.21 degrees to its port side, with its payload bay doors open, just like in space. That’s what you see here!',
          'The 90,000-square-foot exhibit opened on June 29, 2013.'] },
        saturnv: { titulo: 'Saturn V · Apollo/Saturn V Center', sala: 'Museum · Apollo/Saturn V Center', fatos: [
          'The Apollo/Saturn V Center displays a refurbished 363-foot-long Apollo-era Saturn V rocket.',
          'It lies horizontally inside a 100,000-square-foot building with artifacts, historical displays and two film theaters.',
          'The center is about 2 miles north of the Vehicle Assembly Building.'] },
        artemis: { titulo: 'Ship inspiration: Artemis I', sala: 'Hangar', fatos: [
          'The game’s RR-01 ship is an original model inspired by the SLS rocket with the Orion spacecraft.',
          'On Artemis I, SLS and Orion launched on Nov. 16, 2022, at 1:47 a.m. EST from Launch Pad 39B at Kennedy Space Center.',
          'It was the first integrated flight test of NASA’s deep space exploration systems: Orion, SLS and ground systems.',
          'Orion splashed down on Dec. 11, 2022, after a 25.5-day mission that took it farther into deep space than any human-rated spacecraft had ever flown.'] }
      },
      missoes: { falar: 'Talk to Marcos Pontes', museu: 'Enter the Kennedy Space Center museum', expo: 'Explore the museum exhibits', expo_cont: 'exhibits', hangar: 'Reach the ship hangar', escada: 'Climb the platform stairs', elevador: 'Ride the elevator to the access arm', missao1: 'Board the ship and complete Phase 1' },
      conquistas: { falar: 'Recruited!', museu: 'KSC Visitor', expo: 'Space Historian', hangar: 'Inside the Hangar', escada: 'Astronaut Stamina', elevador: 'Ready to Board', missao1: 'Project Mercury Pilot' },
      zonas: {
        recepcao: ['ROOKIE ROCKET AGENCY', 'Reception'], c1: ['IN TRANSIT', 'Hallway to the museum'],
        museu: ['KENNEDY SPACE CENTER VISITOR COMPLEX', 'Museum'], c2: ['IN TRANSIT', 'Boarding hallway'], hangar: ['LAUNCH SECTOR', 'Ship hangar']
      },
      prompt: {
        ver: 'View exhibit', conversar: 'Talk', proxima: 'Next line', marcos: 'Marcos Pontes · Guide',
        embarcar: 'Board', escotilha: 'Phase 1 · Project Mercury', subir: 'Go up', descer: 'Go down', chamar: 'Call elevator', elevador: 'Elevator', movendo: 'Moving…', tocar: 'Tap'
      },
      msg: {
        chamado: '👋 Marcos Pontes wants to talk to you! Walk up to him and press E.',
        chamado_toque: '👋 Marcos Pontes wants to talk to you! Walk up to him and tap the button.',
        subindo: '⬆️ Going up to the access arm…', descendo: '⬇️ Going down to the platform…',
        perto: 'Get closer to interact! 🚶', capacete: '🪖 Helmet locked! Getting ready to board…'
      },
      missao: {
        fase: 'PHASE 1 · PROJECT MERCURY', task: 'Autopilot Meltdown', sair: 'Exit',
        alerta: '⚠ AUTOPILOT FAILURE', restaurado: '✔ AUTOPILOT RESTORED',
        dica: 'Move the camera: put the + on a red dot and hold for {s} s',
        dica_toque: 'Drag the screen: put the + on a red dot and hold for {s} s',
        segure: 'Hold steady…', pontos: 'DOTS', tempo: 'TIME',
        sucesso_titulo: 'Mission accomplished!', novo_card: 'New card in your Space Album',
        voltar: 'Keep exploring', proxima: 'Next phase',
        // stars: 3 ≤ 10 s · 2 ≤ 17 s · 1 ≤ 25 s · slower = failed (the mission ends at 40 s)
        falhou_titulo: 'MISSION FAILED',
        tentar: 'Try again', sair_mapa: 'Back to the map', trocar: 'Change equipment',
        // result math. {t} time · {b} bonus · {f} final time · {e} stars
        conta: 'Time {t} − {b} s lightness bonus = {f} · {e}',
        conta_peso: 'Weight {p} kg · limit {l} kg · the rocket did not lift off',
        sem_estrelas: 'no stars', bonus_hud: 'BONUS',
        escolha_titulo: 'Phase 1 complete!', escolha_txt: 'Your best result:', refazer: 'Replay Phase 1'
      },
      // Marcos lines on the result screen (fictional, written for the game).
      marcosResultado: {
        peso: '{nome}, the Atlas rocket can only carry {limite} kg and your spacecraft weighed {peso} kg. Too heavy: it never left the pad! In space engineering every kilogram counts: pick the equipment that helps most and leave the rest on the ground.',
        tempo: 'The spacecraft was out of control for too long, {nome}. In Project Mercury, astronauts had to act fast when the autopilot failed.',
        lento: 'You saved the spacecraft, but it took {tempo}. To earn stars, your final time must be under {limiteEstrela} s.',
        dica_combustivel: 'Tip: the extra fuel would have given you {extra} more seconds.',
        dica_proximos: 'Tip: try locking the dots closest to your crosshair first.',
        dica_giroscopio: 'Tip: the gyroscope locks each dot faster.',
        dica_leveza: 'Tip: a lighter spacecraft earns a time bonus: every {bonusKg} kg free is worth {bonusS} s.',
        sucesso: 'Great job, {nome}! Final time {tempo} and {estrelas} of 3 stars. You flew like a real Project Mercury astronaut!'
      },
      preparo: {
        titulo: 'Mission preparation',
        objetivo: 'Choose what to carry on the spacecraft. Then lock the 4 red dots with the + crosshair as fast as you can.',
        nave: 'Spacecraft weight: {n} kg', limite: 'Atlas rocket limit: {n} kg',
        peso: 'Weight: {p} / {l} kg · Free: {f} kg', acima: 'Weight: {p} / {l} kg · {x} kg over the limit!',
        bonus: 'Lightness bonus: −{b} s',
        dica: 'A lighter spacecraft handles better: every {kg} kg free takes {s} s off your final time.',
        lancar: '🚀 Launch',
        itens: {
          amortecedor: { nome: 'Shock absorber', txt: 'The cabin shakes less and aiming gets easier.' },
          combustivel: { nome: 'Extra fuel', txt: 'More time before the spacecraft goes out of control.' },
          giroscopio: { nome: 'Gyroscope', txt: 'Locks each dot faster.' }
        }
      },
      // Real mission cards (album). Phase 1: photo and goal from NASA record 9248362; "what happened" from NTRS report 20040110111.
      cards: {
        missao1: {
          nome: 'Friendship 7 · Mercury-Atlas 6',
          objetivo: 'Fly the first U.S. manned orbital flight: John Glenn orbited the Earth three times in about 5 hours.',
          aconteceu: 'NASA’s report records a few difficulties during the flight and deviations from the planned sequence. Its conclusion: the astronaut contributes to mission success through the capacity to control the spacecraft and its systems.',
          vazio: 'Complete Phase 1'
        },
        missao2: { nome: 'Phase 2', vazio: 'Phase 2 card' }
      },
      album: { titulo: 'Space Album', sub: 'Complete the phases to collect the real mission cards.', real: 'REAL MISSION', objetivo: 'Goal: ', aconteceu: 'What happened: ' },
      roblox: { titulo: 'The adventure continues on Roblox!', texto: 'The next phases are in the official Rookie Rocket game.', botao: 'Play on Roblox', em_breve: 'Game link coming soon' },
      placas: {
        totem_topo: '★ EXHIBIT ★', totem_pe: 'Press E to view',
        recepcao: 'RECEPTION', programa: 'ROOKIE ASTRONAUT PROGRAM',
        telao_topo: 'DAY ONE · ROOKIE ASTRONAUT PROGRAM', telao_bemvindo: 'WELCOME ABOARD, ', telao_pe: '↓ Hallway to the Kennedy Space Center museum',
        poster1a: 'YOUR FIRST', poster1b: 'DAY IN SPACE', poster2a: 'CURIOSITY', poster2b: 'IS YOUR FUEL',
        c1a1: 'NEXT STOP', c1a2: 'KSC MUSEUM', c1a3: 'Kennedy Space Center · Florida', c1b1: 'VISITOR', c1b2: 'COMPLEX', c1b3: '→ follow the arrows',
        museu1: 'KENNEDY SPACE CENTER', museu2: 'VISITOR COMPLEX · FLORIDA', museu3: 'museum as represented in the game · explore all 6 exhibits ★',
        voltar: '↩ RECEPTION', hangar1: '→ SHIP HANGAR', hangar2: 'Boarding hallway',
        heroes2: 'Mercury · Gemini · Apollo', sigma2: 'Mercury · 1962',
        mapa: 'MERCURY CONTROL · TRACKING MAP (stylized)',
        estatua1: 'ALAN SHEPARD STATUE', estatua2: 'representation',
        atlantis2: 'tilted 43.21° · payload bay doors open',
        c2a1: 'BOARDING HALLWAY', c2b2: '→ stairs and elevator',
        nave1: 'RR-01 TRAINING SHIP', nave2: 'original game model · inspired by SLS + Orion',
        escada1: 'STAIRS ↑', escada2: 'elevator platform',
        braco1: 'ACCESS ARM', braco2: 'PHASE 1 · PROJECT MERCURY', elevador: 'ELEVATOR'
      }
    }
  }
};
