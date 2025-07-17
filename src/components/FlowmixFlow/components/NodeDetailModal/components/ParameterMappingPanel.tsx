/**
 * 参数映射配置面板
 * 允许用户指定具体使用哪些节点的输出作为参数
 */

import React, { memo, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Switch,
  Space,
  Popconfirm,
  Typography,
  Alert,
  Modal,
  Form
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  LinkOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { useTranslation } from 'react-i18next';

import { ParameterMapping } from '@/utils/workflow/multiInputCollector';

const { Text, Title } = Typography;
const { Option } = Select;

interface ParameterMappingPanelProps {
  mappings: ParameterMapping[];
  availableNodes: Array<{ id: string; label: string; type: string }>;
  onChange: (mappings: ParameterMapping[]) => void;
  disabled?: boolean;
}

const useStyles = createStyles(({ token, css }) => ({
  mappingPanel: css`
    .ant-card-body {
      padding: 16px;
    }
  `,

  addButton: css`
    width: 100%;
    margin-bottom: 16px;
    border-style: dashed;
  `,

  parameterRow: css`
    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,

  requiredBadge: css`
    .ant-tag {
      margin: 0;
    }
  `,

  nodeSelect: css`
    min-width: 120px;
  `,

  actionButtons: css`
    .ant-btn {
      padding: 4px 8px;
      height: auto;
    }
  `
}));

const ParameterMappingPanel: React.FC<ParameterMappingPanelProps> = memo(({
  mappings,
  availableNodes,
  onChange,
  disabled = false
}) => {
  const { styles } = useStyles();
  const { t } = useTranslation('workflow');
  const [editingMapping, setEditingMapping] = useState<ParameterMapping | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 添加新的参数映射
  const handleAddMapping = () => {
    const newMapping: ParameterMapping = {
      parameterName: `param${mappings.length + 1}`,
      sourceNodeId: availableNodes[0]?.id || '',
      required: true,
      defaultValue: ''
    };
    setEditingMapping(newMapping);
    setModalVisible(true);
    form.setFieldsValue(newMapping);
  };

  // 编辑参数映射
  const handleEditMapping = (mapping: ParameterMapping) => {
    setEditingMapping(mapping);
    setModalVisible(true);
    form.setFieldsValue(mapping);
  };

  // 删除参数映射
  const handleDeleteMapping = (index: number) => {
    const newMappings = mappings.filter((_, i) => i !== index);
    onChange(newMappings);
  };

  // 保存参数映射
  const handleSaveMapping = async () => {
    try {
      const values = await form.validateFields();
      const newMapping: ParameterMapping = {
        parameterName: values.parameterName,
        sourceNodeId: values.sourceNodeId,
        required: values.required || false,
        defaultValue: values.defaultValue || ''
      };

      let newMappings;
      if (editingMapping && mappings.find(m => m.parameterName === editingMapping.parameterName)) {
        // 编辑现有映射
        newMappings = mappings.map(m =>
          m.parameterName === editingMapping.parameterName ? newMapping : m
        );
      } else {
        // 添加新映射
        newMappings = [...mappings, newMapping];
      }

      onChange(newMappings);
      setModalVisible(false);
      setEditingMapping(null);
      form.resetFields();
    } catch (error) {
      console.error('保存参数映射失败:', error);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    setModalVisible(false);
    setEditingMapping(null);
    form.resetFields();
  };

  // 获取节点显示名称
  const getNodeDisplayName = (nodeId: string) => {
    const node = availableNodes.find(n => n.id === nodeId);
    return node ? `${node.label} (${node.type})` : nodeId;
  };

  // 表格列定义
  const columns = [
    {
      title: '参数名称',
      dataIndex: 'parameterName',
      key: 'parameterName',
      width: 150,
      render: (text: string, record: ParameterMapping) => (
        <Space>
          <Text strong>{text}</Text>
          {record.required && (
            <Text type="danger" style={{ fontSize: '12px' }}>*</Text>
          )}
        </Space>
      )
    },
    {
      title: '源节点',
      dataIndex: 'sourceNodeId',
      key: 'sourceNodeId',
      render: (nodeId: string) => (
        <Space>
          <LinkOutlined style={{ color: '#1890ff' }} />
          <Text>{getNodeDisplayName(nodeId)}</Text>
        </Space>
      )
    },
    {
      title: '必需',
      dataIndex: 'required',
      key: 'required',
      width: 80,
      render: (required: boolean) => (
        <Switch checked={required} disabled size="small" />
      )
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      width: 120,
      render: (value: string, record: ParameterMapping) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {record.required ? '-' : (value || '(空)')}
        </Text>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_: any, record: ParameterMapping, index: number) => (
        <Space className={styles.actionButtons}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditMapping(record)}
            disabled={disabled}
          />
          <Popconfirm
            title="确认删除此参数映射？"
            onConfirm={() => handleDeleteMapping(index)}
            disabled={disabled}
          >
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              danger
              disabled={disabled}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Card
      title={
        <Space>
          <LinkOutlined />
          参数映射配置
        </Space>
      }
      size="small"
      className={styles.mappingPanel}
    >
      {/* 说明信息 */}
      <Alert
        message="参数映射模式"
        description="在此模式下，您可以明确指定每个参数使用哪个节点的输出。这样可以精确控制多输入的处理逻辑。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* 添加按钮 */}
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={handleAddMapping}
        disabled={disabled || availableNodes.length === 0}
        className={styles.addButton}
      >
        添加参数映射
      </Button>

      {/* 参数映射表格 */}
      {mappings.length > 0 ? (
        <Table
          dataSource={mappings}
          columns={columns}
          rowKey="parameterName"
          size="small"
          pagination={false}
          rowClassName={styles.parameterRow}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          <Text type="secondary">暂无参数映射配置</Text>
        </div>
      )}

      {/* 可用节点不足提示 */}
      {availableNodes.length === 0 && (
        <Alert
          message="无可用节点"
          description="当前没有可用的上游节点。请先连接其他节点到此输出节点。"
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginTop: 16 }}
        />
      )}

      {/* 编辑弹窗 */}
      <Modal
        title={editingMapping?.parameterName ? '编辑参数映射' : '添加参数映射'}
        open={modalVisible}
        onOk={handleSaveMapping}
        onCancel={handleCancel}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="参数名称"
            name="parameterName"
            rules={[
              { required: true, message: '请输入参数名称' },
              { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '参数名称只能包含字母、数字和下划线，且不能以数字开头' }
            ]}
          >
            <Input placeholder="例如: userInput, processedData" />
          </Form.Item>

          <Form.Item
            label="源节点"
            name="sourceNodeId"
            rules={[{ required: true, message: '请选择源节点' }]}
          >
            <Select placeholder="选择提供此参数值的节点">
              {availableNodes.map(node => (
                <Option key={node.id} value={node.id}>
                  {node.label} ({node.type})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="是否必需"
            name="required"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="默认值"
            name="defaultValue"
            help="当源节点无输出且参数非必需时使用的默认值"
          >
            <Input placeholder="留空表示使用空字符串" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
});

ParameterMappingPanel.displayName = 'ParameterMappingPanel';

export default ParameterMappingPanel;