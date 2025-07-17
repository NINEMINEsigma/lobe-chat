import React from 'react';

import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import SystemRole from './features/SystemRole';
import TopicContentWrapper from './features/TopicContentWrapper';

const Topic = async (props: DynamicLayoutProps) => {
  const isMobile = await RouteVariants.getIsMobile(props);

  const Layout = isMobile ? Mobile : Desktop;

  return (
    <>
      {!isMobile && <SystemRole />}
      <Layout>
        <TopicContentWrapper />
      </Layout>
    </>
  );
};

Topic.displayName = 'ChatTopic';

export default Topic;
