/**
 * Bot Telegram - VideoGenAPI Sora 2
 * 
 * Este bot permite gerar vídeos usando a API VideoGenAPI.com
 * através de conversas no Telegram.
 * 
 * Autor: Rube AI
 * Data: 2025
 */

import config, { validateConfig } from './config.js';
import { createBot } from './telegramBot.js';

/**
 * Função principal - inicializa e roda o bot
 */
async function main() {
  console.log('\n🤖 ========================================');
  console.log('   Bot Telegram - VideoGenAPI Sora 2');
  console.log('========================================\n');

  // 1. Valida configurações
  console.log('🔍 Validando configurações...');
  validateConfig();
  console.log('');

  // 2. Cria instância do bot
  console.log('🚀 Inicializando bot do Telegram...');
  const bot = createBot();

  // 3. Configura handlers de processo
  setupProcessHandlers(bot);

  // 4. Inicia o bot
  console.log('✅ Bot iniciado com sucesso!');
  console.log('📡 Aguardando mensagens...\n');

  await bot.launch();

  console.log('🎉 Bot está rodando! Pressione Ctrl+C para parar.\n');
}

/**
 * Configura handlers para encerramento gracioso
 */
function setupProcessHandlers(bot) {
  // Encerramento gracioso
  const gracefulShutdown = async (signal) => {
    console.log(`\n\n⚠️  Recebido sinal ${signal}`);
    console.log('🛑 Encerrando bot...');

    try {
      await bot.stop(signal);
      console.log('✅ Bot encerrado com sucesso');
      process.exit(0);
    } catch (error) {
      console.error('❌ Erro ao encerrar bot:', error);
      process.exit(1);
    }
  };

  process.once('SIGINT', () => gracefulShutdown('SIGINT'));
  process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));

  // Handler de erros não tratados
  process.on('uncaughtException', (error) => {
    console.error('❌ Erro não tratado:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rejeitada não tratada:', reason);
  });
}

// Executa a aplicação
main().catch((error) => {
  console.error('\n❌ Erro fatal ao iniciar bot:\n');
  console.error(error);
  process.exit(1);
});
