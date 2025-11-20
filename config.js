/**
 * Módulo de Configuração
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

    // Modelo de IMAGEM
    imageModel: process.env.HF_IMAGE_MODEL || 'stabilityai/stable-diffusion-xl-base-1.0',

    // Modelo de VÍDEO (grátis do Hugging Face)
    // Opções: 'ali-vilab/text-to-video-ms-1.7b', 'damo-vilab/text-to-video-ms-1.7b'
    videoModel: process.env.HF_VIDEO_MODEL || 'damo-vilab/text-to-video-ms-1.7b',

    negativePrompt: process.env.NEGATIVE_PROMPT || 'blurry, bad quality, distorted, ugly, watermark',
  },

  // Configurações de IMAGEM
  image: {
    defaultWidth: parseInt(process.env.IMAGE_WIDTH) || 1024,
    defaultHeight: parseInt(process.env.IMAGE_HEIGHT) || 1024,
    defaultSteps: parseInt(process.env.IMAGE_STEPS) || 30,
    defaultGuidanceScale: parseFloat(process.env.IMAGE_GUIDANCE) || 7.5,
  },

  // Configurações de VÍDEO
  video: {
    defaultSteps: parseInt(process.env.VIDEO_STEPS) || 25,
    defaultFrames: parseInt(process.env.VIDEO_FRAMES) || 16,
  },
};

/**
 * Valida configurações
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
    console.error('\n📝 Configure as variáveis necessárias.\n');
    console.error('💡 Token: https://huggingface.co/settings/tokens\n');
    process.exit(1);
  }

  console.log('✅ Configurações validadas');
}

export default config;
