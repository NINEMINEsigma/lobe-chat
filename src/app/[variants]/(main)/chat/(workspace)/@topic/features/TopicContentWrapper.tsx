'use client';

import { useSearchParams } from 'next/navigation';
import { memo, Suspense } from 'react';

import SkeletonList from './SkeletonList';
import TopicListContent from './TopicListContent';
import ScheduleTable from '../../features/ScheduleTable';

const TopicContentWrapper = memo(() => {
  const searchParams = useSearchParams();
  const assistant = searchParams.get('assistant');

  // 如果是schedule助手模式，显示时间安排表
  if (assistant === 'schedule') {
    return (
      <Suspense fallback={<SkeletonList />}>
        <ScheduleTable />
      </Suspense>
    );
  }

  // 否则显示原来的话题列表
  return (
    <Suspense fallback={<SkeletonList />}>
      <TopicListContent />
    </Suspense>
  );
});

TopicContentWrapper.displayName = 'TopicContentWrapper';

export default TopicContentWrapper; 