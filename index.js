/**
 * Bot Telegram - AI Image Generator
 * 
 * Gera imagens incríveis usando Hugging Face + Stable Diffusion
 * 100% Gratuito e Open Source
 * 
 * Autor: Rube AI
 * Data: 2025
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

  // 2. Info do modelo
  const modelName = config.huggingface.model.split('/').pop();
  console.log(`🎯 Modelo: ${modelName}`);
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
  console.log('💡 Dica: Envie descrições detalhadas para melhores resultados!\n');
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
