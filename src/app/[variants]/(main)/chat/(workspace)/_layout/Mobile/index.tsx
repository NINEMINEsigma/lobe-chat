import { Suspense } from 'react';
import MobileContentLayout from '@/components/server/MobileNavLayout';

import BrandTextLoading from '@/components/Loading/BrandTextLoading';

import { LayoutProps } from '../type';
import ChatHeader from './ChatHeader';
import TopicModal from './TopicModal';

const Layout = ({ children, topic, conversation, portal, workflow }: LayoutProps) => {
  return (
    <>
      <MobileContentLayout header={<ChatHeader />} style={{ overflowY: 'hidden' }}>
        {conversation}
        {children}
      </MobileContentLayout>
      <TopicModal>{topic}</TopicModal>
      {portal}
      <Suspense fallback={<BrandTextLoading />}>{workflow}</Suspense>
    </>
  );
};

Layout.displayName = 'MobileConversationLayout';

export default Layout;
