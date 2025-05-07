/**
 * 调试工具模块 - 用于API请求调试
 */

export const DEBUG_MODE = true;

/**
 * 记录API请求日志
 * @param method 请求方法
 * @param url 请求URL
 * @param body 请求体
 */
export function logApiRequest(method: string, url: string, body?: any): void {
  if (!DEBUG_MODE) return;
  
  console.group(`API请求: ${method} ${url}`);
  console.log('时间:', new Date().toISOString());
  if (body) {
    console.log('请求体:', body);
  }
  console.groupEnd();
}

/**
 * 记录API响应日志
 * @param method 请求方法
 * @param url 请求URL
 * @param status 响应状态码
 * @param data 响应数据
 */
export function logApiResponse(method: string, url: string, status: number, data?: any): void {
  if (!DEBUG_MODE) return;
  
  console.group(`API响应: ${method} ${url}`);
  console.log('时间:', new Date().toISOString());
  console.log('状态:', status);
  if (data) {
    console.log('响应数据:', data);
  }
  console.groupEnd();
}

/**
 * 记录API错误日志
 * @param method 请求方法
 * @param url 请求URL
 * @param error 错误信息
 */
export function logApiError(method: string, url: string, error: any): void {
  if (!DEBUG_MODE) return;
  
  console.group(`API错误: ${method} ${url}`);
  console.log('时间:', new Date().toISOString());
  console.error('错误:', error);
  console.groupEnd();
}

/**
 * 向HTML插入调试面板
 * @param message 调试信息
 */
export function showDebugPanel(message: string): HTMLElement {
  if (!DEBUG_MODE) return null;
  
  const existingPanel = document.getElementById('airob-debug-panel');
  if (existingPanel) {
    existingPanel.innerHTML += `<div>${message}</div>`;
    return existingPanel;
  }
  
  const panel = document.createElement('div');
  panel.id = 'airob-debug-panel';
  panel.style.position = 'fixed';
  panel.style.bottom = '10px';
  panel.style.right = '10px';
  panel.style.width = '300px';
  panel.style.maxHeight = '200px';
  panel.style.overflow = 'auto';
  panel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  panel.style.color = '#4f8eff';
  panel.style.padding = '10px';
  panel.style.borderRadius = '5px';
  panel.style.fontSize = '12px';
  panel.style.fontFamily = 'monospace';
  panel.style.zIndex = '10000';
  
  panel.innerHTML = `<div>${message}</div>`;
  document.body.appendChild(panel);
  
  return panel;
} 