import { Avatar, Button, Form, type FormItemProps, Tooltip } from '@lobehub/ui';
import { Upload } from 'antd';
import { Wand2 } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { imageToBase64 } from '@/utils/imageToBase64';
import { createUploadImageHandler } from '@/utils/uploadFIle';
import { useStore } from '../store';

interface AutoGenerateAvatarProps {
  background?: string;
  canAutoGenerate?: boolean;
  loading?: boolean;
  onGenerate?: () => void;
}

const AutoGenerateAvatar = memo<AutoGenerateAvatarProps>(
  ({ background, canAutoGenerate, loading, onGenerate }) => {
    const { t } = useTranslation(['setting', 'common']);
    const setAgentMeta = useStore((s) => s.setAgentMeta);
    const meta = useStore((s) => s.meta);
    const [avatarUrl, setAvatarUrl] = useState<string>(meta?.avatar || '');

    const handleUploadAvatar = createUploadImageHandler(async (avatar) => {
      try {
        // 准备图像
        const img = new Image();
        img.src = avatar;

        // 使用 Promise 等待图片加载
        await new Promise((resolve, reject) => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', reject);
        });

        // 压缩图像并转换为 base64
        const webpBase64 = imageToBase64({ img, size: 256 });

        // 更新本地状态以立即显示
        setAvatarUrl(webpBase64);

        // 更新 store 中的头像
        await setAgentMeta({ avatar: webpBase64 });
      } catch (error) {
        console.error('Failed to upload avatar:', error);
      }
    });

    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <Form.Item noStyle>
          <Avatar
            avatar={avatarUrl}
            background={background}
            size={64}
            style={{ overflow: 'hidden' }}
          />
        </Form.Item>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Upload beforeUpload={handleUploadAvatar} maxCount={1}>
            <Button size="small">{t('common:upload')}</Button>
          </Upload>
          <Tooltip
            title={
              !canAutoGenerate
                ? t('common:autoGenerateTooltipDisabled')
                : t('common:autoGenerateTooltip')
            }
          >
            <Button
              disabled={!canAutoGenerate}
              icon={Wand2}
              loading={loading}
              onClick={onGenerate}
              size="small"
            >
              {t('common:autoGenerate')}
            </Button>
          </Tooltip>
        </div>
      </div>
    );
  },
);

export default AutoGenerateAvatar;
