import React, { useState, useEffect } from 'react';
import { Modal, Card, Input, Empty, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { shop_list } from '../ElementLayer/shop_list';
import styles from './index.less';

const { Search } = Input;

interface NodeSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (nodeType: string) => void;
  position?: { x: number; y: number };
}

// 简化的节点类型定义
interface SimpleNodeType {
  id: string;
  label: string;
  category: string;
  icon?: React.ReactNode;
  description?: string;
}

const NodeSelector: React.FC<NodeSelectorProps> = ({
  visible,
  onClose,
  onSelect,
  position
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [nodeTypes, setNodeTypes] = useState<SimpleNodeType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // 加载节点类型列表
  useEffect(() => {
    const loadNodeTypes = () => {
      // 尝试从核心引擎加载，如果失败则使用现有的shop_list
      try {
        // TODO: 当核心引擎可用时，使用以下代码
        // const allPlugins = globalNodeRegistry.getAllPlugins();
        // const allCategories = globalNodeRegistry.getCategories();
        // setPlugins(allPlugins);
        // setCategories(allCategories);

        // 回退方案：使用现有的shop_list
        const types: SimpleNodeType[] = [];
        const cats: string[] = [];

        shop_list.forEach(category => {
          if (!cats.includes(category.label)) {
            cats.push(category.label);
          }

          category.children.forEach(child => {
            types.push({
              id: child.id,
              label: child.label,
              category: category.label,
              icon: child.icon,
              description: `${child.label}组件`
            });
          });
        });

        // 添加一些常用的节点类型
        const additionalTypes: SimpleNodeType[] = [
          {
            id: 'Text',
            label: '文本',
            category: '基础',
            description: '文本显示组件'
          },
          {
            id: 'Image',
            label: '图片',
            category: '基础',
            description: '图片显示组件'
          },
          {
            id: 'Input',
            label: '输入框',
            category: '表单',
            description: '文本输入组件'
          },
          {
            id: 'Select',
            label: '选择器',
            category: '表单',
            description: '下拉选择组件'
          }
        ];

        // 添加表单分类
        if (!cats.includes('表单')) {
          cats.push('表单');
        }

        setNodeTypes([...types, ...additionalTypes]);
        setCategories(cats);

      } catch (error) {
        console.warn('核心引擎不可用，使用回退方案', error);
        // 使用最基本的节点类型
        setNodeTypes([
          {
            id: 'Button',
            label: '按钮',
            category: '基础',
            description: '按钮组件'
          },
          {
            id: 'Text',
            label: '文本',
            category: '基础',
            description: '文本组件'
          }
        ]);
        setCategories(['基础']);
      }
    };

    loadNodeTypes();
  }, []);

  // 搜索过滤
  const filteredNodeTypes = nodeTypes.filter(nodeType =>
    nodeType.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    nodeType.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 按分类分组
  const nodeTypesByCategory = categories.reduce((acc, category) => {
    acc[category] = filteredNodeTypes.filter(nodeType => nodeType.category === category);
    return acc;
  }, {} as Record<string, SimpleNodeType[]>);

  const handleNodeSelect = (nodeType: string) => {
    onSelect(nodeType);
    onClose();
    setSearchQuery('');
  };

  return (
    <Modal
      title="选择节点类型"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className={styles.nodeSelectorModal}
    >
      <div className={styles.searchContainer}>
        <Search
          placeholder="搜索节点类型..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: 16 }}
        />
      </div>

      <div className={styles.nodeList}>
        {categories.length === 0 ? (
          <Empty description="暂无可用节点类型" />
        ) : (
          categories.map(category => (
            <div key={category} className={styles.categorySection}>
              <h4 className={styles.categoryTitle}>{category}</h4>
              <Row gutter={[12, 12]}>
                {nodeTypesByCategory[category]?.map(nodeType => (
                  <Col span={8} key={nodeType.id}>
                    <Card
                      size="small"
                      className={styles.nodeCard}
                      hoverable
                      onClick={() => handleNodeSelect(nodeType.id)}
                    >
                      <div className={styles.nodeIcon}>
                        {nodeType.icon || <PlusOutlined />}
                      </div>
                      <div className={styles.nodeName}>{nodeType.label}</div>
                      {nodeType.description && (
                        <div className={styles.nodeDescription}>
                          {nodeType.description}
                        </div>
                      )}
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default NodeSelector;