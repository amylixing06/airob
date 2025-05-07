import { logApiRequest, logApiResponse, logApiError, showDebugPanel } from '../utils/debug';

// API路径
const API_GENERATE_URL = '/api/v1/generator/generate';
const API_REFINE_URL = '/api/v1/generator/refine';
const API_STATUS_URL = '/api/v1/status';

// API配置
const API_CONFIG = {
  timeout: 120000, // 120秒超时，与后端保持一致
  retries: 2,     // 最多重试2次
  retryDelay: 1000 // 重试间隔1秒
};

// API基础路径
const API_BASE_URL = '/api/v1';

// API错误类
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * 封装的fetch函数，带有超时和重试功能
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = API_CONFIG.retries): Promise<Response> {
  // 添加超时处理
  const fetchPromise = fetch(url, options);
  const timeoutPromise = new Promise<Response>((_, reject) => {
    setTimeout(() => reject(new Error('请求超时')), API_CONFIG.timeout);
  });
  
  try {
    // 竞争Promise，谁先完成就用谁的结果
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error: any) {
    if (retries > 0) {
      showDebugPanel(`API请求失败，${retries}秒后重试...`);
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

/**
 * 生成HTML页面
 * @param description 页面描述
 * @param style 页面风格
 * @returns 生成的HTML
 */
export async function generateHtml(description: string, style: string): Promise<string> {
  const url = API_GENERATE_URL;
  const body = { description, style };
  
  logApiRequest('POST', url, body);
  showDebugPanel(`发送生成请求: ${description}`);
  
  try {
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '未知错误');
      logApiError('POST', url, `状态码: ${response.status}, 错误: ${errorText}`);
      showDebugPanel(`API错误 ${response.status}: ${errorText}`);
      throw new ApiError(`API错误: ${response.status}`, response.status);
    }
    
    const data = await response.json();
    logApiResponse('POST', url, response.status, data);
    showDebugPanel(`生成成功: 返回 ${data.html.length} 字符`);
    
    return data.html;
  } catch (error: any) {
    if (!(error instanceof ApiError)) {
      logApiError('POST', url, error);
      showDebugPanel(`请求错误: ${error.message}`);
    }
    throw error;
  }
}

/**
 * 优化HTML页面
 * @param originalHtml 原始HTML
 * @param instructions 优化指令
 * @returns 优化后的HTML
 */
export async function refineHtml(originalHtml: string, instructions: string): Promise<string> {
  const url = API_REFINE_URL;
  const body = { originalHtml, instructions };
  
  logApiRequest('POST', url, { instructions, originalHtmlLength: originalHtml.length });
  showDebugPanel(`发送优化请求: ${instructions}`);
  
  try {
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '未知错误');
      logApiError('POST', url, `状态码: ${response.status}, 错误: ${errorText}`);
      showDebugPanel(`API错误 ${response.status}: ${errorText}`);
      throw new ApiError(`API错误: ${response.status}`, response.status);
    }
    
    const data = await response.json();
    logApiResponse('POST', url, response.status, { htmlLength: data.html.length });
    showDebugPanel(`优化成功: 返回 ${data.html.length} 字符`);
    
    return data.html;
  } catch (error: any) {
    if (!(error instanceof ApiError)) {
      logApiError('POST', url, error);
      showDebugPanel(`请求错误: ${error.message}`);
    }
    throw error;
  }
}

/**
 * 测试API连接
 * @returns 是否连接成功
 */
export async function testApiConnection(): Promise<boolean> {
  const url = API_GENERATE_URL;
  
  logApiRequest('HEAD', url);
  showDebugPanel('测试API连接');
  
  try {
    // 测试连接不需要重试，使用较短超时
    const timeoutMs = 5000; // 5秒超时
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(id);
    
    const isOk = response.ok;
    logApiResponse('HEAD', url, response.status);
    showDebugPanel(`API连接测试: ${isOk ? '成功' : '失败'} (${response.status})`);
    
    return isOk;
  } catch (error: any) {
    logApiError('HEAD', url, error);
    const isTimeout = error.name === 'AbortError';
    showDebugPanel(`API连接测试失败: ${isTimeout ? '请求超时' : error.message}`);
    return false;
  }
} 