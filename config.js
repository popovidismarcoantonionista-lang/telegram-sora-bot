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

  // Replicate API
  replicate: {
    apiToken: process.env.REPLICATE_API_TOKEN,
    // Modelo padrão: minimax-video (outros: stability-ai/stable-video-diffusion, genmo/mochi-1-preview)
    model: process.env.REPLICATE_MODEL || 'minimax/video-01',
  },

  // Configurações de vídeo
  video: {
    defaultSteps: parseInt(process.env.DEFAULT_STEPS) || 50,
    defaultGuidanceScale: parseFloat(process.env.DEFAULT_GUIDANCE_SCALE) || 7.5,
  },

  // Configurações de polling
  polling: {
    intervalMs: parseInt(process.env.POLLING_INTERVAL_MS) || 3000,
    maxAttempts: parseInt(process.env.MAX_POLLING_ATTEMPTS) || 200,
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

  if (!config.replicate.apiToken) {
    errors.push('❌ REPLICATE_API_TOKEN não configurado');
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
