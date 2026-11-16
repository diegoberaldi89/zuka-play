# Zuka Play

Aplicativo web em HTML, CSS e JavaScript puro. Arquivos publicados em `dist/`; testes em `tests/`.

## Validação

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
