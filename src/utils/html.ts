/**
 * 清理HTML内容，移除不必要的空白和注释
 */
export const cleanHtml = (html: string): string => {
  return html
    .replace(/\s+/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim()
}

/**
 * 提取HTML中的样式
 */
export const extractStyles = (html: string): string => {
  const styleRegex = /<style>([\s\S]*?)<\/style>/g
  const matches = html.match(styleRegex)
  if (!matches) return ''
  return matches.map(match => match.replace(/<\/?style>/g, '')).join('\n')
}

/**
 * 提取HTML中的脚本
 */
export const extractScripts = (html: string): string => {
  const scriptRegex = /<script>([\s\S]*?)<\/script>/g
  const matches = html.match(scriptRegex)
  if (!matches) return ''
  return matches.map(match => match.replace(/<\/?script>/g, '')).join('\n')
}

/**
 * 合并HTML、CSS和JavaScript
 */
export const combineHtml = (html: string, css: string, js: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    ${js}
  </script>
</body>
</html>
  `.trim()
}

/**
 * 验证HTML内容是否安全
 */
export const validateHtml = (html: string): boolean => {
  // 检查是否包含潜在的危险标签或属性
  const dangerousPatterns = [
    /<script\b[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:\s*text\/html/i
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(html))
} 