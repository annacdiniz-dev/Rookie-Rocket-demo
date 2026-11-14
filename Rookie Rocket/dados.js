// =====================================================================
// ROOKIE ROCKET · conteúdo da demo
// ---------------------------------------------------------------------
// Regra do projeto: só usar dados liberados pelo desafio Space Apps ou
// dados de APIs oficiais da NASA.
//
// Todos os fatos e fotos abaixo vêm da NASA Image and Video Library
// (API oficial: https://images-api.nasa.gov), consultada em 14/11/2026.
// Cada exposição traz o nasa_id, a data e o crédito do registro original.
// As conversões de unidade (pés/milhas → metros/km) são só aritmética.
//
// As falas do personagem Marcos Pontes são FICTÍCIAS, escritas para o
// jogo. Os fatos citados nelas vêm dos registros iss012e22280 e
// 20060409_exp12_11.
// =====================================================================

const FONTE_API = 'NASA Image and Video Library (images-api.nasa.gov)';

const DADOS = {
  desafio: {
    nome: 'NASA Space Apps Challenge 2026 · Space Mission Design Game',
    url: 'https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/'
  },

  // Fala do guia. {nome} é trocado pelo nome do jogador.
  marcos: [
    'E aí, {nome}! 👋 Aqui é o Marcos Pontes, o primeiro astronauta brasileiro a ir para o espaço.',
    'Tenho uma notícia incrível: você foi selecionado(a) para o Programa Estagiário Astronauta! A partir de hoje, você faz parte da tripulação. 🚀',
    'Em 2006 eu vivi um pouco mais de uma semana na Estação Espacial Internacional. Tudo começou com curiosidade, igualzinho a você agora.',
    'Sua primeira missão: atravesse o corredor e explore o museu do Kennedy Space Center. Lá tem foguete de verdade, cápsula histórica e até um ônibus espacial!',
    'Depois, siga pelo corredor do outro lado do museu até o hangar. Sua nave está te esperando lá. Bora decolar, {nome}? 🌎✨'
  ],

  // Exposições: o texto do card resume, em português, a descrição oficial do registro.
  exposicoes: {
    pontes: {
      titulo: 'Quem é Marcos Pontes?',
      sala: 'Recepção',
      fatos: [
        'Foi o primeiro astronauta do Brasil a ir ao espaço, pela Agência Espacial Brasileira.',
        'Em 3 de abril de 2006 trabalhou no laboratório Destiny da Estação Espacial Internacional, logo depois de chegar.',
        'Voltou à Terra em 9 de abril de 2006, na nave Soyuz TMA-7, pousando nas estepes do Cazaquistão depois de um pouco mais de uma semana na estação.'
      ],
      registros: [
        { id: 'iss012e22280', data: '2006-04-03', credito: 'NASA', foto: 'nasa/iss012e22280.jpg' },
        { id: '20060409_exp12_11', data: '2006-04-08', credito: 'NASA/Bill Ingalls', foto: 'nasa/20060409_exp12_11.jpg' }
      ]
    },
    recepcao: {
      titulo: 'A entrada do Visitor Complex',
      sala: 'Recepção',
      fatos: [
        'A praça de ingressos é a porta de entrada do Kennedy Space Center Visitor Complex.',
        'Lá dentro, um centro de orientação tem equipe que atende visitantes em vários idiomas. É a inspiração para esta recepção!'
      ],
      registros: [
        { id: 'KSC-03pd2164', data: '2003-07-22', credito: 'NASA', foto: 'nasa/KSC-03pd2164.jpg' }
      ]
    },
    jardim: {
      titulo: 'Rocket Garden · Jardim de Foguetes',
      sala: 'Museu',
      fatos: [
        'O Rocket Garden reúne oito foguetes autênticos do passado, incluindo um Mercury-Atlas.',
        'Tem réplicas das cápsulas Mercury, Gemini e Apollo em que dá para entrar, além de painéis informativos.'
      ],
      registros: [
        { id: 'KSC-03pd2174', data: '2003-07-22', credito: 'NASA', foto: 'nasa/KSC-03pd2174.jpg' }
      ]
    },
    sigma7: {
      titulo: 'Sigma 7 · Projeto Mercury',
      sala: 'Museu · Heroes and Legends',
      fatos: [
        'A cápsula Sigma 7 foi pilotada por Wally Schirra numa missão de seis órbitas em 3 de outubro de 1962.',
        'No museu ela aparece sobre um foguete Redstone, como o que levou Alan Shepard e Gus Grissom em voos suborbitais em 1961.',
        'Na vida real, a Sigma 7 foi lançada por um Atlas, mais potente, para conseguir chegar à órbita.'
      ],
      registros: [
        { id: 'KSC-20161107-PH_GEB02_0276', data: '2016-11-07', credito: 'NASA/Glenn Benson', foto: 'nasa/KSC-20161107-PH_GEB02_0276.jpg' }
      ]
    },
    controle: {
      titulo: 'Controle de Missão Mercury',
      sala: 'Museu · Heroes and Legends',
      fatos: [
        'A exposição tem os consoles originais da sala de Controle de Missão do Projeto Mercury.',
        'No mapa-múndi, a equipe acompanhava o caminho das cápsulas entre as estações de rastreamento.'
      ],
      registros: [
        { id: 'KSC-20161107-PH_GEB02_0090', data: '2016-11-07', credito: 'NASA/Glenn Benson', foto: 'nasa/KSC-20161107-PH_GEB02_0090.jpg' }
      ]
    },
    halldafama: {
      titulo: 'Hall da Fama dos Astronautas',
      sala: 'Museu · Heroes and Legends',
      fatos: [
        'Uma estátua de Alan Shepard, a primeira pessoa dos Estados Unidos a ir ao espaço, fica logo na entrada do U.S. Astronaut Hall of Fame.',
        'A área Heroes and Legends homenageia os pioneiros dos programas Mercury, Gemini e Apollo.'
      ],
      registros: [
        { id: 'KSC-20161107-PH_GEB02_0118', data: '2016-11-07', credito: 'NASA/Glenn Benson', foto: 'nasa/KSC-20161107-PH_GEB02_0118.jpg' }
      ]
    },
    atlantis: {
      titulo: 'Ônibus espacial Atlantis',
      sala: 'Museu · Space Shuttle Atlantis',
      fatos: [
        'Em 26 anos de carreira, o Atlantis voou 33 missões, passou 307 dias no espaço e percorreu 125.935.769 milhas (cerca de 202,7 milhões de km).',
        'Em novembro de 2012 viajou 10 milhas (16 km) do Vehicle Assembly Building até o Visitor Complex, e foi recebido com fogos de artifício.',
        'Fica erguido a 26 pés (7,9 m) do chão e inclinado exatamente 43,21° para o lado, com as portas do compartimento de carga abertas, como no espaço. É o que você vê aqui!',
        'A exposição tem 90.000 pés² (cerca de 8.400 m²) e abriu em 29 de junho de 2013.'
      ],
      registros: [
        { id: 'KSC-2012-6136', data: '2012-11-02', credito: 'NASA/Jim Grossmann', foto: 'nasa/KSC-2012-6136.jpg' },
        { id: 'KSC-2012-6362', data: '2012-11-29', credito: 'NASA/Dimitri Gerondidakis', foto: 'nasa/KSC-2012-6362.jpg' },
        { id: '2013-2311', data: '2013-05-10', credito: 'NASA/Kim Shiflett', foto: 'nasa/2013-2311.jpg' }
      ]
    },
    saturnv: {
      titulo: 'Saturn V · Apollo/Saturn V Center',
      sala: 'Museu · Apollo/Saturn V Center',
      fatos: [
        'O Apollo/Saturn V Center exibe um foguete Saturn V da era Apollo, restaurado, com 363 pés de comprimento (cerca de 110 m).',
        'Ele fica deitado, na horizontal, dentro de um prédio de 100.000 pés² (cerca de 9.300 m²), com artefatos históricos e dois cinemas.',
        'O centro fica a cerca de 2 milhas (3 km) ao norte do Vehicle Assembly Building.'
      ],
      registros: [
        { id: 'KSC-98pc1004', data: '1998-08-07', credito: 'NASA', foto: 'nasa/KSC-98pc1004.jpg' }
      ]
    },
    artemis: {
      titulo: 'Inspiração da nave: Artemis I',
      sala: 'Hangar',
      fatos: [
        'A nave RR-01 do jogo é um modelo original inspirado no foguete SLS com a cápsula Orion.',
        'Na Artemis I, o SLS e a Orion decolaram em 16 de novembro de 2022, à 1h47 no horário da Flórida (3h47 em Brasília), da plataforma 39B do Kennedy Space Center.',
        'Foi o primeiro voo de teste integrado dos sistemas de exploração do espaço profundo da NASA: Orion, SLS e sistemas de solo.',
        'A Orion voltou em 11 de dezembro de 2022, depois de 25,5 dias. Nenhuma nave feita para humanos tinha ido tão longe no espaço profundo.'
      ],
      registros: [
        { id: 'NHQ202211160030', data: '2022-11-16', credito: 'NASA/Joel Kowsky', foto: 'nasa/NHQ202211160030.jpg' },
        { id: 'MAF_20221211_Splashdown02', data: '2022-12-11', credito: 'NASA/Michael DeMocker', foto: 'nasa/MAF_20221211_Splashdown02.jpg' }
      ]
    }
  },

  // Lista de tarefas do estagiário (painel de missões)
  missoes: [
    { id: 'falar', texto: 'Fale com Marcos Pontes' },
    { id: 'museu', texto: 'Entre no museu do Kennedy Space Center' },
    { id: 'expo', texto: 'Explore as exposições do museu', meta: 6 },
    { id: 'hangar', texto: 'Chegue ao hangar da nave' },
    { id: 'escada', texto: 'Suba a escada da plataforma' },
    { id: 'elevador', texto: 'Use o elevador até o braço de acesso' }
  ],

  conquistas: {
    falar: 'Recrutado(a)!',
    museu: 'Visitante do KSC',
    expo: 'Historiador(a) Espacial',
    hangar: 'Dentro do Hangar',
    escada: 'Fôlego de Astronauta',
    elevador: 'Pronto(a) para Embarcar'
  }
};
