import { Edge, Node } from '@xyflow/react';
import {
  NodeParameterSchema,
  ParameterConnectionPoint,
  VisualParameterBinding,
  ParameterMapping
} from '@/utils/workflow/multiInputCollector';

/**
 * 参数发现服务
 * 复用现有的工作流处理逻辑，提供智能参数发现和绑定推荐功能
 */
export class ParameterDiscoveryService {
  private nodeParameterCache = new Map<string, NodeParameterSchema[]>();
  private inputParameterCache = new Map<string, NodeParameterSchema[]>();
  private outputParameterCache = new Map<string, NodeParameterSchema[]>();
  private compatibilityCache = new Map<string, boolean>();

  /**
   * 发现节点的输入参数
   * 基于节点类型返回正确的数据流输入参数
   */
  async discoverInputParameters(node: Node): Promise<NodeParameterSchema[]> {
    const nodeType = node.data?.nodeType || node.type || 'unknown';
    const cacheKey = `input-${node.id}-${nodeType}`;

    if (this.inputParameterCache.has(cacheKey)) {
      return this.inputParameterCache.get(cacheKey)!;
    }

    const parameters: NodeParameterSchema[] = [];

    try {
      switch (nodeType) {
        case 'input':
          // 输入节点无输入参数，直接处理用户输入
          break;

        case 'agent':
          // AI代理节点输入参数
          parameters.push({
            name: 'text',
            type: 'string',
            required: true,
            description: '输入给AI代理的文本内容'
          });
          break;

        case 'output':
          // 输出节点输入参数
          parameters.push({
            name: 'content',
            type: 'string',
            required: true,
            description: '要输出的内容'
          });
          break;

        default:
          // 通用节点输入参数发现
          if (node.data) {
            Object.keys(node.data).forEach(key => {
              if (key.includes('input') || key.includes('Input')) {
                parameters.push({
                  name: key,
                  type: typeof node.data[key],
                  required: false,
                  defaultValue: node.data[key],
                  description: `节点${key}输入参数`
                });
              }
            });
          }
      }

      this.inputParameterCache.set(cacheKey, parameters);
      return parameters;

    } catch (error) {
      console.error('[ParameterDiscoveryService] 输入参数发现失败:', error);
      return [];
    }
  }

  /**
   * 发现节点的输出参数
   * 基于节点类型返回正确的数据流输出参数
   */
  async discoverOutputParameters(node: Node): Promise<NodeParameterSchema[]> {
    const nodeType = node.data?.nodeType || node.type || 'unknown';
    const cacheKey = `output-${node.id}-${nodeType}`;

    if (this.outputParameterCache.has(cacheKey)) {
      return this.outputParameterCache.get(cacheKey)!;
    }

    const parameters: NodeParameterSchema[] = [];

    try {
      switch (nodeType) {
        case 'input':
          // 输入节点输出参数
          parameters.push({
            name: 'userInput',
            type: 'string',
            required: true,
            description: '用户输入的文本内容'
          });
          break;

        case 'agent':
          // AI代理节点输出参数
          parameters.push({
            name: 'response',
            type: 'string',
            required: true,
            description: 'AI代理生成的回复内容'
          });
          break;

        case 'output':
          // 输出节点无输出参数，作为终端节点
          break;

        default:
          // 通用节点输出参数发现
          if (node.data) {
            Object.keys(node.data).forEach(key => {
              if (key.includes('output') || key.includes('Output')) {
                parameters.push({
                  name: key,
                  type: typeof node.data[key],
                  required: false,
                  defaultValue: node.data[key],
                  description: `节点${key}输出参数`
                });
              }
            });
          }
      }

      this.outputParameterCache.set(cacheKey, parameters);
      return parameters;

    } catch (error) {
      console.error('[ParameterDiscoveryService] 输出参数发现失败:', error);
      return [];
    }
  }

  /**
   * 发现节点的所有可用参数 (向后兼容)
   * @deprecated 请使用 discoverInputParameters 或 discoverOutputParameters
   */
  async discoverNodeParameters(node: Node): Promise<NodeParameterSchema[]> {
    // 正确获取节点类型 - 使用 data.nodeType 而不是 type
    const nodeType = node.data?.nodeType || node.type || 'unknown';
    const cacheKey = `${node.id}-${nodeType}`;

    // 检查缓存，提高性能
    if (this.nodeParameterCache.has(cacheKey)) {
      return this.nodeParameterCache.get(cacheKey)!;
    }

    const parameters: NodeParameterSchema[] = [];

    try {
      // 根据节点类型发现参数
      switch (nodeType) {
        case 'agent':
          // Agent节点参数
          parameters.push(
            { name: 'prompt', type: 'string', required: true, description: '智能体提示词' },
            { name: 'model', type: 'string', required: false, description: '使用的模型', enumValues: ['gpt-4', 'gpt-3.5-turbo', 'claude-3'] },
            { name: 'temperature', type: 'number', required: false, defaultValue: 0.7, description: '生成温度' },
            { name: 'maxTokens', type: 'number', required: false, defaultValue: 1000, description: '最大令牌数' },
            { name: 'systemMessage', type: 'string', required: false, description: '系统消息' }
          );
          break;

        case 'input':
          // 输入节点参数
          parameters.push(
            { name: 'placeholder', type: 'string', required: false, description: '输入占位符' },
            { name: 'defaultValue', type: 'string', required: false, description: '默认值' },
            { name: 'validation', type: 'object', required: false, description: '验证规则' }
          );
          break;

        case 'output':
          // 输出节点参数
          parameters.push(
            { name: 'format', type: 'string', required: false, description: '输出格式', enumValues: ['text', 'markdown', 'json'] },
            { name: 'template', type: 'string', required: false, description: '输出模板' }
          );
          break;

        case 'knowledgeBase':
          parameters.push(
            { name: 'query', type: 'string', required: true, description: '查询内容' },
            { name: 'topK', type: 'number', required: false, defaultValue: 5, description: '返回结果数量' },
            { name: 'similarity', type: 'number', required: false, defaultValue: 0.8, description: '相似度阈值' }
          );
          break;

        case 'httpRequest':
          parameters.push(
            { name: 'url', type: 'string', required: true, description: '请求URL' },
            { name: 'method', type: 'string', required: false, defaultValue: 'GET', description: '请求方法', enumValues: ['GET', 'POST', 'PUT', 'DELETE'] },
            { name: 'headers', type: 'object', required: false, description: '请求头' },
            { name: 'body', type: 'string', required: false, description: '请求体' }
          );
          break;

        default:
          // 通用节点参数发现
          if (node.data) {
            Object.keys(node.data).forEach(key => {
              if (key !== 'id' && key !== 'type') {
                parameters.push({
                  name: key,
                  type: typeof node.data[key],
                  required: false,
                  defaultValue: node.data[key],
                  description: `节点${key}参数`
                });
              }
            });
          }
      }

      // 缓存结果
      this.nodeParameterCache.set(cacheKey, parameters);
      return parameters;

    } catch (error) {
      console.error('[ParameterDiscoveryService] 参数发现失败:', error);
      return [];
    }
  }

  /**
   * 检查两个参数的兼容性
   * 复用现有的类型检查逻辑
   */
  validateParameterCompatibility(
    sourceParam: NodeParameterSchema,
    targetParam: NodeParameterSchema
  ): boolean {
    const cacheKey = `${sourceParam.type}-${targetParam.type}`;

    if (this.compatibilityCache.has(cacheKey)) {
      return this.compatibilityCache.get(cacheKey)!;
    }

    let isCompatible = false;

    // 类型兼容性检查
    if (sourceParam.type === targetParam.type) {
      isCompatible = true;
    } else if (sourceParam.type === 'string' && targetParam.type !== 'object') {
      // 字符串可以转换为大多数类型
      isCompatible = true;
    } else if (sourceParam.type === 'number' && targetParam.type === 'string') {
      // 数字可以转换为字符串
      isCompatible = true;
    } else if (sourceParam.type === 'boolean' && targetParam.type === 'string') {
      // 布尔值可以转换为字符串
      isCompatible = true;
    }

    // 枚举值兼容性检查
    if (targetParam.enumValues && sourceParam.enumValues) {
      const hasCommonValues = targetParam.enumValues.some(val =>
        sourceParam.enumValues!.includes(val)
      );
      isCompatible = isCompatible && hasCommonValues;
    }

    this.compatibilityCache.set(cacheKey, isCompatible);
    return isCompatible;
  }

  /**
   * 生成参数绑定推荐
   * 基于类型兼容性和语义相似性推荐最佳绑定方案
   */
  async generateBindingRecommendations(
    sourceNode: Node,
    targetNode: Node
  ): Promise<VisualParameterBinding[]> {
    const sourceParams = await this.discoverNodeParameters(sourceNode);
    const targetParams = await this.discoverNodeParameters(targetNode);

    const recommendations: VisualParameterBinding[] = [];

    for (const targetParam of targetParams) {
      if (!targetParam.required) continue; // 只推荐必需参数的绑定

      for (const sourceParam of sourceParams) {
        const isCompatible = this.validateParameterCompatibility(sourceParam, targetParam);

        if (isCompatible) {
          const confidence = this.calculateBindingConfidence(sourceParam, targetParam);

          recommendations.push({
            sourceConnectionPoint: {
              nodeId: sourceNode.id,
              parameterName: sourceParam.name,
              parameterType: sourceParam.type,
              isInput: false
            },
            targetConnectionPoint: {
              nodeId: targetNode.id,
              parameterName: targetParam.name,
              parameterType: targetParam.type,
              isInput: true
            },
            bindingType: sourceParam.type === targetParam.type ? 'direct' : 'transformed',
            transformExpression: sourceParam.type !== targetParam.type ?
              this.generateTransformExpression(sourceParam.type, targetParam.type) : undefined,
            isCompatible: true,
            confidence
          });
        }
      }
    }

    // 按置信度排序，返回最佳推荐
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 计算绑定置信度
   * 基于参数名称相似性和类型匹配度
   */
  private calculateBindingConfidence(
    sourceParam: NodeParameterSchema,
    targetParam: NodeParameterSchema
  ): number {
    let confidence = 0.5; // 基础置信度

    // 类型完全匹配
    if (sourceParam.type === targetParam.type) {
      confidence += 0.3;
    }

    // 参数名称相似性
    const nameSimilarity = this.calculateNameSimilarity(sourceParam.name, targetParam.name);
    confidence += nameSimilarity * 0.2;

    // 语义相似性（简单的关键词匹配）
    const semanticSimilarity = this.calculateSemanticSimilarity(
      sourceParam.description || sourceParam.name,
      targetParam.description || targetParam.name
    );
    confidence += semanticSimilarity * 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * 计算参数名称相似性
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    const lowerName1 = name1.toLowerCase();
    const lowerName2 = name2.toLowerCase();

    if (lowerName1 === lowerName2) return 1.0;
    if (lowerName1.includes(lowerName2) || lowerName2.includes(lowerName1)) return 0.8;

    // 简单的编辑距离计算
    const maxLength = Math.max(name1.length, name2.length);
    const distance = this.levenshteinDistance(lowerName1, lowerName2);
    return Math.max(0, 1 - distance / maxLength);
  }

  /**
   * 计算语义相似性（简化版本）
   */
  private calculateSemanticSimilarity(desc1: string, desc2: string): number {
    const keywords1 = desc1.toLowerCase().split(/\s+/);
    const keywords2 = desc2.toLowerCase().split(/\s+/);

    const commonKeywords = keywords1.filter(word => keywords2.includes(word));
    const totalKeywords = new Set([...keywords1, ...keywords2]).size;

    return totalKeywords > 0 ? commonKeywords.length / totalKeywords : 0;
  }

  /**
   * 生成类型转换表达式
   */
  private generateTransformExpression(sourceType: string, targetType: string): string {
    if (sourceType === 'string' && targetType === 'number') {
      return 'Number({{value}})';
    }
    if (sourceType === 'number' && targetType === 'string') {
      return 'String({{value}})';
    }
    if (sourceType === 'boolean' && targetType === 'string') {
      return '{{value}} ? "true" : "false"';
    }
    if (sourceType === 'string' && targetType === 'boolean') {
      return '{{value}} === "true" || {{value}} === "1"';
    }
    return '{{value}}'; // 默认直接传递
  }

  /**
   * 计算编辑距离（Levenshtein距离）
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.nodeParameterCache.clear();
    this.compatibilityCache.clear();
  }
}

// 单例模式，避免重复创建实例
export const parameterDiscoveryService = new ParameterDiscoveryService();