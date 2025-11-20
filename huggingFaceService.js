/**
 * Módulo de Integração com Hugging Face Inference API
 * Suporta geração de IMAGENS e VÍDEOS
 */
import { HfInference } from '@huggingface/inference';
import config from './config.js';
import fs from 'fs';
import path from 'path';

/**
 * Cliente Hugging Face configurado com NOVA URL (router)
 */
const hf = new HfInference(config.huggingface.apiToken, {
  apiUrl: 'https://api-inference.huggingface.co', // Mantém padrão - lib já usa router internamente
});

/**
 * Gera uma imagem usando Stable Diffusion
 */
export async function generateImage(prompt, options = {}) {
  try {
    console.log(`🎨 Gerando imagem: "${prompt.substring(0, 50)}..."`);

    const model = config.huggingface.imageModel;
    console.log(`🎯 Modelo: ${model}`);

    const params = {
      negative_prompt: options.negativePrompt || config.huggingface.negativePrompt,
      // Remover width/height pois alguns modelos não suportam
      num_inference_steps: options.steps || config.image.defaultSteps,
      guidance_scale: options.guidanceScale || config.image.defaultGuidanceScale,
    };

    console.log('⏳ Gerando imagem...');
    const startTime = Date.now();

    const blob = await hf.textToImage({
      model: model,
      inputs: prompt,
      parameters: params,
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Imagem gerada em ${duration}s`);

    const buffer = await blob.arrayBuffer();
    const imageBuffer = Buffer.from(buffer);

    return {
      success: true,
      buffer: imageBuffer,
      type: 'image',
      duration,
      prompt,
      model,
    };

  } catch (error) {
    console.error('❌ Erro ao gerar imagem:', error.message);
    console.error('Stack:', error.stack);
    return {
      success: false,
      error: handleApiError(error),
    };
  }
}

/**
 * Gera um vídeo usando modelos de Text-to-Video
 */
export async function generateVideo(prompt, options = {}) {
  try {
    console.log(`🎬 Gerando vídeo: "${prompt.substring(0, 50)}..."`);

    const model = config.huggingface.videoModel;
    console.log(`🎯 Modelo: ${model}`);

    const params = {
      negative_prompt: options.negativePrompt || config.huggingface.negativePrompt,
      num_inference_steps: options.steps || config.video.defaultSteps,
      num_frames: options.numFrames || config.video.defaultFrames,
      guidance_scale: options.guidanceScale || 7.5,
    };

    console.log('⏳ Gerando vídeo (1-3 minutos)...');
    const startTime = Date.now();

    const response = await hf.request({
      model: model,
      inputs: prompt,
      parameters: params,
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Vídeo gerado em ${duration}s`);

    let videoBuffer;
    if (response instanceof Blob) {
      const arrayBuffer = await response.arrayBuffer();
      videoBuffer = Buffer.from(arrayBuffer);
    } else if (Buffer.isBuffer(response)) {
      videoBuffer = response;
    } else if (response instanceof ArrayBuffer) {
      videoBuffer = Buffer.from(response);
    } else {
      throw new Error('Formato de resposta inesperado');
    }

    return {
      success: true,
      buffer: videoBuffer,
      type: 'video',
      duration,
      prompt,
      model,
    };

  } catch (error) {
    console.error('❌ Erro ao gerar vídeo:', error.message);
    return {
      success: false,
      error: handleApiError(error, 'video'),
    };
  }
}

/**
 * Gera múltiplas imagens (batch)
 */
export async function generateMultipleImages(prompt, count = 2) {
  console.log(`🎨 Gerando ${count} imagens...`);

  const results = [];

  for (let i = 0; i < Math.min(count, 4); i++) {
    console.log(`\n📸 Imagem ${i + 1}/${count}...`);

    const result = await generateImage(prompt, {
      guidanceScale: 7.5 + (Math.random() * 2 - 1),
    });

    results.push(result);

    if (i < count - 1) {
      await sleep(1000);
    }
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`\n✅ ${successCount}/${count} imagens geradas`);

  return results;
}

/**
 * Detecta automaticamente se deve gerar imagem ou vídeo
 */
export async function generateAuto(prompt, options = {}) {
  const videoKeywords = [
    'video', 'vídeo', 'movimento', 'moving', 'animação', 'animation',
    'correndo', 'running', 'voando', 'flying', 'nadando', 'swimming',
    'dançando', 'dancing', 'andando', 'walking', 'girando', 'spinning'
  ];

  const lowerPrompt = prompt.toLowerCase();
  const isVideo = videoKeywords.some(keyword => lowerPrompt.includes(keyword));

  if (isVideo) {
    console.log('🎬 Detectado: VÍDEO');
    return await generateVideo(prompt, options);
  } else {
    console.log('🎨 Detectado: IMAGEM');
    return await generateImage(prompt, options);
  }
}

/**
 * Trata erros da API
 */
function handleApiError(error, type = 'image') {
  const message = error.message || String(error);

  if (message.includes('401') || message.includes('Invalid token')) {
    return '❌ Token inválido.\n\n💡 Verifique HUGGINGFACE_API_TOKEN em:\nhttps://huggingface.co/settings/tokens';
  }

  if (message.includes('429') || message.includes('rate limit')) {
    return '❌ Limite excedido.\n\n💡 Aguarde 30 segundos e tente novamente.';
  }

  if (message.includes('503') || message.includes('loading')) {
    const waitTime = type === 'video' ? '1-2 minutos' : '30-60 segundos';
    return `❌ Modelo carregando.\n\n💡 Aguarde ${waitTime} e tente novamente.\n\n🔄 Primeira requisição sempre demora mais!`;
  }

  if (message.includes('400') || message.includes('invalid')) {
    return '❌ Prompt inválido.\n\n💡 Tente simplificar a descrição.';
  }

  if (message.includes('no longer supported') || message.includes('router')) {
    return '❌ API em atualização.\n\n💡 Aguarde alguns minutos - estamos migrando para nova versão da API.';
  }

  if (message.includes('ENOTFOUND') || message.includes('network')) {
    return '❌ Erro de conexão.\n\n💡 Verifique sua internet.';
  }

  return `❌ Erro: ${message.substring(0, 100)}\n\n💡 Tente novamente em 30 segundos.`;
}

/**
 * Valida prompt
 */
export function validatePrompt(prompt) {
  if (!prompt || prompt.trim().length === 0) {
    return {
      valid: false,
      error: '⚠️ Prompt vazio.',
    };
  }

  if (prompt.length < 3) {
    return {
      valid: false,
      error: '⚠️ Prompt muito curto (min 3 caracteres).',
    };
  }

  if (prompt.length > 1000) {
    return {
      valid: false,
      error: '⚠️ Prompt muito longo (max 1000 caracteres).',
    };
  }

  const bannedWords = ['nude', 'nsfw', 'explicit', 'porn', 'xxx'];
  const lowerPrompt = prompt.toLowerCase();

  for (const word of bannedWords) {
    if (lowerPrompt.includes(word)) {
      return {
        valid: false,
        error: '⚠️ Conteúdo inapropriado.',
      };
    }
  }

  return { valid: true };
}

export function saveMediaTemp(buffer, filename) {
  const tempDir = '/tmp';
  const filepath = path.join(tempDir, filename);
  fs.writeFileSync(filepath, buffer);
  return filepath;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
