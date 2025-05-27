import { Card, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  card: css`
    width: 200px;
    background: ${isDarkMode ? '#2a2a2a' : token.colorBgElevated};
    border: 1px solid ${isDarkMode ? '#404040' : token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;

    &:hover {
      border-color: ${isDarkMode ? '#1890ff' : token.colorPrimary};
    }
  `,
  handle: css`
    width: 8px;
    height: 8px;
    background: ${token.colorPrimary};
    border: 2px solid ${isDarkMode ? '#404040' : token.colorBorderSecondary};
  `,
}));

interface CustomNodeProps {
  data: {
    labelKey: string;
    descriptionKey: string;
  };
}

const CustomNode = memo(({ data }: CustomNodeProps) => {
  const { styles } = useStyles();
  const { t } = useTranslation('common');

  return (
    <Card className={styles.card} bodyStyle={{ padding: '12px' }}>
      <Handle
        type="target"
        position={Position.Top}
        className={styles.handle}
      />
      <Flexbox gap={4}>
        <Text strong>{t(data.labelKey)}</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>{t(data.descriptionKey)}</Text>
      </Flexbox>
      <Handle
        type="source"
        position={Position.Bottom}
        className={styles.handle}
      />
    </Card>
  );
});

export default CustomNode;