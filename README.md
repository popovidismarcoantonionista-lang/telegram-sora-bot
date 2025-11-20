# 🎬 Bot Telegram - VideoGenAPI Sora 2 Text To Video

Bot do Telegram que gera vídeos usando a API oficial **VideoGenAPI.com Sora 2 Text To Video**. Desenvolvido em Node.js com Telegraf e Axios.

## 📋 Características

✅ Integração completa com API VideoGenAPI.com  
✅ Interface amigável via Telegram  
✅ Polling automático do status de geração  
✅ Tratamento robusto de erros (400, 401, 402, 429, 500)  
✅ Feedback de progresso em tempo real  
✅ Código modular e bem documentado  
✅ Configuração via arquivo .env  

## 🚀 Requisitos

- **Node.js** v18 ou superior
- **npm** ou **yarn**
- **Bot Token do Telegram** (obtenha com [@BotFather](https://t.me/botfather))
- **API Key da VideoGenAPI** (obtenha em [videogenapi.com](https://videogenapi.com))

## 📦 Instalação

### 1. Clone ou baixe o projeto

```bash
git clone https://github.com/popovidismarcoantonionista-lang/telegram-sora-bot.git
cd telegram-sora-bot
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas credenciais
nano .env
```

**Arquivo `.env`:**

```env
# Token do seu bot do Telegram (obtenha com @BotFather)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# API Key da VideoGenAPI (obtenha em https://videogenapi.com)
VIDEOGENAPI_API_KEY=sua_api_key_aqui

# URL base da API (geralmente não precisa alterar)
VIDEOGENAPI_BASE_URL=https://videogenapi.com/api/v1

# Configurações de vídeo (opcionais)
DEFAULT_ASPECT_RATIO=landscape
DEFAULT_DURATION=5

# Configurações de polling (opcionais)
POLLING_INTERVAL_MS=5000
MAX_POLLING_ATTEMPTS=120
```

### 4. Execute o bot

```bash
# Modo produção
npm start

# Modo desenvolvimento (reinicia automaticamente)
npm run dev
```

## 📱 Como Usar

### Comandos disponíveis:

- `/start` - Exibe mensagem de boas-vindas
- `/help` - Mostra guia de uso e exemplos
- `/settings` - Exibe configurações atuais

### Gerando vídeos:

1. Envie uma mensagem de texto com a descrição do vídeo
2. O bot criará uma task na API VideoGenAPI
3. Aguarde o processamento (2-10 minutos)
4. Receba o link do vídeo gerado!

### Exemplos de prompts:

✅ **Bons prompts:**
- "Uma astronauta flutuando no espaço com nebulosas coloridas ao fundo"
- "Cachorro golden retriever correndo em um campo de flores ao pôr do sol"
- "Cidade futurista com carros voadores, estilo cyberpunk, chuva neon"

❌ **Prompts ruins:**
- "Vídeo legal"
- "Algo interessante"

## 🏗️ Estrutura do Projeto

```
telegram-sora-bot/
├── index.js              # Arquivo principal - inicializa o bot
├── config.js             # Configurações e validação de env vars
├── kieAiService.js       # Serviço de integração com API VideoGenAPI
├── telegramBot.js        # Lógica do bot do Telegram
├── package.json          # Dependências e scripts
├── .env.example          # Exemplo de configuração
├── .env                  # Suas configurações (não commitar!)
├── README.md             # Este arquivo
├── DEPLOY.md             # Guia de deploy
├── railway.json          # Config Railway/Render
└── nixpacks.toml         # Build config
```

## 🔧 Módulos e Funções

### **config.js**
- `validateConfig()` - Valida variáveis de ambiente obrigatórias

### **kieAiService.js**
- `createVideoTask(prompt, options)` - Cria nova task de geração
- `getTaskStatus(requestId)` - Consulta status de uma task
- `waitForTaskCompletion(requestId, onProgress)` - Polling até conclusão
- `handleApiError(error)` - Trata erros da API

### **telegramBot.js**
- `createBot()` - Cria e configura instância do bot
- Handlers para `/start`, `/help`, `/settings`
- Handler para mensagens de texto (prompts)

## 🐛 Tratamento de Erros

O bot trata os seguintes erros da API:

| Código | Descrição |
|--------|-----------|
| 400 | Parâmetros inválidos |
| 401 | API Key inválida ou não autorizada |
| 402 | Créditos insuficientes |
| 429 | Limite de requisições excedido |
| 500 | Erro no servidor da VideoGenAPI |

## ⚙️ Configurações Avançadas

### Alterar formato do vídeo:

```env
DEFAULT_ASPECT_RATIO=portrait  # ou landscape
```

### Alterar duração:

```env
DEFAULT_DURATION=5  # 5 ou 10 segundos
```

### Ajustar polling:

```env
POLLING_INTERVAL_MS=5000       # Intervalo entre consultas (ms)
MAX_POLLING_ATTEMPTS=120       # Máximo de tentativas antes de timeout
```

## 📝 Logs

O bot exibe logs detalhados no console:

```
🎬 Criando task de vídeo...
📤 Payload enviado: {...}
✅ Task criada com sucesso
⏳ Iniciando polling para request abc123...
🔄 Tentativa 1/120 - Consultando status...
⏳ Estado atual: processing - Aguardando 5000ms...
✅ Task concluída com sucesso!
```

## 🔒 Segurança

⚠️ **IMPORTANTE:**
- Nunca comite o arquivo `.env` no Git
- Mantenha suas API Keys em segredo
- Use variáveis de ambiente em produção
- Implemente rate limiting se necessário

## 🚢 Deploy em Produção

### Opções de hospedagem:

1. **Render (Recomendado)**
   - Crie um **Background Worker** (não Web Service)
   - Configure env vars no dashboard
   - Deploy automático via GitHub

2. **Railway**
   - Use o arquivo `railway.json` incluído
   - Configure env vars no dashboard
   - Deploy automático

3. **VPS (DigitalOcean, AWS EC2, etc.)**
   ```bash
   # Use PM2 para gerenciar o processo
   npm install -g pm2
   pm2 start index.js --name telegram-sora-bot
   pm2 save
   pm2 startup
   ```

4. **Docker**
   - Crie um `Dockerfile` e `docker-compose.yml`
   - Use volumes para persistência

**📖 Guia Completo:** Veja [DEPLOY.md](DEPLOY.md) para instruções detalhadas de deploy.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja arquivo LICENSE para detalhes

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se as credenciais estão corretas no `.env`
2. Confirme que tem créditos na conta VideoGenAPI
3. Verifique os logs do console para detalhes do erro
4. Consulte a [documentação da API VideoGenAPI](https://videogenapi.com/docs)

## 🔗 Links Úteis

- [VideoGenAPI Docs](https://videogenapi.com/docs)
- [Telegraf.js Docs](https://telegraf.js.org/)
- [Axios Docs](https://axios-http.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 📊 Status da API

A API VideoGenAPI.com suporta:

- ✅ **Modelos:** Sora 2 Text-to-Video
- ✅ **Formatos:** landscape (16:9), portrait (9:16)
- ✅ **Duração:** 5s ou 10s
- ✅ **Qualidade:** HD 1080p
- ✅ **Polling:** Status em tempo real

---

Desenvolvido com ❤️ usando Node.js, Telegraf e VideoGenAPI.com
