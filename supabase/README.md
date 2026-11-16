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

A confirmação de e-mail continua como padrão pretendido. Até configurar SMTP e testar a entrega, não anunciar cadastro público com confirmação operacional. Desativar a confirmação exige uma decisão explícita posterior do usuário; ele autorizou essa alternativa apenas se o custo justificar.

## Verificação

```sh
npm ci
npm test
```

Os testes de banco usam PostgreSQL embutido (PGlite) e identidades de teste isoladas. Exercitam RLS e privilégios reais; o schema `auth` e o contexto JWT são fixtures locais. Nenhuma conta de teste é criada na instância hospedada. Esses testes não substituem um teste ponta a ponta de Supabase Auth, envio de e-mail e interface.

## Integração publicada

O site consulta torneios, categorias, duplas, confrontos e sets compartilhados no Supabase. Cadastro, login, logout, confirmação e recuperação usam Supabase Auth. A confirmação de e-mail permanece ativa. **SMTP próprio e entrega pública de e-mails ainda precisam ser configurados e testados**; o serviço padrão tem restrições e não deve ser considerado pronto para cadastro público geral.

`dist/backend.js` contém apenas URL e chave publicável. A sessão é renovada com refresh token. Favoritos permanecem locais. Dados fictícios e eventos locais antigos não são importados para o banco.

A migração `202611160002_save_event.sql` foi aplicada pelo SQL Editor em 16/11/2026. `save_event` executa com os privilégios do usuário, mantém RLS e salva um evento completo em uma transação, rejeitando uma versão desatualizada. Categorias/duplas/jogos são reconstruídos no salvamento do evento; partidas mantêm seus UUIDs. Esta versão não fornece edição simultânea com mesclagem, gêneros separados ou fusos diferentes de São Paulo. Reconciliar também esta migração antes de usar o CLI.

Os testes locais verificam leitura pública, isolamento entre contas, gravação de placares, rollback e conflitos. Um teste transacional no banco hospedado criou torneio, confronto e dois sets e confirmou leitura pública, seguido de rollback para não deixar dados de teste. O fluxo completo de cadastro/entrega de e-mail ainda não foi verificado com um usuário real.

Site URL: `https://zukaplay.com.br`. Redirects: `https://zukaplay.com.br/`, `https://www.zukaplay.com.br/` e `https://zuka-play.pages.dev/`.

Auditoria remota reexecutável: `verify-permissions.sql`.
