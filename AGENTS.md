# Zuka Play

Aplicativo web em HTML, CSS e JavaScript puro. Arquivos publicados em `dist/`; testes em `tests/`.

## Validação

- Em um checkout novo, executar `npm ci` para instalar apenas as dependências de desenvolvimento/testes. O site continua sem build.
- Executar `node --test tests/*.test.cjs` para alterações de comportamento.
- Validar sintaxe dos scripts alterados com `node --check`.
- Conferir no navegador quando houver mudanças visuais ou de interação.

## GitHub e commits

O usuário autorizou o repositório público `https://github.com/diegoberaldi89/zuka-play` e pediu para salvar futuras alterações nele.

Ao concluir uma alteração solicitada, verificar o resultado, criar um commit descritivo e enviá-lo à branch `main`, sem pedir autorização novamente para esse fluxo já autorizado. Comunicar qualquer falha de envio. Não incluir alterações alheias à tarefa.

Preferir Git autenticado quando disponível. Se o acesso de escrita existir apenas pelo plugin GitHub, usar os recursos de blobs, árvores, commits e atualização de referência do plugin; conferir a referência atual antes de atualizar e sincronizar o checkout local depois. Nunca usar force push para contornar divergências.

Credenciais, arquivos `.env`, dados privados, estado do navegador e configuração local `.openai/` não devem ser enviados ao repositório público.

## Hospedagem

Site público: `https://zuka-play.pages.dev`. O projeto Pages `zuka-play` usa Direct Upload de `dist/`. Pushes no GitHub não disparam publicação automática nesta configuração. Ao publicar uma versão, confirmar o deployment e o acesso público antes de informar conclusão.

## Supabase

Projeto Cloud Free `zetarilmjhsqxrvnqnxp`, região São Paulo. Estrutura inicial aplicada e documentada em `supabase/README.md`; migrações em `supabase/migrations/`. Manter RLS em todas as tabelas e testar leitura pública e isolamento entre organizadores antes de publicar integração. O frontend ainda usa dados locais até sua integração explícita. Não reaplicar a migração inicial na instância já configurada.
