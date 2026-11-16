# Verificação do protótipo

Executada em 16/11/2026 no navegador integrado do Codex, por interações reais com os controles.

## Resultados

- HTTP local: `GET /` retornou 200.
- Sintaxe JavaScript: `node --check dist/app.js` concluiu com código 0.
- Desktop 1440 × 1000: catálogo com três colunas, filtro lateral, cards e placares.
- Celular 390 × 844: largura do documento 390 px; nenhum transbordamento horizontal. Filtros abrem, filtram e retornam ao catálogo pelo botão Ver torneios.
- Estado SP + cidade Santos: um resultado, Open Litoral Paulista.
- Busca `ribeirao`: um resultado, Masters Zuka — Ribeirão; busca ignora acentos.
- Estado SC no celular: um resultado, Floripa Beach Cup.
- Limpar filtros: catálogo completo retorna.
- Busca inexistente: estado vazio oferece limpar filtros.
- Favoritar Copa Zuka: um resultado na aba Favoritos, preservado após recarregar.
- Cadastro sem categorias: publicação impedida com mensagem de validação.
- Cadastro de Copa de Verificação Zuka: evento exibido no painel e catálogo.
- Novo confronto Ana / Bia × Clara / Dani: confronto cadastrado para categoria C.
- Placar com somente uma dupla preenchida: gravação impedida com mensagem de validação.
- Placar final 6 × 4: exibido em Jogos e resultados e na área pública Placares > Finalizados.
- Recarregar após cadastro: torneio e confronto preservados.
- Console do navegador: nenhuma mensagem de erro observada durante a rodada de verificação.

## Correções verificadas

O painel do organizador e a página de placares herdavam a coluna de 204 px ao esconder os filtros. A grade agora muda para duas colunas nessas páginas. A medição após a correção mostrou conteúdo com largura 1052 px em viewport de 1440 px.

O cabeçalho móvel foi ajustado para preservar a altura da marca e manter a navegação em uma linha separada. A navegação por âncora do link de acessibilidade não substitui mais a página atual.

## Limites da validação

Não testados em aparelhos físicos Android/iOS ou navegadores externos. A localização real não foi solicitada durante os testes. Não há backend, autenticação ou fonte de resultados externos para testar nesta etapa. A primeira rodada não possuía testes automatizados; a atualização de filtros abaixo adicionou testes de regressão.

## Atualização de identidade Zuka — 16/11/2026

- Aplicadas as cores oficiais #0A2B48 e #00D5C8; valores conferidos nos estilos computados do navegador.
- Marca horizontal fornecida exibida no cabeçalho, rodapé e módulo Zuka TV, a partir da prancha original preservada.
- Ilustração de quadra substituída por areia, rede e quatro jogadores; sem linhas internas de serviço de tênis.
- Desktop 1440 × 1000: página com 1440 px de largura, sem transbordamento. Painel do organizador com 1052 px de conteúdo.
- Celular 390 × 844: documento com 390 px de largura, sem transbordamento; logo e quadra conferidas visualmente.
- Regressão: estado SP + Santos exibiu um torneio; região Sul no celular exibiu um torneio; limpeza dos filtros restaurou o catálogo.

## Filtros personalizados — 16/11/2026

- 12 testes automatizados em `tests/filter-rules.test.cjs`: todos passaram. Cobrem datas sobrepostas, limites inclusivos, intervalo invertido, ausência de coordenadas, distâncias inválidas, cidades homônimas e busca sem acentos. Rodada inicial com comportamento incompleto falhou; rodada com implementação passou.
- Municípios: download oficial do IBGE, 5.571 localidades e 27 UFs, incorporado ao projeto. Não depende de eventos cadastrados. Filtro de região removido.
- Navegador: estado SP apresentou 645 cidades; cidade Santos retornou um torneio; busca sem acentos `sao luis` apresentou municípios e UFs correspondentes. Boa Esperança do Norte/MT apareceu na lista e selecioná-la retornou zero eventos, conforme os dados demonstrativos.
- Cadastro de organizador: sugestões de cidade com 645 opções em SP e 853 em MG.
- Barra de distância: campos 20–350 atualizaram os controles; seta direita no mínimo alterou o campo de 20 para 21; mínimo 400 com máximo 350 apresentou erro. Sem solicitar localização real durante a verificação.
- Datas: período 21–23/11/2026 retornou Open Litoral e o torneio de verificação que termina em 24/11, confirmando sobreposição; período invertido apresentou erro e desabilitou Aplicar.
- Celular 390 × 844: painel de filtros e seleção de datas verificados; documento sem transbordamento horizontal.
- Console do navegador sem erros observados nesta rodada.

## Preparação do Supabase — 16/11/2026

- Supabase Cloud Free: Zuka Play, referência `zetarilmjhsqxrvnqnxp`, região São Paulo (`sa-east-1`).
- Migração inicial aplicada via SQL Editor. Consulta prévia confirmou zero tabelas no schema público.
- Auditoria remota após aplicação confirmou seis tabelas; em todas, RLS ativo, escrita anônima desabilitada e criação de tabelas por `authenticated` desabilitada. Consulta reexecutável em `supabase/verify-permissions.sql`.
- Testes locais PostgreSQL/PGlite: 26 testes passaram, incluindo 13 subtestes de banco e os testes de filtros existentes. Casos de acesso público, rascunhos privados, dois proprietários, adulteração de proprietário, relacionamentos entre eventos, placares inválidos, perfis privados e ausência de privilégios DDL.
- Não foram criados usuários de teste na instância hospedada. Cadastro, login, entrega de e-mail e interface conectada ainda não foram testados ponta a ponta.
- Site URL e redirecionamento autorizado configurados para `https://zuka-play.pages.dev/`.
- O frontend continua no modo demonstrativo/local; esta etapa não publicou um formulário de login sem integração.
