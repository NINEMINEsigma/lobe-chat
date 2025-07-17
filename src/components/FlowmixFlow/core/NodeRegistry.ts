import { NodePlugin, NodePluginConfig } from './types/NodePlugin';
import { EventBus } from './EventBus';
import { EventType } from './types/Events';

/**
 * 节点注册表
 * 管理所有节点插件的注册、分类和查找
 */
export class NodeRegistry {
  private plugins: Map<string, NodePlugin> = new Map();
  private categories: Map<string, string[]> = new Map();
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /**
   * 注册节点插件
   */
  register(plugin: NodePlugin): void {
    const { id, category } = plugin.config;

    // 检查插件是否已存在
    if (this.plugins.has(id)) {
      throw new Error(`Plugin with id "${id}" is already registered`);
    }

    // 验证插件配置
    this.validatePlugin(plugin);

    // 注册插件
    this.plugins.set(id, plugin);

    // 更新分类
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    this.categories.get(category)!.push(id);

    // 发布注册事件
    this.eventBus.emit(EventType.PLUGIN_REGISTER, { plugin });

    console.log(`Plugin "${id}" registered successfully in category "${category}"`);
  }

  /**
   * 注销节点插件
   */
  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin with id "${pluginId}" is not registered`);
    }

    const { category } = plugin.config;

    // 从插件映射中移除
    this.plugins.delete(pluginId);

    // 从分类中移除
    const categoryPlugins = this.categories.get(category);
    if (categoryPlugins) {
      const index = categoryPlugins.indexOf(pluginId);
      if (index > -1) {
        categoryPlugins.splice(index, 1);
      }
      // 如果分类为空，删除分类
      if (categoryPlugins.length === 0) {
        this.categories.delete(category);
      }
    }

    // 发布注销事件
    this.eventBus.emit(EventType.PLUGIN_UNREGISTER, { pluginId });

    console.log(`Plugin "${pluginId}" unregistered successfully`);
  }

  /**
   * 获取节点插件
   */
  getPlugin(pluginId: string): NodePlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): NodePlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 根据分类获取插件
   */
  getPluginsByCategory(category: string): NodePlugin[] {
    const pluginIds = this.categories.get(category) || [];
    return pluginIds.map(id => this.plugins.get(id)!).filter(Boolean);
  }

  /**
   * 获取所有分类
   */
  getCategories(): string[] {
    return Array.from(this.categories.keys());
  }

  /**
   * 获取插件配置信息
   */
  getPluginConfigs(): NodePluginConfig[] {
    return this.getAllPlugins().map(plugin => plugin.config);
  }

  /**
   * 搜索插件
   */
  searchPlugins(query: string): NodePlugin[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllPlugins().filter(plugin => {
      const { name, description, category } = plugin.config;
      return (
        name.toLowerCase().includes(lowerQuery) ||
        (description && description.toLowerCase().includes(lowerQuery)) ||
        category.toLowerCase().includes(lowerQuery)
      );
    });
  }

  /**
   * 检查插件是否已注册
   */
  hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * 获取插件数量
   */
  getPluginCount(): number {
    return this.plugins.size;
  }

  /**
   * 获取分类统计
   */
  getCategoryStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.categories.forEach((pluginIds, category) => {
      stats[category] = pluginIds.length;
    });
    return stats;
  }

  /**
   * 批量注册插件
   */
  registerBatch(plugins: NodePlugin[]): void {
    const errors: string[] = [];

    plugins.forEach(plugin => {
      try {
        this.register(plugin);
      } catch (error) {
        errors.push(`Failed to register plugin "${plugin.config.id}": ${error}`);
      }
    });

    if (errors.length > 0) {
      console.warn('Some plugins failed to register:', errors);
    }
  }

  /**
   * 清空所有插件
   */
  clear(): void {
    const pluginIds = Array.from(this.plugins.keys());
    pluginIds.forEach(id => {
      try {
        this.unregister(id);
      } catch (error) {
        console.error(`Failed to unregister plugin "${id}":`, error);
      }
    });
  }

  /**
   * 验证插件配置
   */
  private validatePlugin(plugin: NodePlugin): void {
    const { config, schema, component } = plugin;

    // 验证基本配置
    if (!config.id || !config.name || !config.category || !config.version) {
      throw new Error('Plugin config must include id, name, category, and version');
    }

    // 验证组件
    if (!component.NodeComponent) {
      throw new Error('Plugin must include a NodeComponent');
    }

    // 验证Schema
    if (!schema.properties || typeof schema.properties !== 'object') {
      throw new Error('Plugin schema must include properties object');
    }

    // 验证版本格式（简单的语义版本检查）
    const versionRegex = /^\d+\.\d+\.\d+/;
    if (!versionRegex.test(config.version)) {
      throw new Error('Plugin version must follow semantic versioning (x.y.z)');
    }
  }

  /**
   * 导出插件配置
   */
  exportConfig(): any {
    return {
      plugins: this.getPluginConfigs(),
      categories: Object.fromEntries(this.categories),
      stats: this.getCategoryStats()
    };
  }
}