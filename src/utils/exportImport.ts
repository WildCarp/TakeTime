import { AppData } from '../types';
import { formatDateTime } from './timeUtils';

/**
 * 导出数据为 JSON 文件下载
 */
export function exportData(data: AppData): void {
  const now = new Date();
  const y = now.getFullYear();
  const M = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const H = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const filename = `TakeTime_backup_${y}${M}${d}_${H}${m}${s}.json`;

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 导入 JSON 文件并解析
 */
export function importData(): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('未选择文件'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string) as AppData;
          if (!data.tagGroups || !data.tasks) {
            reject(new Error('文件格式不正确'));
            return;
          }
          resolve(data);
        } catch {
          reject(new Error('文件解析失败'));
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}

// 导出 formatDateTime 供其他模块使用
export { formatDateTime };
