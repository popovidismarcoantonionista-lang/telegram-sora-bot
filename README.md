# 🎨 Bot Telegram - AI Image Generator

Bot do Telegram que gera **imagens incríveis** usando **Inteligência Artificial**.

✨ **100% GRATUITO** ✨

Powered by **Hugging Face** 🤗 + **Stable Diffusion** 🎨

---

## 🌟 Características

✅ **Totalmente Gratuito** - Sem custos, sem cartão de crédito  
✅ **Geração Rápida** - 10-30 segundos por imagem  
✅ **Alta Qualidade** - 1024x1024 pixels  
✅ **Fácil de Usar** - Apenas descreva o que quer  
✅ **Múltiplas Variações** - Gere 2-4 imagens de uma vez  
✅ **Open Source** - Código aberto no GitHub  

---

## 🚀 Demo

**Prompt:** "A majestic lion with golden mane, sunset background, photorealistic"

**Resultado:** Imagem fotorrealista de um leão majestoso com juba dourada! 🦁

---

## 📦 Instalação

### Requisitos

- **Node.js** v18+
- **npm** ou **yarn**
- **Token do Telegram** ([@BotFather](https://t.me/botfather))
- **Token da Hugging Face** ([huggingface.co/settings/tokens](https://huggingface.co/settings/tokens))

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/popovidismarcoantonionista-lang/telegram-sora-bot.git
cd telegram-sora-bot

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
nano .env

# 4. Execute o bot
npm start
```

---

## 🔑 Configuração

### Arquivo `.env`

```env
# Token do Telegram (obtenha com @BotFather)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Token da Hugging Face (GRÁTIS em huggingface.co/settings/tokens)
HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx

# Modelo (opcional - padrão: SDXL)
HF_MODEL=stabilityai/stable-diffusion-xl-base-1.0

# Qualidade (opcional)
IMAGE_WIDTH=1024
IMAGE_HEIGHT=1024
INFERENCE_STEPS=30
GUIDANCE_SCALE=7.5
```

### Obtendo Token Hugging Face (GRÁTIS)

1. **Acesse:** [huggingface.co](https://huggingface.co)
2. **Crie conta gratuita** (sem cartão)
3. **Vá para:** [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. **Crie novo token** (Read access)
5. **Copie e cole no `.env`**

---

## 📱 Como Usar

### Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `/start` | Mensagem de boas-vindas |
| `/help` | Guia completo + dicas |
| `/examples` | Ver exemplos de prompts |
| `/multiple` | Gerar várias imagens |
| `/info` | Informações do bot |

### Gerando Imagens

**Simples:** Envie uma descrição

```
Um gato astronauta flutuando no espaço
```

**Múltiplas:** Adicione um número (2-4)

```
Cidade futurista cyberpunk 3
```

Isso gerará 3 variações!

---

## 🎯 Exemplos de Prompts

### 📸 Fotografia Profissional

```
Portrait of a young woman with blue eyes, golden hour lighting, 
professional photography, bokeh background, 50mm lens, 4k
```

### 🎨 Arte Digital

```
Dragon flying over mountain peaks, epic fantasy art, dramatic clouds, 
digital painting, highly detailed, trending on artstation
```

### 🌆 Cenários Urbanos

```
Futuristic Tokyo street at night, neon signs, rain reflections, 
cyberpunk aesthetic, cinematic composition, 8k
```

### 🐾 Animais

```
Majestic white wolf in snowy forest, moonlight, mystical atmosphere, 
photorealistic, award winning photography
```

### 🎭 Fantasia

```
Fairy castle floating in clouds, magical glowing crystals, rainbow waterfall, 
fantasy illustration, dreamy, vibrant colors
```

### 🤖 Ficção Científica

```
Advanced AI robot in laboratory, holographic displays, blue lighting, 
concept art, octane render, futuristic
```

---

## 💡 Dicas Para Prompts Melhores

### ✅ O que FAZER:

- ✓ Seja específico e detalhado
- ✓ Use palavras-chave de qualidade: "4k", "detailed", "high quality"
- ✓ Especifique o estilo: "photorealistic", "digital art", "oil painting"
- ✓ Descreva iluminação: "golden hour", "dramatic lighting", "neon"
- ✓ Adicione atmosfera: "mystical", "serene", "epic"

### ❌ O que EVITAR:

- ✗ Prompts muito vagos ("algo legal")
- ✗ Sem detalhes ("uma pessoa")
- ✗ Muitas ideias misturadas
- ✗ Conteúdo inapropriado

---

## 🏗️ Estrutura do Projeto

```
telegram-sora-bot/
├── index.js                  # Arquivo principal
├── config.js                 # Configurações
├── huggingFaceService.js     # Integração com Hugging Face
├── telegramBot.js            # Lógica do bot
├── package.json              # Dependências
├── .env.example              # Exemplo de configuração
└── README.md                 # Este arquivo
```

---

## 🚢 Deploy em Produção

### Render (Recomendado)

1. Crie conta no [Render](https://render.com)
2. **New** → **Background Worker** (não Web Service!)
3. Conecte seu repositório GitHub
4. Configure env vars:
   ```
   TELEGRAM_BOT_TOKEN=...
   HUGGINGFACE_API_TOKEN=...
   ```
5. Deploy! 🚀

### Railway

1. Crie conta no [Railway](https://railway.app)
2. New Project → Deploy from GitHub
3. Configure env vars
4. Deploy! 🚀

### VPS / Cloud

```bash
# Use PM2 para gerenciar
npm install -g pm2
pm2 start index.js --name ai-image-bot
pm2 save
pm2 startup
```

---

## 🐛 Troubleshooting

### Bot não inicia

**Erro:** `TELEGRAM_BOT_TOKEN não configurado`

**Solução:** Configure o token no `.env`

### Erro 401

**Erro:** `Token da Hugging Face inválido`

**Solução:** Verifique seu token em [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

### Erro 503 - Model Loading

**Erro:** `Modelo está carregando`

**Solução:** Aguarde 20-30 segundos e tente novamente (modelos "dormem" quando não usados)

### Imagem demora muito

- ⏱️ Normal: 10-30 segundos
- 🔄 Primeira geração: até 60s (modelo carregando)
- 💡 Use prompts mais simples para resultados mais rápidos

---

## 📊 Performance

| Métrica | Valor |
|---------|-------|
| Tempo médio | 10-30s |
| Resolução | 1024x1024 |
| Qualidade | Alta (SDXL) |
| Custo | **GRÁTIS** |
| Rate limit | ~100 img/hora |

---

## 🎨 Modelos Disponíveis

### 1. Stable Diffusion XL (Padrão) ⭐

```env
HF_MODEL=stabilityai/stable-diffusion-xl-base-1.0
```

- ✅ Melhor qualidade
- ✅ Alta resolução
- ⏱️ ~20-30s

### 2. Stable Diffusion 2.1

```env
HF_MODEL=stabilityai/stable-diffusion-2-1
```

- ✅ Boa qualidade
- ✅ Mais rápido
- ⏱️ ~10-20s

### 3. Stable Diffusion 1.5

```env
HF_MODEL=runwayml/stable-diffusion-v1-5
```

- ✅ Clássico
- ✅ Muito rápido
- ⏱️ ~5-15s

---

## 🔒 Privacidade & Segurança

- ✅ Código 100% open source
- ✅ Sem armazenamento de imagens
- ✅ Processamento via Hugging Face (confiável)
- ✅ Sem coleta de dados pessoais
- ✅ Token nunca exposto

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. **Fork** o projeto
2. **Crie branch:** `git checkout -b feature/nova-feature`
3. **Commit:** `git commit -m 'Add feature'`
4. **Push:** `git push origin feature/nova-feature`
5. **Pull Request**

---

## 📄 Licença

MIT License - Use livremente!

---

## 🔗 Links Úteis

- 🤗 [Hugging Face](https://huggingface.co)
- 📖 [Hugging Face Docs](https://huggingface.co/docs/api-inference)
- 🎨 [Stable Diffusion](https://stability.ai)
- 🤖 [Telegraf.js](https://telegraf.js.org)
- 💬 [BotFather](https://t.me/botfather)

---

## 💬 Suporte

Encontrou um bug? Tem uma sugestão?

- 🐛 [Abra uma Issue](https://github.com/popovidismarcoantonionista-lang/telegram-sora-bot/issues)
- 💡 [Inicie uma Discussion](https://github.com/popovidismarcoantonionista-lang/telegram-sora-bot/discussions)

---

## 🌟 Mostre Seu Apoio

Se este projeto te ajudou, deixe uma ⭐ no GitHub!

---

**Desenvolvido com ❤️ usando Node.js, Telegraf e Hugging Face**

**100% Gratuito & Open Source** 🎨✨
