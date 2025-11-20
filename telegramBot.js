/**
 * Módulo do Bot Telegram
 * Gerencia interações com usuários e orquestra chamadas à API Replicate
 */
import { Telegraf } from 'telegraf';
import config from './config.js';
import { createVideoTask, waitForTaskCompletion } from './replicateService.js';

/**
 * Inicializa e configura o bot do Telegram
 */
export function createBot() {
  const bot = new Telegraf(config.telegram.botToken);

  // Middleware de logging
  bot.use(async (ctx, next) => {
    const start = Date.now();
    const user = ctx.from?.username || ctx.from?.id || 'unknown';
    console.log(`📨 Mensagem recebida de @${user}`);

    await next();

    const duration = Date.now() - start;
    console.log(`✅ Resposta enviada em ${duration}ms`);
  });

  // Comando /start
  bot.start(async (ctx) => {
    const welcomeMessage = `
🎬 *Bem-vindo ao Bot de Geração de Vídeos!*

Este bot gera vídeos usando a poderosa API *Replicate*.

📝 *Como usar:*
Envie uma descrição em texto do vídeo que deseja criar.

Exemplo:
\`\`\`
Um gato laranja caminhando em uma praia ao pôr do sol
\`\`\`

⚙️ *Comandos disponíveis:*
/start - Exibe esta mensagem
/help - Instruções de uso e dicas
/models - Ver modelos disponíveis
/info - Informações sobre custos

🎨 *Modelo atual:* ${config.replicate.model}

Envie seu primeiro prompt para começar! 🚀

💡 *Dica:* A geração pode levar de 2 a 10 minutos dependendo do modelo e complexidade.
    `;

    await ctx.replyWithMarkdown(welcomeMessage);
  });

  // Comando /help
  bot.help(async (ctx) => {
    const helpMessage = `
📖 *Guia de Uso Completo*

*1. Envie uma descrição detalhada*
Seja específico e criativo! Descreva:
• **O que acontece** no vídeo
• **Estilo visual** (realista, animado, cartoon, etc.)
• **Ambiente** e iluminação
• **Movimentos** da câmera ou personagens
• **Emoção** ou atmosfera desejada

*✅ Exemplos de prompts EXCELENTES:*
• "Uma astronauta flutuando graciosamente no espaço profundo, com nebulosas roxas e azuis ao fundo, câmera girando lentamente"
• "Cachorro golden retriever correndo em câmera lenta por um campo de flores amarelas ao pôr do sol dourado"
• "Cidade futurista cyberpunk com arranha-céus neon, carros voadores, chuva torrencial, estilo Blade Runner"
• "Cachoeira mágica em floresta encantada, água cristalina brilhante, borboletas luminosas, atmosfera mística"

*❌ Exemplos de prompts RUINS:*
• "Vídeo legal" (muito vago)
• "Algo interessante" (sem contexto)
• "Faça um vídeo" (sem detalhes)

*2. Aguarde o processamento*
⏱️ Tempo estimado: 2-10 minutos
📊 Status: Você receberá atualizações de progresso

*3. Receba seu vídeo*
🎥 Link direto para download
🆔 ID da predição para referência

💡 *Dicas Profissionais:*
• Use adjetivos descritivos (brilhante, sombrio, vibrante)
• Mencione estilo artístico (cinematográfico, 3D, anime)
• Especifique movimento de câmera (zoom, pan, orbit)
• Seja específico mas conciso (100-200 palavras ideal)
    `;

    await ctx.replyWithMarkdown(helpMessage);
  });

  // Comando /models
  bot.command('models', async (ctx) => {
    const modelsMessage = `
🎯 *Modelos Disponíveis na Replicate*

*Modelo Atual:* ${config.replicate.model}

*Modelos Populares:*

1️⃣ *minimax/video-01*
   • Modelo rápido e eficiente
   • Ótima qualidade/custo
   • ~$0.01-0.05 por vídeo

2️⃣ *stability-ai/stable-video-diffusion*
   • Alta qualidade, estável
   • Melhor para vídeos curtos
   • ~$0.05-0.10 por vídeo

3️⃣ *genmo/mochi-1-preview*
   • Qualidade cinematográfica
   • Mais lento mas melhor resultado
   • ~$0.10-0.20 por vídeo

💰 *Custos Aproximados:*
• Vídeo 5s: $0.01-0.05
• Vídeo 10s: $0.05-0.10
• Vídeo HD: +50% custo

🔧 Para trocar de modelo, contate o administrador.
    `;

    await ctx.replyWithMarkdown(modelsMessage);
  });

  // Comando /info
  bot.command('info', async (ctx) => {
    const infoMessage = `
ℹ️ *Informações do Bot*

🤖 *Tecnologia:*
• Plataforma: Replicate AI
• Framework: Telegraf (Node.js)
• Deploy: Render/Railway

💰 *Sistema de Custos:*
• Pay-as-you-go (pague apenas o que usar)
• Sem mensalidade fixa
• Preços variam por modelo (~$0.01-0.20/vídeo)

⏱️ *Tempos de Processamento:*
• Fila: 0-30s (depende da demanda)
• Geração: 2-10min (depende do modelo)
• Total: ~3-10min em média

🔒 *Privacidade:*
• Seus prompts são processados pela Replicate
• Vídeos ficam disponíveis por 24h
• Não armazenamos seus vídeos permanentemente

📊 *Limites:*
• Sem limite de requisições
• Limitado apenas por créditos Replicate
• Uma geração por vez por usuário

🔗 *Links Úteis:*
• Replicate: replicate.com
• Código fonte: github.com/seu-repo
• Suporte: Entre em contato via Telegram
    `;

    await ctx.replyWithMarkdown(infoMessage);
  });

  // Handler para mensagens de texto (prompts de vídeo)
  bot.on('text', async (ctx) => {
    const prompt = ctx.message.text;

    // Ignora comandos
    if (prompt.startsWith('/')) {
      return;
    }

    // Valida tamanho do prompt
    if (prompt.length < 10) {
      await ctx.reply('⚠️ Por favor, envie uma descrição mais detalhada (mínimo 10 caracteres).\n\n💡 Use /help para ver exemplos de bons prompts!');
      return;
    }

    if (prompt.length > 2000) {
      await ctx.reply('⚠️ Descrição muito longa. Por favor, use no máximo 2000 caracteres.\n\n💡 Seja conciso mas descritivo!');
      return;
    }

    // Inicia processamento
    await ctx.reply('🎬 Recebido! Iniciando geração do vídeo...\n\n⏳ Isso pode levar alguns minutos. Aguarde!');

    try {
      // 1. Criar predição na Replicate
      const createResult = await createVideoTask(prompt);

      if (!createResult.success) {
        await ctx.reply(`${createResult.error}\n\n💡 Tente novamente ou use /help para dicas.`);
        return;
      }

      const predictionId = createResult.predictionId;
      await ctx.reply(`✅ Predição criada!\n🆔 ID: \`${predictionId}\`\n\n⏳ Processando seu vídeo...`, {
        parse_mode: 'Markdown'
      });

      // 2. Aguardar conclusão com feedback de progresso
      let lastProgressMessage = null;
      let lastProgress = 0;

      const result = await waitForTaskCompletion(predictionId, async (attempt, maxAttempts, status) => {
        // Envia atualizações a cada 10 tentativas ou mudança de status
        const progress = Math.round((attempt / maxAttempts) * 100);

        if (attempt % 10 === 0 || progress - lastProgress >= 10) {
          lastProgress = progress;

          const statusEmoji = {
            'starting': '🚀',
            'processing': '⚙️',
            'succeeded': '✅',
            'failed': '❌'
          };

          const progressMessage = `${statusEmoji[status] || '⏳'} *Status:* ${status}\n📊 *Progresso:* ${progress}%\n🔄 *Tentativa:* ${attempt}/${maxAttempts}`;

          if (lastProgressMessage) {
            try {
              await ctx.telegram.editMessageText(
                ctx.chat.id,
                lastProgressMessage.message_id,
                null,
                progressMessage,
                { parse_mode: 'Markdown' }
              );
            } catch {
              // Ignora erros de edição
            }
          } else {
            lastProgressMessage = await ctx.replyWithMarkdown(progressMessage);
          }
        }
      });

      // 3. Processar resultado
      if (!result.success) {
        await ctx.reply(`${result.error}\n\n🆔 Prediction ID: \`${predictionId}\`\n\n💡 Se o erro persistir, tente um prompt mais simples.`, {
          parse_mode: 'Markdown'
        });
        return;
      }

      // 4. Enviar vídeo ao usuário
      if (result.videoUrl) {
        const successMessage = `
✨ *Vídeo gerado com sucesso!*

🎥 *Link do vídeo:*
${result.videoUrl}

🆔 *Prediction ID:* \`${predictionId}\`
📊 *Status:* ${result.status}

💡 *Próximos passos:*
• Clique no link para baixar/visualizar
• O link expira em 24 horas
• Envie outro prompt para gerar mais vídeos
• Use /help para dicas de prompts melhores

🌟 *Gostou?* Compartilhe com seus amigos!
        `;

        await ctx.replyWithMarkdown(successMessage);

      } else {
        await ctx.reply(`⚠️ Vídeo processado, mas nenhum link foi retornado.\n\n🆔 Prediction ID: \`${predictionId}\`\n📊 Status: ${result.status}\n\n💡 Tente novamente.`, {
          parse_mode: 'Markdown'
        });
      }

    } catch (error) {
      console.error('❌ Erro crítico no processamento:', error);

      await ctx.reply(`❌ Ocorreu um erro inesperado.\n\n🔧 Detalhes: ${error.message}\n\n💡 Por favor, tente novamente em alguns minutos.`);
    }
  });

  // Handler para outros tipos de mensagem
  bot.on('message', async (ctx) => {
    await ctx.reply('⚠️ Por favor, envie apenas *mensagens de texto* com a descrição do vídeo.\n\nUse /help para mais informações.', {
      parse_mode: 'Markdown'
    });
  });

  // Error handler global
  bot.catch((error, ctx) => {
    console.error('❌ Erro no bot:', error);
    if (ctx) {
      ctx.reply('❌ Ocorreu um erro. Por favor, tente novamente.').catch(() => {});
    }
  });

  return bot;
}
