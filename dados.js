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
  desafio: { nome: 'Space Mission Design Game', evento: 'NASA Space Apps Challenge 2026', url: 'https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/' },

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
  // Link do jogo oficial. Aparece no banner "Jogar no Roblox" (fim da fase 1 e totem da recepção).
  // Se ficar vazio (''), o banner mostra "link em breve".
  linkRoblox: 'https://www.roblox.com/share?code=a84324d6a84b554796b4115f8931b4ff&type=ExperienceDetails&stamp=1794753740191',

  // =====================================================================
  // MISSÃO 1 · PROJETO MERCURY (FRIENDSHIP 7): peso, equipamentos, tempos e estrelas
  // ATENÇÃO: são VALORES DIDÁTICOS para balancear o jogo, não dados reais da NASA.
  // Pode ajustar à vontade. O jogo.js lê tudo daqui.
  // =====================================================================
  regrasPeso: {
    pesoNave: 20,          // kg: peso da cápsula vazia
    limite: 60,            // kg: o máximo que o foguete consegue levar (acima disso não decola)
    faixaVerde: 50,        // kg: barra verde até aqui · amarela até o limite · vermelha acima do limite
    kgPorBonus: 10,        // a cada 10 kg livres (limite − peso)...
    segundosPorBonus: 2,   // ...o jogador ganha 2 s de desconto no tempo final
    maxItens: 2            // no máximo 2 equipamentos (20 + 25 = 65 kg é o erro didático)
  },
  equipamentos: [
    // task: em qual task o equipamento ajuda (aparece no card e nas dicas do Marcos)
    // efeito.segurar: segundos para travar cada alvo da Task 1 (o normal é 2,0)
    // efeito.ima: "ímã" da mira. Com 1, a mira pula para o centro do ponto quando o "+" encosta no círculo cinza. 0 desliga.
    // missao: a qual missão o equipamento pertence (1 = Mercury, 2 = ISS)
    { id: 'giroscopio', missao: 1, icone: '🧭', peso: 15, task: 1, efeito: { segurar: 1.2, ima: 1 } },
    // efeito.limiteT2: tempo máximo da Task 2 em segundos (o normal é 30) · destaque: marca o código na prancheta
    { id: 'manual', missao: 1, icone: '📘', peso: 20, task: 2, efeito: { limiteT2: 45, destaque: true } },
    // efeito.segurarT3: segundos segurando o retropack na Task 3 (o normal é 10) · tremorT3: multiplica o tremor (0.5 = metade, igual ao jogo)
    { id: 'escudo', missao: 1, icone: '🛡️', peso: 25, task: 3, efeito: { segurarT3: 6, tremorT3: 0.5 } },
    // ---- Missão 2 (ISS) ----
    // efeito.zonaI1: multiplica a zona verde da pressão na Task 1 (1.5 = 50% maior)
    { id: 'sensor', missao: 2, icone: '⏲️', peso: 15, task: 1, efeito: { zonaI1: 1.5 } },
    // efeito.velI2: multiplica a velocidade máxima para arrastar os cabos na Task 2 (2 = o dobro)
    { id: 'luvas', missao: 2, icone: '🧤', peso: 20, task: 2, efeito: { velI2: 2 } },
    // efeito.perdaI3: multiplica a perda de ar na Task 3 (0.6 = 40% menor) · vedarI3: segundos para vedar (o normal é 3,0)
    { id: 'kit', missao: 2, icone: '🧰', peso: 25, task: 3, efeito: { perdaI3: 0.6, vedarI3: 2.0 } }
  ],
  missao1: {
    contagem: 12,              // s: contagem regressiva do lançamento (dá para pular)
    estrelas: [45, 70, 100],   // tempo final (T1 + T2 + T3 − bônus): ≤45 s = 3★ · ≤70 s = 2★ · ≤100 s = 1★ · acima = falha
    t1: { limite: 40, segurar: 2.0 },   // Task 1: falha ao passar de 40 s · 2,0 s para travar cada alvo
    t2: { limite: 30, digitos: 4 },     // Task 2: falha aos 30 s · código de 4 dígitos sorteado
    t3: { decidir: 10, segurar: 10 }    // Task 3: 10 s para decidir · segurar o retropack por 10 s
  },
  // MISSÃO 2 · ESTAÇÃO ESPACIAL INTERNACIONAL (ISS). Liberada com 1 estrela ou mais na Mercury.
  missao2: {
    contagem: 12,              // s: lançamento e chegada à estação (dá para pular)
    estrelas: [45, 70, 100],   // iguais aos da missão 1
    // Task 1 (acoplamento): pressão de 0 a 1. Zona verde = centro ± zona. Falha se ficar em "max" ou mais por maxSegundos, ou ao passar do limite.
    // resposta: quão rápido a pressão segue a válvula · deriva: tamanho da oscilação que obriga a reajustar (no Roblox é 0.32; aqui é menor porque um jogador faz tudo sozinho)
    t1: { limite: 40, centro: 0.5, zona: 0.1, max: 0.95, maxSegundos: 3, resposta: 1.3, deriva: 0.25 },
    // Task 2 (caminhada espacial): velMax em studs/s carregando o cabo · tolerancia: segundos acima do limite até escorregar
    // largura: quantos studs o quadro representa de lado a lado · encaixe: distância (studs) para prender na polia
    // velEVA: velocidade máxima dos propulsores (studs/s); o cabo segue o dedo no máximo nessa velocidade
    t2: { limite: 45, velMax: 6, velEVA: 12, tolerancia: 0.3, largura: 24, encaixe: 4.5 },
    // Task 3 (vazamento): perda de ar em % por segundo · escotilha fechada multiplica a perda por 0.5 · vedar: segundos segurando a gaze
    t3: { perda: 2.5, escotilha: 0.5, vedar: 3.0, lugares: 4 }
  },

  equipe: ['Anna Clara Diniz', 'Hurias Felipe Silveira', 'Luis Renato Fernandes', 'Nando Nogueira', 'Túlio Amaral', 'Valter Cauã Alves'],

  // Álbum espacial: um card de missão real por fase concluída. O total de espaços define o "Missões 0/2".
  // Fase 1 → Friendship 7 (foto: NASA Image and Video Library 9248362; "o que aconteceu": relatório NTRS abaixo).
  album: [
    { id: 'missao1', ano: '1962', foto: 'nasa/9248362.jpg', registro: { id: '9248362', data: '1962-02-20', credito: 'NASA/MSFC' } },
    // Fase 2 → Construindo a ISS (foto: NASA Image and Video Library iss020e005813, treliças P4, P5 e P6; fontes: páginas oficiais da NASA)
    { id: 'missao2', ano: '1998 · 2000 · 2018', foto: 'nasa/iss020e005813.jpg', registro: { id: 'iss020e005813', data: '2009-05-31', credito: 'NASA' },
      fontes: [
        { rot: 'STS-88', url: 'https://www.nasa.gov/mission/sts-88/' },
        { rot: 'STS-97', url: 'https://www.nasa.gov/mission/sts-97/' },
        { rot: 'Soyuz MS-09', url: 'https://www.nasa.gov/blogs/spacestation/2018/08/30/international-space-station-status-3/' }
      ] }
  ],
  // NASA Technical Reports Server (API oficial https://ntrs.nasa.gov/api): "Summary results of the first United States manned orbital space flight"
  ntrs: { id: '20040110111', url: 'https://ntrs.nasa.gov/citations/20040110111' },

  exposMuseu: ['jardim', 'sigma7', 'controle', 'halldafama', 'atlantis', 'saturnv'],
  missoes: [{ id: 'falar' }, { id: 'museu' }, { id: 'expo', meta: 6 }, { id: 'hangar' }, { id: 'escada' }, { id: 'elevador' }, { id: 'missao1' }, { id: 'missao2' }],

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
        hint_andar: 'andar', hint_pular: 'pular', hint_interagir: 'interagir', hint_capacete: 'capacete', hint_camera: 'arraste para girar · roda = zoom até 1ª pessoa',
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
        cr_p6: 'Todos os pesos, tempos, velocidades e efeitos de equipamentos são valores didáticos simplificados para jogabilidade e aprendizado, não dados reais da NASA.',
        cr_desafio: 'Página do desafio', cr_desafio_rot: 'DESAFIO ESCOLHIDO',
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
      missoes: { falar: 'Fale com Marcos Pontes', museu: 'Entre no museu do Kennedy Space Center', expo: 'Explore as exposições do museu', expo_cont: 'exposições', hangar: 'Chegue ao hangar da nave', escada: 'Suba a escada da plataforma', elevador: 'Use o elevador até o braço de acesso', missao1: 'Embarque na nave e conclua a Fase 1', missao2: 'Embarque de novo e conclua a Fase 2 (ISS)' },
      conquistas: { falar: 'Recrutad{o}!', museu: 'Visitante do KSC', expo: 'Historiador{a} Espacial', hangar: 'Dentro do Hangar', escada: 'Fôlego de Astronauta', elevador: 'Pront{o} para Embarcar', missao1: 'Pilot{o} do Projeto Mercury', missao2: 'Tripulante da ISS' },
      zonas: {
        recepcao: ['AGÊNCIA ROOKIE ROCKET', 'Recepção'], c1: ['EM TRÂNSITO', 'Corredor para o museu'],
        museu: ['KENNEDY SPACE CENTER VISITOR COMPLEX', 'Museu'], c2: ['EM TRÂNSITO', 'Corredor de embarque'], hangar: ['SETOR DE LANÇAMENTO', 'Hangar da nave']
      },
      prompt: {
        ver: 'Ver exposição', conversar: 'Conversar', proxima: 'Próxima fala', marcos: 'Marcos Pontes · Guia',
        embarcar: 'Embarcar', escotilha: 'Fase 1 · Projeto Mercury', subir: 'Subir', descer: 'Descer', chamar: 'Chamar elevador', elevador: 'Elevador', movendo: 'Em movimento…', tocar: 'Tocar',
        jogar: 'Jogar no Roblox', jogo: 'Jogo oficial do Rookie Rocket'
      },
      msg: {
        chamado: '👋 Marcos Pontes quer falar com você! Vá até ele e aperte E.',
        chamado_toque: '👋 Marcos Pontes quer falar com você! Vá até ele e toque no botão.',
        subindo: '⬆️ Subindo para o braço de acesso…', descendo: '⬇️ Descendo para a plataforma…',
        perto: 'Chegue mais perto para interagir! 🚶', capacete: '🪖 Capacete travado! Preparando o embarque…',
        primeira_pessoa: '👀 Primeira pessoa! Role a roda para trás para voltar.',
        primeira_pessoa_toque: '👀 Primeira pessoa! Junte dois dedos na tela para voltar.',
        dica_pinca: '🤏 Dica: afaste dois dedos na tela para dar zoom até a primeira pessoa.'
      },
      missao: {
        fase: 'FASE 1 · PROJETO MERCURY', sair: 'Sair', task_n: 'TASK {n}/3',
        // as 3 tasks: nome, alerta que pisca, aviso de sucesso e resumo (guia do manifesto de voo)
        tasks: {
          t1: { nome: 'A Falha do Piloto Automático', alerta: '⚠ FALHA NO CONTROLE AUTOMÁTICO', ok: '✔ CONTROLE AUTOMÁTICO RESTAURADO', guia: 'Mantenha o + nos marcadores vermelhos até cada círculo encher.' },
          t2: { nome: 'O Blackout de Comunicação', alerta: '⚠ PERDA DE CONTATO COM A TERRA', ok: '✔ CONTATO RESTABELECIDO', guia: 'Leia o código na prancheta e digite no rádio.' },
          t3: { nome: 'O Alarme do Escudo Térmico', alerta: '⚠ PERIGO: SENSOR DO ESCUDO TÉRMICO INSTÁVEL', ok: '✔ REENTRADA CONCLUÍDA', guia: 'Segure o botão do retropack até a barra encher.' }
        },
        contagem: 'LANÇAMENTO EM', decolagem: 'DECOLAGEM!', pular: 'Pular ▶',
        alerta_peso: '⚠ PESO ACIMA DO LIMITE · LANÇAMENTO CANCELADO', dica_peso: 'O foguete está pesado demais para decolar!',
        barra_estrelas: 'Estrelas que ainda dá para ganhar',
        // Task 1
        dica: 'Mova a câmera: leve o + até um ponto vermelho e segure {s} s',
        dica_toque: 'Arraste a tela: leve o + até um ponto vermelho e segure {s} s',
        segure: 'Segure firme…', pontos: 'PONTOS', tempo: 'TEMPO', limite: 'LIMITE', bonus_hud: 'BÔNUS',
        // Task 2
        t2_dica: 'Ache o código REINÍCIO DO RÁDIO na prancheta e digite no rádio.',
        t2_aba_prancheta: '📋 Mesa de navegação', t2_aba_radio: '📻 Rádio',
        t2_prancheta_titulo: 'PLANO DE VOO · FRIENDSHIP 7', t2_alvo: 'REINÍCIO DO RÁDIO',
        t2_linhas: ['VERIF. DE ÓRBITA', 'PRESSÃO DA CABINE', 'SEQUÊNCIA RETRO', 'COMBUSTÍVEL RCS'],
        t2_manual: '◀ manual de bordo', t2_estatica: 'SEM SINAL · digite o código', t2_invalido: 'Código inválido',
        t2_ok: '“Friendship 7, estamos ouvindo você. Bem-vindo de volta.”', t2_enviar: 'ENVIAR',
        ejetar: 'EJETAR CÁPSULA',
        // Task 3
        t3_decida: 'Decida em {s} s: ejetar a cápsula ou manter o retropack?',
        t3_manter: 'MANTER RETROPACK', t3_barra: 'RETROPACK',
        t3_segure: 'Segure o botão verde até a barra encher', t3_segurando: 'Segurando… não solte!', t3_pausado: 'Pausado: segure de novo!',
        // fim: parabéns + aprendizado, depois o resultado
        parabens_titulo: 'Parabéns, {nome}!', parabens_sub: 'Você concluiu sua primeira missão! Cada task usou ciência e engenharia de verdade. Veja o que você praticou hoje:', ciencia: 'Ciência: ', fato: 'Fato real: ', ver_resultado: 'Ver resultado ▶',
        // Tradução dos textos do jogo no Roblox (rookie-rocket-roblox/build/rookie/shared/Missoes.luau, Aprendizado).
        aprender: {
          t1: { areas: 'Física (inércia / mecânica) · Engenharia de Automação e Controle',
            ciencia: 'No espaço nada freia um giro: pela inércia, um pequeno desvio continua crescendo até que um jato empurre de volta. Um sistema de controle fecha o ciclo: sensor → decisão → jato.',
            fato: 'Na Friendship 7, quando a cápsula saiu de atitude, John Glenn a guiou de volta à mão.' },
          t2: { areas: 'Física (ondas eletromagnéticas) · Engenharia de Telecomunicações',
            ciencia: 'Na reentrada, o ar em volta da cápsula vira um gás quente e ionizado (plasma), que bloqueia as ondas de rádio até a cápsula perder velocidade.',
            fato: 'O apagão de rádio previsto para o voo de Glenn durou 4 minutos e 20 segundos.' },
          t3: { areas: 'Física (termodinâmica) · Engenharia de Materiais',
            ciencia: 'O ar comprimido na frente da cápsula fica extremamente quente. O escudo térmico é feito para absorver esse calor e levá-lo embora enquanto sua superfície queima aos poucos.',
            fato: 'Um sinal com defeito indicou que o escudo térmico estava solto, então os controladores mantiveram o retropack preso durante a reentrada. O sinal era falso.' }
        },
        sucesso_titulo: 'Missão concluída com sucesso!', novo_card: 'A missão real · novo card no seu Álbum Espacial',
        voltar: 'Voltar a explorar', proxima: 'Próxima fase',
        falhou_titulo: 'MISSÃO FALHOU',
        tentar_task: 'Repetir task', reiniciar: 'Reiniciar missão', sair_mapa: 'Sair para o mapa',
        // conta do resultado. {a} {b} {c} tempos das tasks · {l} bônus de leveza · {f} tempo final · {e} estrelas
        conta: 'T1 {a} + T2 {b} + T3 {c} − {l} s de leveza = {f} · {e}',
        conta_peso: 'Peso {p} kg · limite {l} kg · o foguete não decolou',
        conta_task: 'Falha na Task {n} · {nome}',
        sem_estrelas: 'demorou demais',
        escolha_titulo: 'Fase 1 concluída!', escolha_txt: 'Seu melhor resultado:', refazer: 'Refazer fase 1'
      },
      // MISSÃO 2 (ISS): só o que muda em relação à missão 1. O que não estiver aqui vem de "missao" (botões, conta, etc.).
      // Textos traduzidos do jogo no Roblox (Missoes.luau).
      missao2: {
        fase: 'FASE 2 · ESTAÇÃO ESPACIAL (ISS)',
        tasks: {
          t1: { nome: 'O Acoplamento (STS-88)', alerta: '⚠ PRESSÃO DO BRAÇO ALTA DEMAIS', ok: '✔ ZARYA ACOPLADA AO UNITY', guia: 'Alinhe as 4 esferas e mantenha a pressão no verde.' },
          t2: { nome: 'O Painel Solar Preso (STS-97)', alerta: '⚠ CABOS DO PAINEL SOLAR SOLTOS', ok: '✔ CABOS PRESOS NAS POLIAS', guia: 'Vá para fora e arraste os cabos até as polias.' },
          t3: { nome: 'O Vazamento de 2 mm (Soyuz MS-09)', alerta: '⚠ PRESSÃO DA CABINE CAINDO', ok: '✔ VAZAMENTO VEDADO', guia: 'Feche a escotilha, ache o vazamento e vede.' }
        },
        contagem: 'CHEGADA À ESTAÇÃO EM', decolagem: 'ACOPLADO À ESTAÇÃO!',
        // Task 1: console do braço robótico
        i1_dica: 'Arraste as 4 esferas até os ✕ e mantenha a pressão na zona verde.',
        i1_pressao: 'PRESSÃO DO BRAÇO', i1_valvula: 'VÁLVULA: arraste para ajustar',
        i1_fora: 'Pressão fora da zona verde: a esfera escorregou.', i1_perigo: 'PRESSÃO NO MÁXIMO! Alivie a válvula!', i1_esfera: 'Esfera {n}',
        // Task 2: caminhada espacial
        i2_dica: 'Arraste cada cabo solto até a sua polia verde. Rápido demais e ele escorrega!',
        i2_vel: 'VELOCIDADE', i2_escorregou: 'O cabo escorregou! Vá mais devagar ao carregar.', i2_cabo: 'Cabo {n}',
        // Task 3: vazamento
        i3_dica1: '1. Feche a escotilha do módulo ao lado.', i3_dica2: '2. Ache o furo: procure o ar sendo sugado e toque nele.',
        i3_dica3: '3. Pegue a gaze com epóxi na caixa de ferramentas.', i3_dica4: '4. Segure a gaze sobre o furo até vedar.',
        i3_pressao: 'PRESSÃO DA CABINE', i3_escotilha: '🚪 Fechar escotilha', i3_escotilha_ok: '✔ Escotilha fechada', i3_gaze: '🧰 Pegar gaze com epóxi', i3_gaze_ok: '✔ Gaze na mão',
        i3_feche: 'Feche primeiro a escotilha do módulo ao lado!', i3_precisa: 'Pegue primeiro a gaze com epóxi na caixa de ferramentas.',
        i3_nada: 'Nada aqui. Procure o ar sendo sugado.', i3_achou: 'Furo de 2 mm encontrado!', i3_vedar: 'VEDAÇÃO', i3_painel: 'Painel {n} da parede',
        parabens_sub: 'Você manteve a estação espacial segura! Cada task foi inspirada em um momento real da história da ISS. Veja a ciência por trás de cada uma:',
        aprender: {
          t1: { areas: 'Física (forças / ação e reação) · Engenharia Robótica',
            ciencia: 'Cada empurrão que o braço dá em um módulo empurra o braço de volta (3ª lei de Newton). Força suave e constante alinha as peças sem estragar nada.',
            fato: 'Na STS-88 (dezembro de 1998), o braço robótico do ônibus espacial capturou a Zarya e a uniu ao Unity. Os encaixes não alinharam de primeira, então o braço soltou a Zarya e tentou de novo.' },
          t2: { areas: 'Física (massa e momento) · Engenharia Mecânica',
            ciencia: 'Em órbita um cabo não tem peso, mas ainda tem massa: se você o move rápido, o momento dificulta parar e ele escapa.',
            fato: 'Na STS-97 (dezembro de 2000), a manta de um novo painel solar do P6 ficou frouxa. Na terceira caminhada espacial, Joe Tanner e Carlos Noriega puxaram os cabos de tensão de volta aos carretéis.' },
          t3: { areas: 'Física (pressão dos gases) · Engenharia de Suporte à Vida',
            ciencia: 'O ar sempre vai da pressão alta para a baixa. Um furo pequeno para o vácuo do espaço deixa o ar da cabine escapar devagar, e fechar escotilhas isola o módulo com vazamento.',
            fato: 'Em agosto de 2018, a tripulação achou um furo de cerca de 2 mm no módulo orbital da Soyuz MS-09. O comandante Sergey Prokopyev o tapou com epóxi em uma gaze.' }
        }
      },
      // Falas do Marcos no resultado (fictícias, escritas para o jogo).
      // Marcadores: {nome} {peso} {limite} {equipamento} {tempo} {limiteEstrela} {estrelas}
      marcosResultado: {
        pressao_max: 'Força demais esmaga o módulo! Na STS-88, a solução foi aliviar a pressão no braço, não empurrar com mais força.',
        peso: '{nome}, o foguete só leva {limite} kg e a nave estava com {peso} kg. Ele nem saiu da plataforma! Na engenharia espacial cada quilo conta: escolha apenas o que mais ajuda.',
        ejetar2: 'Ejetar durante a reentrada seria fatal. O John Glenn ficou 4 minutos sem rádio e confiou no treinamento. Às vezes a resposta certa é manter a calma e seguir o procedimento.',
        ejetar3: 'Era um erro do sensor! O escudo estava preso. Quem ejeta no pânico perde a missão. Manter o retropack foi a decisão real da NASA.',
        tempo_sem: 'Faltou tempo, {nome}. O {equipamento} teria ajudado justamente aqui. Na próxima, pense em qual task é mais difícil para você antes de escolher.',
        tempo_com: 'Quase lá, {nome}! Mesmo com o {equipamento}, o tempo apertou. Respire, organize os passos e tente novamente.',
        lento: 'Missão concluída, mas demorou demais, {nome}: {tempo} passa do limite de {limiteEstrela} s. Planeje os passos antes de os alarmes começarem.',
        sucesso: 'Excelente trabalho, {nome}! Você tomou decisões de verdadeir{o} astronauta da NASA. Confira o registro histórico dessa missão no seu álbum!'
      },
      preparo: {
        titulo: 'Manifesto de voo',
        aba_missao: '1 · Missão', aba_itens: '2 · Equipamentos',
        descricao: 'Em 1962, John Glenn se tornou o primeiro americano a orbitar a Terra, a bordo da Friendship 7. Durante o voo ele guiou a cápsula à mão, atravessou um apagão de rádio e enfrentou um alarme do escudo térmico.',
        continuar: 'Escolher equipamentos ▶', voltar: '◀ Missão',
        nave: 'Peso da nave: {n} kg', limite: 'Limite do foguete: {n} kg',
        peso: 'Peso: {p} / {l} kg · Livre: {f} kg', acima: 'Peso: {p} / {l} kg · {x} kg acima do limite!',
        bonus: 'Bônus de leveza: −{b} s',
        dica: 'Leve no máximo {max} equipamentos. Cada {kg} kg livres tiram {s} s do seu tempo final.',
        max_itens: 'Só cabem {max} equipamentos! Desmarque um para trocar.',
        check_traje: 'Traje espacial vestido', check_itens: 'Equipamentos: {n} de {max}', check_peso_ok: 'Peso dentro do limite', check_peso_ruim: 'Peso acima do limite',
        lancar: '🚀 Embarcar',
        itens: {
          giroscopio: { nome: 'Giroscópio', txt: 'Trava cada ponto em 1,2 s (em vez de 2 s) e a mira gruda no centro.' },
          manual: { nome: 'Manual de bordo', txt: 'Destaca o código na prancheta e dá mais 15 s.' },
          escudo: { nome: 'Escudo reforçado', txt: 'Segurar o retropack leva 6 s (em vez de 10 s) e a cabine treme menos.' },
          sensor: { nome: 'Sensor de pressão', txt: 'A zona verde do controle de pressão fica 50% maior.' },
          luvas: { nome: 'Luvas aderentes', txt: 'Arrasta os cabos soltos 2× mais rápido sem escorregar.' },
          kit: { nome: 'Kit de vedação', txt: 'Perda de ar 40% menor e vedação em 2 s (em vez de 3 s).' }
        },
        // seletor de missão (aba 1)
        missoes: {
          m1: { nome: 'Projeto Mercury (Friendship 7)', sub: 'A primeira órbita americana em volta da Terra' },
          m2: { nome: 'Estação Espacial Internacional (ISS)', sub: 'Monte e conserte a estação espacial' },
          m3: { nome: 'Fase 3', sub: 'Continua no jogo oficial do Roblox ↗' }
        },
        bloqueada: '🔒 BLOQUEADA · Ganhe 1★ na Mercury', escolher: 'Escolha a missão',
        descricao2: 'Em 1998, os dois primeiros módulos da ISS foram unidos com um braço robótico. Depois, tripulações consertaram cabos frouxos de um painel solar e vedaram um vazamento minúsculo de 2 mm.'
      },
      // Cards das missões reais (álbum). Fase 1: foto e objetivo do registro NASA 9248362; "o que aconteceu" do relatório NTRS 20040110111.
      cards: {
        missao1: {
          nome: 'Friendship 7 · Mercury-Atlas 6',
          objetivo: 'Fazer o primeiro voo orbital tripulado dos EUA. Em 20/02/1962, John Glenn deu 3 voltas na Terra em 4 h 55 min.',
          aconteceu: 'A cápsula saiu da posição correta e Glenn a guiou à mão. Na reentrada, ele ficou 4 min 20 s sem rádio. Um aviso indicou que o escudo térmico estava solto, mas era um interruptor com defeito: o retropack ficou preso por segurança e o pouso foi um sucesso.',
          relacao: 'Task 1 é o controle manual da cápsula, Task 2 o apagão de rádio da reentrada e Task 3 o alarme do escudo térmico com o retropack mantido.',
          tradeoff: 'Cada quilo lançado pede mais combustível, então as primeiras cápsulas levavam só o essencial. No jogo, cada item ajuda em uma task, mas custa peso e bônus de leveza.',
          vazio: 'Conclua a Fase 1'
        },
        // Fase 2: textos traduzidos do card "Building the ISS" do jogo no Roblox (Missoes.luau)
        missao2: {
          nome: 'Construindo a ISS · STS-88 · STS-97 · Soyuz MS-09',
          aconteceu: 'Em dezembro de 1998, a tripulação da STS-88 usou o braço robótico do ônibus espacial para unir o módulo americano Unity ao módulo russo Zarya: as duas primeiras peças da ISS. Em dezembro de 2000, a STS-97 instalou a treliça P6 com os primeiros painéis solares americanos da estação, e astronautas em caminhada espacial retensionaram uma manta frouxa. Em agosto de 2018, um furo de 2 mm na Soyuz MS-09 causou um vazamento lento de pressão; a tripulação o encontrou e vedou com epóxi em uma gaze.',
          relacao: 'Task 1 é o acoplamento Unity–Zarya, Task 2 os cabos do painel solar da STS-97 e Task 3 o vazamento da Soyuz MS-09.',
          tradeoff: 'Tudo na estação foi lançado da Terra: cada ferramenta e peça compete por massa com comida, água e ciência. No jogo, o limite de 60 kg obriga a escolher só dois itens.',
          vazio: 'Conclua a Fase 2'
        }
      },
      album: { titulo: 'Álbum Espacial', sub: 'Conclua as fases para colecionar os cards das missões reais.', real: 'MISSÃO REAL', objetivo: 'Objetivo: ', aconteceu: 'O que aconteceu: ', relacao: 'No jogo: ', tradeoff: 'Trade-off de massa: ' },
      roblox: { titulo: 'A aventura continua no Roblox!', texto: 'Você concluiu as duas fases da demo! A Fase 3 e as próximas estão no jogo oficial do Rookie Rocket.', botao: 'Jogar no Roblox', em_breve: 'Link do jogo em breve',
        // textos do totem da recepção (antes de terminar a fase 1)
        titulo_totem: 'Jogue o Rookie Rocket de verdade!', texto_totem: 'Esta é só a demo. O jogo oficial, com a aventura completa, está no Roblox.' },
      placas: {
        totem_topo: '★ EXPOSIÇÃO ★', totem_pe: 'Aperte E para ver',
        jogo_topo: 'JOGO OFICIAL', jogo_l1: 'JOGUE DE', jogo_l2: 'VERDADE!', jogo_botao: '▶ NO ROBLOX', jogo_pe: 'Aperte E', jogo_pe_toque: 'Toque aqui',
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
        hint_andar: 'walk', hint_pular: 'jump', hint_interagir: 'interact', hint_capacete: 'helmet', hint_camera: 'drag to turn · wheel = zoom to 1st person',
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
        cr_p6: 'All weights, times, speeds and equipment effects are simplified teaching values for gameplay and learning, not real NASA data.',
        cr_desafio: 'Challenge page', cr_desafio_rot: 'OUR CHALLENGE',
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
      missoes: { falar: 'Talk to Marcos Pontes', museu: 'Enter the Kennedy Space Center museum', expo: 'Explore the museum exhibits', expo_cont: 'exhibits', hangar: 'Reach the ship hangar', escada: 'Climb the platform stairs', elevador: 'Ride the elevator to the access arm', missao1: 'Board the ship and complete Phase 1', missao2: 'Board again and complete Phase 2 (ISS)' },
      conquistas: { falar: 'Recruited!', museu: 'KSC Visitor', expo: 'Space Historian', hangar: 'Inside the Hangar', escada: 'Astronaut Stamina', elevador: 'Ready to Board', missao1: 'Project Mercury Pilot', missao2: 'ISS Crew Member' },
      zonas: {
        recepcao: ['ROOKIE ROCKET AGENCY', 'Reception'], c1: ['IN TRANSIT', 'Hallway to the museum'],
        museu: ['KENNEDY SPACE CENTER VISITOR COMPLEX', 'Museum'], c2: ['IN TRANSIT', 'Boarding hallway'], hangar: ['LAUNCH SECTOR', 'Ship hangar']
      },
      prompt: {
        ver: 'View exhibit', conversar: 'Talk', proxima: 'Next line', marcos: 'Marcos Pontes · Guide',
        embarcar: 'Board', escotilha: 'Phase 1 · Project Mercury', subir: 'Go up', descer: 'Go down', chamar: 'Call elevator', elevador: 'Elevator', movendo: 'Moving…', tocar: 'Tap',
        jogar: 'Play on Roblox', jogo: 'Official Rookie Rocket game'
      },
      msg: {
        chamado: '👋 Marcos Pontes wants to talk to you! Walk up to him and press E.',
        chamado_toque: '👋 Marcos Pontes wants to talk to you! Walk up to him and tap the button.',
        subindo: '⬆️ Going up to the access arm…', descendo: '⬇️ Going down to the platform…',
        perto: 'Get closer to interact! 🚶', capacete: '🪖 Helmet locked! Getting ready to board…',
        primeira_pessoa: '👀 First person! Scroll back to zoom out.',
        primeira_pessoa_toque: '👀 First person! Pinch two fingers together to zoom out.',
        dica_pinca: '🤏 Tip: spread two fingers on the screen to zoom into first person.'
      },
      missao: {
        fase: 'PHASE 1 · PROJECT MERCURY', sair: 'Exit', task_n: 'TASK {n}/3',
        tasks: {
          t1: { nome: 'The Autopilot Failure', alerta: '⚠ AUTOMATIC CONTROL FAILURE', ok: '✔ AUTOMATIC CONTROL RESTORED', guia: 'Keep the + on the red markers until each circle fills.' },
          t2: { nome: 'The Communication Blackout', alerta: '⚠ LOSS OF CONTACT WITH EARTH', ok: '✔ CONTACT RESTORED', guia: 'Read the code on the clipboard and type it on the radio.' },
          t3: { nome: 'The Heat Shield Alarm', alerta: '⚠ DANGER: HEAT SHIELD SENSOR UNSTABLE', ok: '✔ REENTRY COMPLETE', guia: 'Hold the retropack button until the bar fills.' }
        },
        contagem: 'LAUNCH IN', decolagem: 'LIFTOFF!', pular: 'Skip ▶',
        alerta_peso: '⚠ OVER WEIGHT LIMIT · LAUNCH ABORTED', dica_peso: 'The rocket is too heavy to lift off!',
        barra_estrelas: 'Stars you can still earn',
        dica: 'Move the camera: put the + on a red dot and hold for {s} s',
        dica_toque: 'Drag the screen: put the + on a red dot and hold for {s} s',
        segure: 'Hold steady…', pontos: 'DOTS', tempo: 'TIME', limite: 'LIMIT', bonus_hud: 'BONUS',
        t2_dica: 'Find the RADIO RESET code on the clipboard and type it into the radio.',
        t2_aba_prancheta: '📋 Navigation table', t2_aba_radio: '📻 Radio',
        t2_prancheta_titulo: 'FLIGHT PLAN · FRIENDSHIP 7', t2_alvo: 'RADIO RESET',
        t2_linhas: ['ORBIT CHECK', 'CABIN PRESSURE', 'RETRO SEQUENCE', 'RCS FUEL'],
        t2_manual: '◀ flight manual', t2_estatica: 'NO SIGNAL · enter the code', t2_invalido: 'Invalid code',
        t2_ok: '“Friendship 7, we read you. Welcome back.”', t2_enviar: 'ENTER',
        ejetar: 'EJECT CAPSULE',
        t3_decida: 'Decide in {s} s: eject the capsule or hold the retropack?',
        t3_manter: 'HOLD RETROPACK', t3_barra: 'RETROPACK',
        t3_segure: 'Hold the green button until the bar fills', t3_segurando: 'Holding… don\'t let go!', t3_pausado: 'Paused: hold again!',
        parabens_titulo: 'Congratulations, {nome}!', parabens_sub: 'You completed your first mission! Every task you solved uses real science and engineering. Here is what you practiced today:', ciencia: 'Science: ', fato: 'Real fact: ', ver_resultado: 'See result ▶',
        // Same texts as the Roblox game (rookie-rocket-roblox/build/rookie/shared/Missoes.luau, Aprendizado).
        aprender: {
          t1: { areas: 'Physics (Inertia / Mechanics) · Automation and Control Engineering',
            ciencia: 'In space nothing slows a spin: by inertia, a small drift keeps growing until a thruster pushes back. A control system closes the loop: sensor → decision → thruster.',
            fato: 'On Friendship 7, when the capsule drifted out of attitude, John Glenn steered it back by hand.' },
          t2: { areas: 'Physics (Electromagnetic Waves) · Telecommunications Engineering',
            ciencia: 'During reentry the air around the capsule turns into hot ionized gas (plasma), which blocks radio waves until the capsule slows down.',
            fato: 'Glenn\'s planned radio blackout lasted 4 minutes and 20 seconds.' },
          t3: { areas: 'Physics (Thermodynamics) · Materials Engineering',
            ciencia: 'Air squeezed in front of the capsule gets extremely hot. The heat shield is made to absorb that heat and carry it away as its surface burns off slowly.',
            fato: 'A faulty signal suggested the heat shield was loose, so controllers kept the retropack strapped on during reentry. The signal was false.' }
        },
        sucesso_titulo: 'Mission accomplished!', novo_card: 'The real mission · new card in your Space Album',
        voltar: 'Keep exploring', proxima: 'Next phase',
        falhou_titulo: 'MISSION FAILED',
        tentar_task: 'Retry task', reiniciar: 'Restart mission', sair_mapa: 'Back to the map',
        conta: 'T1 {a} + T2 {b} + T3 {c} − {l} s lightness = {f} · {e}',
        conta_peso: 'Weight {p} kg · limit {l} kg · the rocket did not lift off',
        conta_task: 'Failed on Task {n} · {nome}',
        sem_estrelas: 'took too long',
        escolha_titulo: 'Phase 1 complete!', escolha_txt: 'Your best result:', refazer: 'Replay Phase 1'
      },
      // MISSION 2 (ISS): only what differs from mission 1. Same texts as the Roblox game (Missoes.luau).
      missao2: {
        fase: 'PHASE 2 · SPACE STATION (ISS)',
        tasks: {
          t1: { nome: 'The Docking (STS-88)', alerta: '⚠ ARM PRESSURE TOO HIGH', ok: '✔ ZARYA DOCKED TO UNITY', guia: 'Line up the 4 spheres and keep the pressure green.' },
          t2: { nome: 'The Stuck Solar Panel (STS-97)', alerta: '⚠ SOLAR ARRAY CABLES LOOSE', ok: '✔ CABLES LOCKED ON THE PULLEYS', guia: 'Go outside and drag the cables to their pulleys.' },
          t3: { nome: 'The 2 mm Leak (Soyuz MS-09)', alerta: '⚠ CABIN PRESSURE DROPPING', ok: '✔ LEAK SEALED', guia: 'Close the hatch, find the leak and seal it.' }
        },
        contagem: 'ARRIVING AT THE STATION IN', decolagem: 'DOCKED TO THE STATION!',
        i1_dica: 'Drag the 4 spheres onto the ✕ marks and keep the pressure in the green zone.',
        i1_pressao: 'ARM PRESSURE', i1_valvula: 'VALVE: drag to adjust',
        i1_fora: 'Pressure outside the green zone: the sphere slipped.', i1_perigo: 'PRESSURE AT MAXIMUM! Ease the valve!', i1_esfera: 'Sphere {n}',
        i2_dica: 'Drag each loose cable to its green pulley. Too fast and it slips!',
        i2_vel: 'SPEED', i2_escorregou: 'The cable slipped! Move slower while carrying it.', i2_cabo: 'Cable {n}',
        i3_dica1: '1. Close the hatch to the next module.', i3_dica2: '2. Find the hole: look for air being sucked in and tap it.',
        i3_dica3: '3. Take the epoxy gauze from the toolbox.', i3_dica4: '4. Hold the gauze on the hole until it seals.',
        i3_pressao: 'CABIN PRESSURE', i3_escotilha: '🚪 Close hatch', i3_escotilha_ok: '✔ Hatch closed', i3_gaze: '🧰 Take epoxy gauze', i3_gaze_ok: '✔ Gauze in hand',
        i3_feche: 'Close the hatch to the next module first!', i3_precisa: 'Take the epoxy gauze from the toolbox first.',
        i3_nada: 'Nothing here. Look for air being sucked in.', i3_achou: '2 mm hole found!', i3_vedar: 'SEAL', i3_painel: 'Wall panel {n}',
        parabens_sub: 'You kept the space station safe! Each task was inspired by a real moment in the history of the ISS. Here is the science behind it:',
        aprender: {
          t1: { areas: 'Physics (Forces / Action and Reaction) · Robotics Engineering',
            ciencia: 'Every push the arm gives a module pushes back on the arm (Newton\'s third law). Gentle, steady force lines parts up without damaging them.',
            fato: 'On STS-88 (December 1998) the shuttle\'s robotic arm captured Zarya and joined it to Unity. The fittings did not line up at first, so the arm released Zarya and tried again.' },
          t2: { areas: 'Physics (Mass and Momentum) · Mechanical Engineering',
            ciencia: 'In orbit a cable has no weight, but it still has mass: if you move it fast, its momentum makes it hard to stop and it slips away.',
            fato: 'On STS-97 (December 2000) a new P6 solar array blanket was slack. On the third spacewalk, Joe Tanner and Carlos Noriega pulled its tensioning cables back into their reels.' },
          t3: { areas: 'Physics (Pressure of Gases) · Life Support Engineering',
            ciencia: 'Air always flows from high to low pressure. A tiny hole to the vacuum of space lets cabin air escape slowly, and closing hatches isolates the leaking module.',
            fato: 'In August 2018 the crew found a hole about 2 mm across in the Soyuz MS-09 orbital module. Commander Sergey Prokopyev plugged it with epoxy on a gauze wipe.' }
        }
      },
      // Marcos lines on the result screen (fictional, written for the game).
      marcosResultado: {
        pressao_max: 'Too much force crushes the module! On STS-88, the fix was to ease the pressure on the arm, not to push harder.',
        peso: '{nome}, the rocket can only carry {limite} kg and the spacecraft weighed {peso} kg. It never left the pad! In space engineering every kilogram counts: pick only what helps the most.',
        ejetar2: 'Ejecting during reentry would be fatal. John Glenn spent 4 minutes without radio and trusted his training. Sometimes the right answer is to stay calm and follow the procedure.',
        ejetar3: 'It was a sensor error! The shield was secure. Ejecting in a panic loses the mission. Holding the retropack was NASA\'s real decision.',
        tempo_sem: 'You ran out of time, {nome}. The {equipamento} would have helped right here. Next time, think about which task is hardest for you before choosing.',
        tempo_com: 'Almost there, {nome}! Even with the {equipamento}, time got tight. Take a breath, plan your steps and try again.',
        lento: 'Mission complete, but it took too long, {nome}: {tempo} is over the {limiteEstrela} s limit. Plan your steps before the alarms start.',
        sucesso: 'Excellent work, {nome}! You made decisions like a real NASA astronaut. Check this mission\'s historical record in your album!'
      },
      preparo: {
        titulo: 'Mission Flight Manifest',
        aba_missao: '1 · Mission', aba_itens: '2 · Equipment',
        descricao: 'In 1962, John Glenn became the first American to orbit Earth on Friendship 7. During the flight he steered the capsule by hand, flew through a radio blackout and faced a heat shield alarm.',
        continuar: 'Choose equipment ▶', voltar: '◀ Mission',
        nave: 'Spacecraft weight: {n} kg', limite: 'Rocket limit: {n} kg',
        peso: 'Weight: {p} / {l} kg · Free: {f} kg', acima: 'Weight: {p} / {l} kg · {x} kg over the limit!',
        bonus: 'Lightness bonus: −{b} s',
        dica: 'Take at most {max} items. Every {kg} kg free takes {s} s off your final time.',
        max_itens: 'Only {max} items fit! Unselect one to swap.',
        check_traje: 'Space suit on', check_itens: 'Equipment: {n} of {max}', check_peso_ok: 'Weight within the limit', check_peso_ruim: 'Weight over the limit',
        lancar: '🚀 Board',
        itens: {
          giroscopio: { nome: 'Gyroscope', txt: 'Locks each dot in 1.2 s (instead of 2 s) and the crosshair snaps to the center.' },
          manual: { nome: 'Flight Manual', txt: 'Highlights the code on the clipboard and gives 15 extra seconds.' },
          escudo: { nome: 'Reinforced Shield', txt: 'Holding the retropack takes 6 s (instead of 10 s) and the cabin shakes less.' },
          sensor: { nome: 'Pressure Sensor', txt: 'The green zone of the pressure control gets 50% bigger.' },
          luvas: { nome: 'Grip Gloves', txt: 'Drag the loose cables 2× faster without slipping.' },
          kit: { nome: 'Sealing Kit', txt: 'Air loss 40% lower and sealing in 2 s (instead of 3 s).' }
        },
        missoes: {
          m1: { nome: 'Project Mercury (Friendship 7)', sub: 'America\'s first orbit around Earth' },
          m2: { nome: 'International Space Station (ISS)', sub: 'Build and repair the space station' },
          m3: { nome: 'Phase 3', sub: 'Continues in the official Roblox game ↗' }
        },
        bloqueada: '🔒 LOCKED · Earn 1★ on Mercury', escolher: 'Choose the mission',
        descricao2: 'In 1998 the first two ISS modules were joined with a robotic arm. Later, crews fixed slack solar array cables and sealed a tiny 2 mm leak.'
      },
      // Real mission cards (album). Phase 1: photo and goal from NASA record 9248362; "what happened" from NTRS report 20040110111.
      cards: {
        missao1: {
          nome: 'Friendship 7 · Mercury-Atlas 6',
          objetivo: 'Fly the first U.S. crewed orbital flight. On February 20, 1962, John Glenn orbited the Earth 3 times in 4 h 55 min.',
          aconteceu: 'The capsule drifted out of attitude and Glenn flew it by hand. During reentry he spent 4 min 20 s without radio. A warning said the heat shield was loose, but it was a faulty switch: the retropack stayed strapped on to be safe and the landing was a success.',
          relacao: 'Your three tasks follow this flight: manual attitude control (Task 1), the reentry radio blackout (Task 2) and the heat shield alarm with the retropack kept on (Task 3).',
          tradeoff: 'Every kilogram launched needs more rocket fuel, so early capsules carried only what was essential. In the game, items help one task each but cost weight and lightness bonus.',
          vazio: 'Complete Phase 1'
        },
        // Phase 2: same texts as the "Building the ISS" card in the Roblox game (Missoes.luau)
        missao2: {
          nome: 'Building the ISS · STS-88 · STS-97 · Soyuz MS-09',
          aconteceu: 'In December 1998 the STS-88 crew used the shuttle\'s robotic arm to join the U.S. Unity node to the Russian Zarya module: the first two pieces of the ISS. In December 2000 the STS-97 crew installed the P6 truss with the station\'s first U.S. solar arrays, and spacewalkers re-tensioned a slack array blanket. In August 2018 a 2 mm hole in the Soyuz MS-09 caused a slow pressure leak; the crew found it and sealed it with epoxy on gauze.',
          relacao: 'Task 1 is the Unity–Zarya docking, Task 2 the solar array cables of STS-97 and Task 3 the Soyuz MS-09 leak.',
          tradeoff: 'Everything on the station was launched from Earth, so each tool and spare part competes for mass with food, water and science. In the game, the 60 kg limit makes you choose only two items.',
          vazio: 'Complete Phase 2'
        }
      },
      album: { titulo: 'Space Album', sub: 'Complete the phases to collect the real mission cards.', real: 'REAL MISSION', objetivo: 'Goal: ', aconteceu: 'What happened: ', relacao: 'In the game: ', tradeoff: 'Mass trade-off: ' },
      roblox: { titulo: 'The adventure continues on Roblox!', texto: 'You completed both phases of the demo! Phase 3 and beyond are in the official Rookie Rocket game.', botao: 'Play on Roblox', em_breve: 'Game link coming soon',
        titulo_totem: 'Play the real Rookie Rocket!', texto_totem: 'This is just the demo. The official game, with the full adventure, is on Roblox.' },
      placas: {
        totem_topo: '★ EXHIBIT ★', totem_pe: 'Press E to view',
        jogo_topo: 'OFFICIAL GAME', jogo_l1: 'PLAY THE', jogo_l2: 'REAL GAME!', jogo_botao: '▶ ON ROBLOX', jogo_pe: 'Press E', jogo_pe_toque: 'Tap here',
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
