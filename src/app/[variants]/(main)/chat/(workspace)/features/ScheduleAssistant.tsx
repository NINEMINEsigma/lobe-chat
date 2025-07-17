'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { LobeAgentSession } from '@/types/session';

const SCHEDULE_SESSION_ID = 'schedule-assistant';

const ScheduleAssistant = () => {
  const searchParams = useSearchParams();
  const assistant = searchParams.get('assistant');
  const createSession = useSessionStore((s) => s.createSession);
  const switchSession = useSessionStore((s) => s.switchSession);
  const sessions = useSessionStore((s) => s.sessions);

  useEffect(() => {
    if (assistant === 'schedule') {
      // 检查是否已存在schedule助手会话
      const existingSession = sessions.find((session: LobeAgentSession) => 
        session.meta?.title === '日程安排助手' || 
        session.id === SCHEDULE_SESSION_ID
      );

      if (existingSession) {
        // 如果存在，切换到该会话
        switchSession(existingSession.id);
      } else {
        // 如果不存在，创建一个新的schedule助手会话
        createSession({
          meta: {
            title: '日程安排助手',
            description: '智能日程安排助手，帮助您规划和管理日常事务',
            avatar: '🗓️',
          },
          config: {
            systemRole: `你是一个专业的日程安排助手，专门帮助用户规划和管理日常事务。

## 主要功能：
1. **日程规划**：帮助用户制定合理的日程安排
2. **时间管理**：提供时间管理建议和技巧
3. **任务优先级**：协助用户确定任务的优先级
4. **提醒设置**：帮助用户设置重要事项的提醒
5. **日程优化**：根据用户习惯优化日程安排

## 工作方式：
- 主动询问用户的日程需求和偏好
- 提供结构化的日程建议
- 考虑时间冲突和优先级
- 给出实用的时间管理建议
- 帮助用户建立良好的日程习惯

## 交互风格：
- 友好、专业、有条理
- 使用清晰的列表和表格展示信息
- 提供具体的行动建议
- 鼓励用户主动参与日程规划

请告诉我您今天的日程安排需求，我会为您提供专业的建议和帮助。`,
            model: 'gpt-4o-mini',
            provider: 'openai',
            params: {
              temperature: 0.7,
              top_p: 1,
              frequency_penalty: 0,
              presence_penalty: 0,
            },
            chatConfig: {
              displayMode: 'chat',
              enableAutoCreateTopic: true,
              autoCreateTopicThreshold: 4,
              enableHistoryCount: false,
            },
          },
        });
      }
    }
  }, [assistant, createSession, switchSession, sessions]);

  return null;
};

export default ScheduleAssistant; 