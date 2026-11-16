# Zuka Play

Aplicativo web em HTML, CSS e JavaScript puro, com Supabase Auth e PostgreSQL.

**Site público:** https://zukaplay.com.br

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
- Cadastro, edição, publicação compartilhada e exclusão de torneios.
- Cadastro e edição manual de confrontos; lançamento de placares por set, incluindo campo para decisivo/super tie-break.
- Status agendado, em jogo e finalizado, com horário de atualização.
- Links de inscrição e transmissão fornecidos pelo organizador.
- Layout responsivo para celular e computador.

## Limites atuais

O banco compartilhado usa Supabase e RLS por organizador. O cadastro dispensa confirmação de e-mail. A recuperação de senha por e-mail ainda depende de configurar e testar SMTP próprio. Não há integração com feeds externos, importação de eventos antigos do navegador, geração automática de chaves ou cálculo de classificação. A busca por distância exige coordenadas e os formulários atuais ainda não fazem geocodificação.

## Direção de produto

Referências de organização: SofaScore (hierarquia de placares e estados de jogo) e ScorePlay (contexto de torneios). Identidade visual Zuka: azul-marinho `#0A2B48`, turquesa `#00D5C8` e branco. A logo fornecida é exibida em sua composição horizontal a partir da prancha original, preservada em `dist/assets/zuka-identidade.png`. O destaque de placares usa uma ilustração SVG de quadra de areia de beach tennis, com perímetro, rede e quatro jogadores, sem linhas de saque ou corredores de tênis.

Próximas etapas: SMTP próprio, armazenamento de imagens, geocodificação e fontes externas autorizadas. Android pode consumir o mesmo backend quando o fluxo web estiver validado.

## Testes de filtros

```sh
node --test tests/*.test.cjs
```

Os testes exercitam sobreposição de datas, limites de distância, rejeição de intervalos inválidos, cidades homônimas e busca sem acentos. A lista do IBGE está em `dist/data/municipios.js`; a fonte e a data de consulta estão em `dist/data/README.md`. Os campos de data usam os calendários nativos do navegador, cuja aparência varia por plataforma.

## Banco Supabase

A estrutura inicial do banco já está preparada e aplicada no Supabase Cloud, no plano Free e região São Paulo. Esquema, permissões, limitações e próximos passos estão em [supabase/README.md](supabase/README.md). O site consulta e grava dados no Supabase.

Para executar todos os testes, incluindo as políticas do banco: `npm ci` e `npm test`. A dependência de desenvolvimento PGlite roda PostgreSQL localmente, sem servidor ou Docker. Não é usada pelo site publicado.

## Integração Supabase (16/11/2026)

A versão atual utiliza banco compartilhado e acesso de organizadores. Os detalhes e limitações atuais estão em `supabase/README.md`; descrições anteriores do protótipo local acima são históricas. O cadastro não exige confirmação de e-mail; SMTP próprio segue pendente para recuperação de senha.
