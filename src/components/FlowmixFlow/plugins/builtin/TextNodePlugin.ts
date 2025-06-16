import React from 'react';
import { NodePlugin, NodeProps } from '../../core/types/NodePlugin';
import { AppNode, ValidationResult } from '../../core/types/Common';

interface TextNodeData {
  text: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
}

const TextNodeComponent: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as TextNodeData;

  const nodeStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderRadius: '8px',
    border: selected ? '2px solid #1890ff' : '1px solid #d9d9d9',
    backgroundColor: nodeData.backgroundColor || '#ffffff',
    color: nodeData.color || '#000000',
    fontSize: `${nodeData.fontSize || 14}px`,
    minWidth: '120px',
    maxWidth: '300px',
    cursor: 'pointer',
    boxShadow: selected ? '0 4px 12px rgba(24, 144, 255, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div style={nodeStyle}>
      <div style={{ marginBottom: '4px', fontSize: '10px', color: '#666', opacity: 0.7 }}>
        Text Node
      </div>
      <div>
        {nodeData.text || 'Double click to edit'}
      </div>
    </div>
  );
};

export const TextNodePlugin: NodePlugin = {
  config: {
    id: 'text',
    name: 'Text Node',
    category: 'Basic',
    icon: '📝',
    description: 'A node for displaying and editing text content',
    version: '1.0.0',
    author: 'FlowMix'
  },
  schema: {
    properties: {
      text: {
        type: 'string',
        label: 'Text Content',
        description: 'The text content to display',
        default: 'Text Node',
        required: true
      },
      fontSize: {
        type: 'number',
        label: 'Font Size',
        description: 'Font size in pixels',
        default: 14
      },
      color: {
        type: 'string',
        label: 'Text Color',
        description: 'Text color',
        default: '#000000'
      },
      backgroundColor: {
        type: 'string',
        label: 'Background Color',
        description: 'Node background color',
        default: '#ffffff'
      }
    }
  },
  component: {
    NodeComponent: TextNodeComponent
  },
  behaviors: {
    validate: (node: AppNode): ValidationResult => {
      const data = node.data as TextNodeData;
      const errors: Array<{ type: 'node' | 'edge' | 'flow'; id?: string; message: string }> = [];

      if (!data.text || data.text.trim().length === 0) {
        errors.push({
          type: 'node',
          id: node.id,
          message: 'Text content cannot be empty'
        });
      }

      return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
      };
    }
  },
  executor: async (input: any, config: TextNodeData) => {
    return {
      text: config.text,
      style: {
        fontSize: config.fontSize,
        color: config.color,
        backgroundColor: config.backgroundColor
      }
    };
  }
};