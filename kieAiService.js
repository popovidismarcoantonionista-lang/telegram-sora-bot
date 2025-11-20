/**
 * Módulo de Integração com VideoGenAPI.com
 * Gerencia todas as interações com a API de geração de vídeo
 */
import axios from 'axios';
import config from './config.js';

/**
 * Cliente HTTP configurado para VideoGenAPI
 */
const videoGenClient = axios.create({
  baseURL: config.videoGenApi.baseUrl,
  headers: {
    'x-api-key': config.videoGenApi.apiKey,
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

/**
 * Mapeia códigos de erro HTTP para mensagens amigáveis
 */
const ERROR_MESSAGES = {
  400: '❌ Erro: Parâmetros inválidos enviados para a API',
  401: '❌ Erro: API Key inválida ou não autorizada',
  402: '❌ Erro: Créditos insuficientes na conta VideoGenAPI',
  429: '❌ Erro: Limite de requisições excedido. Tente novamente em alguns minutos',
  500: '❌ Erro: Problema no servidor da VideoGenAPI. Tente novamente mais tarde',
};

/**
 * Cria uma nova task de geração de vídeo na API VideoGenAPI
 * 
 * @param {string} prompt - Texto descritivo do vídeo a ser gerado
 * @param {Object} options - Opções adicionais
 * @param {string} options.aspectRatio - 'portrait' ou 'landscape'
 * @param {number} options.duration - Duração em segundos (5 ou 10)
 * @returns {Promise<Object>} Objeto contendo request_id e outras informações
 */
export async function createVideoTask(prompt, options = {}) {
  try {
    console.log(`🎬 Criando task de vídeo para prompt: "${prompt.substring(0, 50)}..."`);

    const payload = {
      prompt: prompt,
      aspect_ratio: options.aspectRatio || config.video.defaultAspectRatio,
      duration: options.duration || config.video.defaultDuration,
    };

    console.log('📤 Payload enviado:', JSON.stringify(payload, null, 2));

    const response = await videoGenClient.post('/generate', payload);

    console.log('✅ Task criada com sucesso:', response.data);

    return {
      success: true,
      requestId: response.data.request_id,
      data: response.data,
    };

  } catch (error) {
    console.error('❌ Erro ao criar task:', error.response?.data || error.message);

    return {
      success: false,
      error: handleApiError(error),
    };
  }
}

/**
 * Consulta o status de uma task específica
 * 
 * @param {string} requestId - ID da requisição a ser consultada
 * @returns {Promise<Object>} Informações sobre o estado da task
 */
export async function getTaskStatus(requestId) {
  try {
    const response = await videoGenClient.get(`/generate/${requestId}`);

    const data = response.data;

    return {
      success: true,
      status: data.status,
      requestId: data.request_id,
      videoUrl: data.video_url,
      data: data,
    };

  } catch (error) {
    console.error(`❌ Erro ao consultar task ${requestId}:`, error.response?.data || error.message);

    return {
      success: false,
      error: handleApiError(error),
    };
  }
}

/**
 * Aguarda até que uma task seja concluída (sucesso ou falha)
 * Usa polling com intervalo configurável
 * 
 * @param {string} requestId - ID da requisição a ser monitorada
 * @param {Function} onProgress - Callback chamado a cada tentativa (opcional)
 * @returns {Promise<Object>} Resultado final da task
 */
export async function waitForTaskCompletion(requestId, onProgress = null) {
  console.log(`⏳ Iniciando polling para request ${requestId}...`);

  let attempts = 0;
  const maxAttempts = config.polling.maxAttempts;
  const interval = config.polling.intervalMs;

  while (attempts < maxAttempts) {
    attempts++;

    console.log(`🔄 Tentativa ${attempts}/${maxAttempts} - Consultando status...`);

    const result = await getTaskStatus(requestId);

    if (!result.success) {
      return result;
    }

    const { status, videoUrl } = result;

    // Chama callback de progresso se fornecido
    if (onProgress) {
      onProgress(attempts, maxAttempts, status);
    }

    // Task completada com sucesso
    if (status === 'completed' && videoUrl) {
      console.log('✅ Task concluída com sucesso!');

      return {
        success: true,
        status: 'completed',
        requestId,
        videoUrl,
        data: result.data,
      };
    }

    // Task falhou
    if (status === 'failed' || status === 'error') {
      console.error('❌ Task falhou');

      return {
        success: false,
        status: 'failed',
        requestId,
        error: result.data.error || 'A geração do vídeo falhou. Por favor, tente novamente.',
      };
    }

    // Estados intermediários: pending, processing, queued
    console.log(`⏳ Estado atual: ${status} - Aguardando ${interval}ms...`);

    await sleep(interval);
  }

  // Timeout: excedeu número máximo de tentativas
  console.error('⏰ Timeout: número máximo de tentativas excedido');

  return {
    success: false,
    error: 'Timeout: a geração do vídeo está demorando mais do que o esperado. Por favor, consulte o requestId manualmente.',
    requestId,
  };
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
    const message = ERROR_MESSAGES[status] || `❌ Erro ${status}: ${error.response.statusText}`;

    const details = error.response.data?.message || error.response.data?.error;

    return details ? `${message}\n\nDetalhes: ${details}` : message;
  }

  if (error.request) {
    return '❌ Erro de conexão: Não foi possível conectar à API VideoGenAPI';
  }

  return `❌ Erro inesperado: ${error.message}`;
}

/**
 * Utilitário: pausa a execução por X milissegundos
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
