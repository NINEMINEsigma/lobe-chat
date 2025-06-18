/**
 * 多输入数据收集器
 * 负责从多个源节点收集数据并提供合并策略
 */

import { Edge } from '@xyflow/react';

// 输入数据接口
export interface InputData {
  sourceNodeId: string;
  edgeId: string;
  value: string;
  timestamp: number;
  sourceHandle?: string;
}

// 收集结果接口
export interface CollectionResult {
  inputs: InputData[];
  success: boolean;
  error?: string;
}

// 多输入合并策略枚举
export enum InputMergeStrategy {
  CONCAT = 'concat',           // 字符串拼接
  ARRAY = 'array',            // 数组合并
  FIRST = 'first',            // 使用第一个输入
  LAST = 'last',              // 使用最后一个输入
  TEMPLATE = 'template'       // 模板替换
}

// 参数映射配置
export interface ParameterMapping {
  parameterName: string;       // 参数名称
  sourceNodeId: string;        // 源节点ID
  sourceHandle?: string;       // 源节点输出端口
  required: boolean;           // 是否必需
  defaultValue?: string;       // 默认值
}

// 多输入配置接口
export interface MultiInputConfig {
  strategy: InputMergeStrategy;
  separator?: string;          // 拼接分隔符
  template?: string;           // 模板字符串
  enabled: boolean;            // 是否启用多输入
  parameterMappings?: ParameterMapping[];  // 参数映射配置
  useParameterMapping?: boolean;           // 是否使用参数映射模式
}

/**
 * 从多个源节点收集输入数据
 */
export const collectMultipleInputs = async (
  nodeId: string,
  edges: Edge[],
  nodeOutputs: Map<string, any>
): Promise<CollectionResult> => {
  try {
    // 获取指向当前节点的所有边
    const inputEdges = edges.filter(edge => edge.target === nodeId);

    if (inputEdges.length === 0) {
      return {
        inputs: [],
        success: true,
        error: undefined
      };
    }

    const inputs: InputData[] = [];
    const timestamp = Date.now();

    // 收集每个输入连接的数据
    for (const edge of inputEdges) {
      const sourceOutput = nodeOutputs.get(edge.source);

      if (sourceOutput !== undefined) {
        inputs.push({
          sourceNodeId: edge.source,
          edgeId: edge.id,
          value: String(sourceOutput || ''),
          timestamp,
          sourceHandle: edge.sourceHandle || undefined
        });
      }
    }

    return {
      inputs,
      success: true,
      error: undefined
    };
  } catch (error) {
    console.error('[MultiInputCollector] 收集输入数据失败:', error);
    return {
      inputs: [],
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
};

/**
 * 根据策略合并输入数据
 */
export const mergeInputData = (
  inputs: InputData[],
  config: MultiInputConfig
): string => {
  if (!inputs || inputs.length === 0) {
    return '';
  }

  // 检查是否使用参数映射模式
  if (config.useParameterMapping && config.parameterMappings && config.parameterMappings.length > 0) {
    try {
      const parameters = processParameterMappings(inputs, config.parameterMappings);

      // 如果配置了模板，使用模板；否则生成默认格式
      const template = config.template || generateParameterTemplate(config.parameterMappings);
      return applyParameterMapping(template, parameters);
    } catch (error) {
      console.error('[MultiInputCollector] 参数映射处理失败:', error);
      // 回退到普通合并模式
    }
  }

  // 按时间戳排序，确保处理顺序一致
  const sortedInputs = [...inputs].sort((a, b) => a.timestamp - b.timestamp);

  switch (config.strategy) {
    case InputMergeStrategy.CONCAT:
      return sortedInputs
        .map(input => input.value)
        .join(config.separator || '\n');

    case InputMergeStrategy.ARRAY:
      try {
        const values = sortedInputs.map(input => input.value);
        return JSON.stringify(values, null, 2);
      } catch {
        // 如果JSON序列化失败，回退到字符串拼接
        return sortedInputs
          .map(input => input.value)
          .join(config.separator || ', ');
      }

    case InputMergeStrategy.FIRST:
      return sortedInputs[0]?.value || '';

    case InputMergeStrategy.LAST:
      return sortedInputs[sortedInputs.length - 1]?.value || '';

    case InputMergeStrategy.TEMPLATE:
      return applyTemplate(config.template || '', sortedInputs);

    default:
      console.warn(`[MultiInputCollector] 未知的合并策略: ${config.strategy}`);
      return sortedInputs
        .map(input => input.value)
        .join(config.separator || '\n');
  }
};

/**
 * 应用模板替换
 */
const applyTemplate = (template: string, inputs: InputData[]): string => {
  if (!template) {
    return inputs.map(input => input.value).join('\n');
  }

  let result = template;

  // 替换索引占位符 {{0}}, {{1}}, {{2}}...
  inputs.forEach((input, index) => {
    const placeholder = `{{${index}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), input.value);
  });

  // 替换源节点ID占位符 {{sourceNodeId}}
  inputs.forEach((input, index) => {
    const placeholder = `{{${index}.sourceNodeId}}`;
    result = result.replace(new RegExp(placeholder, 'g'), input.sourceNodeId);
  });

  // 替换通用占位符
  result = result.replace(/\{\{all\}\}/g, inputs.map(input => input.value).join('\n'));
  result = result.replace(/\{\{count\}\}/g, String(inputs.length));

  return result;
};

/**
 * 验证多输入配置的有效性
 */
export const validateMultiInputConfig = (config: MultiInputConfig): boolean => {
  if (!config) return false;

  // 检查策略是否有效
  if (!Object.values(InputMergeStrategy).includes(config.strategy)) {
    return false;
  }

  // 如果使用模板策略，检查模板是否存在
  if (config.strategy === InputMergeStrategy.TEMPLATE && !config.template) {
    return false;
  }

  return true;
};

/**
 * 基于参数映射处理输入数据
 */
export const processParameterMappings = (
  inputs: InputData[],
  mappings: ParameterMapping[]
): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const mapping of mappings) {
    const matchingInput = inputs.find(input => input.sourceNodeId === mapping.sourceNodeId);

    if (matchingInput) {
      result[mapping.parameterName] = matchingInput.value;
    } else if (mapping.required) {
      throw new Error(`必需参数 "${mapping.parameterName}" 的源节点 "${mapping.sourceNodeId}" 未找到输出数据`);
    } else {
      result[mapping.parameterName] = mapping.defaultValue || '';
    }
  }

  return result;
};

/**
 * 根据参数映射生成模板字符串
 */
export const generateParameterTemplate = (parameterMappings: ParameterMapping[]): string => {
  if (!parameterMappings || parameterMappings.length === 0) {
    return '{{all}}';
  }

  return parameterMappings
    .map(mapping => `${mapping.parameterName}: {{${mapping.parameterName}}}`)
    .join('\n');
};

/**
 * 应用参数映射到模板
 */
const applyParameterMapping = (template: string, parameters: Record<string, string>): string => {
  let result = template;

  // 替换参数占位符
  Object.entries(parameters).forEach(([paramName, value]) => {
    const placeholder = new RegExp(`\\{\\{${paramName}\\}\\}`, 'g');
    result = result.replace(placeholder, value);
  });

  return result;
};

/**
 * 获取默认多输入配置
 */
export const getDefaultMultiInputConfig = (): MultiInputConfig => ({
  strategy: InputMergeStrategy.CONCAT,
  separator: '\n',
  template: '',
  enabled: false,
  parameterMappings: [],
  useParameterMapping: false
});