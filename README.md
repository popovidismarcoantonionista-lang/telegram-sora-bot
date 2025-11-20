# 🎬 Bot Telegram - Replicate Video AI

Bot do Telegram que gera vídeos usando a poderosa plataforma **Replicate AI**. Desenvolvido em Node.js com Telegraf.

## 📋 Características

✅ Integração com Replicate (múltiplos modelos de IA)  
✅ Interface amigável via Telegram  
✅ Polling automático do status de geração  
✅ Feedback de progresso em tempo real  
✅ Tratamento robusto de erros  
✅ Código modular e bem documentado  
✅ **Pay-as-you-go** - Pague apenas o que usar (~$0.01-0.10/vídeo)

## 🚀 Requisitos

- **Node.js** v18 ou superior
- **npm** ou **yarn**
- **Bot Token do Telegram** (obtenha com [@BotFather](https://t.me/botfather))
- **API Token da Replicate** (obtenha em [replicate.com](https://replicate.com))

## 📦 Instalação

### 1. Clone o projeto

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
cp .env.example .env
nano .env
```

**Arquivo `.env`:**

```env
# Token do Telegram (obtenha com @BotFather)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Token da Replicate (obtenha em https://replicate.com/account/api-tokens)
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxx

# Modelo de IA (opcional)
REPLICATE_MODEL=minimax/video-01

# Configurações opcionais
DEFAULT_STEPS=50
DEFAULT_GUIDANCE_SCALE=7.5
POLLING_INTERVAL_MS=3000
MAX_POLLING_ATTEMPTS=200
```

### 4. Execute o bot

```bash
npm start
```

## 🔑 Como Obter API Token da Replicate

1. Acesse [replicate.com](https://replicate.com)
2. Crie uma conta (gratuita)
3. Vá para [Account > API Tokens](https://replicate.com/account/api-tokens)
4. Crie um novo token
5. Adicione **créditos** ($10 = ~100-1000 vídeos dependendo do modelo)
6. Cole o token no arquivo `.env`

## 💰 Custos

| Modelo | Custo Aproximado | Qualidade | Tempo |
|--------|------------------|-----------|-------|
| minimax/video-01 | $0.01-0.05/vídeo | Boa | 2-5min |
| stability-ai/stable-video-diffusion | $0.05-0.10/vídeo | Alta | 3-7min |
| genmo/mochi-1-preview | $0.10-0.20/vídeo | Excelente | 5-10min |

**💡 Dica:** Comece com $10 de crédito para testar!

## 📱 Como Usar

### Comandos disponíveis:

- `/start` - Exibe mensagem de boas-vindas
- `/help` - Guia completo de uso e dicas
- `/models` - Ver modelos disponíveis e custos
- `/info` - Informações sobre o bot

### Gerando vídeos:

1. Envie uma **descrição detalhada** do vídeo
2. Aguarde o processamento (2-10 minutos)
3. Receba o link do vídeo gerado!

### Exemplos de prompts:

✅ **Excelentes:**
- "Uma astronauta flutuando no espaço com nebulosas coloridas ao fundo, câmera girando suavemente"
- "Cachorro golden retriever correndo em câmera lenta em um campo de flores douradas"
- "Cidade futurista cyberpunk com arranha-céus neon, carros voadores, chuva torrencial"

❌ **Ruins:**
- "Vídeo legal" (muito vago)
- "Algo interessante" (sem contexto)

## 🎯 Modelos Disponíveis

### 1. minimax/video-01 (Recomendado)
- ✅ Ótimo custo-benefício
- ✅ Rápido (2-5 min)
- ✅ Boa qualidade
- 💰 ~$0.01-0.05/vídeo

### 2. stability-ai/stable-video-diffusion
- ✅ Alta qualidade
- ✅ Estável e consistente
- ⏱️ Moderado (3-7 min)
- 💰 ~$0.05-0.10/vídeo

### 3. genmo/mochi-1-preview
- ✅ Qualidade cinematográfica
- ⏱️ Mais lento (5-10 min)
- 💰 ~$0.10-0.20/vídeo

Para trocar de modelo, edite `REPLICATE_MODEL` no `.env`.

## 🏗️ Estrutura do Projeto

```
telegram-sora-bot/
├── index.js              # Arquivo principal
├── config.js             # Configurações
├── replicateService.js   # Integração com Replicate
├── telegramBot.js        # Lógica do bot
├── package.json          # Dependências
├── .env.example          # Exemplo de configuração
└── README.md             # Este arquivo
```

## 🚢 Deploy em Produção

### **Render (Recomendado)**

1. Crie conta no [Render](https://render.com)
2. Crie um **Background Worker** (não Web Service)
3. Conecte seu repositório GitHub
4. Configure as variáveis de ambiente:
   ```
   TELEGRAM_BOT_TOKEN=...
   REPLICATE_API_TOKEN=...
   ```
5. Deploy automático! ✅

### **Railway**

1. Crie conta no [Railway](https://railway.app)
2. New Project → Deploy from GitHub
3. Configure env vars
4. Deploy automático! ✅

### **VPS (DigitalOcean, AWS, etc.)**

```bash
# Use PM2
npm install -g pm2
pm2 start index.js --name telegram-video-bot
pm2 save
pm2 startup
```

## 🐛 Troubleshooting

### Bot não inicia

```
❌ TELEGRAM_BOT_TOKEN não configurado
```
**Solução:** Configure o token no arquivo `.env`

### Erro 401 Unauthorized

```
❌ API Token inválido
```
**Solução:** Verifique seu `REPLICATE_API_TOKEN` em [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)

### Erro 402 Payment Required

```
❌ Créditos insuficientes
```
**Solução:** Adicione créditos em [replicate.com/account/billing](https://replicate.com/account/billing)

### Vídeo demora muito

- ⏱️ Normal: 2-10 minutos dependendo do modelo
- 🔄 Verifique fila da Replicate em tempo de alta demanda
- 💡 Use modelos mais rápidos (minimax/video-01)

## 🔒 Segurança

⚠️ **IMPORTANTE:**
- Nunca comite o arquivo `.env`
- Mantenha suas API Tokens em segredo
- Use variáveis de ambiente em produção
- Monitore seus gastos na Replicate

## 📊 Monitoramento de Custos

Acompanhe seus gastos em:
- [Replicate Billing](https://replicate.com/account/billing)
- Ver histórico de previsões e custos
- Configurar alertas de gastos

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Add nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📄 Licença

MIT License

## 🔗 Links Úteis

- [Replicate](https://replicate.com)
- [Replicate API Docs](https://replicate.com/docs)
- [Telegraf.js Docs](https://telegraf.js.org/)
- [BotFather](https://t.me/botfather)
- [Repositório GitHub](https://github.com/popovidismarcoantonionista-lang/telegram-sora-bot)

## 💡 Dicas Pro

1. **Seja específico** nos prompts - quanto mais detalhes, melhor
2. **Teste modelos diferentes** - cada um tem estilo próprio
3. **Monitore gastos** - configure alertas na Replicate
4. **Use cache** - Replicate pode cachear predições similares
5. **Batch processing** - gere vários vídeos de uma vez para economizar

## 🌟 Exemplos de Uso

### Vídeo de Marketing
```
Produto flutuando em fundo minimalista branco, luz suave, movimento rotacional lento, estilo comercial
```

### Vídeo Artístico
```
Ondas abstratas de tinta colorida se misturando em água cristalina, câmera submersa, iluminação natural
```

### Vídeo de Natureza
```
Floresta enevoada ao amanhecer, raios de sol atravessando árvores, pássaros voando, atmosfera serena
```

---

**Desenvolvido com ❤️ usando Node.js, Telegraf e Replicate AI**

⭐ Se gostou do projeto, dê uma estrela no GitHub!
