# Revisão de CSS — 26 de setembro de 2026

## Correções aplicadas

- Classe `page-title` para títulos de páginas operacionais e secundárias: 30 px em ecrãs pequenos, 36 px a partir de 640 px, entrelinha 1,15 e fonte de títulos centralizada. Os títulos promocionais mantêm a sua hierarquia própria.
- Títulos longos podem quebrar palavras para evitar transbordo horizontal.
- Margens dos três painéis (canil, utilizador, administração) centralizadas em `dashboard-shell`: 20 px em telemóvel, 32 px a partir de 640 px.
- Campos de registos, equipa, operação, pedidos e apoios reutilizam `field`: altura mínima 48 px, borda e raio partilhados, espaçamento de rótulo, fundo de cartão, foco visível e 16 px em telemóvel para evitar ampliação automática ao escrever. Em ecrãs maiores usam 14 px.
- Áreas de texto partilhadas têm altura mínima 112 px, entrelinha confortável e redimensionamento vertical.
- Painéis e formulários de apoios têm padding responsivo (16/24 px), bordas e raios consistentes. Botões principais/secundários usam os estilos partilhados com altura mínima de 48 px. Checkboxes têm 20 px e rótulos com área mínima de 44 px.

## Validação feita

TypeScript, lint, 37 testes automáticos e compilação de produção com webpack passaram após as alterações. Confirmada a geração das classes e da variável de fonte no CSS compilado.

## Inspeção visual da página pública do canil

O ambiente permitiu posteriormente a execução autorizada do Chromium. A página pública foi verificada a 320, 390, 768 e 1440 px, com screenshots a 390 e 1440 px. O teste verifica ausência de transbordo horizontal, altura mínima das ações, ordem das secções, navegação para contactos e expansão da lista de animais.

Melhorias: fotografia com ícone apenas como alternativa, selo de verificação legível, acessos a animais/apoios/contactos, telefone e email clicáveis, estado de adoção nos cartões, seis animais inicialmente com expansão dos restantes, animais antes da apresentação e contactos antes dos donativos. Corrigida a contagem de disponíveis em português. No cabeçalho global, o registo passa para o menu em telemóvel para não empurrar a navegação para fora do ecrã.

Passaram também os 10 percursos de navegador existentes e o novo percurso de apoios. Estes resultados não equivalem à inspeção visual completa de todas as páginas, tema escuro, zoom a 200% e impressão; esses cenários continuam na lista de revisão antes do lançamento.
