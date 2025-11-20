/**
 * Módulo do Bot Telegram
 * Gerencia interações e geração de imagens com Hugging Face
 */
import { Telegraf } from 'telegraf';
import config from './config.js';
import { generateImage, generateMultipleImages, validatePrompt } from './huggingFaceService.js';

/**
 * Inicializa e configura o bot
 */
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

  // Comando /start
  bot.start(async (ctx) => {
    const welcomeMessage = `
🎨 *Bem-vindo ao Bot de Geração de Imagens AI!*

Crie imagens incríveis usando *Inteligência Artificial*.
Powered by *Hugging Face* 🤗 + *Stable Diffusion* 🎨

✨ *100% GRATUITO* ✨

📝 *Como usar:*
Simplesmente envie uma descrição do que quer ver!

*Exemplo:*
\`\`\`
Um gato astronauta flutuando no espaço
\`\`\`

⚙️ *Comandos:*
/start - Mensagem de boas-vindas
/help - Guia completo + dicas
/examples - Ver exemplos incríveis
/multiple - Gerar várias imagens
/info - Sobre o bot

🎯 *Modelo atual:* Stable Diffusion XL
⚡ *Tempo médio:* 10-30 segundos

Descreva sua imagem e vamos criar! 🚀
    `;

    await ctx.replyWithMarkdown(welcomeMessage);
  });

  // Comando /help
  bot.help(async (ctx) => {
    const helpMessage = `
📖 *Guia Completo de Uso*

*🎨 Como criar imagens incríveis:*

*1. Seja específico e detalhado*
Quanto mais detalhes, melhor o resultado!

Descreva:
• *O que* você quer ver
• *Estilo* artístico (realista, cartoon, 3D, etc.)
• *Cores* predominantes
• *Iluminação* (dia, noite, neon, etc.)
• *Atmosfera* (alegre, sombrio, místico, etc.)

*2. Use palavras-chave poderosas*
• "high quality", "detailed", "4k", "masterpiece"
• "photorealistic", "cinematic lighting"
• "digital art", "concept art", "trending on artstation"

*3. Especifique o estilo*
• Fotográfico: "photo, realistic, 8k"
• Ilustração: "digital art, illustration"
• 3D: "3D render, octane render"
• Pintura: "oil painting, watercolor"

*✅ Exemplos EXCELENTES:*

• "A majestic lion with a golden mane, sunset background, photorealistic, 4k, detailed"

• "Cyberpunk city at night, neon lights, rain, futuristic cars, cinematic, high quality"

• "Cute cartoon cat wearing wizard hat, magical sparkles, colorful, digital art"

• "Ancient temple in misty forest, dramatic lighting, concept art, fantasy"

*❌ Evite:*
• Descrições muito vagas ("algo legal")
• Sem detalhes ("uma pessoa")
• Muitas ideias misturadas

*💡 Dica Pro:*
Comece simples e vá adicionando detalhes!
    `;

    await ctx.replyWithMarkdown(helpMessage);
  });

  // Comando /examples
  bot.command('examples', async (ctx) => {
    const examplesMessage = `
🌟 *Exemplos de Prompts Incríveis*

*📸 FOTOGRAFIA:*
"Portrait of a young woman with blue eyes, golden hour lighting, professional photography, bokeh background, 50mm lens"

*🎨 ARTE DIGITAL:*
"Dragon flying over mountain peaks, epic fantasy art, dramatic clouds, digital painting, highly detailed"

*🌆 CENÁRIOS:*
"Futuristic Tokyo street at night, neon signs, rain reflections, cyberpunk aesthetic, cinematic composition"

*🐾 ANIMAIS:*
"Majestic white wolf in snowy forest, moonlight, mystical atmosphere, photorealistic, award winning"

*🎭 FANTASIA:*
"Fairy castle floating in clouds, magical glowing crystals, rainbow waterfall, fantasy illustration, dreamy"

*🤖 SCI-FI:*
"Advanced AI robot in laboratory, holographic displays, blue lighting, concept art, octane render"

*🏞️ NATUREZA:*
"Tropical beach at sunset, palm trees, turquoise water, golden sand, paradise, professional photo"

*🎪 SURREALISTA:*
"Clock melting in desert, Salvador Dali style, surrealism, artistic, oil painting"

*💡 Use como inspiração e adapte!*
    `;

    await ctx.replyWithMarkdown(examplesMessage);
  });

  // Comando /multiple
  bot.command('multiple', async (ctx) => {
    await ctx.reply('🎨 *Modo Múltiplas Imagens*\n\nEnvie seu prompt seguido de um número (2-4):\n\nExemplo:\n`Gato astronauta 3`\n\nIsso gerará 3 variações da sua ideia!', {
      parse_mode: 'Markdown'
    });
  });

  // Comando /info
  bot.command('info', async (ctx) => {
    const infoMessage = `
ℹ️ *Informações do Bot*

*🤖 Tecnologia:*
• IA: Hugging Face Inference API
• Modelo: Stable Diffusion XL
• Framework: Telegraf (Node.js)

*💰 Custo:*
• *100% GRATUITO* ✨
• Sem limites de uso abusivos
• Sem necessidade de cartão

*⏱️ Performance:*
• Geração: 10-30 segundos
• Qualidade: 1024x1024 pixels
• Rate limit: ~100 imagens/hora

*🔒 Privacidade:*
• Seus prompts são processados pela Hugging Face
• Imagens não são armazenadas permanentemente
• Enviadas diretamente para você

*🎨 Modelos Disponíveis:*
• Stable Diffusion XL (atual)
• Stable Diffusion 2.1
• Stable Diffusion 1.5

*🔗 Links:*
• Hugging Face: huggingface.co
• Código: github.com/seu-repo
• Modelo: huggingface.co/stabilityai/stable-diffusion-xl-base-1.0

*⭐ 100% Open Source & Free*
    `;

    await ctx.replyWithMarkdown(infoMessage);
  });

  // Handler para mensagens de texto (prompts)
  bot.on('text', async (ctx) => {
    let prompt = ctx.message.text;

    // Ignora comandos
    if (prompt.startsWith('/')) {
      return;
    }

    // Verifica se é pedido de múltiplas imagens
    const multipleMatch = prompt.match(/^(.*?)\s+(\d+)$/);
    let count = 1;

    if (multipleMatch) {
      prompt = multipleMatch[1].trim();
      count = Math.min(parseInt(multipleMatch[2]), 4);

      if (count > 1) {
        await ctx.reply(`🎨 Vou gerar *${count} variações* para você!\n⏳ Isso pode levar ~${count * 15}-${count * 30} segundos...`, {
          parse_mode: 'Markdown'
        });
      }
    }

    // Valida prompt
    const validation = validatePrompt(prompt);
    if (!validation.valid) {
      await ctx.reply(validation.error);
      return;
    }

    // Mensagem inicial
    const loadingMsg = await ctx.reply('🎨 Criando sua imagem...\n⏳ Aguarde ~10-30 segundos...', {
      parse_mode: 'Markdown'
    });

    try {
      if (count > 1) {
        // Gera múltiplas imagens
        const results = await generateMultipleImages(prompt, count);

        let successCount = 0;

        for (let i = 0; i < results.length; i++) {
          const result = results[i];

          if (result.success) {
            successCount++;

            await ctx.replyWithPhoto(
              { source: result.imageBuffer },
              {
                caption: `🎨 *Imagem ${i + 1}/${count}*\n\n📝 Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}\n⏱️ Gerada em ${result.duration}s\n🤖 Modelo: Stable Diffusion XL`,
                parse_mode: 'Markdown'
              }
            );
          } else {
            await ctx.reply(`❌ Erro ao gerar imagem ${i + 1}: ${result.error}`);
          }
        }

        if (successCount > 0) {
          await ctx.reply(`✨ *${successCount}/${count} imagens geradas!*\n\n💡 Gostou? Experimente outros prompts!`, {
            parse_mode: 'Markdown'
          });
        }

        // Deleta mensagem de loading
        try {
          await ctx.deleteMessage(loadingMsg.message_id);
        } catch {}

      } else {
        // Gera uma imagem
        const result = await generateImage(prompt);

        if (result.success) {
          // Envia a imagem
          await ctx.replyWithPhoto(
            { source: result.imageBuffer },
            {
              caption: `✨ *Imagem Gerada!*\n\n📝 *Prompt:* ${prompt.substring(0, 200)}${prompt.length > 200 ? '...' : ''}\n\n⏱️ *Tempo:* ${result.duration}s\n🤖 *Modelo:* ${result.model.split('/').pop()}\n\n💡 *Dica:* Use /help para criar imagens ainda melhores!`,
              parse_mode: 'Markdown'
            }
          );

          // Deleta mensagem de loading
          try {
            await ctx.deleteMessage(loadingMsg.message_id);
          } catch {}

        } else {
          await ctx.reply(result.error);
        }
      }

    } catch (error) {
      console.error('❌ Erro crítico:', error);
      await ctx.reply(`❌ Erro inesperado: ${error.message}\n\n💡 Tente novamente em alguns segundos.`);
    }
  });

  // Handler para fotos (futuramente: img2img)
  bot.on('photo', async (ctx) => {
    await ctx.reply('📸 Recebi sua foto!\n\n⚠️ Por enquanto, o bot só gera imagens a partir de texto.\n\n💡 Envie uma descrição do que quer criar!');
  });

  // Handler para outros tipos
  bot.on('message', async (ctx) => {
    await ctx.reply('⚠️ Por favor, envie apenas *texto* descrevendo a imagem que deseja.\n\nUse /help para ver exemplos!', {
      parse_mode: 'Markdown'
    });
  });

  // Error handler global
  bot.catch((error, ctx) => {
    console.error('❌ Erro no bot:', error);
    if (ctx) {
      ctx.reply('❌ Ocorreu um erro. Tente novamente.').catch(() => {});
    }
  });

  return bot;
}
