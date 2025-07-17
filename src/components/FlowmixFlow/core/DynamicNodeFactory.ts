import React from 'react';
import { NodeRegistry } from './NodeRegistry';
import { NodeProps, NodeContext } from './types/NodePlugin';
import { AppNode, ValidationResult } from './types/Common';
import { EventBus } from './EventBus';
import { EventType } from './types/Events';

/**
 * 动态节点工厂
 * 根据注册的插件动态创建节点组件
 */
export class DynamicNodeFactory {
  private registry: NodeRegistry;
  private eventBus: EventBus;

  constructor(registry: NodeRegistry, eventBus: EventBus) {
    this.registry = registry;
    this.eventBus = eventBus;
  }

  /**
   * 创建节点组件
   */
  createNodeComponent(nodeType: string): React.ComponentType<NodeProps> | null {
    const plugin = this.registry.getPlugin(nodeType);
    if (!plugin) {
      console.warn(`No plugin found for node type: ${nodeType}`);
      return null;
    }

    const { NodeComponent } = plugin.component;

    // 创建包装组件，提供插件上下文和事件处理
    const WrappedNodeComponent: React.ComponentType<NodeProps> = (props) => {
      const context: NodeContext = {
        registry: this.registry,
        updateNode: this.handleUpdateNode.bind(this),
        removeNode: this.handleRemoveNode.bind(this),
        addEdge: this.handleAddEdge.bind(this)
      };

      // 处理双击事件
      const handleDoubleClick = (event: React.MouseEvent) => {
        event.stopPropagation();

        const node: AppNode = {
          id: props.id,
          type: nodeType,
          position: { x: props.xPos, y: props.yPos },
          data: props.data,
          selected: props.selected
        };

        // 触发插件的双击行为
        if (plugin.behaviors?.onDoubleClick) {
          plugin.behaviors.onDoubleClick(node, context);
        }

        // 发布双击事件
        this.eventBus.emit(EventType.NODE_DOUBLE_CLICK, {
          node,
          event: event.nativeEvent as MouseEvent
        });
      };

      // 处理数据变化
      const handleDataChange = (newData: any) => {
        if (plugin.behaviors?.onDataChange) {
          plugin.behaviors.onDataChange(newData, context);
        }

        if (props.updateNode) {
          props.updateNode(props.id, newData);
        }
      };

      // 扩展props以包含双击处理
      const extendedProps = {
        ...props,
        updateNode: handleDataChange,
        context
      };

      return React.createElement('div', {
        onDoubleClick: handleDoubleClick,
        style: { width: '100%', height: '100%' }
      }, React.createElement(NodeComponent, extendedProps));
    };

    // 设置显示名称以便调试
    WrappedNodeComponent.displayName = `DynamicNode(${plugin.config.name})`;

    return WrappedNodeComponent;
  }

  /**
   * 获取所有节点类型映射
   */
  getNodeTypes(): Record<string, React.ComponentType<NodeProps>> {
    const nodeTypes: Record<string, React.ComponentType<NodeProps>> = {};

    this.registry.getAllPlugins().forEach(plugin => {
      const component = this.createNodeComponent(plugin.config.id);
      if (component) {
        nodeTypes[plugin.config.id] = component;
      }
    });

    return nodeTypes;
  }

  /**
   * 创建节点数据
   */
  createNodeData(nodeType: string, customData?: any): any {
    const plugin = this.registry.getPlugin(nodeType);
    if (!plugin) {
      throw new Error(`No plugin found for node type: ${nodeType}`);
    }

    // 从schema中获取默认值
    const defaultData: any = {};
    Object.entries(plugin.schema.properties).forEach(([key, property]) => {
      if (property.default !== undefined) {
        defaultData[key] = property.default;
      }
    });

    // 合并自定义数据
    return {
      ...defaultData,
      ...customData,
      nodeType,
      pluginVersion: plugin.config.version
    };
  }

  /**
   * 验证节点数据
   */
  validateNodeData(nodeType: string, data: any): { valid: boolean; errors: string[] } {
    const plugin = this.registry.getPlugin(nodeType);
    if (!plugin) {
      return { valid: false, errors: [`No plugin found for node type: ${nodeType}`] };
    }

    const errors: string[] = [];
    const { properties } = plugin.schema;

    // 验证必填字段
    Object.entries(properties).forEach(([key, property]) => {
      if (property.required && (data[key] === undefined || data[key] === null)) {
        errors.push(`Required field "${key}" is missing`);
      }

      // 验证数据类型
      if (data[key] !== undefined) {
        const value = data[key];
        const expectedType = property.type;

        if (!this.validateDataType(value, expectedType)) {
          errors.push(`Field "${key}" should be of type ${expectedType}`);
        }

        // 自定义验证
        if (property.validation && typeof property.validation === 'function') {
          const validationResult = property.validation(value);
          if (validationResult !== true) {
            errors.push(typeof validationResult === 'string' ? validationResult : `Field "${key}" validation failed`);
          }
        }
      }
    });

    // 插件自定义验证
    if (plugin.behaviors?.validate) {
      const node: AppNode = {
        id: 'temp',
        type: nodeType,
        position: { x: 0, y: 0 },
        data
      };

      const validationResult = plugin.behaviors.validate(node);
      if (!validationResult.valid) {
        if (validationResult.errors) {
          errors.push(...validationResult.errors.map(err => err.message));
        } else if (validationResult.message) {
          errors.push(validationResult.message);
        } else {
          errors.push('Validation failed');
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * 获取节点属性编辑组件
   */
  getPropertiesComponent(nodeType: string): React.ComponentType<any> | null {
    const plugin = this.registry.getPlugin(nodeType);
    return plugin?.component.PropertiesComponent || null;
  }

  /**
   * 获取节点对话框组件
   */
  getDialogComponent(nodeType: string): React.ComponentType<any> | null {
    const plugin = this.registry.getPlugin(nodeType);
    return plugin?.component.DialogComponent || null;
  }

  /**
   * 处理节点更新
   */
  private handleUpdateNode(nodeId: string, data: any): void {
    this.eventBus.emit(EventType.NODE_UPDATE, {
      nodeId,
      updates: { data }
    });
  }

  /**
   * 处理节点删除
   */
  private handleRemoveNode(nodeId: string): void {
    this.eventBus.emit(EventType.NODE_REMOVE, { nodeId });
  }

  /**
   * 处理边添加
   */
  private handleAddEdge(edge: any): void {
    this.eventBus.emit(EventType.EDGE_ADD, { edge });
  }

  /**
   * 验证数据类型
   */
  private validateDataType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * 获取节点类型信息
   */
  getNodeTypeInfo(nodeType: string) {
    const plugin = this.registry.getPlugin(nodeType);
    if (!plugin) {
      return null;
    }

    return {
      id: plugin.config.id,
      name: plugin.config.name,
      category: plugin.config.category,
      description: plugin.config.description,
      icon: plugin.config.icon,
      version: plugin.config.version,
      author: plugin.config.author,
      schema: plugin.schema
    };
  }
}