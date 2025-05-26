import { ActionIcon } from '@lobehub/ui';
import { Download, Plus, Save, Upload } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useAgentStore } from '@/store/agent';

const WorkflowToolbar = memo(() => {
  const { t } = useTranslation('common');
  const { saveWorkflow, isWorkflowModified } = useAgentStore();

  return (
    <Flexbox gap={8} horizontal>
      <ActionIcon
        icon={Save}
        onClick={saveWorkflow}
        disabled={!isWorkflowModified}
        title={t('workflow.save')}
      />
      <ActionIcon
        icon={Upload}
        onClick={() => {}}
        title={t('workflow.import')}
      />
      <ActionIcon
        icon={Download}
        onClick={() => {}}
        title={t('workflow.export')}
      />
    </Flexbox>
  );
});

export default WorkflowToolbar;