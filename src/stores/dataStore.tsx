import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TagGroup, Task, AppData } from '../types';
import { DEFAULT_TAG_GROUP, DEFAULT_TAG_GROUP_ID } from '../constants';
import { loadData, saveData } from '../utils/storage';
import { formatDateTime, calcDuration } from '../utils/timeUtils';

// Action 类型
type Action =
  | { type: 'INIT_DATA'; payload: AppData }
  | { type: 'ADD_TAG_GROUP'; payload: Omit<TagGroup, 'id'> }
  | { type: 'UPDATE_TAG_GROUP'; payload: { id: string; updates: Partial<Omit<TagGroup, 'id'>> } }
  | { type: 'DELETE_TAG_GROUP'; payload: string }
  | { type: 'REORDER_TAG_GROUPS'; payload: string[] }
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'duration' | 'createdAt'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Omit<Task, 'id' | 'duration' | 'createdAt'>> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK_COMPLETE'; payload: string }
  | { type: 'IMPORT_DATA'; payload: AppData };

// 初始数据
function getInitialData(): AppData {
  const saved = loadData();
  if (saved) return saved;

  // 创建默认数据
  const today = new Date();
  const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0);
  const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0);

  return {
    tagGroups: [DEFAULT_TAG_GROUP],
    tasks: [
      {
        id: 'default-task-example',
        tagGroupId: DEFAULT_TAG_GROUP_ID,
        name: '示例任务',
        startTime: formatDateTime(startTime),
        endTime: formatDateTime(endTime),
        duration: 1,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

// Reducer
function dataReducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'INIT_DATA':
      return action.payload;

    case 'ADD_TAG_GROUP': {
      const newGroup: TagGroup = {
        id: uuidv4(),
        ...action.payload,
      };
      return { ...state, tagGroups: [...state.tagGroups, newGroup] };
    }

    case 'UPDATE_TAG_GROUP': {
      const { id, updates } = action.payload;
      return {
        ...state,
        tagGroups: state.tagGroups.map((g) =>
          g.id === id ? { ...g, ...updates } : g
        ),
      };
    }

    case 'DELETE_TAG_GROUP': {
      const groupId = action.payload;
      // 不允许删除默认标签组
      if (groupId === DEFAULT_TAG_GROUP_ID) return state;
      // 将该标签组下的任务迁移到默认标签组
      const updatedTasks = state.tasks.map((t) =>
        t.tagGroupId === groupId ? { ...t, tagGroupId: DEFAULT_TAG_GROUP_ID } : t
      );
      return {
        ...state,
        tagGroups: state.tagGroups.filter((g) => g.id !== groupId),
        tasks: updatedTasks,
      };
    }

    case 'REORDER_TAG_GROUPS': {
      const orderedIds = action.payload;
      const reordered = orderedIds
        .map((id) => state.tagGroups.find((g) => g.id === id))
        .filter(Boolean) as TagGroup[];
      return { ...state, tagGroups: reordered };
    }

    case 'ADD_TASK': {
      const { startTime, endTime, ...rest } = action.payload;
      const duration = calcDuration(startTime, endTime);
      const newTask: Task = {
        id: uuidv4(),
        startTime,
        endTime,
        duration,
        createdAt: new Date().toISOString(),
        ...rest,
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }

    case 'UPDATE_TASK': {
      const { id, updates } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id !== id) return t;
          const updated = { ...t, ...updates };
          // 如果修改了时间，重新计算 duration
          if (updates.startTime || updates.endTime) {
            updated.duration = calcDuration(updated.startTime, updated.endTime);
          }
          return updated;
        }),
      };
    }

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };

    case 'TOGGLE_TASK_COMPLETE':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload ? { ...t, completed: !t.completed } : t
        ),
      };

    case 'IMPORT_DATA':
      return action.payload;

    default:
      return state;
  }
}

// Context
interface DataContextType {
  data: AppData;
  addTagGroup: (group: Omit<TagGroup, 'id'>) => void;
  updateTagGroup: (id: string, updates: Partial<Omit<TagGroup, 'id'>>) => void;
  deleteTagGroup: (id: string) => void;
  reorderTagGroups: (orderedIds: string[]) => void;
  addTask: (task: Omit<Task, 'id' | 'duration' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'duration' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  importData: (data: AppData) => void;
  getTagGroup: (id: string) => TagGroup | undefined;
}

const DataContext = createContext<DataContextType | null>(null);

// Provider
export function DataProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(dataReducer, undefined, getInitialData);

  // 数据变化时自动保存
  useEffect(() => {
    saveData(data);
  }, [data]);

  const addTagGroup = useCallback((group: Omit<TagGroup, 'id'>) => {
    dispatch({ type: 'ADD_TAG_GROUP', payload: group });
  }, []);

  const updateTagGroup = useCallback((id: string, updates: Partial<Omit<TagGroup, 'id'>>) => {
    dispatch({ type: 'UPDATE_TAG_GROUP', payload: { id, updates } });
  }, []);

  const deleteTagGroup = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TAG_GROUP', payload: id });
  }, []);

  const reorderTagGroups = useCallback((orderedIds: string[]) => {
    dispatch({ type: 'REORDER_TAG_GROUPS', payload: orderedIds });
  }, []);

  const addTask = useCallback((task: Omit<Task, 'id' | 'duration' | 'createdAt'>) => {
    dispatch({ type: 'ADD_TASK', payload: task });
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, 'id' | 'duration' | 'createdAt'>>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  const toggleTaskComplete = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_TASK_COMPLETE', payload: id });
  }, []);

  const importDataFn = useCallback((newData: AppData) => {
    dispatch({ type: 'IMPORT_DATA', payload: newData });
  }, []);

  const getTagGroup = useCallback((id: string) => {
    return data.tagGroups.find((g) => g.id === id);
  }, [data.tagGroups]);

  return (
    <DataContext.Provider
      value={{
        data,
        addTagGroup,
        updateTagGroup,
        deleteTagGroup,
        reorderTagGroups,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        importData: importDataFn,
        getTagGroup,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// Hook
export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
