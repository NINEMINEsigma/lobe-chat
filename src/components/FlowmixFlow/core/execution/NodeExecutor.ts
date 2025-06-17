/**
 * 节点执行引擎
 * 负责处理工作流中各个节点的执行逻辑
 */

import { chatService } from '@/services/chat';
import { useSessionStore } from '@/store/session';
import { useAgentStore } from '@/store/agent';
import { ChatMessage } from '@/types/message';

// 节点数据类型定义
export interface InputNodeData {
  nodeType: 'input';
  outputValue: string;
  placeholder?: string;
}

export interface LLMNodeData {
  nodeType: 'llm';
  inputValue: string;
  outputValue: string;
  modelConfig?: {
    temperature?: number;
    maxTokens?: number;
    // 🚀 FUTURE: 扩展模型配置选项
    // systemPrompt?: string;
    // topP?: number;
    // frequencyPenalty?: number;
    // presencePenalty?: number;
  };
}

export interface OutputNodeData {
  nodeType: 'output';
  inputValue: string;
  // 🚀 FUTURE: 输出格式化配置
  // displayConfig?: {
  //   format?: 'text' | 'markdown' | 'json' | 'code';
  //   syntax?: string;
  //   template?: string;
  // };
}

export type NodeData = InputNodeData | LLMNodeData | OutputNodeData;

// 执行上下文接口
export interface ExecutionContext {
  sessionId: string;
  currentUserId: string;
  userInput: string;
  nodeOutputs: Map<string, any>;
  error?: Error;
}

// 节点执行器类
export class NodeExecutor {
  private context: ExecutionContext;

  constructor(context: ExecutionContext) {
    this.context = context;
  }

  /**
   * 执行输入节点
   * 功能: 获取用户输入文本作为工作流起始点
   */
  async executeInputNode(nodeId: string, nodeData: InputNodeData): Promise<string> {
    try {
      console.log(`[NodeExecutor] 执行输入节点 ${nodeId}`);

      // 输入节点直接返回用户输入的文本
      const output = this.context.userInput || '';

      // 更新节点数据
      nodeData.outputValue = output;

      // 存储节点输出
      this.context.nodeOutputs.set(nodeId, output);

      console.log(`[NodeExecutor] 输入节点 ${nodeId} 执行完成，输出:`, output);
      return output;
    } catch (error) {
      console.error(`[NodeExecutor] 输入节点 ${nodeId} 执行失败:`, error);
      this.context.error = error as Error;
      throw error;
    }
  }

  /**
   * 执行大模型节点
   * 功能: 调用当前会话的AI模型处理输入文本
   */
  async executeLLMNode(nodeId: string, nodeData: LLMNodeData): Promise<string> {
    try {
      console.log(`[NodeExecutor] 执行大模型节点 ${nodeId}`);

      const inputText = nodeData.inputValue;
      if (!inputText) {
        throw new Error('大模型节点输入为空');
      }

            // 获取当前会话和代理配置
      const agentStore = useAgentStore.getState();
      const currentConfig = agentStore.activeId ? agentStore.agentMap[agentStore.activeId] : null;

      if (!currentConfig) {
        throw new Error('当前会话未配置模型');
      }

      // 构造消息对象
      const message: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: inputText,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        meta: {}
      };

      // 调用chatService创建AI响应
      const response = await chatService.createAssistantMessage({
        messages: [message],
        model: currentConfig.chatConfig?.model || 'gpt-3.5-turbo',
        provider: currentConfig.meta?.model?.provider || 'openai',
        // 应用节点配置的模型参数
        temperature: nodeData.modelConfig?.temperature,
        max_tokens: nodeData.modelConfig?.maxTokens,
      });

      let output = '';

      // 处理流式响应或直接响应
      if (response && typeof response === 'object' && 'getReader' in response) {
        // 流式响应处理
        const reader = response.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.choices?.[0]?.delta?.content) {
                  output += parsed.choices[0].delta.content;
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } else if (typeof response === 'string') {
        output = response;
      }

      // 更新节点数据
      nodeData.outputValue = output;

      // 存储节点输出
      this.context.nodeOutputs.set(nodeId, output);

      console.log(`[NodeExecutor] 大模型节点 ${nodeId} 执行完成，输出:`, output);
      return output;
    } catch (error) {
      console.error(`[NodeExecutor] 大模型节点 ${nodeId} 执行失败:`, error);
      this.context.error = error as Error;
      throw error;
    }
  }

  /**
   * 执行输出节点
   * 功能: 接收输入并作为工作流最终输出
   */
  async executeOutputNode(nodeId: string, nodeData: OutputNodeData): Promise<string> {
    try {
      console.log(`[NodeExecutor] 执行输出节点 ${nodeId}`);

      const inputText = nodeData.inputValue;
      if (!inputText) {
        throw new Error('输出节点输入为空');
      }

      // 输出节点将输入直接作为最终结果
      // 🚀 FUTURE: 在这里可以添加格式化处理逻辑
      const output = inputText;

      // 存储节点输出
      this.context.nodeOutputs.set(nodeId, output);

      console.log(`[NodeExecutor] 输出节点 ${nodeId} 执行完成，最终输出:`, output);
      return output;
    } catch (error) {
      console.error(`[NodeExecutor] 输出节点 ${nodeId} 执行失败:`, error);
      this.context.error = error as Error;
      throw error;
    }
  }

  /**
   * 执行单个节点的统一入口
   */
  async executeNode(nodeId: string, nodeType: string, nodeData: NodeData): Promise<string> {
    switch (nodeType) {
      case 'input':
        return this.executeInputNode(nodeId, nodeData as InputNodeData);
      case 'llm':
        return this.executeLLMNode(nodeId, nodeData as LLMNodeData);
      case 'output':
        return this.executeOutputNode(nodeId, nodeData as OutputNodeData);
      default:
        throw new Error(`不支持的节点类型: ${nodeType}`);
    }
  }

  /**
   * 获取执行上下文
   */
  getContext(): ExecutionContext {
    return this.context;
  }

  /**
   * 更新执行上下文
   */
  updateContext(updates: Partial<ExecutionContext>): void {
    this.context = { ...this.context, ...updates };
  }
}

// 🚀 FUTURE: 多模态输入支持接口
// export interface MultiModalInputConfig {
//   supportedTypes: ('text' | 'image' | 'audio')[];
//   maxFileSize?: number;
// }

// 🚀 FUTURE: 高级模型配置接口
// export interface AdvancedModelConfig {
//   systemPrompt?: string;
//   temperature?: number;
//   topP?: number;
//   frequencyPenalty?: number;
//   presencePenalty?: number;
// }

// 🚀 FUTURE: 输出格式化配置接口
// export interface OutputFormatConfig {
//   format: 'text' | 'markdown' | 'json' | 'code';
//   syntax?: string;
//   template?: string;
// }

export default NodeExecutor;