import { EventType, EventData, EventListener, EventListenerMap } from './types/Events';

/**
 * 事件总线实现
 * 提供类型安全的事件监听和发布功能
 */
export class EventBus {
  private listeners: EventListenerMap = {};

  /**
   * 添加事件监听器
   */
  on<T extends EventType>(event: T, listener: EventListener<T>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener as any);
  }

  /**
   * 移除事件监听器
   */
  off<T extends EventType>(event: T, listener: EventListener<T>): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      const index = eventListeners.indexOf(listener as any);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * 发布事件
   */
  emit<T extends EventType>(event: T, data: EventData[T]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      // 创建副本以避免在执行过程中修改监听器列表
      const listeners = [...eventListeners];
      listeners.forEach(listener => {
        try {
          const result = listener(data);
          // 如果监听器返回Promise，处理异步错误
          if (result instanceof Promise) {
            result.catch(error => {
              console.error(`Error in async event listener for ${event}:`, error);
              this.emit(EventType.ENGINE_ERROR, { error });
            });
          }
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
          this.emit(EventType.ENGINE_ERROR, { error: error as Error });
        }
      });
    }
  }

  /**
   * 一次性事件监听器
   */
  once<T extends EventType>(event: T, listener: EventListener<T>): void {
    const onceListener: EventListener<T> = (data) => {
      this.off(event, onceListener);
      return listener(data);
    };
    this.on(event, onceListener);
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(): void {
    this.listeners = {};
  }

  /**
   * 移除特定事件的所有监听器
   */
  removeAllListenersForEvent<T extends EventType>(event: T): void {
    delete this.listeners[event];
  }

  /**
   * 获取事件的监听器数量
   */
  getListenerCount<T extends EventType>(event: T): number {
    return this.listeners[event]?.length || 0;
  }

  /**
   * 获取所有已注册的事件类型
   */
  getRegisteredEvents(): EventType[] {
    return Object.keys(this.listeners) as EventType[];
  }

  /**
   * 检查是否有监听器监听特定事件
   */
  hasListeners<T extends EventType>(event: T): boolean {
    return this.getListenerCount(event) > 0;
  }
}

// 创建全局事件总线实例
export const globalEventBus = new EventBus();