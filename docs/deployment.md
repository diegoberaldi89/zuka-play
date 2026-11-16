# Publicação

## Cloudflare Pages

- Site público: https://zuka-play.pages.dev
- Projeto Pages: `zuka-play`
- Diretório publicado: `dist`
- Tipo de publicação: envio direto dos arquivos estáticos (Direct Upload)
- Branch de produção: `main`

## Domínio próprio

Domínio registrado na GoDaddy: `zukaplay.com.br` (com **k**). Em 16/11/2026, os servidores personalizados foram salvos e confirmados no painel da GoDaddy:

- `patryk.ns.cloudflare.com`
- `teresa.ns.cloudflare.com`

Zona Cloudflare Free: `c272472868efd2f8a60e104748d235e9`. Os domínios `zukaplay.com.br` e `www.zukaplay.com.br` estão associados ao projeto Pages `zuka-play`, com CNAME para `zuka-play.pages.dev` e proxy habilitado. Os registros auxiliares `_domainconnect` e `_dmarc` existentes na GoDaddy foram preservados na Cloudflare. Não havia registros MX.

Em 16/11/2026, a delegação pública foi confirmada e a Cloudflare informou a zona e os dois domínios como ativos. O endereço principal respondeu via HTTPS. Não é necessário republicar os arquivos estáticos para o apontamento entrar em vigor.

Os e-mails de autenticação ainda não possuem SMTP próprio configurado. A URL principal de autenticação agora é `https://zukaplay.com.br`, com redirects para o domínio, www e o endereço Pages anterior.

## Atualizações do site

Não há compilação nem dependências para servir a página. Em uma configuração de build, usar `exit 0` como comando e `dist` como saída.

A publicação direta atual não está ligada automaticamente a pushes no GitHub. Atualizações precisam enviar novamente os arquivos de `dist` ao projeto Pages. Torneios e resultados são compartilhados no Supabase; favoritos continuam locais.

O arquivo `.openai/hosting.json` é configuração da prévia anterior do Sites, sem uso no Cloudflare Pages. Não faz parte da distribuição pública preparada para o GitHub.
