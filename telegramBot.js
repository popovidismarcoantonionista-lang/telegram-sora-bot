/**
 * Bot Telegram - Geração de IMAGENS e VÍDEOS com AI
 */
import { Telegraf } from 'telegraf';
import config from './config.js';
import { generateImage, generateVideo, generateMultipleImages, generateAuto, validatePrompt } from './huggingFaceService.js';

export function createBot() {
  const bot = new Telegraf(config.telegram.botToken);

  // Middleware de logging
  bot.use(async (ctx, next) => {
    const start = Date.now();
    const user = ctx.from?.username || ctx.from?.id || 'unknown';
    console.log(`📨 Mensagem de @${user}`);
    await next();
    const duration = Date.now() - start;
    console.log(`✅ Processado em ${duration}ms`);
  });

  // /start
  bot.start(async (ctx) => {
    const welcomeMessage = `
🎨 *Bem-vindo ao Bot AI Creator!*

Crie *IMAGENS* e *VÍDEOS* incríveis com IA!
Powered by *Hugging Face* 🤗

✨ *100% GRATUITO* ✨

📝 *Como usar:*

*Para IMAGENS:*
\`Um gato astronauta no espaço\`

*Para VÍDEOS:*
\`/video Gato correndo na praia\`
ou
\`Vídeo de gato correndo na praia\`

⚙️ *Comandos:*
/start - Boas-vindas
/help - Guia completo
/video - Gerar vídeo
/image - Gerar imagem
/multiple - Várias imagens
/examples - Ver exemplos
/info - Sobre o bot

🎯 *Modelos:*
• Imagens: Stable Diffusion XL
• Vídeos: Text-to-Video MS

⏱️ *Tempo:*
• Imagens: 10-30s
• Vídeos: 1-3min

Comece agora! 🚀
    `;

    await ctx.replyWithMarkdown(welcomeMessage);
  });

  // /help
  bot.help(async (ctx) => {
    const helpMessage = `
📖 *Guia Completo*

*🎨 IMAGENS:*
Envie uma descrição:
\`Um leão majestoso ao pôr do sol\`

*🎬 VÍDEOS:*
Use /video ou mencione "vídeo":
\`/video Pássaro voando sobre montanhas\`
ou
\`Vídeo de pássaro voando\`

*📸 MÚLTIPLAS IMAGENS:*
\`Cidade cyberpunk 3\` (gera 3 variações)

*✅ DICAS PARA MELHORES RESULTADOS:*

*Para IMAGENS:*
• Seja específico: cores, estilo, iluminação
• Use: "4k", "detailed", "high quality"
• Especifique estilo: "photorealistic", "digital art"

*Para VÍDEOS:*
• Descreva MOVIMENTO: "correndo", "voando", "girando"
• Mantenha simples (vídeos são mais lentos)
• Evite muitos detalhes complexos

*❌ EVITE:*
• Prompts vagos
• Conteúdo inapropriado
• Muitas ideias misturadas

💡 Use /examples para ver prompts incríveis!
    `;

    await ctx.replyWithMarkdown(helpMessage);
  });

  // /video
  bot.command('video', async (ctx) => {
    const prompt = ctx.message.text.replace('/video', '').trim();

    if (!prompt) {
      await ctx.reply('🎬 *Gerar Vídeo*\n\nUso: `/video sua descrição aqui`\n\nExemplo:\n`/video Gato correndo em câmera lenta`\n\n💡 Descreva MOVIMENTO para melhores resultados!', {
        parse_mode: 'Markdown'
      });
      return;
    }

    await generateMediaForUser(ctx, prompt, 'video');
  });

  // /image
  bot.command('image', async (ctx) => {
    const prompt = ctx.message.text.replace('/image', '').trim();

    if (!prompt) {
      await ctx.reply('🎨 *Gerar Imagem*\n\nUso: `/image sua descrição`\n\nExemplo:\n`/image Paisagem futurista com neon`', {
        parse_mode: 'Markdown'
      });
      return;
    }

    await generateMediaForUser(ctx, prompt, 'image');
  });

  // /multiple
  bot.command('multiple', async (ctx) => {
    await ctx.reply('🎨 *Múltiplas Imagens*\n\nEnvie: `prompt número`\n\nExemplo:\n`Gato astronauta 3`\n\nGerará 3 variações!', {
      parse_mode: 'Markdown'
    });
  });

  // /examples
  bot.command('examples', async (ctx) => {
    const examplesMessage = `
🌟 *Exemplos Incríveis*

*🎨 IMAGENS:*

📸 *Fotografia:*
\`Portrait of woman, blue eyes, golden hour, bokeh, 4k\`

🎨 *Arte Digital:*
\`Dragon over mountains, epic fantasy, detailed\`

🌆 *Cyberpunk:*
\`Futuristic Tokyo, neon signs, rain, cinematic\`

*🎬 VÍDEOS:*

🐾 *Natureza:*
\`/video Eagle flying over canyon, slow motion\`

🏙️ *Urbano:*
\`/video Cars driving in futuristic city at night\`

🌊 *Água:*
\`/video Dolphin jumping out of ocean waves\`

🎪 *Abstrato:*
\`/video Colorful smoke swirling and dancing\`

💡 Adapte para suas ideias!
    `;

    await ctx.replyWithMarkdown(examplesMessage);
  });

  // /info
  bot.command('info', async (ctx) => {
    const infoMessage = `
ℹ️ *Informações do Bot*

*🤖 Tecnologia:*
• API: Hugging Face
• Imagens: Stable Diffusion XL
• Vídeos: Text-to-Video MS

*💰 Custo:*
• *100% GRATUITO* ✨
• Sem limites abusivos

*⏱️ Performance:*
• Imagens: 10-30s (1024x1024)
• Vídeos: 1-3min (16 frames)
• Rate: ~50 img/hora, ~20 vídeos/hora

*🎯 Capacidades:*
✅ Imagens HD
✅ Vídeos curtos animados
✅ Múltiplas variações
✅ Detecção automática (imagem/vídeo)

*🔗 Links:*
• Hugging Face: huggingface.co
• Código: github.com/seu-repo
• Modelos: huggingface.co/damo-vilab

*⭐ Open Source & Free Forever*
    `;

    await ctx.replyWithMarkdown(infoMessage);
  });

  // Handler de texto
  bot.on('text', async (ctx) => {
    let prompt = ctx.message.text;

    if (prompt.startsWith('/')) return;

    // Detecta múltiplas imagens
    const multipleMatch = prompt.match(/^(.*?)\s+(\d+)$/);
    let count = 1;

    if (multipleMatch) {
      prompt = multipleMatch[1].trim();
      count = Math.min(parseInt(multipleMatch[2]), 4);

      if (count > 1) {
        await ctx.reply(`🎨 Gerando *${count} variações*!\n⏳ ~${count * 15}-${count * 30}s...`, {
          parse_mode: 'Markdown'
        });
      }
    }

    // Valida
    const validation = validatePrompt(prompt);
    if (!validation.valid) {
      await ctx.reply(validation.error);
      return;
    }

    // Múltiplas imagens
    if (count > 1) {
      const loadingMsg = await ctx.reply('🎨 Gerando suas imagens...\n⏳ Aguarde...', {
        parse_mode: 'Markdown'
      });

      try {
        const results = await generateMultipleImages(prompt, count);
        let successCount = 0;

        for (let i = 0; i < results.length; i++) {
          const result = results[i];

          if (result.success) {
            successCount++;
            await ctx.replyWithPhoto(
              { source: result.buffer },
              {
                caption: `🎨 *Imagem ${i + 1}/${count}*\n\n📝 ${prompt.substring(0, 100)}\n⏱️ ${result.duration}s`,
                parse_mode: 'Markdown'
              }
            );
          }
        }

        if (successCount > 0) {
          await ctx.reply(`✨ *${successCount}/${count} imagens geradas!*`, {
            parse_mode: 'Markdown'
          });
        }

        try { await ctx.deleteMessage(loadingMsg.message_id); } catch {}

      } catch (error) {
        console.error('❌ Erro:', error);
        await ctx.reply(`❌ Erro: ${error.message}`);
      }

      return;
    }

    // Detecta automaticamente se é imagem ou vídeo
    const lowerPrompt = prompt.toLowerCase();
    const isVideoRequest = lowerPrompt.includes('video') || lowerPrompt.includes('vídeo');

    if (isVideoRequest) {
      // Remove palavra "video/vídeo" do prompt
      prompt = prompt.replace(/\bvideo\b|\bvídeo\b/gi, '').trim();
      await generateMediaForUser(ctx, prompt, 'video');
    } else {
      await generateMediaForUser(ctx, prompt, 'auto');
    }
  });

  // Handler global de erros
  bot.catch((error, ctx) => {
    console.error('❌ Erro no bot:', error);
    if (ctx) {
      ctx.reply('❌ Erro inesperado. Tente novamente.').catch(() => {});
    }
  });

  return bot;
}

/**
 * Função auxiliar para gerar mídia
 */
async function generateMediaForUser(ctx, prompt, type = 'auto') {
  let loadingMsg;

  try {
    if (type === 'video') {
      loadingMsg = await ctx.reply('🎬 Gerando vídeo...\n⏳ Isso pode levar 1-3 minutos...\n\n💡 Primeira geração pode ser mais lenta!', {
        parse_mode: 'Markdown'
      });
    } else {
      loadingMsg = await ctx.reply('🎨 Criando...\n⏳ ~10-30s...', {
        parse_mode: 'Markdown'
      });
    }

    let result;

    if (type === 'video') {
      result = await generateVideo(prompt);
    } else if (type === 'image') {
      result = await generateImage(prompt);
    } else {
      result = await generateAuto(prompt);
    }

    if (result.success) {
      if (result.type === 'video') {
        await ctx.replyWithVideo(
          { source: result.buffer },
          {
            caption: `🎬 *Vídeo Gerado!*\n\n📝 ${prompt.substring(0, 150)}\n\n⏱️ ${result.duration}s\n🤖 ${result.model.split('/').pop()}\n\n💡 Use /help para dicas!`,
            parse_mode: 'Markdown'
          }
        );
      } else {
        await ctx.replyWithPhoto(
          { source: result.buffer },
          {
            caption: `✨ *Imagem Gerada!*\n\n📝 ${prompt.substring(0, 150)}\n\n⏱️ ${result.duration}s\n🤖 ${result.model.split('/').pop()}`,
            parse_mode: 'Markdown'
          }
        );
      }

      try { await ctx.deleteMessage(loadingMsg.message_id); } catch {}

    } else {
      await ctx.reply(result.error);
    }

  } catch (error) {
    console.error('❌ Erro crítico:', error);
    await ctx.reply(`❌ Erro: ${error.message}\n\n💡 Tente novamente.`);
  }
}
