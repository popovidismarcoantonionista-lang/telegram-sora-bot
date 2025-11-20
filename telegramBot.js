/**
 * Módulo do Bot Telegram
 * Gerencia interações com usuários e orquestra chamadas à API
 */
import { Telegraf } from 'telegraf';
import config from './config.js';
import { createVideoTask, waitForTaskCompletion } from './kieAiService.js';

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
🎬 *Bem-vindo ao Bot Sora 2 Video Generator!*

Este bot gera vídeos usando a API Kie.ai Sora 2 Text To Video.

📝 *Como usar:*
Envie uma descrição em texto do vídeo que deseja criar.

Exemplo:
\`\`\`
Um gato laranja caminhando em uma praia ao pôr do sol
\`\`\`

⚙️ *Comandos disponíveis:*
/start - Exibe esta mensagem
/help - Instruções de uso
/settings - Ver configurações atuais

🎨 *Configurações padrão:*
• Formato: ${config.video.defaultAspectRatio}
• Frames: ${config.video.defaultNFrames}
• Marca d'água: ${config.video.removeWatermark ? 'Removida' : 'Visível'}

Envie seu primeiro prompt para começar! 🚀
    `;

    await ctx.replyWithMarkdown(welcomeMessage);
  });

  // Comando /help
  bot.help(async (ctx) => {
    const helpMessage = `
📖 *Guia de Uso*

*1. Envie uma descrição de vídeo*
Seja específico e criativo! Descreva:
• O que acontece no vídeo
• Estilo visual (realista, animado, etc.)
• Ambiente e iluminação
• Movimentos da câmera

*Exemplos de prompts bons:*
✅ "Uma astronauta flutuando no espaço com nebulosas coloridas ao fundo, câmera girando suavemente"
✅ "Cachorro golden retriever correndo em câmera lenta em um campo de flores"
✅ "Cidade futurista com carros voadores, estilo cyberpunk, chuva neon"

*Exemplos de prompts ruins:*
❌ "Vídeo legal"
❌ "Algo interessante"

*2. Aguarde o processamento*
A geração pode levar de 1 a 5 minutos dependendo da complexidade.

*3. Receba seu vídeo*
O bot enviará o link do vídeo assim que estiver pronto!

💡 *Dicas:*
• Seja específico mas não muito longo
• Use adjetivos descritivos
• Mencione estilo de câmera se quiser movimento específico
    `;

    await ctx.replyWithMarkdown(helpMessage);
  });

  // Comando /settings
  bot.command('settings', async (ctx) => {
    const settingsMessage = `
⚙️ *Configurações Atuais*

📐 *Formato:* ${config.video.defaultAspectRatio}
   (landscape = 16:9, portrait = 9:16)

🎞️ *Frames:* ${config.video.defaultNFrames}
   (10 = ~4s, 15 = ~6s)

💧 *Marca d'água:* ${config.video.removeWatermark ? '✅ Removida' : '❌ Visível'}

ℹ️ Estas configurações são definidas no servidor.
Para alterá-las, entre em contato com o administrador.
    `;

    await ctx.replyWithMarkdown(settingsMessage);
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
      await ctx.reply('⚠️ Por favor, envie uma descrição mais detalhada (mínimo 10 caracteres).');
      return;
    }

    if (prompt.length > 1000) {
      await ctx.reply('⚠️ Descrição muito longa. Por favor, use no máximo 1000 caracteres.');
      return;
    }

    // Inicia processamento
    await ctx.reply('🎬 Recebido! Criando seu vídeo...');

    try {
      // 1. Criar task na API
      const createResult = await createVideoTask(prompt);

      if (!createResult.success) {
        await ctx.reply(`${createResult.error}\n\n💡 Tente novamente com um prompt diferente.`);
        return;
      }

      const taskId = createResult.taskId;
      await ctx.reply(`✅ Task criada com sucesso!\n🆔 Task ID: \`${taskId}\`\n\n⏳ Processando... Isso pode levar alguns minutos.`, {
        parse_mode: 'Markdown'
      });

      // 2. Aguardar conclusão com feedback de progresso
      let lastProgressMessage = null;

      const result = await waitForTaskCompletion(taskId, async (attempt, maxAttempts, state) => {
        // Envia atualizações a cada 5 tentativas
        if (attempt % 5 === 0) {
          const progress = Math.round((attempt / maxAttempts) * 100);
          const progressMessage = `⏳ Progresso: ${progress}%\nEstado: ${state}\nTentativa ${attempt}/${maxAttempts}`;

          if (lastProgressMessage) {
            try {
              await ctx.telegram.editMessageText(
                ctx.chat.id,
                lastProgressMessage.message_id,
                null,
                progressMessage
              );
            } catch {
              // Ignora erros de edição (mensagem não mudou)
            }
          } else {
            lastProgressMessage = await ctx.reply(progressMessage);
          }
        }
      });

      // 3. Processar resultado
      if (!result.success) {
        await ctx.reply(`${result.error}\n\n🆔 Task ID: \`${taskId}\``, {
          parse_mode: 'Markdown'
        });
        return;
      }

      // 4. Enviar vídeo ao usuário
      if (result.videoUrls && result.videoUrls.length > 0) {
        const videoUrl = result.videoUrls[0];

        const successMessage = `
✨ *Vídeo gerado com sucesso!*

🎥 *Link do vídeo:*
${videoUrl}

🆔 *Task ID:* \`${taskId}\`
📊 *Estado:* ${result.state}

💡 *Próximos passos:*
• Clique no link para baixar/visualizar
• Envie outro prompt para gerar mais vídeos
• Use /help para dicas de prompts melhores
        `;

        await ctx.replyWithMarkdown(successMessage);

      } else {
        await ctx.reply(`⚠️ Vídeo processado, mas nenhum link foi retornado.\n\n🆔 Task ID: \`${taskId}\`\n📊 Estado: ${result.state}`, {
          parse_mode: 'Markdown'
        });
      }

    } catch (error) {
      console.error('❌ Erro crítico no processamento:', error);

      await ctx.reply(`❌ Ocorreu um erro inesperado ao processar sua solicitação.\n\nDetalhes técnicos: ${error.message}\n\n💡 Por favor, tente novamente.`, {
        parse_mode: 'Markdown'
      });
    }
  });

  // Handler para outros tipos de mensagem
  bot.on('message', async (ctx) => {
    await ctx.reply('⚠️ Por favor, envie apenas mensagens de texto com a descrição do vídeo que deseja criar.\n\nUse /help para mais informações.');
  });

  // Error handler global
  bot.catch((error, ctx) => {
    console.error('❌ Erro no bot:', error);
    ctx.reply('❌ Ocorreu um erro. Por favor, tente novamente.').catch(() => {});
  });

  return bot;
}
