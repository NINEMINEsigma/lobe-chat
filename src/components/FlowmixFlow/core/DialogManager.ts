import React from 'react';
import { Modal } from 'antd';
import { NodeRegistry } from './NodeRegistry';
import { DynamicNodeFactory } from './DynamicNodeFactory';
import { AppNode } from './types/Common';
import { EventBus } from './EventBus';
import { EventType } from './types/Events';

/**
 * 对话框管理器
 * 负责管理节点编辑对话框的打开、关闭和数据处理
 */
export class DialogManager {
  private registry: NodeRegistry;
  private nodeFactory: DynamicNodeFactory;
  private eventBus: EventBus;
  private openDialogs: Map<string, any> = new Map();

  constructor(
    registry: NodeRegistry,
    nodeFactory: DynamicNodeFactory,
    eventBus: EventBus
  ) {
    this.registry = registry;
    this.nodeFactory = nodeFactory;
    this.eventBus = eventBus;
  }

  /**
   * 打开节点编辑对话框
   */
  openNodeDialog(node: AppNode): void {
    const plugin = this.registry.getPlugin(node.type);
    if (!plugin) {
      console.warn(`No plugin found for node type: ${node.type}`);
      return;
    }

    // 检查是否已有对话框打开
    if (this.openDialogs.has(node.id)) {
      return;
    }

    // 获取自定义对话框组件
    const DialogComponent = this.nodeFactory.getDialogComponent(node.type);

    if (DialogComponent) {
      this.openCustomDialog(node, DialogComponent);
    } else {
      this.openDefaultDialog(node);
    }
  }

  /**
   * 打开自定义对话框
   */
  private openCustomDialog(node: AppNode, DialogComponent: React.ComponentType<any>): void {
    const handleSave = (data: any) => {
      this.handleNodeUpdate(node.id, data);
      this.closeDialog(node.id);
    };

    const handleCancel = () => {
      this.closeDialog(node.id);
    };

    const dialogProps = {
      node,
      onSave: handleSave,
      onCancel: handleCancel
    };

    // 创建对话框实例
    const modal = Modal.info({
      title: `编辑 ${node.type} 节点`,
      content: React.createElement(DialogComponent, dialogProps),
      width: 600,
      okText: '保存',
      cancelText: '取消',
      onOk: handleSave,
      onCancel: handleCancel,
      maskClosable: false
    });

    this.openDialogs.set(node.id, modal);
  }

  /**
   * 打开默认对话框（使用动态表单）
   */
  private openDefaultDialog(node: AppNode): void {
    const plugin = this.registry.getPlugin(node.type);
    if (!plugin) return;

    const { schema } = plugin;
    let formData = { ...node.data };

    const handleSave = () => {
      // 验证数据
      const validation = this.nodeFactory.validateNodeData(node.type, formData);
      if (!validation.valid) {
        Modal.error({
          title: '数据验证失败',
          content: validation.errors.join('\n')
        });
        return;
      }

      this.handleNodeUpdate(node.id, formData);
      this.closeDialog(node.id);
    };

    const handleCancel = () => {
      this.closeDialog(node.id);
    };

    // 创建表单字段
    const formFields = this.createFormFields(schema, formData, (key: string, value: any) => {
      formData[key] = value;
    });

    const modal = Modal.confirm({
      title: `编辑 ${plugin.config.name}`,
      content: React.createElement('div', {
        style: { maxHeight: '400px', overflowY: 'auto' }
      }, formFields),
      width: 600,
      okText: '保存',
      cancelText: '取消',
      onOk: handleSave,
      onCancel: handleCancel,
      maskClosable: false
    });

    this.openDialogs.set(node.id, modal);
  }

  /**
   * 创建表单字段
   */
  private createFormFields(schema: any, data: any, onChange: (key: string, value: any) => void): React.ReactElement[] {
    const fields: React.ReactElement[] = [];

    Object.entries(schema.properties).forEach(([key, property]: [string, any]) => {
      const fieldProps = {
        key,
        style: { marginBottom: '16px' }
      };

      let fieldElement: React.ReactElement;

      switch (property.type) {
        case 'string':
          if (property.options) {
            // 下拉选择
            fieldElement = React.createElement('div', fieldProps, [
              React.createElement('label', {
                key: 'label',
                style: { display: 'block', marginBottom: '4px', fontWeight: 'bold' }
              }, property.label),
              React.createElement('select', {
                key: 'input',
                value: data[key] || property.default || '',
                onChange: (e: any) => onChange(key, e.target.value),
                style: { width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }
              }, [
                React.createElement('option', { key: 'empty', value: '' }, '请选择...'),
                ...property.options.map((option: any) =>
                  React.createElement('option', {
                    key: option.value,
                    value: option.value
                  }, option.label)
                )
              ])
            ]);
          } else {
            // 文本输入
            fieldElement = React.createElement('div', fieldProps, [
              React.createElement('label', {
                key: 'label',
                style: { display: 'block', marginBottom: '4px', fontWeight: 'bold' }
              }, property.label),
              React.createElement('input', {
                key: 'input',
                type: 'text',
                value: data[key] || property.default || '',
                onChange: (e: any) => onChange(key, e.target.value),
                placeholder: property.description,
                style: { width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }
              })
            ]);
          }
          break;

        case 'number':
          fieldElement = React.createElement('div', fieldProps, [
            React.createElement('label', {
              key: 'label',
              style: { display: 'block', marginBottom: '4px', fontWeight: 'bold' }
            }, property.label),
            React.createElement('input', {
              key: 'input',
              type: 'number',
              value: data[key] || property.default || 0,
              onChange: (e: any) => onChange(key, parseFloat(e.target.value) || 0),
              placeholder: property.description,
              style: { width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }
            })
          ]);
          break;

        case 'boolean':
          fieldElement = React.createElement('div', fieldProps, [
            React.createElement('label', {
              key: 'label',
              style: { display: 'flex', alignItems: 'center', cursor: 'pointer' }
            }, [
              React.createElement('input', {
                key: 'input',
                type: 'checkbox',
                checked: data[key] !== undefined ? data[key] : property.default || false,
                onChange: (e: any) => onChange(key, e.target.checked),
                style: { marginRight: '8px' }
              }),
              React.createElement('span', { key: 'text' }, property.label)
            ])
          ]);
          break;

        default:
          fieldElement = React.createElement('div', fieldProps, [
            React.createElement('label', {
              key: 'label',
              style: { display: 'block', marginBottom: '4px', fontWeight: 'bold' }
            }, property.label),
            React.createElement('textarea', {
              key: 'input',
              value: JSON.stringify(data[key] || property.default || {}, null, 2),
              onChange: (e: any) => {
                try {
                  const value = JSON.parse(e.target.value);
                  onChange(key, value);
                } catch (error) {
                  // 忽略JSON解析错误，等待用户完成输入
                }
              },
              placeholder: property.description,
              rows: 4,
              style: {
                width: '100%',
                padding: '4px 8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontFamily: 'monospace'
              }
            })
          ]);
      }

      fields.push(fieldElement);
    });

    return fields;
  }

  /**
   * 关闭对话框
   */
  closeDialog(nodeId: string): void {
    const modal = this.openDialogs.get(nodeId);
    if (modal) {
      modal.destroy();
      this.openDialogs.delete(nodeId);
    }
  }

  /**
   * 关闭所有对话框
   */
  closeAllDialogs(): void {
    this.openDialogs.forEach((modal, nodeId) => {
      modal.destroy();
    });
    this.openDialogs.clear();
  }

  /**
   * 处理节点数据更新
   */
  private handleNodeUpdate(nodeId: string, data: any): void {
    this.eventBus.emit(EventType.NODE_UPDATE, {
      nodeId,
      updates: { data }
    });

    // 发布节点数据变更事件
    this.eventBus.emit(EventType.NODE_DATA_CHANGE, {
      nodeId,
      data
    });
  }

  /**
   * 获取当前打开的对话框数量
   */
  getOpenDialogCount(): number {
    return this.openDialogs.size;
  }

  /**
   * 检查指定节点是否有对话框打开
   */
  hasOpenDialog(nodeId: string): boolean {
    return this.openDialogs.has(nodeId);
  }

  /**
   * 批量关闭指定节点的对话框
   */
  closeDialogsByNodeIds(nodeIds: string[]): void {
    nodeIds.forEach(nodeId => {
      this.closeDialog(nodeId);
    });
  }
}