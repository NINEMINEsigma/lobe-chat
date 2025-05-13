import { DraggablePanel } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const WorkflowConfig = memo(() => {
  return (
    <DraggablePanel placement={'right'} style={{ flex: 1, minHeight: 400 }}>
      <Flexbox gap={16}>
        {/* 这里将来添加工作流配置面板 */}
      </Flexbox>
    </DraggablePanel>
  );
});

export default WorkflowConfig; 