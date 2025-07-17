import { NodeParameterSchema } from './multiInputCollector';

/**
 * 参数兼容性检查工具
 * 复用现有的类型检查逻辑，提供统一的兼容性验证功能
 */

// 参数类型权重映射（用于兼容性评分）
const TYPE_COMPATIBILITY_WEIGHTS = {
  exact: 1.0,        // 完全匹配
  convertible: 0.8,  // 可转换
  partial: 0.6,      // 部分兼容
  incompatible: 0.0  // 不兼容
};

// 类型转换映射表
const TYPE_CONVERSION_MAP: Record<string, Record<string, 'exact' | 'convertible' | 'partial' | 'incompatible'>> = {
  string: {
    string: 'exact',
    number: 'convertible',
    boolean: 'convertible',
    object: 'partial',
    array: 'partial'
  },
  number: {
    string: 'convertible',
    number: 'exact',
    boolean: 'partial',
    object: 'incompatible',
    array: 'incompatible'
  },
  boolean: {
    string: 'convertible',
    number: 'partial',
    boolean: 'exact',
    object: 'incompatible',
    array: 'incompatible'
  },
  object: {
    string: 'partial',
    number: 'incompatible',
    boolean: 'incompatible',
    object: 'exact',
    array: 'partial'
  },
  array: {
    string: 'partial',
    number: 'incompatible',
    boolean: 'incompatible',
    object: 'partial',
    array: 'exact'
  }
};

// 兼容性结果接口
export interface CompatibilityResult {
  isCompatible: boolean;
  compatibilityScore: number;
  compatibilityLevel: 'exact' | 'convertible' | 'partial' | 'incompatible';
  transformationRequired: boolean;
  transformationExpression?: string;
  warnings: string[];
  recommendations: string[];
}

/**
 * 检查两个参数的兼容性
 */
export function checkParameterCompatibility(
  sourceParam: NodeParameterSchema,
  targetParam: NodeParameterSchema
): CompatibilityResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // 获取基础类型兼容性
  const sourceType = normalizeType(sourceParam.type);
  const targetType = normalizeType(targetParam.type);

  const compatibilityLevel = getTypeCompatibility(sourceType, targetType);
  const compatibilityScore = TYPE_COMPATIBILITY_WEIGHTS[compatibilityLevel];
  const isCompatible = compatibilityScore > 0;

  // 检查必需性兼容性
  if (targetParam.required && !sourceParam.required && !sourceParam.defaultValue) {
    warnings.push('目标参数为必需，但源参数不是必需且无默认值');
    recommendations.push('考虑为源参数设置默认值或确保源参数总是有值');
  }

  // 检查枚举值兼容性
  if (targetParam.enumValues && sourceParam.enumValues) {
    const commonValues = targetParam.enumValues.filter(val =>
      sourceParam.enumValues!.includes(val)
    );
    if (commonValues.length === 0) {
      warnings.push('枚举值不匹配');
      recommendations.push('检查枚举值设置或考虑添加转换逻辑');
    } else if (commonValues.length < Math.min(sourceParam.enumValues.length, targetParam.enumValues.length)) {
      warnings.push('枚举值部分匹配');
    }
  }

  // 检查默认值兼容性
  if (sourceParam.defaultValue !== undefined && targetParam.defaultValue !== undefined) {
    if (sourceParam.defaultValue !== targetParam.defaultValue) {
      warnings.push('默认值不匹配');
    }
  }

  // 生成转换表达式
  const transformationRequired = compatibilityLevel !== 'exact';
  const transformationExpression = transformationRequired ?
    generateTransformationExpression(sourceType, targetType) : undefined;

  // 生成建议
  if (compatibilityLevel === 'convertible') {
    recommendations.push('需要类型转换，已自动生成转换表达式');
  } else if (compatibilityLevel === 'partial') {
    recommendations.push('部分兼容，建议验证数据结构或添加错误处理');
  } else if (compatibilityLevel === 'incompatible') {
    recommendations.push('类型不兼容，需要自定义转换逻辑或重新设计参数结构');
  }

  return {
    isCompatible,
    compatibilityScore,
    compatibilityLevel,
    transformationRequired,
    transformationExpression,
    warnings,
    recommendations
  };
}

/**
 * 批量检查参数兼容性
 */
export function batchCheckCompatibility(
  sourceParams: NodeParameterSchema[],
  targetParams: NodeParameterSchema[]
): Record<string, Record<string, CompatibilityResult>> {
  const results: Record<string, Record<string, CompatibilityResult>> = {};

  for (const sourceParam of sourceParams) {
    results[sourceParam.name] = {};

    for (const targetParam of targetParams) {
      results[sourceParam.name][targetParam.name] = checkParameterCompatibility(
        sourceParam,
        targetParam
      );
    }
  }

  return results;
}

/**
 * 检查输出参数到输入参数的数据流兼容性
 * 专门用于工作流节点间的参数绑定验证
 */
export function checkOutputToInputCompatibility(
  outputParam: NodeParameterSchema,
  inputParam: NodeParameterSchema
): CompatibilityResult & { dataFlow: 'output_to_input'; description: string } {
  const baseResult = checkParameterCompatibility(outputParam, inputParam);

  return {
    ...baseResult,
    dataFlow: 'output_to_input' as const,
    description: `${outputParam.type} → ${inputParam.type}${
      !baseResult.isCompatible ? ' (不兼容)' :
      baseResult.compatibilityScore < 1 ? ' (需转换)' :
      ' (兼容)'
    }`
  };
}

/**
 * 获取最佳参数匹配
 */
export function findBestParameterMatches(
  sourceParams: NodeParameterSchema[],
  targetParams: NodeParameterSchema[],
  minCompatibilityScore = 0.6
): Array<{
  sourceParam: NodeParameterSchema;
  targetParam: NodeParameterSchema;
  compatibility: CompatibilityResult;
}> {
  const matches: Array<{
    sourceParam: NodeParameterSchema;
    targetParam: NodeParameterSchema;
    compatibility: CompatibilityResult;
  }> = [];

  for (const targetParam of targetParams) {
    let bestMatch: {
      sourceParam: NodeParameterSchema;
      compatibility: CompatibilityResult;
    } | null = null;

    for (const sourceParam of sourceParams) {
      const compatibility = checkParameterCompatibility(sourceParam, targetParam);

      if (compatibility.compatibilityScore >= minCompatibilityScore) {
        if (!bestMatch || compatibility.compatibilityScore > bestMatch.compatibility.compatibilityScore) {
          bestMatch = {
            sourceParam,
            compatibility
          };
        }
      }
    }

    if (bestMatch) {
      matches.push({
        sourceParam: bestMatch.sourceParam,
        targetParam,
        compatibility: bestMatch.compatibility
      });
    }
  }

  return matches.sort((a, b) => b.compatibility.compatibilityScore - a.compatibility.compatibilityScore);
}

/**
 * 标准化参数类型
 */
function normalizeType(type: string): string {
  const lowerType = type.toLowerCase();

  // 处理常见的类型别名
  const typeMap: Record<string, string> = {
    'str': 'string',
    'int': 'number',
    'integer': 'number',
    'float': 'number',
    'double': 'number',
    'bool': 'boolean',
    'dict': 'object',
    'list': 'array',
    'arr': 'array'
  };

  return typeMap[lowerType] || lowerType;
}

/**
 * 获取类型兼容性等级
 */
function getTypeCompatibility(
  sourceType: string,
  targetType: string
): 'exact' | 'convertible' | 'partial' | 'incompatible' {
  if (!TYPE_CONVERSION_MAP[sourceType]) {
    return 'incompatible';
  }

  return TYPE_CONVERSION_MAP[sourceType][targetType] || 'incompatible';
}

/**
 * 生成类型转换表达式
 */
function generateTransformationExpression(sourceType: string, targetType: string): string {
  const key = `${sourceType}_to_${targetType}`;

  const transformations: Record<string, string> = {
    // 转换为字符串
    'number_to_string': 'String({{value}})',
    'boolean_to_string': '{{value}} ? "true" : "false"',
    'object_to_string': 'JSON.stringify({{value}})',
    'array_to_string': '{{value}}.join(", ")',

    // 转换为数字
    'string_to_number': 'Number({{value}})',
    'boolean_to_number': '{{value}} ? 1 : 0',

    // 转换为布尔值
    'string_to_boolean': '{{value}} === "true" || {{value}} === "1" || {{value}} === "yes"',
    'number_to_boolean': '{{value}} !== 0',

    // 转换为对象
    'string_to_object': 'JSON.parse({{value}})',
    'array_to_object': 'Object.fromEntries({{value}}.map((v, i) => [i, v]))',

    // 转换为数组
    'string_to_array': '{{value}}.split(",")',
    'object_to_array': 'Object.values({{value}})',
  };

  return transformations[key] || '{{value}}'; // 默认直接传递
}

/**
 * 验证转换表达式的安全性
 */
export function validateTransformationExpression(expression: string): {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
} {
  const errors: string[] = [];
  const suggestions: string[] = [];

  // 检查是否包含危险的操作
  const dangerousPatterns = [
    /eval\s*\(/i,
    /function\s*\(/i,
    /=>\s*{/,
    /import\s+/i,
    /require\s*\(/i,
    /document\./i,
    /window\./i,
    /global\./i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(expression)) {
      errors.push(`表达式包含可能不安全的操作: ${pattern.source}`);
    }
  }

  // 检查是否包含{{value}}占位符
  if (!expression.includes('{{value}}')) {
    suggestions.push('建议在表达式中包含{{value}}占位符来引用源值');
  }

  // 检查括号匹配
  const openBrackets = (expression.match(/\(/g) || []).length;
  const closeBrackets = (expression.match(/\)/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push('括号不匹配');
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions
  };
}