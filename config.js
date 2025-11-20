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

  // Hugging Face
  huggingface: {
    apiToken: process.env.HUGGINGFACE_API_TOKEN,
    // Modelo padrão: Stable Diffusion XL (melhor qualidade)
    // Alternativas: stabilityai/stable-diffusion-2-1, runwayml/stable-diffusion-v1-5
    model: process.env.HF_MODEL || 'stabilityai/stable-diffusion-xl-base-1.0',
    negativePrompt: process.env.NEGATIVE_PROMPT || 'blurry, bad quality, distorted, ugly, watermark',
  },

  // Configurações de imagem
  image: {
    defaultWidth: parseInt(process.env.IMAGE_WIDTH) || 1024,
    defaultHeight: parseInt(process.env.IMAGE_HEIGHT) || 1024,
    defaultSteps: parseInt(process.env.INFERENCE_STEPS) || 30,
    defaultGuidanceScale: parseFloat(process.env.GUIDANCE_SCALE) || 7.5,
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

  if (!config.huggingface.apiToken) {
    errors.push('❌ HUGGINGFACE_API_TOKEN não configurado');
  }

  if (errors.length > 0) {
    console.error('\n🚨 Erros de configuração:\n');
    errors.forEach(error => console.error(error));
    console.error('\n📝 Configure as variáveis de ambiente necessárias.\n');
    console.error('💡 Obtenha seu token em: https://huggingface.co/settings/tokens\n');
    process.exit(1);
  }

  console.log('✅ Configurações validadas com sucesso');
}

export default config;
