# 🚂 Guia de Deploy no Railway

## Passo a Passo Completo

### 1️⃣ **Acesse o Railway**
Acesse [railway.app](https://railway.app) e faça login com sua conta GitHub.

### 2️⃣ **Criar Novo Projeto**
- Clique em **"New Project"**
- Selecione **"Deploy from GitHub repo"**
- Escolha o repositório: `popovidismarcoantonionista-lang/telegram-sora-bot`
- Clique em **"Deploy Now"**

### 3️⃣ **Configurar Variáveis de Ambiente**
Vá em **Variables** e adicione:

```
TELEGRAM_BOT_TOKEN=seu_token_do_botfather_aqui
KIE_AI_API_KEY=sua_api_key_kie_ai_aqui
KIE_AI_BASE_URL=https://api.kie.ai/api/v1
DEFAULT_ASPECT_RATIO=landscape
DEFAULT_N_FRAMES=15
REMOVE_WATERMARK=true
POLLING_INTERVAL_MS=3000
MAX_POLLING_ATTEMPTS=100
```

**⚠️ IMPORTANTE:**
- `TELEGRAM_BOT_TOKEN`: Obtenha com [@BotFather](https://t.me/botfather) no Telegram
- `KIE_AI_API_KEY`: Obtenha em [kie.ai](https://kie.ai)

### 4️⃣ **Deploy Automático**
O Railway detectará automaticamente:
- ✅ Node.js 18
- ✅ `npm install` será executado
- ✅ `npm start` iniciará o bot
- ✅ Railway.json e nixpacks.toml configurados

### 5️⃣ **Verificar Logs**
- Clique na aba **"Deployments"**
- Veja os logs em tempo real
- Procure por: `✅ Bot iniciado com sucesso!`

### 6️⃣ **Testar o Bot**
- Abra o Telegram
- Procure por seu bot (nome que você configurou no BotFather)
- Envie `/start`
- Teste gerando um vídeo!

---

## ⚙️ Configurações Avançadas

### **Restart Policy**
O bot está configurado para reiniciar automaticamente em caso de falha (max 10 tentativas).

### **Resource Usage**
- **Memória**: ~100-200 MB
- **CPU**: Baixo (exceto durante uploads)
- **Custo estimado**: $5-10/mês no plano Hobby

### **Custom Domain (Opcional)**
Se quiser um domínio personalizado:
1. Vá em **Settings** → **Domains**
2. Adicione seu domínio customizado
3. Configure DNS conforme instruções

---

## 🐛 Troubleshooting

### **Bot não inicia**
✅ Verifique as variáveis de ambiente
✅ Veja os logs para erros de autenticação
✅ Confirme que o token do Telegram está correto

### **"TELEGRAM_BOT_TOKEN não configurado"**
❌ Você esqueceu de adicionar as env vars no Railway
✅ Vá em Variables e adicione todas as variáveis

### **"401 Unauthorized" da API Kie.ai**
❌ API Key inválida ou expirada
✅ Verifique sua API key em [kie.ai](https://kie.ai)

### **Bot responde mas não gera vídeos**
❌ Créditos insuficientes na conta Kie.ai
✅ Recarregue créditos na plataforma Kie.ai

---

## 🔄 Atualizações

Para atualizar o bot após mudanças no código:

1. **Push para GitHub**:
   ```bash
   git add .
   git commit -m "Atualização do bot"
   git push origin main
   ```

2. **Railway fará deploy automático** em ~2-3 minutos

---

## 📊 Monitoramento

### **Logs em Tempo Real**
```bash
railway logs
```

### **Métricas**
- CPU, memória e rede visíveis no dashboard
- Alertas podem ser configurados

---

## 💰 Custos

### **Plano Hobby**
- $5/mês para ~500 horas de uso
- Ideal para bots pequenos/médios
- Inclui 512 MB RAM, 1 vCPU

### **Plano Pro**
- $20/mês com recursos expandidos
- Melhor para bots de produção

---

## 🔗 Links Úteis

- [Railway Docs](https://docs.railway.app)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Kie.ai API Docs](https://kie.ai/docs)
- [Repositório GitHub](https://github.com/popovidismarcoantonionista-lang/telegram-sora-bot)

---

## ✅ Checklist de Deploy

- [ ] Repositório no GitHub criado
- [ ] Conta no Railway criada
- [ ] Projeto Railway conectado ao GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] Logs verificados sem erros
- [ ] Bot testado no Telegram
- [ ] Comandos /start, /help funcionando
- [ ] Geração de vídeo testada

---

**Pronto! Seu bot está no ar! 🎉**

Se tiver dúvidas, consulte os logs do Railway ou o README do projeto.
