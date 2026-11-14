# Rookie Rocket — demo local

Abra `index.html` no navegador. Não precisa instalar nada, iniciar servidor ou ter conexão com a internet.

## O que explorar

- Recepção: digite seu nome e clique no astronauta Marcos Pontes para abrir o balão de diálogo fictício.
- Galeria: corredor de entrada pelo lado inferior e saída para o hangar pela parede oposta. Modelos conceituais clicáveis.
- Hangar: nave original, escada à direita e plataforma superior com elevador.
- Plataforma: botão para subir/descer o elevador, com animação simples.

Use WASD ou setas para caminhar, E para interagir com o ponto próximo, ou clique nos pontos iluminados. Os botões de navegação e de próximo passo permitem percorrer tudo sem usar o teclado. No celular há botões direcionais.

O movimento na tela usa eixos isométricos: W sobe na tela, S desce, A vai à esquerda e D à direita. O progresso e o nome são guardados no navegador quando o armazenamento está disponível.

## Arquivos

- `index.html`: estrutura e interface.
- `estilo.css`: apresentação e adaptação a celular.
- `dados.js`: nomes, textos das salas e fontes.
- `jogo.js`: desenho dos ambientes, movimento, interações e salvamento.

## Limites desta versão

É uma representação conceitual, não uma reprodução arquitetônica do Kennedy Space Center Visitor Complex. Não integra o Roblox e não inclui montagem de missões. A nave e os modelos são desenhos originais simplificados. Mercury foi interpretado como destaque provisório da galeria.

O endereço do desafio retornou erro na consulta. A lista de fontes autorizadas ainda precisa ser validada. Não foram incorporadas imagens externas, dados científicos ou fichas históricas. Os modelos do museu aguardam escolha e validação com a equipe. A fala do personagem Marcos Pontes foi criada para a narrativa e não é uma citação real.

## Roteiro de verificação manual

1. Abra index.html sem internet; os ambientes devem aparecer.
2. Digite um nome com acentos e abra o diálogo do astronauta; confira a personalização.
3. Visite o museu e teste os três pontos de exposição.
4. Siga à sala da nave pelo corredor na parede oposta à entrada.
5. Clique no ponto da escada, acione o elevador e teste a descida.
6. Abra e feche os créditos com o mouse e Escape.
7. Recarregue a página para conferir nome e contagem das salas visitadas.
8. Reduza a janela para testar navegação e controles de celular.
