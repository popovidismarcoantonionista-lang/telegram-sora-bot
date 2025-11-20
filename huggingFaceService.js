/**
 * Módulo de Integração com Hugging Face Inference API
 * Gerencia geração de imagens com Stable Diffusion
 */
import { HfInference } from '@huggingface/inference';
import config from './config.js';
import fs from 'fs';
import path from 'path';

/**
 * Cliente Hugging Face configurado
 */
const hf = new HfInference(config.huggingface.apiToken);

/**
 * Gera uma imagem usando Stable Diffusion
 * 
 * @param {string} prompt - Descrição da imagem a ser gerada
 * @param {Object} options - Opções adicionais
 * @returns {Promise<Object>} Buffer da imagem e informações
 */
export async function generateImage(prompt, options = {}) {
  try {
    console.log(`🎨 Gerando imagem para prompt: "${prompt.substring(0, 50)}..."`);

    const model = config.huggingface.model;
    console.log(`🎯 Modelo: ${model}`);

    const params = {
      negative_prompt: options.negativePrompt || config.huggingface.negativePrompt,
      width: options.width || config.image.defaultWidth,
      height: options.height || config.image.defaultHeight,
      num_inference_steps: options.steps || config.image.defaultSteps,
      guidance_scale: options.guidanceScale || config.image.defaultGuidanceScale,
    };

    console.log('📤 Parâmetros:', params);
    console.log('⏳ Gerando imagem...');

    const startTime = Date.now();

    // Gera a imagem
    const blob = await hf.textToImage({
      model: model,
      inputs: prompt,
      parameters: params,
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Imagem gerada em ${duration}s`);

    // Converte blob para buffer
    const buffer = await blob.arrayBuffer();
    const imageBuffer = Buffer.from(buffer);

    return {
      success: true,
      imageBuffer,
      duration,
      prompt,
      model,
    };

  } catch (error) {
    console.error('❌ Erro ao gerar imagem:', error.message);

    return {
      success: false,
      error: handleApiError(error),
    };
  }
}

/**
 * Gera múltiplas imagens (batch)
 * 
 * @param {string} prompt - Descrição da imagem
 * @param {number} count - Número de imagens (max 4)
 * @returns {Promise<Array>} Array de resultados
 */
export async function generateMultipleImages(prompt, count = 2) {
  console.log(`🎨 Gerando ${count} imagens para prompt: "${prompt.substring(0, 50)}..."`);

  const results = [];

  for (let i = 0; i < Math.min(count, 4); i++) {
    console.log(`\n📸 Gerando imagem ${i + 1}/${count}...`);

    const result = await generateImage(prompt, {
      // Varia ligeiramente os parâmetros para gerar imagens diferentes
      guidanceScale: 7.5 + (Math.random() * 2 - 1),
    });

    results.push(result);

    // Pequeno delay entre requisições
    if (i < count - 1) {
      await sleep(1000);
    }
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`\n✅ ${successCount}/${count} imagens geradas com sucesso`);

  return results;
}

/**
 * Gera variações de uma imagem (image-to-image)
 * Nota: Requer modelo específico, por enquanto usa text-to-image
 * 
 * @param {string} prompt - Prompt com variação desejada
 * @returns {Promise<Object>} Resultado da geração
 */
export async function generateVariation(prompt) {
  // Por enquanto, usa text-to-image com prompt modificado
  return generateImage(`${prompt}, variation, alternative style`);
}

/**
 * Trata erros da API e retorna mensagem amigável
 * 
 * @param {Error} error - Erro capturado
 * @returns {string} Mensagem de erro formatada
 */
function handleApiError(error) {
  const message = error.message || String(error);

  if (message.includes('401') || message.includes('Invalid token')) {
    return '❌ Erro: Token da Hugging Face inválido.\n\n💡 Verifique seu HUGGINGFACE_API_TOKEN em huggingface.co/settings/tokens';
  }

  if (message.includes('429') || message.includes('rate limit')) {
    return '❌ Erro: Limite de requisições excedido.\n\n💡 Aguarde alguns segundos e tente novamente.';
  }

  if (message.includes('503') || message.includes('loading')) {
    return '❌ Erro: Modelo está carregando.\n\n💡 Aguarde 20-30 segundos e tente novamente.';
  }

  if (message.includes('400') || message.includes('invalid')) {
    return '❌ Erro: Prompt inválido ou parâmetros incorretos.\n\n💡 Tente simplificar sua descrição.';
  }

  if (message.includes('ENOTFOUND') || message.includes('network')) {
    return '❌ Erro de conexão.\n\n💡 Verifique sua internet e tente novamente.';
  }

  return `❌ Erro: ${message}\n\n💡 Tente novamente em alguns segundos.`;
}

/**
 * Salva imagem temporariamente (para debug)
 * 
 * @param {Buffer} buffer - Buffer da imagem
 * @param {string} filename - Nome do arquivo
 * @returns {string} Caminho do arquivo
 */
export function saveImageTemp(buffer, filename = 'temp.png') {
  const tempDir = '/tmp';
  const filepath = path.join(tempDir, filename);
  fs.writeFileSync(filepath, buffer);
  return filepath;
}

/**
 * Utilitário: pausa a execução
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Valida prompt
 * 
 * @param {string} prompt - Prompt a validar
 * @returns {Object} Resultado da validação
 */
export function validatePrompt(prompt) {
  if (!prompt || prompt.trim().length === 0) {
    return {
      valid: false,
      error: '⚠️ Prompt vazio. Por favor, descreva a imagem que deseja criar.',
    };
  }

  if (prompt.length < 3) {
    return {
      valid: false,
      error: '⚠️ Prompt muito curto. Use pelo menos 3 caracteres.',
    };
  }

  if (prompt.length > 1000) {
    return {
      valid: false,
      error: '⚠️ Prompt muito longo. Use no máximo 1000 caracteres.',
    };
  }

  // Lista de palavras banidas (conteúdo inapropriado)
  const bannedWords = ['nude', 'nsfw', 'explicit', 'porn', 'xxx'];
  const lowerPrompt = prompt.toLowerCase();

  for (const word of bannedWords) {
    if (lowerPrompt.includes(word)) {
      return {
        valid: false,
        error: '⚠️ Prompt contém conteúdo inapropriado. Por favor, use descrições adequadas.',
      };
    }
  }

  return {
    valid: true,
  };
}
