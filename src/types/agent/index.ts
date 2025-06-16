import { FileItem } from '@/types/files';
import { KnowledgeBaseItem } from '@/types/knowledgeBase';
import { FewShots, LLMParams } from '@/types/llm';
import { LobeAgentWorkflow } from './workflow';
import { LobeFlowData } from './flowmix';

import { LobeAgentChatConfig } from './chatConfig';

export type TTSServer = 'openai' | 'edge' | 'microsoft';

export interface LobeAgentTTSConfig {
  showAllLocaleVoice?: boolean;
  sttLocale: 'auto' | string;
  ttsService: TTSServer;
  voice: {
    edge?: string;
    microsoft?: string;
    openai: string;
  };
}

export interface LobeAgentConfig {
  chatConfig: LobeAgentChatConfig;
  fewShots?: FewShots;
  files?: FileItem[];
  id?: string;
  /**
   * knowledge bases
   */
  knowledgeBases?: KnowledgeBaseItem[];
  /**
   * 角色所使用的语言模型
   * @default gpt-4o-mini
   */
  model: string;

  /**
   * 开场白
   */
  openingMessage?: string;
  /**
   * 开场问题
   */
  openingQuestions?: string[];

  /**
   * 语言模型参数
   */
  params: LLMParams;
  /**
   * 启用的插件
   */
  plugins?: string[];

  /**
   *  模型供应商
   */
  provider?: string;

  /**
   * 系统角色
   */
  systemRole: string;

  /**
   * 语音服务
   */
  tts: LobeAgentTTSConfig;

  /**
   * 工作流配置 - 支持新旧两种格式
   */
  workflow?: {
    /**
     * 工作流定义 - 新格式(FlowmixFlow)
     */
    definition?: LobeFlowData;
    /**
     * 工作流定义 - 旧格式(保持兼容)
     * @deprecated 请使用新的FlowmixFlow格式
     */
    legacyDefinition?: LobeAgentWorkflow;
    /**
     * 工作流状态
     */
    status?: 'active' | 'inactive';
    /**
     * 工作流元数据
     */
    meta?: {
      name?: string;
      description?: string;
      tags?: string[];
      createdAt?: string;
      updatedAt?: string;
      version?: string;
      isLegacyFormat?: boolean; // 标识是否为旧格式
    };
  };
}

export type LobeAgentConfigKeys =
  | keyof LobeAgentConfig
  | ['params', keyof LobeAgentConfig['params']];

export * from './chatConfig';
