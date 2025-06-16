import { NodeRegistry } from './NodeRegistry';
import { NodePlugin } from './types/NodePlugin';
import { EventBus } from './EventBus';
import { EventType } from './types/Events';

/**
 * 插件加载器
 * 负责加载和管理插件的生命周期
 */
export class PluginLoader {
  private registry: NodeRegistry;
  private eventBus: EventBus;
  private loadedPlugins: Map<string, NodePlugin> = new Map();
  private pluginUrls: Map<string, string> = new Map();

  constructor(registry: NodeRegistry, eventBus: EventBus) {
    this.registry = registry;
    this.eventBus = eventBus;
  }

  /**
   * 加载内置插件
   */
  async loadBuiltinPlugins(): Promise<void> {
    const builtinPlugins = await this.getBuiltinPlugins();

    for (const plugin of builtinPlugins) {
      try {
        await this.loadPlugin(plugin);
        this.eventBus.emit(EventType.PLUGIN_LOAD, {
          pluginId: plugin.config.id
        });
      } catch (error) {
        console.error(`Failed to load builtin plugin ${plugin.config.id}:`, error);
        this.eventBus.emit(EventType.PLUGIN_ERROR, {
          pluginId: plugin.config.id,
          error: error as Error
        });
      }
    }
  }

  /**
   * 从URL加载外部插件
   */
  async loadPluginFromUrl(url: string): Promise<NodePlugin | null> {
    try {
      // 动态导入插件模块
      const module = await import(url);
      const plugin = module.default || module;

      if (!this.validatePlugin(plugin)) {
        throw new Error('Invalid plugin format');
      }

      await this.loadPlugin(plugin);
      this.pluginUrls.set(plugin.config.id, url);

      this.eventBus.emit(EventType.PLUGIN_LOAD, {
        pluginId: plugin.config.id,
        url
      });

      return plugin;
    } catch (error) {
      console.error(`Failed to load plugin from URL ${url}:`, error);
      this.eventBus.emit(EventType.PLUGIN_ERROR, {
        pluginId: 'unknown',
        error: error as Error
      });
      return null;
    }
  }

  /**
   * 加载插件配置
   */
  async loadPluginsFromConfig(configs: Array<{ id: string; url: string; enabled: boolean }>): Promise<void> {
    const loadPromises = configs
      .filter(config => config.enabled)
      .map(config => this.loadPluginFromUrl(config.url));

    await Promise.allSettled(loadPromises);
  }

  /**
   * 卸载插件
   */
  async unloadPlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.loadedPlugins.get(pluginId);
      if (!plugin) {
        return false;
      }

      // 从注册表中移除
      this.registry.unregister(pluginId);

      // 从加载列表中移除
      this.loadedPlugins.delete(pluginId);
      this.pluginUrls.delete(pluginId);

      this.eventBus.emit(EventType.PLUGIN_UNREGISTER, { pluginId });

      return true;
    } catch (error) {
      console.error(`Failed to unload plugin ${pluginId}:`, error);
      this.eventBus.emit(EventType.PLUGIN_ERROR, {
        pluginId,
        error: error as Error
      });
      return false;
    }
  }

  /**
   * 重新加载插件
   */
  async reloadPlugin(pluginId: string): Promise<boolean> {
    const url = this.pluginUrls.get(pluginId);
    if (!url) {
      return false;
    }

    await this.unloadPlugin(pluginId);
    const plugin = await this.loadPluginFromUrl(url);

    return plugin !== null;
  }

  /**
   * 获取已加载的插件列表
   */
  getLoadedPlugins(): NodePlugin[] {
    return Array.from(this.loadedPlugins.values());
  }

  /**
   * 获取插件加载状态
   */
  getPluginStatus(pluginId: string): {
    loaded: boolean;
    registered: boolean;
    url?: string;
  } {
    return {
      loaded: this.loadedPlugins.has(pluginId),
      registered: this.registry.hasPlugin(pluginId),
      url: this.pluginUrls.get(pluginId)
    };
  }

  /**
   * 获取所有插件状态
   */
  getAllPluginStatus(): Record<string, {
    loaded: boolean;
    registered: boolean;
    url?: string;
    plugin?: NodePlugin;
  }> {
    const status: Record<string, any> = {};

    // 已加载的插件
    this.loadedPlugins.forEach((plugin, id) => {
      status[id] = {
        loaded: true,
        registered: this.registry.hasPlugin(id),
        url: this.pluginUrls.get(id),
        plugin
      };
    });

    // 已注册但未在加载列表中的插件
    this.registry.getAllPlugins().forEach(plugin => {
      if (!status[plugin.config.id]) {
        status[plugin.config.id] = {
          loaded: false,
          registered: true,
          plugin
        };
      }
    });

    return status;
  }

  /**
   * 清除所有插件
   */
  async clearAllPlugins(): Promise<void> {
    const pluginIds = Array.from(this.loadedPlugins.keys());

    for (const pluginId of pluginIds) {
      await this.unloadPlugin(pluginId);
    }
  }

  /**
   * 加载单个插件
   */
  private async loadPlugin(plugin: NodePlugin): Promise<void> {
    // 验证插件
    if (!this.validatePlugin(plugin)) {
      const pluginId = (plugin as any)?.config?.id || 'unknown';
      throw new Error(`Invalid plugin: ${pluginId}`);
    }

    // 检查版本兼容性
    if (!this.checkCompatibility(plugin)) {
      throw new Error(`Plugin ${plugin.config.id} is not compatible with current version`);
    }

    // 注册到插件注册表
    this.registry.register(plugin);

    // 添加到已加载列表
    this.loadedPlugins.set(plugin.config.id, plugin);

    this.eventBus.emit(EventType.PLUGIN_REGISTER, { plugin });
  }

  /**
   * 验证插件格式
   */
  private validatePlugin(plugin: any): plugin is NodePlugin {
    if (!plugin || typeof plugin !== 'object') {
      return false;
    }

    // 检查必需的配置
    if (!plugin.config || !plugin.config.id || !plugin.config.name) {
      return false;
    }

    // 检查schema
    if (!plugin.schema || !plugin.schema.properties) {
      return false;
    }

    // 检查组件
    if (!plugin.component || !plugin.component.NodeComponent) {
      return false;
    }

    return true;
  }

  /**
   * 检查插件兼容性
   */
  private checkCompatibility(plugin: NodePlugin): boolean {
    // 这里可以添加版本兼容性检查逻辑
    // 目前简单返回true
    return true;
  }

  /**
   * 获取内置插件
   */
  private async getBuiltinPlugins(): Promise<NodePlugin[]> {
    const plugins: NodePlugin[] = [];

    try {
      // 尝试加载内置插件
      // 这里可以根据实际情况调整导入路径
      const modules: Promise<any>[] = [
        // 可以在这里添加内置插件的导入
      ];

      for (const modulePromise of modules) {
        try {
          const module = await modulePromise;
          const plugin = module.default || module;
          if (this.validatePlugin(plugin)) {
            plugins.push(plugin);
          }
        } catch (error) {
          console.warn('Failed to load builtin plugin:', error);
        }
      }
    } catch (error) {
      console.warn('No builtin plugins found:', error);
    }

    return plugins;
  }

  /**
   * 创建插件沙箱环境
   */
  private createPluginSandbox(plugin: NodePlugin): any {
    // 为插件创建隔离的执行环境
    // 这里可以添加安全性检查和资源限制
    return {
      plugin,
      registry: this.registry,
      eventBus: this.eventBus,
      // 可以添加更多沙箱API
    };
  }

  /**
   * 获取插件依赖
   */
  private getPluginDependencies(plugin: NodePlugin): string[] {
    // 从插件配置中提取依赖信息
    return (plugin.config as any).dependencies || [];
  }

  /**
   * 检查插件依赖
   */
  private checkDependencies(plugin: NodePlugin): boolean {
    const dependencies = this.getPluginDependencies(plugin);

    for (const dep of dependencies) {
      if (!this.loadedPlugins.has(dep)) {
        console.warn(`Plugin ${plugin.config.id} requires dependency: ${dep}`);
        return false;
      }
    }

    return true;
  }
}