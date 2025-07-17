'use client';

import { Calendar, Clock, Plus } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ActionIcon, Button, Input, Modal, Select } from '@lobehub/ui';
import { Card, DatePicker, TimePicker } from 'antd';
import dayjs from 'dayjs';

interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'task' | 'reminder';
  completed: boolean;
}

const ScheduleTable = memo(() => {
  const { t } = useTranslation('common');
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    {
      id: '1',
      title: '团队会议',
      date: '2025-01-14',
      time: '10:00',
      type: 'meeting',
      completed: false,
    },
    {
      id: '2',
      title: '项目报告',
      date: '2025-01-14',
      time: '14:30',
      type: 'task',
      completed: false,
    },
    {
      id: '3',
      title: '客户沟通',
      date: '2025-01-15',
      time: '09:00',
      type: 'meeting',
      completed: false,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    date: '',
    time: '',
    type: 'task' as const,
  });

  const addSchedule = () => {
    if (newSchedule.title && newSchedule.date && newSchedule.time) {
      const schedule: ScheduleItem = {
        id: Date.now().toString(),
        title: newSchedule.title,
        date: newSchedule.date,
        time: newSchedule.time,
        type: newSchedule.type,
        completed: false,
      };
      setSchedules([...schedules, schedule]);
      setNewSchedule({ title: '', date: '', time: '', type: 'task' });
      setIsModalOpen(false);
    }
  };

  const toggleComplete = (id: string) => {
    setSchedules(schedules.map(s => 
      s.id === id ? { ...s, completed: !s.completed } : s
    ));
  };

  const deleteSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return '#1890ff';
      case 'task': return '#52c41a';
      case 'reminder': return '#faad14';
      default: return '#d9d9d9';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return '📅';
      case 'task': return '📋';
      case 'reminder': return '⏰';
      default: return '📝';
    }
  };

  const today = dayjs().format('YYYY-MM-DD');
  const todaySchedules = schedules.filter(s => s.date === today);
  const upcomingSchedules = schedules.filter(s => s.date > today).slice(0, 5);

  return (
    <Flexbox gap={16} padding={16} style={{ height: '100%', overflow: 'auto' }}>
      {/* 今日日程 */}
      <Card title="今日日程" extra={
        <ActionIcon 
          icon={Plus} 
          onClick={() => setIsModalOpen(true)}
          size="small"
          title="添加日程"
        />
      }>
        <Flexbox gap={8}>
          {todaySchedules.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
              今日暂无日程安排
            </div>
          ) : (
            todaySchedules.map(schedule => (
              <Flexbox
                key={schedule.id}
                horizontal
                align="center"
                justify="space-between"
                padding={8}
                style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: 6,
                  backgroundColor: schedule.completed ? '#f6f6f6' : '#fff',
                }}
              >
                <Flexbox horizontal align="center" gap={8}>
                  <span>{getTypeIcon(schedule.type)}</span>
                  <span style={{ 
                    textDecoration: schedule.completed ? 'line-through' : 'none',
                    color: schedule.completed ? '#999' : '#333'
                  }}>
                    {schedule.title}
                  </span>
                </Flexbox>
                <Flexbox horizontal align="center" gap={8}>
                  <span style={{ fontSize: 12, color: '#666' }}>{schedule.time}</span>
                  <Button
                    size="small"
                    type={schedule.completed ? 'default' : 'primary'}
                    onClick={() => toggleComplete(schedule.id)}
                  >
                    {schedule.completed ? '已完成' : '完成'}
                  </Button>
                  <ActionIcon
                    icon="Trash2"
                    size="small"
                    onClick={() => deleteSchedule(schedule.id)}
                    title="删除"
                  />
                </Flexbox>
              </Flexbox>
            ))
          )}
        </Flexbox>
      </Card>

      {/* 即将到来的日程 */}
      <Card title="即将到来的日程">
        <Flexbox gap={8}>
          {upcomingSchedules.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
              暂无即将到来的日程
            </div>
          ) : (
            upcomingSchedules.map(schedule => (
              <Flexbox
                key={schedule.id}
                horizontal
                align="center"
                justify="space-between"
                padding={8}
                style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: 6,
                }}
              >
                <Flexbox horizontal align="center" gap={8}>
                  <span>{getTypeIcon(schedule.type)}</span>
                  <span>{schedule.title}</span>
                </Flexbox>
                <Flexbox horizontal align="center" gap={8}>
                  <span style={{ fontSize: 12, color: '#666' }}>
                    {dayjs(schedule.date).format('MM-DD')} {schedule.time}
                  </span>
                  <ActionIcon
                    icon="Trash2"
                    size="small"
                    onClick={() => deleteSchedule(schedule.id)}
                    title="删除"
                  />
                </Flexbox>
              </Flexbox>
            ))
          )}
        </Flexbox>
      </Card>

      {/* 添加日程模态框 */}
      <Modal
        title="添加新日程"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={addSchedule}
        okText="添加"
        cancelText="取消"
      >
        <Flexbox gap={16} padding={16}>
          <Input
            placeholder="日程标题"
            value={newSchedule.title}
            onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
          />
          <DatePicker
            placeholder="选择日期"
            style={{ width: '100%' }}
            onChange={(date) => setNewSchedule({ 
              ...newSchedule, 
              date: date ? date.format('YYYY-MM-DD') : '' 
            })}
          />
          <TimePicker
            placeholder="选择时间"
            style={{ width: '100%' }}
            onChange={(time: any) => setNewSchedule({ 
              ...newSchedule, 
              time: time ? time.format('HH:mm') : '' 
            })}
          />
          <Select
            placeholder="选择类型"
            value={newSchedule.type}
            onChange={(value) => setNewSchedule({ ...newSchedule, type: value })}
            options={[
              { label: '会议', value: 'meeting' },
              { label: '任务', value: 'task' },
              { label: '提醒', value: 'reminder' },
            ]}
          />
        </Flexbox>
      </Modal>
    </Flexbox>
  );
});

ScheduleTable.displayName = 'ScheduleTable';

export default ScheduleTable; 