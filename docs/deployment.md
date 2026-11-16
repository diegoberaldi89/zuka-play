# Publicação

## Cloudflare Pages

- Site público: https://zuka-play.pages.dev
- Projeto Pages: `zuka-play`
- Diretório publicado: `dist`
- Tipo de publicação: envio direto dos arquivos estáticos (Direct Upload)
- Branch de produção: `main`

Não há compilação nem dependências para servir a página. Em uma configuração de build, usar `exit 0` como comando e `dist` como saída.

A publicação direta atual não está ligada automaticamente a pushes no GitHub. Atualizações precisam enviar novamente os arquivos de `dist` ao projeto Pages. Dados cadastrados no protótipo ficam no navegador de cada visitante e não são compartilhados com outras pessoas.

O arquivo `.openai/hosting.json` é configuração da prévia anterior do Sites, sem uso no Cloudflare Pages. Não faz parte da distribuição pública preparada para o GitHub.
