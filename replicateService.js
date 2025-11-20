/**
 * Módulo de Integração com Replicate API
 * Gerencia todas as interações com a API de geração de vídeo
 */
import Replicate from 'replicate';
import config from './config.js';

/**
 * Cliente Replicate configurado
 */
const replicate = new Replicate({
  auth: config.replicate.apiToken,
});

/**
 * Cria uma nova predição de vídeo usando Replicate
 * 
 * @param {string} prompt - Texto descritivo do vídeo a ser gerado
 * @param {Object} options - Opções adicionais
 * @returns {Promise<Object>} Objeto contendo prediction ID e outras informações
 */
export async function createVideoTask(prompt, options = {}) {
  try {
    console.log(`🎬 Criando predição de vídeo para prompt: "${prompt.substring(0, 50)}..."`);

    // Usando modelo minimax-video (free tier disponível)
    // Outros modelos: "stability-ai/stable-video-diffusion", "genmo/mochi-1-preview"
    const model = config.replicate.model;

    const input = {
      prompt: prompt,
      // Configurações opcionais
      num_inference_steps: options.steps || 50,
      guidance_scale: options.guidanceScale || 7.5,
    };

    console.log('📤 Iniciando predição...');
    console.log('🎯 Modelo:', model);

    const prediction = await replicate.predictions.create({
      version: model,
      input: input,
    });

    console.log('✅ Predição criada com sucesso:', prediction.id);

    return {
      success: true,
      predictionId: prediction.id,
      status: prediction.status,
      data: prediction,
    };

  } catch (error) {
    console.error('❌ Erro ao criar predição:', error.message);

    return {
      success: false,
      error: handleApiError(error),
    };
  }
}

/**
 * Consulta o status de uma predição específica
 * 
 * @param {string} predictionId - ID da predição a ser consultada
 * @returns {Promise<Object>} Informações sobre o estado da predição
 */
export async function getTaskStatus(predictionId) {
  try {
    const prediction = await replicate.predictions.get(predictionId);

    return {
      success: true,
      status: prediction.status,
      predictionId: prediction.id,
      output: prediction.output,
      error: prediction.error,
      data: prediction,
    };

  } catch (error) {
    console.error(`❌ Erro ao consultar predição ${predictionId}:`, error.message);

    return {
      success: false,
      error: handleApiError(error),
    };
  }
}

/**
 * Aguarda até que uma predição seja concluída (sucesso ou falha)
 * Usa polling com intervalo configurável
 * 
 * @param {string} predictionId - ID da predição a ser monitorada
 * @param {Function} onProgress - Callback chamado a cada tentativa (opcional)
 * @returns {Promise<Object>} Resultado final da predição
 */
export async function waitForTaskCompletion(predictionId, onProgress = null) {
  console.log(`⏳ Iniciando polling para predição ${predictionId}...`);

  let attempts = 0;
  const maxAttempts = config.polling.maxAttempts;
  const interval = config.polling.intervalMs;

  while (attempts < maxAttempts) {
    attempts++;

    console.log(`🔄 Tentativa ${attempts}/${maxAttempts} - Consultando status...`);

    const result = await getTaskStatus(predictionId);

    if (!result.success) {
      return result;
    }

    const { status, output, error: predError } = result;

    // Chama callback de progresso se fornecido
    if (onProgress) {
      onProgress(attempts, maxAttempts, status);
    }

    // Predição completada com sucesso
    if (status === 'succeeded' && output) {
      console.log('✅ Predição concluída com sucesso!');

      // Output pode ser string (URL) ou array de URLs
      const videoUrl = Array.isArray(output) ? output[0] : output;

      return {
        success: true,
        status: 'succeeded',
        predictionId,
        videoUrl,
        data: result.data,
      };
    }

    // Predição falhou
    if (status === 'failed' || status === 'canceled') {
      console.error('❌ Predição falhou:', predError);

      return {
        success: false,
        status: 'failed',
        predictionId,
        error: predError || 'A geração do vídeo falhou. Por favor, tente novamente.',
      };
    }

    // Estados intermediários: starting, processing
    console.log(`⏳ Estado atual: ${status} - Aguardando ${interval}ms...`);

    await sleep(interval);
  }

  // Timeout: excedeu número máximo de tentativas
  console.error('⏰ Timeout: número máximo de tentativas excedido');

  return {
    success: false,
    error: 'Timeout: a geração do vídeo está demorando mais do que o esperado. Por favor, tente novamente mais tarde.',
    predictionId,
  };
}

/**
 * Cancela uma predição em andamento
 * 
 * @param {string} predictionId - ID da predição a ser cancelada
 * @returns {Promise<Object>} Resultado do cancelamento
 */
export async function cancelTask(predictionId) {
  try {
    await replicate.predictions.cancel(predictionId);

    return {
      success: true,
      message: 'Predição cancelada com sucesso',
    };
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error),
    };
  }
}

/**
 * Trata erros da API e retorna mensagem amigável
 * 
 * @param {Error} error - Erro capturado
 * @returns {string} Mensagem de erro formatada
 */
function handleApiError(error) {
  if (error.response) {
    const status = error.response.status;

    if (status === 401) {
      return '❌ Erro: API Token inválido ou não autorizado. Verifique seu REPLICATE_API_TOKEN.';
    } else if (status === 402) {
      return '❌ Erro: Créditos insuficientes na conta Replicate. Adicione créditos em replicate.com/account.';
    } else if (status === 429) {
      return '❌ Erro: Limite de requisições excedido. Aguarde alguns minutos e tente novamente.';
    } else if (status >= 500) {
      return '❌ Erro: Problema no servidor da Replicate. Tente novamente mais tarde.';
    }

    return `❌ Erro ${status}: ${error.response.statusText}`;
  }

  if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
    return '❌ Erro de conexão: Não foi possível conectar à API Replicate. Verifique sua internet.';
  }

  return `❌ Erro: ${error.message}`;
}

/**
 * Utilitário: pausa a execução por X milissegundos
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
