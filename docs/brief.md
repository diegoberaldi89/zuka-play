# Zuka Play — primeira versão de exploração

Objetivo: atletas descobrirem torneios de beach tennis por cidade, estado e proximidade, e acompanharem confrontos e resultados de forma simples.

Decisões do usuário: web e Android como plataformas pretendidas; começar pela web em HTML/CSS/JavaScript; organizadores publicam diretamente; organizadores cadastram confrontos, jogos e resultados; não é necessário placar ponto a ponto; grandes torneios e eventos locais fazem parte da cobertura; visual esportivo, simples, sem aparência genérica; logo e identidade visual fornecidas em 16/11/2026: azul-marinho, turquesa e branco.

Escolhas deste protótipo: HTML/CSS/JavaScript sem framework; persistência local; eventos fictícios; filtro de região removido a pedido do usuário; municípios da base completa do IBGE, com seleção por estado e busca por nome; distância mínima e máxima personalizáveis; intervalo de datas com calendários nativos; distância em linha reta usa coordenadas de exemplo; inscrições e transmissões por link externo; chaves são confrontos cadastrados manualmente; demonstração de organizador sem login. Isso permite validar os fluxos antes de construir autenticação e banco de dados.

Não inclui integração automática com fontes externas nem aplicativo Android nativo nesta etapa.

Alternativas de dados discutidas: alimentação por organizadores (disponível neste protótipo), integrações autorizadas (a verificar com fornecedores) e modelo híbrido (recomendado para evolução). Não há fonte externa contratada ou integrada.
