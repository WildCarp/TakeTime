import { TagGroup } from '../types';

// 预设颜色（16 个，按色调顺序排列）
export const PRESET_COLORS: { key: string; value: string; label: string }[] = [
  { key: 'coral', value: '#FF6B6B', label: '珊瑚红' },
  { key: 'rose', value: '#FF8787', label: '玫瑰红' },
  { key: 'citrus', value: '#FFA94D', label: '柑橘橙' },
  { key: 'amber', value: '#FFC078', label: '琥珀橙' },
  { key: 'sun', value: '#FFD43B', label: '阳光黄' },
  { key: 'lime', value: '#A9E34B', label: '青柠绿' },
  { key: 'mint', value: '#69DB7C', label: '薄荷绿' },
  { key: 'teal', value: '#38D9A9', label: '青绿' },
  { key: 'cyan', value: '#66D9E8', label: '青蓝' },
  { key: 'sky', value: '#4DABF7', label: '天空蓝' },
  { key: 'indigo', value: '#5C7CFA', label: '靛蓝' },
  { key: 'lavender', value: '#8A6CF7', label: '薰衣草紫' },
  { key: 'berry', value: '#bd75ee', label: '香芋紫' },
  { key: 'grape', value: '#da64da', label: '葡萄紫' },
  { key: 'sakura', value: '#F783AC', label: '樱花粉' },
  { key: 'stone', value: '#CED4DA', label: '岩石灰' },
];

// 夜间模式预设颜色（降低亮度和饱和度，用于侧边栏标签组）
export const PRESET_COLORS_DARK: Record<string, string> = {
  coral: '#a84a47',
  rose: '#a85555',
  citrus: '#9a6344',
  amber: '#9a7044',
  sun: '#a88a44',
  lime: '#6a8a30',
  mint: '#4a7a4a',
  teal: '#3d7a66',
  cyan: '#3d7a80',
  sky: '#4a6099',
  indigo: '#4a5090',
  lavender: '#6c4a90',
  berry: '#7a4a90',
  grape: '#8a3a8a',
  sakura: '#8a5060',
  stone: '#5c5c5c',
};

// 任务格子颜色映射（直接使用标签组预设颜色作为背景色）
export const TASK_BLOCK_COLORS: Record<string, { bg: string; text: string }> = {
  coral: { bg: '#FF6B6B', text: '#7a2020' },
  rose: { bg: '#FF8787', text: '#7a2020' },
  citrus: { bg: '#FFA94D', text: '#6b3500' },
  amber: { bg: '#FFC078', text: '#6b3500' },
  sun: { bg: '#FFD43B', text: '#5c4500' },
  lime: { bg: '#A9E34B', text: '#2d5010' },
  mint: { bg: '#69DB7C', text: '#155530' },
  teal: { bg: '#38D9A9', text: '#104a3a' },
  cyan: { bg: '#66D9E8', text: '#104550' },
  sky: { bg: '#4DABF7', text: '#0e3060' },
  indigo: { bg: '#5C7CFA', text: '#1a2060' },
  lavender: { bg: '#8A6CF7', text: '#1e1560' },
  berry: { bg: '#bd75ee', text: '#3a1060' },
  grape: { bg: '#da64da', text: '#3a0838' },
  sakura: { bg: '#F783AC', text: '#6a1535' },
  stone: { bg: '#CED4DA', text: '#3a4048' },
};

// 夜间模式任务格子颜色（降低亮度和饱和度）
export const TASK_BLOCK_COLORS_DARK: Record<string, { bg: string; text: string }> = {
  coral: { bg: '#a84a47', text: '#f5dede' },
  rose: { bg: '#a85555', text: '#f5e0e0' },
  citrus: { bg: '#9a6344', text: '#f5e6d9' },
  amber: { bg: '#9a7044', text: '#f5ead9' },
  sun: { bg: '#a88a44', text: '#f5ecd4' },
  lime: { bg: '#6a8a30', text: '#e8f5d4' },
  mint: { bg: '#5a8a5a', text: '#ddf5dd' },
  teal: { bg: '#55907a', text: '#ddf5ed' },
  cyan: { bg: '#4a8a90', text: '#ddf5f5' },
  sky: { bg: '#5c6aa5', text: '#dde3f5' },
  indigo: { bg: '#4a5090', text: '#ddddf5' },
  lavender: { bg: '#6c4a9a', text: '#ecddf5' },
  berry: { bg: '#7a4a90', text: '#f0ddf8' },
  grape: { bg: '#8a3a8a', text: '#f5ddf5' },
  sakura: { bg: '#a56e78', text: '#f5dde3' },
  stone: { bg: '#5c5c5c', text: '#e0e0e0' },
};

// 预设 emoji（40 个，按实用顺序排列）
export const PRESET_EMOJIS: string[] = [
  '💼', '📝', '💻', '📱', '📚', '✍️', '🎓', '💡',
  '🏠', '🍳', '🛒', '🧹', '🏃', '🧘', '⚽', '🚗',
  '✈️', '🎮', '🎬', '🎵', '🎨', '📷', '🎯', '🔧',
  '☕', '🍔', '🎂', '🎁', '💊', '🏥', '🐾', '🌿',
  '🌙', '☀️', '📅', '⏰', '💰', '🔑', '❤️', '⭐',
];

// Emoji 名称映射（用于 hover 提示）
export const EMOJI_LABELS: Record<string, string> = {
  '💼': '工作', '📝': '笔记', '💻': '编程', '📱': '手机',
  '📚': '阅读', '✍️': '写作', '🎓': '学习', '💡': '灵感',
  '🏠': '家务', '🍳': '烹饪', '🛒': '购物', '🧹': '清洁',
  '🏃': '运动', '🧘': '冥想', '⚽': '球类', '🚗': '出行',
  '✈️': '旅行', '🎮': '游戏', '🎬': '影视', '🎵': '音乐',
  '🎨': '绘画', '📷': '摄影', '🎯': '目标', '🔧': '维修',
  '☕': '休息', '🍔': '饮食', '🎂': '生日', '🎁': '礼物',
  '💊': '吃药', '🏥': '医疗', '🐾': '宠物', '🌿': '种植',
  '🌙': '晚间', '☀️': '早间', '📅': '日程', '⏰': '提醒',
  '💰': '财务', '🔑': '重要', '❤️': '喜爱', '⭐': '收藏',
};

// 默认标签组 ID
export const DEFAULT_TAG_GROUP_ID = 'default-tag-group';

// 默认标签组
export const DEFAULT_TAG_GROUP: TagGroup = {
  id: DEFAULT_TAG_GROUP_ID,
  name: '默认',
  color: 'teal',
  emoji: '💼',
};

// 日程表默认配置
export const CALENDAR_DEFAULTS = {
  startHour: 9,       // 默认起始时间
  endHour: 17,        // 默认结束时间
  visibleDays: 7,     // 默认显示天数
  minHours: 3,        // 最小时间范围
  maxHours: 24,       // 最大时间范围（缩到最小时 0-24h 铺满）
  minDays: 3,         // 最小天数（缩放到最大时至少看到3天）
  maxDays: 14,        // 最大天数（缩到最小时显示14天）
  snapMinutes: 15,    // 拖拽吸附粒度（分钟）
};

// localStorage key
export const STORAGE_KEY = 'taketime-data';
export const THEME_STORAGE_KEY = 'taketime-theme';
