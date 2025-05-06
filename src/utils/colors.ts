interface ColorScheme {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

const colorSchemes: Record<string, ColorScheme> = {
  blue: {
    primary: '#0ea5e9',
    secondary: '#0284c7',
    accent: '#38bdf8',
    background: '#f0f9ff',
    text: '#0c4a6e'
  },
  green: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    background: '#ecfdf5',
    text: '#065f46'
  },
  purple: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a78bfa',
    background: '#f5f3ff',
    text: '#5b21b6'
  },
  orange: {
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#fb923c',
    background: '#fff7ed',
    text: '#9a3412'
  }
}

export const getColorScheme = (name: string): ColorScheme => {
  return colorSchemes[name] || colorSchemes.blue
}

export const generateGradient = (scheme: ColorScheme): string => {
  return `linear-gradient(to right, ${scheme.primary}, ${scheme.secondary})`
}

export const getContrastColor = (hexColor: string): string => {
  // 移除#号
  const hex = hexColor.replace('#', '')
  
  // 转换为RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // 计算亮度
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  
  // 根据亮度返回黑色或白色
  return brightness > 128 ? '#000000' : '#ffffff'
}

export const generateTailwindConfig = (scheme: ColorScheme): string => {
  return `
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '${scheme.primary}',
          dark: '${scheme.secondary}',
          light: '${scheme.accent}',
        },
        background: '${scheme.background}',
        text: '${scheme.text}',
      },
    },
  },
}
  `.trim()
} 