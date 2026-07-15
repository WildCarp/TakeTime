// 标签组
export interface TagGroup {
  id: string;          // 唯一标识（UUID）
  name: string;        // 名称（必填，不可重复）
  color: string;       // 颜色（必选，10 个预设色之一）
  emoji: string;       // emoji（必选，若干预设 emoji 之一）
}

// 任务
export interface Task {
  id: string;              // 唯一标识（UUID）
  tagGroupId: string;      // 所属标签组 ID（必选，默认「默认」组）
  name: string;            // 任务名称（必填）
  startTime: string;       // 开始时间（格式 yyyy/MM/dd HH:mm）
  endTime: string;         // 结束时间（格式 yyyy/MM/dd HH:mm）
  duration: number;        // 任务时长，单位小时（H），由 startTime/endTime 自动计算
  completed: boolean;      // 是否已完成（默认 false）
  createdAt: string;       // 创建时间（ISO 8601）
  // 周期性任务属性
  isRecurring?: boolean;   // 是否为周期性任务
  weekdays?: number[];     // 每周几重复（0=周日, 1=周一, ..., 6=周六）
}

// 应用数据
export interface AppData {
  tagGroups: TagGroup[];
  tasks: Task[];
}
