/**
 * Módulo de Integração com Kie.ai Sora 2 API
 * Gerencia todas as interações com a API de geração de vídeo
 */
import axios from 'axios';
import config from './config.js';

/**
 * Cliente HTTP configurado para Kie.ai API
 */
const kieAiClient = axios.create({
  baseURL: config.kieAi.baseUrl,
  headers: {
    'Authorization': `Bearer ${config.kieAi.apiKey}`,
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
  402: '❌ Erro: Créditos insuficientes na conta Kie.ai',
  429: '❌ Erro: Limite de requisições excedido. Tente novamente em alguns minutos',
  500: '❌ Erro: Problema no servidor da Kie.ai. Tente novamente mais tarde',
};

/**
 * Cria uma nova task de geração de vídeo na API Kie.ai
 * 
 * @param {string} prompt - Texto descritivo do vídeo a ser gerado
 * @param {Object} options - Opções adicionais
 * @param {string} options.aspectRatio - 'portrait' ou 'landscape'
 * @param {number} options.nFrames - Número de frames (10 ou 15)
 * @param {boolean} options.removeWatermark - Remover marca d'água
 * @returns {Promise<Object>} Objeto contendo taskId e outras informações
 */
export async function createVideoTask(prompt, options = {}) {
  try {
    console.log(`🎬 Criando task de vídeo para prompt: "${prompt.substring(0, 50)}..."`);

    const payload = {
      model: 'sora-2-text-to-video',
      prompt: prompt,
      aspect_ratio: options.aspectRatio || config.video.defaultAspectRatio,
      n_frames: options.nFrames || config.video.defaultNFrames,
      remove_watermark: options.removeWatermark !== undefined 
        ? options.removeWatermark 
        : config.video.removeWatermark,
    };

    console.log('📤 Payload enviado:', JSON.stringify(payload, null, 2));

    const response = await kieAiClient.post('/jobs/createTask', payload);

    console.log('✅ Task criada com sucesso:', response.data);

    return {
      success: true,
      taskId: response.data.taskId || response.data.data?.taskId,
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
 * @param {string} taskId - ID da task a ser consultada
 * @returns {Promise<Object>} Informações sobre o estado da task
 */
export async function getTaskStatus(taskId) {
  try {
    const response = await kieAiClient.get('/jobs/recordInfo', {
      params: { taskId },
    });

    const data = response.data.data || response.data;

    return {
      success: true,
      state: data.state,
      taskId: data.taskId,
      resultJson: data.resultJson,
      data: data,
    };

  } catch (error) {
    console.error(`❌ Erro ao consultar task ${taskId}:`, error.response?.data || error.message);

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
 * @param {string} taskId - ID da task a ser monitorada
 * @param {Function} onProgress - Callback chamado a cada tentativa (opcional)
 * @returns {Promise<Object>} Resultado final da task
 */
export async function waitForTaskCompletion(taskId, onProgress = null) {
  console.log(`⏳ Iniciando polling para task ${taskId}...`);

  let attempts = 0;
  const maxAttempts = config.polling.maxAttempts;
  const interval = config.polling.intervalMs;

  while (attempts < maxAttempts) {
    attempts++;

    console.log(`🔄 Tentativa ${attempts}/${maxAttempts} - Consultando status...`);

    const result = await getTaskStatus(taskId);

    if (!result.success) {
      return result;
    }

    const { state, resultJson } = result;

    // Chama callback de progresso se fornecido
    if (onProgress) {
      onProgress(attempts, maxAttempts, state);
    }

    // Task completada com sucesso
    if (state === 'success') {
      console.log('✅ Task concluída com sucesso!');

      // Extrai URLs do vídeo
      const videoUrls = extractVideoUrls(resultJson);

      return {
        success: true,
        state: 'success',
        taskId,
        videoUrls,
        data: result.data,
      };
    }

    // Task falhou
    if (state === 'fail' || state === 'failed') {
      console.error('❌ Task falhou');

      return {
        success: false,
        state: 'fail',
        taskId,
        error: 'A geração do vídeo falhou. Por favor, tente novamente.',
      };
    }

    // Estados intermediários: pending, processing, etc.
    console.log(`⏳ Estado atual: ${state} - Aguardando ${interval}ms...`);

    await sleep(interval);
  }

  // Timeout: excedeu número máximo de tentativas
  console.error('⏰ Timeout: número máximo de tentativas excedido');

  return {
    success: false,
    error: 'Timeout: a geração do vídeo está demorando mais do que o esperado. Por favor, consulte o taskId manualmente.',
    taskId,
  };
}

/**
 * Extrai URLs de vídeo do resultJson retornado pela API
 * 
 * @param {Object} resultJson - JSON com resultados da API
 * @returns {Array<string>} Array de URLs de vídeo
 */
function extractVideoUrls(resultJson) {
  if (!resultJson) return [];

  // Tenta diferentes estruturas possíveis
  if (resultJson.resultUrls && Array.isArray(resultJson.resultUrls)) {
    return resultJson.resultUrls;
  }

  if (resultJson.urls && Array.isArray(resultJson.urls)) {
    return resultJson.urls;
  }

  if (resultJson.videoUrl) {
    return [resultJson.videoUrl];
  }

  if (typeof resultJson === 'string') {
    try {
      const parsed = JSON.parse(resultJson);
      return extractVideoUrls(parsed);
    } catch {
      return [resultJson];
    }
  }

  return [];
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
    return '❌ Erro de conexão: Não foi possível conectar à API Kie.ai';
  }

  return `❌ Erro inesperado: ${error.message}`;
}

/**
 * Utilitário: pausa a execução por X milissegundos
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
