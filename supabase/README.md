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

## Integração com o aplicativo — próxima etapa

O site publicado ainda usa o armazenamento local do protótipo. Esta etapa prepara o banco; não conecta o frontend automaticamente e não copia eventos fictícios para o banco real.

A próxima etapa deve introduzir um módulo de acesso a dados, Supabase Auth, formulários de cadastro/login/recuperação e a substituição das operações em `localStorage` por operações autenticadas. A chave publicável é própria para clientes, protegida por RLS. Senha do banco, chaves secretas e `service_role` nunca devem ser incluídas no site, aplicativo ou repositório.

O arquivo `.env.example` documenta as duas configurações públicas que serão necessárias. Ele ainda não é lido pelo protótipo estático. Não armazenar credenciais SMTP nesse arquivo público.

Favoritos podem permanecer no navegador, sem exigir cadastro dos visitantes. Futuro aplicativo Android usará o mesmo banco e as mesmas permissões.

## Endereços de autenticação

Site URL configurada no painel: `https://zuka-play.pages.dev`. Redirecionamento explicitamente autorizado: `https://zuka-play.pages.dev/`. Endereços de desenvolvimento e futuros aplicativos devem ser adicionados quando os respectivos fluxos forem integrados e testados.

Auditoria remota reexecutável: `verify-permissions.sql`.
