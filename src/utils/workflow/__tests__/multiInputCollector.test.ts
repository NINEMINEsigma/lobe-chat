/**
 * 多输入收集器测试用例
 * 测试多输入数据收集和合并功能的正确性
 */

import {
  collectMultipleInputs,
  mergeInputData,
  validateMultiInputConfig,
  getDefaultMultiInputConfig,
  processParameterMappings,
  generateParameterTemplate,
  InputMergeStrategy,
  type MultiInputConfig,
  type InputData,
  type ParameterMapping
} from '../multiInputCollector';

// 模拟边数据
const mockEdges = [
  { id: 'edge1', source: 'node1', target: 'output', sourceHandle: null, targetHandle: null },
  { id: 'edge2', source: 'node2', target: 'output', sourceHandle: null, targetHandle: null },
  { id: 'edge3', source: 'node3', target: 'output', sourceHandle: null, targetHandle: null }
];

// 模拟节点输出数据
const mockNodeOutputs = new Map([
  ['node1', 'Hello'],
  ['node2', 'World'],
  ['node3', '!']
]);

describe('多输入收集器测试', () => {

  describe('collectMultipleInputs', () => {
    it('应该正确收集多个输入数据', async () => {
      const result = await collectMultipleInputs('output', mockEdges, mockNodeOutputs);

      expect(result.success).toBe(true);
      expect(result.inputs).toHaveLength(3);
      expect(result.inputs[0].sourceNodeId).toBe('node1');
      expect(result.inputs[0].value).toBe('Hello');
      expect(result.inputs[1].sourceNodeId).toBe('node2');
      expect(result.inputs[1].value).toBe('World');
      expect(result.inputs[2].sourceNodeId).toBe('node3');
      expect(result.inputs[2].value).toBe('!');
    });

    it('应该处理无输入连接的情况', async () => {
      const result = await collectMultipleInputs('output', [], mockNodeOutputs);

      expect(result.success).toBe(true);
      expect(result.inputs).toHaveLength(0);
    });

    it('应该处理部分节点无输出的情况', async () => {
      const partialOutputs = new Map([
        ['node1', 'Hello'],
        ['node3', '!']
        // node2 没有输出
      ]);

      const result = await collectMultipleInputs('output', mockEdges, partialOutputs);

      expect(result.success).toBe(true);
      expect(result.inputs).toHaveLength(2);
      expect(result.inputs.find(input => input.sourceNodeId === 'node1')).toBeDefined();
      expect(result.inputs.find(input => input.sourceNodeId === 'node3')).toBeDefined();
      expect(result.inputs.find(input => input.sourceNodeId === 'node2')).toBeUndefined();
    });

    it('应该正确处理错误情况', async () => {
      // 传入无效的edges参数
      const result = await collectMultipleInputs('output', null as any, mockNodeOutputs);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('mergeInputData', () => {
    const mockInputs: InputData[] = [
      { sourceNodeId: 'node1', edgeId: 'edge1', value: 'Hello', timestamp: 1000 },
      { sourceNodeId: 'node2', edgeId: 'edge2', value: 'World', timestamp: 2000 },
      { sourceNodeId: 'node3', edgeId: 'edge3', value: '!', timestamp: 3000 }
    ];

    it('应该正确执行字符串拼接策略', () => {
      const config: MultiInputConfig = {
        strategy: InputMergeStrategy.CONCAT,
        separator: ' ',
        enabled: true
      };

      const result = mergeInputData(mockInputs, config);
      expect(result).toBe('Hello World !');
    });

    it('应该正确执行数组合并策略', () => {
      const config: MultiInputConfig = {
        strategy: InputMergeStrategy.ARRAY,
        enabled: true
      };

      const result = mergeInputData(mockInputs, config);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(['Hello', 'World', '!']);
    });

    it('应该正确执行第一个输入策略', () => {
      const config: MultiInputConfig = {
        strategy: InputMergeStrategy.FIRST,
        enabled: true
      };

      const result = mergeInputData(mockInputs, config);
      expect(result).toBe('Hello');
    });

    it('应该正确执行最后一个输入策略', () => {
      const config: MultiInputConfig = {
        strategy: InputMergeStrategy.LAST,
        enabled: true
      };

      const result = mergeInputData(mockInputs, config);
      expect(result).toBe('!');
    });

    it('应该正确执行模板替换策略', () => {
      const config: MultiInputConfig = {
        strategy: InputMergeStrategy.TEMPLATE,
        template: '第一个: {{0}}, 第二个: {{1}}, 第三个: {{2}}',
        enabled: true
      };

      const result = mergeInputData(mockInputs, config);
      expect(result).toBe('第一个: Hello, 第二个: World, 第三个: !');
    });

    it('应该正确处理模板中的通用占位符', () => {
      const config: MultiInputConfig = {
        strategy: InputMergeStrategy.TEMPLATE,
        template: '总共 {{count}} 个输入: {{all}}',
        enabled: true
      };

      const result = mergeInputData(mockInputs, config);
      expect(result).toBe('总共 3 个输入: Hello\nWorld\n!');
    });

    it('应该处理空输入数组', () => {
      const config: MultiInputConfig = {
        strategy: InputMergeStrategy.CONCAT,
        separator: ' ',
        enabled: true
      };

      const result = mergeInputData([], config);
      expect(result).toBe('');
    });

    it('应该处理未知策略', () => {
      const config: MultiInputConfig = {
        strategy: 'unknown' as any,
        enabled: true
      };

      const result = mergeInputData(mockInputs, config);
      // 应该回退到默认的字符串拼接
      expect(result).toBe('Hello\nWorld\n!');
    });

    it('应该正确处理默认分隔符', () => {
      const config: MultiInputConfig = {
        strategy: InputMergeStrategy.CONCAT,
        enabled: true
        // 没有设置separator
      };

      const result = mergeInputData(mockInputs, config);
      expect(result).toBe('Hello\nWorld\n!');
    });
  });

  describe('validateMultiInputConfig', () => {
    it('应该验证有效配置', () => {
      const validConfig: MultiInputConfig = {
        strategy: InputMergeStrategy.CONCAT,
        separator: '\n',
        enabled: true
      };

      expect(validateMultiInputConfig(validConfig)).toBe(true);
    });

    it('应该验证模板策略配置', () => {
      const validTemplateConfig: MultiInputConfig = {
        strategy: InputMergeStrategy.TEMPLATE,
        template: 'Hello {{0}}',
        enabled: true
      };

      expect(validateMultiInputConfig(validTemplateConfig)).toBe(true);
    });

    it('应该拒绝无效策略', () => {
      const invalidConfig: MultiInputConfig = {
        strategy: 'invalid' as any,
        enabled: true
      };

      expect(validateMultiInputConfig(invalidConfig)).toBe(false);
    });

    it('应该拒绝模板策略但无模板的配置', () => {
      const invalidTemplateConfig: MultiInputConfig = {
        strategy: InputMergeStrategy.TEMPLATE,
        enabled: true
        // 缺少template
      };

      expect(validateMultiInputConfig(invalidTemplateConfig)).toBe(false);
    });

    it('应该拒绝null配置', () => {
      expect(validateMultiInputConfig(null as any)).toBe(false);
    });
  });

  describe('getDefaultMultiInputConfig', () => {
    it('应该返回有效的默认配置', () => {
      const defaultConfig = getDefaultMultiInputConfig();

      expect(defaultConfig.strategy).toBe(InputMergeStrategy.CONCAT);
      expect(defaultConfig.separator).toBe('\n');
      expect(defaultConfig.enabled).toBe(false);
      expect(defaultConfig.parameterMappings).toEqual([]);
      expect(defaultConfig.useParameterMapping).toBe(false);
      expect(validateMultiInputConfig(defaultConfig)).toBe(true);
    });
  });

  describe('边缘情况测试', () => {
    it('应该处理非常长的输入数据', () => {
      const longInputs: InputData[] = Array.from({ length: 100 }, (_, i) => ({
        sourceNodeId: `node${i}`,
        edgeId: `edge${i}`,
        value: `Value ${i}`.repeat(100),
        timestamp: Date.now() + i
      }));

      const config: MultiInputConfig = {
        strategy: InputMergeStrategy.CONCAT,
        separator: ' | ',
        enabled: true
      };

      const result = mergeInputData(longInputs, config);
      expect(result).toContain('Value 0');
      expect(result).toContain('Value 99');
      expect(result.split(' | ')).toHaveLength(100);
    });

    it('应该处理包含特殊字符的输入', () => {
      const specialInputs: InputData[] = [
        { sourceNodeId: 'node1', edgeId: 'edge1', value: 'Hello\nWorld', timestamp: 1000 },
        { sourceNodeId: 'node2', edgeId: 'edge2', value: 'Test\t\r\n', timestamp: 2000 },
        { sourceNodeId: 'node3', edgeId: 'edge3', value: '特殊字符: ☃️🎉', timestamp: 3000 }
      ];

      const config: MultiInputConfig = {
        strategy: InputMergeStrategy.ARRAY,
        enabled: true
      };

      const result = mergeInputData(specialInputs, config);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(['Hello\nWorld', 'Test\t\r\n', '特殊字符: ☃️🎉']);
    });

    it('应该处理JSON序列化失败的情况', () => {
      const circularInputs: InputData[] = [
        { sourceNodeId: 'node1', edgeId: 'edge1', value: 'Normal', timestamp: 1000 },
        { sourceNodeId: 'node2', edgeId: 'edge2', value: 'Also normal', timestamp: 2000 }
      ];

      // 模拟JSON.stringify失败
      const originalStringify = JSON.stringify;
      JSON.stringify = (() => {
        throw new Error('Circular reference');
      }) as any;

      const config: MultiInputConfig = {
        strategy: InputMergeStrategy.ARRAY,
        enabled: true
      };

      const result = mergeInputData(circularInputs, config);

      // 应该回退到字符串拼接
      expect(result).toBe('Normal, Also normal');

      // 恢复原始函数
      JSON.stringify = originalStringify;
    });
  });

  describe('参数映射功能', () => {
    const mockMappings: ParameterMapping[] = [
      {
        parameterName: 'userInput',
        sourceNodeId: 'node1',
        required: true,
        defaultValue: ''
      },
      {
        parameterName: 'systemPrompt',
        sourceNodeId: 'node2',
        required: false,
        defaultValue: 'Default system prompt'
      }
    ];

    const mockInputsForMapping: InputData[] = [
      { sourceNodeId: 'node1', edgeId: 'edge1', value: 'Hello from user', timestamp: 1000 },
      { sourceNodeId: 'node2', edgeId: 'edge2', value: 'Custom system prompt', timestamp: 2000 }
    ];

    describe('processParameterMappings', () => {
      it('应该正确映射参数', () => {
        const result = processParameterMappings(mockInputsForMapping, mockMappings);

        expect(result).toEqual({
          userInput: 'Hello from user',
          systemPrompt: 'Custom system prompt'
        });
      });

      it('应该处理缺失的非必需参数', () => {
        const incompleteInputs: InputData[] = [
          { sourceNodeId: 'node1', edgeId: 'edge1', value: 'Hello from user', timestamp: 1000 }
          // 缺少 node2 的输入
        ];

        const result = processParameterMappings(incompleteInputs, mockMappings);

        expect(result).toEqual({
          userInput: 'Hello from user',
          systemPrompt: 'Default system prompt'
        });
      });

      it('应该抛出错误当必需参数缺失时', () => {
        const incompleteInputs: InputData[] = [
          { sourceNodeId: 'node2', edgeId: 'edge2', value: 'Custom system prompt', timestamp: 2000 }
          // 缺少 node1 的输入（必需参数）
        ];

        expect(() => {
          processParameterMappings(incompleteInputs, mockMappings);
        }).toThrow('必需参数 "userInput" 的源节点 "node1" 未找到输出数据');
      });
    });

    describe('generateParameterTemplate', () => {
      it('应该生成正确的参数模板', () => {
        const template = generateParameterTemplate(mockMappings);

        expect(template).toBe('userInput: {{userInput}}\nsystemPrompt: {{systemPrompt}}');
      });

      it('应该处理空映射数组', () => {
        const template = generateParameterTemplate([]);

        expect(template).toBe('{{all}}');
      });

      it('应该处理undefined映射', () => {
        const template = generateParameterTemplate(undefined as any);

        expect(template).toBe('{{all}}');
      });
    });

    describe('参数映射模式的多输入合并', () => {
      it('应该使用参数映射模式合并输入', () => {
        const config: MultiInputConfig = {
          strategy: InputMergeStrategy.CONCAT,
          enabled: true,
          useParameterMapping: true,
          parameterMappings: mockMappings,
          template: 'User: {{userInput}}\nSystem: {{systemPrompt}}'
        };

        const result = mergeInputData(mockInputsForMapping, config);

        expect(result).toBe('User: Hello from user\nSystem: Custom system prompt');
      });

      it('应该在参数映射失败时回退到普通模式', () => {
        const config: MultiInputConfig = {
          strategy: InputMergeStrategy.CONCAT,
          separator: ' | ',
          enabled: true,
          useParameterMapping: true,
          parameterMappings: [
            {
              parameterName: 'missingParam',
              sourceNodeId: 'nonexistent',
              required: true,
              defaultValue: ''
            }
          ]
        };

        const result = mergeInputData(mockInputsForMapping, config);

        // 应该回退到普通合并模式
        expect(result).toBe('Hello from user | Custom system prompt');
      });

      it('应该使用生成的默认模板当未指定模板时', () => {
        const config: MultiInputConfig = {
          strategy: InputMergeStrategy.CONCAT,
          enabled: true,
          useParameterMapping: true,
          parameterMappings: mockMappings
          // 没有指定template
        };

        const result = mergeInputData(mockInputsForMapping, config);

        expect(result).toBe('userInput: Hello from user\nsystemPrompt: Custom system prompt');
      });
    });
  });
});