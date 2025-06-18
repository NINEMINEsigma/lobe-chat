import { DraggablePanel } from '@lobehub/ui';
import { Card, List, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { Bot, BrainCircuit, FileJson, FunctionSquare, MessageSquare, Settings } from 'lucide-react';
import { memo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const { Text } = Typography;

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  card: css`
    width: 100%;
    cursor: grab;
    background: ${token.colorBgElevated};
    border: 1px solid ${token.colorBorderSecondary};

    &:hover {
      border-color: ${token.colorPrimary};
    }
  `,
  container: css`
    height: 100%;
    margin: 0;
    background: ${token.colorBgContainer};
  `,
  listItem: css`
    padding: 8px 12px;
  `,
}));

interface Node {
  icon: ReactNode;
  title: string;
  description: string;
  type: string;
}

const WorkflowNodes = memo(() => {
  const { t } = useTranslation('common');
  const { styles } = useStyles();

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodes: Node[] = [
    {
      icon: <Bot size={20} />,
      title: t('workflow.nodes.agent'),
      description: t('workflow.nodes.agentDesc'),
      type: 'agent',
    },
    {
      icon: <MessageSquare size={20} />,
      title: t('workflow.nodes.chat'),
      description: t('workflow.nodes.chatDesc'),
      type: 'chat',
    },
    {
      icon: <FunctionSquare size={20} />,
      title: t('workflow.nodes.function'),
      description: t('workflow.nodes.functionDesc'),
      type: 'function',
    },
    {
      icon: <FileJson size={20} />,
      title: t('workflow.nodes.input'),
      description: t('workflow.nodes.inputDesc'),
      type: 'input',
    },
    {
      icon: <BrainCircuit size={20} />,
      title: t('workflow.nodes.llm'),
      description: t('workflow.nodes.llmDesc'),
      type: 'llm',
    },
    {
      icon: <Settings size={20} />,
      title: t('workflow.nodes.settings'),
      description: t('workflow.nodes.settingsDesc'),
      type: 'settings',
    },
  ];

  return (
    <DraggablePanel
      placement={'left'}
      minWidth={280}
      size={{ width: 280 }}
      className={styles.container}
    >
      <Flexbox gap={8} padding={8}>
        <List
          dataSource={nodes}
          renderItem={(item) => (
            <List.Item
              className={styles.listItem}
              draggable
              onDragStart={(event) => onDragStart(event, item.type)}
            >
              <Card
                size="small"
                className={styles.card}
                styles={{ body: { padding: '8px 12px' } }}
              >
                <Flexbox horizontal gap={8} align="center">
                  {item.icon}
                  <Flexbox>
                    <Text strong>{item.title}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.description}</Text>
                  </Flexbox>
                </Flexbox>
              </Card>
            </List.Item>
          )}
          style={{ width: '100%' }}
        />
      </Flexbox>
    </DraggablePanel>
  );
});

export default WorkflowNodes;