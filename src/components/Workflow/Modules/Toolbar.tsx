import { ActionIcon, Icon } from '@lobehub/ui';
import { Download, Plus, Save, Upload } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const WorkflowToolbar = memo(() => {
  const { t } = useTranslation('common');

  return (
    <Flexbox gap={20} style={{ minHeight: '100%' }}>
        <Flexbox gap={8} horizontal>
          {/* <ActionIcon 
            icon={Plus} 
            onClick={() => {}} 
            title={t('workflow.addNode')} 
          /> */}
          <ActionIcon 
            icon={Save} 
            onClick={() => {}} 
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
    </Flexbox>
  );
});

export default WorkflowToolbar; 