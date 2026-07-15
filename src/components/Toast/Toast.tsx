import { useState, useCallback, useEffect } from 'react';
import './Toast.css';

interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'info' | 'error';
}

let toastId = 0;
let globalShowToast: ((text: string, type?: 'success' | 'info' | 'error') => void) | null = null;

// 全局调用方法
export function showToast(text: string, type: 'success' | 'info' | 'error' = 'success') {
  if (globalShowToast) {
    globalShowToast(text, type);
  }
}

export default function Toast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addMessage = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = ++toastId;
    setMessages((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, 2500);
  }, []);

  useEffect(() => {
    globalShowToast = addMessage;
    return () => { globalShowToast = null; };
  }, [addMessage]);

  if (messages.length === 0) return null;

  return (
    <div className="toast-container">
      {messages.map((msg) => (
        <div key={msg.id} className={`toast-item toast-${msg.type}`}>
          {msg.text}
        </div>
      ))}
    </div>
  );
}
