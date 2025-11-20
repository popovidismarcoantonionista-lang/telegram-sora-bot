/**
 * Bot Telegram - AI Image & Video Generator
 * 
 * Gera imagens e vídeos usando Hugging Face + Stable Diffusion
 * 100% Gratuito e Open Source
 */

import config, { validateConfig } from './config.js';
import { createBot } from './telegramBot.js';

/**
 * Função principal
 */
async function main() {
  console.log('\n🎨 ========================================');
  console.log('   Bot Telegram - AI Image Generator');
  console.log('   Powered by Hugging Face 🤗');
  console.log('========================================\n');

  // 1. Valida configurações
  console.log('🔍 Validando configurações...');
  validateConfig();
  console.log('');

  // 2. Info dos modelos
  const imageModel = config.huggingface?.imageModel || 'stable-diffusion-xl';
  const videoModel = config.huggingface?.videoModel || 'text-to-video-ms';

  const imageModelName = imageModel.includes('/') ? imageModel.split('/').pop() : imageModel;
  const videoModelName = videoModel.includes('/') ? videoModel.split('/').pop() : videoModel;

  console.log(`🎨 Modelo Imagem: ${imageModelName}`);
  console.log(`🎬 Modelo Vídeo: ${videoModelName}`);
  console.log(`📐 Resolução: ${config.image.defaultWidth}x${config.image.defaultHeight}`);
  console.log('');

  // 3. Cria bot
  console.log('🚀 Inicializando bot...');
  const bot = createBot();

  // 4. Setup handlers
  setupProcessHandlers(bot);

  // 5. Launch
  console.log('✅ Bot iniciado com sucesso!');
  console.log('📡 Aguardando mensagens...\n');

  await bot.launch();

  console.log('🎉 Bot rodando! Ctrl+C para parar.\n');
  console.log('💡 Envie descrições para criar imagens ou use /video para vídeos!\n');
}

/**
 * Handlers de processo
 */
function setupProcessHandlers(bot) {
  const gracefulShutdown = async (signal) => {
    console.log(`\n\n⚠️  Sinal ${signal} recebido`);
    console.log('🛑 Encerrando bot...');

    try {
      await bot.stop(signal);
      console.log('✅ Bot encerrado');
      process.exit(0);
    } catch (error) {
      console.error('❌ Erro ao encerrar:', error);
      process.exit(1);
    }
  };

  process.once('SIGINT', () => gracefulShutdown('SIGINT'));
  process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));

  process.on('uncaughtException', (error) => {
    console.error('❌ Erro não tratado:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('❌ Promise rejeitada:', reason);
  });
}

// Inicia aplicação
main().catch((error) => {
  console.error('\n❌ Erro fatal:\n', error);
  process.exit(1);
});
