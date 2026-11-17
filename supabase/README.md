# Supabase — Zuka Play

## Projeto

- Organização: Beraldi Org (Free).
- Projeto: Zuka Play.
- Referência: `zetarilmjhsqxrvnqnxp`.
- Região: South America (São Paulo), `sa-east-1`.
- API pública do projeto: https://zetarilmjhsqxrvnqnxp.supabase.co
- Painel: https://supabase.com/dashboard/project/zetarilmjhsqxrvnqnxp

O Supabase Cloud hospeda o PostgreSQL. O plugin é uma ferramenta de administração e não precisa ficar aberto para o banco funcionar.

## Estrutura inicial

A migração `migrations/202611160001_initial_schema.sql` foi aplicada pelo SQL Editor do painel em 16/11/2026. A estrutura está versionada aqui. Antes de adotar `supabase db push` neste projeto, reconciliar o histórico da migração inicial com a instância remota (`supabase migration repair 202611160001 --status applied` após vincular o projeto e conferir a estrutura). Não executar novamente a criação inicial em uma instância que já contém essas tabelas.

- `organizer_profiles`: perfil privado vinculado ao Supabase Auth, criado por trigger ao cadastrar uma conta.
- `tournaments`: evento, uma conta proprietária, localização, período, contato público e status. `published_at` nulo representa rascunho.
- `tournament_categories`: categoria e gênero por torneio.
- `teams`: duplas por categoria.
- `matches`: confrontos, horário, quadra e status.
- `match_sets`: placares por set, com campo para set decisivo/super tie-break.

Contas e senhas pertencem ao Supabase Auth, não às tabelas públicas. Não há papel administrativo que o usuário possa escolher no cadastro. Transferência de proprietário é bloqueada para o cliente.

## Permissões

Visitantes consultam apenas torneios publicados e seus dados esportivos. Perfis privados não são públicos. Organizadores autenticados criam, alteram e excluem somente seus próprios eventos e dados relacionados. Eles não podem criar tabelas, alterar a estrutura do banco ou modificar eventos de outras contas. Chaves estrangeiras compostas impedem associar categoria, dupla ou placar de outro torneio.

Por decisão explícita do usuário, a confirmação de e-mail foi desativada em 16/11/2026. Novas contas podem iniciar sessão imediatamente. O acesso continua exigindo e-mail e senha e respeitando RLS por organizador.

## Verificação

```sh
npm ci
npm test
```

Os testes de banco usam PostgreSQL embutido (PGlite) e identidades de teste isoladas. Exercitam RLS e privilégios reais; o schema `auth` e o contexto JWT são fixtures locais. Nenhuma conta de teste é criada na instância hospedada. Esses testes não substituem um teste ponta a ponta de Supabase Auth, envio de e-mail e interface.

## Integração publicada

O site consulta torneios, categorias, duplas, confrontos e sets compartilhados no Supabase. Cadastro, login, logout e recuperação usam Supabase Auth. A confirmação de e-mail está desativada. SMTP próprio permanece pendente apenas para fluxos que enviam mensagens, como recuperação de senha; o cadastro não depende de envio de e-mail.

`dist/backend.js` contém apenas URL e chave publicável. A sessão é renovada com refresh token. Favoritos permanecem locais. Dados fictícios e eventos locais antigos não são importados para o banco.

A migração `202611160002_save_event.sql` foi aplicada pelo SQL Editor em 16/11/2026. `save_event` executa com os privilégios do usuário, mantém RLS e salva um evento completo em uma transação, rejeitando uma versão desatualizada. Categorias/duplas/jogos são reconstruídos no salvamento do evento; partidas mantêm seus UUIDs. Esta versão não fornece edição simultânea com mesclagem, gêneros separados ou fusos diferentes de São Paulo. Reconciliar também esta migração antes de usar o CLI.

Os testes locais verificam leitura pública, isolamento entre contas, gravação de placares, rollback e conflitos. Um teste transacional no banco hospedado criou torneio, confronto e dois sets e confirmou leitura pública, seguido de rollback para não deixar dados de teste. O fluxo completo de cadastro/entrega de e-mail ainda não foi verificado com um usuário real.

Site URL: `https://zukaplay.com.br`. Redirects: `https://zukaplay.com.br/`, `https://www.zukaplay.com.br/` e `https://zuka-play.pages.dev/`.

Auditoria remota reexecutável: `verify-permissions.sql`.

## Superadministrador único

A migração `202611160003_super_admin.sql` foi aplicada pelo SQL Editor. A tabela privada `app_private.super_admin` permite uma única linha, com UUID do usuário autorizado; clientes não têm privilégios de alteração e RLS está habilitada. A função `is_super_admin` verifica a identidade do JWT e não usa metadados editáveis pelo usuário. A atribuição da conta é uma operação separada de administração, fora da migração e do repositório público.

O superadministrador consulta nomes e e-mails de organizadores via `list_organizers` e administra todos os torneios, incluindo seus dados esportivos. As políticas dos organizadores comuns continuam limitadas ao proprietário. A edição administrativa não transfere propriedade. Senhas e credenciais de organizadores não são disponibilizadas.

O painel administrativo inclui busca por nome/e-mail e definição de uma nova senha. A Edge Function `admin-password` valida o token no Auth, verifica `is_super_admin` com esse token e usa a credencial de serviço somente no ambiente do servidor para atualizar o usuário no Auth Admin API. A senha não é retornada nem registrada pelo código. Credenciais de serviço nunca devem ser copiadas para `dist/`. O envio da nova senha ao organizador é responsabilidade do administrador; o site não envia mensagens automaticamente.

## Valores e endereço do torneio

A migração `202611160004_tournament_fields.sql` adiciona quatro valores numéricos de inscrição, premiação numérica, rua, bairro, número e CEP. Valores nulos significam não informado e zero representa gratuidade. Campos textuais antigos de endereço e preço permanecem para compatibilidade. A interface mostra os valores com moeda BRL. Um trigger converte nomes de torneios para maiúsculas inclusive em gravações diretas. A função `save_event` continua respeitando proprietário e superadministrador e preserva os novos campos quando um cliente antigo não os envia. Migração aplicada pelo SQL Editor.

## Banner do torneio

A migração `202611160005_banners.sql` foi aplicada via SQL Editor. O bucket público `tournament-banners` aceita JPEG, PNG e WebP até 5 MB. O upload exige autenticação e um caminho com UUID do usuário e UUID do arquivo; o cliente não sobrescreve objetos. O torneio guarda `banner_path`, validado como caminho do bucket. RLS dos eventos continua determinando quem pode vincular/remover um banner. Administradores podem editar todos os eventos.

O formulário permite prévia, troca e remoção ao salvar. O catálogo e os detalhes preservam a proporção integral da arte. Upload que falhar na gravação do torneio tem remoção compensatória; se essa limpeza também falhar, o arquivo pode ficar órfão. Arquivos antigos de banners substituídos/removidos permanecem no bucket, sem vínculo no catálogo; planejar limpeza por referências antes de excluir objetos para não afetar imagens em uso. O bucket destina-se exclusivamente a artes públicas de divulgação.
