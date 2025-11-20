/**
 * Módulo de Configuração
 * Carrega e valida variáveis de ambiente
 */
import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Telegram
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
  },

  // VideoGenAPI
  videoGenApi: {
    apiKey: process.env.VIDEOGENAPI_API_KEY,
    baseUrl: process.env.VIDEOGENAPI_BASE_URL || 'https://videogenapi.com/api/v1',
  },

  // Configurações de vídeo
  video: {
    defaultAspectRatio: process.env.DEFAULT_ASPECT_RATIO || 'landscape',
    defaultDuration: parseInt(process.env.DEFAULT_DURATION) || 5,
  },

  // Configurações de polling
  polling: {
    intervalMs: parseInt(process.env.POLLING_INTERVAL_MS) || 5000,
    maxAttempts: parseInt(process.env.MAX_POLLING_ATTEMPTS) || 120,
  },
};

/**
 * Valida se todas as configurações obrigatórias estão presentes
 */
export function validateConfig() {
  const errors = [];

  if (!config.telegram.botToken) {
    errors.push('❌ TELEGRAM_BOT_TOKEN não configurado');
  }

  if (!config.videoGenApi.apiKey) {
    errors.push('❌ VIDEOGENAPI_API_KEY não configurado');
  }

  if (errors.length > 0) {
    console.error('\n🚨 Erros de configuração:\n');
    errors.forEach(error => console.error(error));
    console.error('\n📝 Copie .env.example para .env e configure suas credenciais.\n');
    process.exit(1);
  }

  console.log('✅ Configurações validadas com sucesso');
}

export default config;
