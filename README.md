# Zuka Play

Protótipo navegável em HTML, CSS e JavaScript puro, sem instalação de dependências.

**Site público:** https://zuka-play.pages.dev

Configuração e limites de publicação: [docs/deployment.md](docs/deployment.md).

## Abrir localmente

Na pasta do projeto:

```sh
python3 -m http.server 4173 --directory dist
```

Abra http://localhost:4173. Também é possível abrir `dist/index.html` diretamente, mas a localização e o armazenamento funcionam melhor por HTTP local.

## O que funciona

- Catálogo e busca por torneio, arena, cidade e estado.
- Filtros por estado, município (base completa do IBGE, com busca por nome), intervalo de datas, categoria e situação.
- Busca por distância mínima e máxima em linha reta, com barra de dois controles e campos numéricos, mediante permissão de localização. Disponível para os exemplos que possuem coordenadas; novos eventos ainda não recebem geocodificação.
- Favoritos persistentes neste navegador.
- Detalhes de torneio, regulamento, confrontos e resultados.
- Cadastro, edição, publicação local e exclusão de torneios.
- Cadastro e edição manual de confrontos; lançamento de placares por set, incluindo campo para decisivo/super tie-break.
- Status agendado, em jogo e finalizado, com horário de atualização.
- Links de inscrição e transmissão fornecidos pelo organizador.
- Exportação dos dados em JSON e restauração apenas dos exemplos.
- Layout responsivo para celular e computador.

## Limites deste protótipo

Os eventos iniciais são fictícios e identificados como demonstração. Os dados são persistidos em `localStorage`, na chave `zuka-play:v1`: não há banco compartilhado, login, autenticação, isolamento de organizadores ou integrações ativas com LetzPlay, ITF ou feeds ao vivo. Nenhuma API é simulada. A publicação no catálogo vale apenas para este navegador/origem. A agenda e os placares são inseridos manualmente. Não há geração automática de chaves ou cálculo de classificação. A validação de placar é básica e não substitui regras de cada formato de competição.

Fontes web opcionais: DM Sans e Barlow Condensed, via Google Fonts; existem fontes locais de fallback. Todos os ícones e elementos de arte são SVG ou CSS locais.

## Direção de produto

Referências de organização: SofaScore (hierarquia de placares e estados de jogo) e ScorePlay (contexto de torneios). Identidade visual Zuka: azul-marinho `#0A2B48`, turquesa `#00D5C8` e branco. A logo fornecida é exibida em sua composição horizontal a partir da prancha original, preservada em `dist/assets/zuka-identidade.png`. O destaque de placares usa uma ilustração SVG de quadra de areia de beach tennis, com perímetro, rede e quatro jogadores, sem linhas de saque ou corredores de tênis.

Próxima etapa para produção: autenticação de organizadores, banco compartilhado e autorização por proprietário, armazenamento de imagens, geocodificação, fonte de dados autorizada e atualização compartilhada. Android pode consumir o mesmo backend quando o fluxo web estiver validado.

## Testes de filtros

```sh
node --test tests/*.test.cjs
```

Os testes exercitam sobreposição de datas, limites de distância, rejeição de intervalos inválidos, cidades homônimas e busca sem acentos. A lista do IBGE está em `dist/data/municipios.js`; a fonte e a data de consulta estão em `dist/data/README.md`. Os campos de data usam os calendários nativos do navegador, cuja aparência varia por plataforma.

## Banco Supabase

A estrutura inicial do banco já está preparada e aplicada no Supabase Cloud, no plano Free e região São Paulo. Esquema, permissões, limitações e próximos passos estão em [supabase/README.md](supabase/README.md). O site publicado ainda usa o armazenamento local até a integração da próxima etapa.

Para executar todos os testes, incluindo as políticas do banco: `npm ci` e `npm test`. A dependência de desenvolvimento PGlite roda PostgreSQL localmente, sem servidor ou Docker. Não é usada pelo site publicado.
