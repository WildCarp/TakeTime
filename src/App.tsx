import { useState, useCallback } from 'react';
import { DataProvider, useData } from './stores/dataStore';
import { useTheme } from './hooks/useTheme';
import { useCalendarZoom } from './hooks/useCalendarZoom';
import Calendar from './components/Calendar/Calendar';
import Sidebar from './components/Sidebar/Sidebar';
import FloatingBall from './components/FloatingBall/FloatingBall';
import TaskModal from './components/Modals/TaskModal';
import TagGroupModal from './components/Modals/TagGroupModal';
import TaskDetailPanel from './components/TaskDetail/TaskDetailPanel';
import TodayView from './components/TodayView/TodayView';
import Titlebar from './components/Titlebar/Titlebar';
import Toast from './components/Toast/Toast';
import ConfirmDialog from './components/Toast/ConfirmDialog';
import { isTauri, enterFloatingMode, exitFloatingMode } from './utils/tauriWindow';
import { Task, TagGroup } from './types';
import './App.css';

function AppContent() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { getTagGroup } = useData();
  const { viewState, zoomTimeAxis, zoomDateAxis, panView, goToToday } = useCalendarZoom();

  // UI 状态
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [tagGroupModalOpen, setTagGroupModalOpen] = useState(false);
  const [editingTagGroup, setEditingTagGroup] = useState<TagGroup | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [floatingMode, setFloatingMode] = useState(false);

  const isTauriEnv = isTauri();

  // 切换悬浮模式
  const handleToggleFloating = useCallback(async () => {
    if (!floatingMode) {
      await enterFloatingMode();
      setFloatingMode(true);
    } else {
      await exitFloatingMode();
      setFloatingMode(false);
    }
  }, [floatingMode]);

  // 退出悬浮模式
  const handleExitFloating = useCallback(async () => {
    await exitFloatingMode();
    setFloatingMode(false);
  }, []);

  // 打开任务详情
  const handleTaskClick = useCallback((task: Task) => {
    setDetailTask(task);
    setDetailOpen(true);
  }, []);

  // 关闭任务详情（延迟清除 task 以允许退出动画）
  const handleDetailClose = useCallback(() => {
    setDetailOpen(false);
    setTimeout(() => setDetailTask(null), 400);
  }, []);

  // 编辑标签组
  const handleEditTagGroup = useCallback((id: string) => {
    const group = getTagGroup(id);
    if (group) {
      setEditingTagGroup(group);
      setTagGroupModalOpen(true);
    }
  }, [getTagGroup]);

  // 新建标签组
  const handleAddTagGroup = useCallback(() => {
    setEditingTagGroup(null);
    setTagGroupModalOpen(true);
  }, []);

  // 定位到现在
  const handleLocateToday = useCallback(() => {
    goToToday();
  }, [goToToday]);

  // 悬浮模式：只显示今日视图
  if (floatingMode) {
    return (
      <div className="app-container app-floating" data-theme={theme}>
        <TodayView theme={theme} onExitFloating={handleExitFloating} />
        <Toast />
      </div>
    );
  }

  return (
    <div className={`app-container ${isTauriEnv ? 'is-tauri' : ''}`} data-theme={theme}>
      {/* 自定义标题栏（仅 Tauri） */}
      <Titlebar />

      {/* 主内容区 */}
      <div className="app-main">
        {/* 侧边栏 */}
        <Sidebar
          visible={sidebarVisible}
          onToggle={() => setSidebarVisible(!sidebarVisible)}
          onEditTagGroup={handleEditTagGroup}
          onAddTagGroup={handleAddTagGroup}
          onTaskClick={handleTaskClick}
          theme={theme}
        />

        {/* 日程表主区域 */}
        <Calendar
          onTaskClick={handleTaskClick}
          viewState={viewState}
          zoomTimeAxis={zoomTimeAxis}
          zoomDateAxis={zoomDateAxis}
          panView={panView}
          theme={theme}
        />
      </div>

      {/* 悬浮功能球 */}
      <FloatingBall
        onAddTask={() => setTaskModalOpen(true)}
        onLocateToday={handleLocateToday}
        onToggleTheme={toggleTheme}
        onToggleFloating={handleToggleFloating}
        isTauriEnv={isTauriEnv}
        theme={theme}
      />

      {/* 新建任务模态框 */}
      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
      />

      {/* 标签组模态框 */}
      <TagGroupModal
        open={tagGroupModalOpen}
        editingGroup={editingTagGroup}
        onClose={() => {
          setTagGroupModalOpen(false);
          setEditingTagGroup(null);
        }}
        theme={theme}
      />

      {/* 任务详情面板 */}
      <TaskDetailPanel
        open={detailOpen}
        task={detailTask}
        onClose={handleDetailClose}
      />

      {/* 全局消息提醒 */}
      <Toast />

      {/* 全局确认对话框 */}
      <ConfirmDialog />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
