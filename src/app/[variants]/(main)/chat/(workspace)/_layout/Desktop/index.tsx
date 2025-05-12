import { Suspense } from 'react';
import { Flexbox } from 'react-layout-kit';

import BrandTextLoading from '@/components/Loading/BrandTextLoading';

import { LayoutProps } from '../type';
import ChatHeader from './ChatHeader';
import Portal from './Portal';
import TopicPanel from './TopicPanel';

const Layout = ({ children, topic, conversation, portal}: LayoutProps) => {
  return (
    <>
      <ChatHeader />
      <Flexbox
        height={'100%'}
        horizontal
        style={{ overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <Flexbox
          height={'100%'}
          style={{ overflow: 'hidden', position: 'relative' }}
          width={'100%'}
        >
          {conversation}
        </Flexbox>
        {children}
        <Portal>
          <Suspense fallback={<BrandTextLoading />}>{portal}</Suspense>
        </Portal>
        <TopicPanel>{topic}</TopicPanel>
        {/* Project-Label 在type.ts中新增了布局ReactNode后就可以在这里把对应的内容加入 */}
        {/*<Suspense fallback={<BrandTextLoading />}>{workflow}</Suspense>*/}
      </Flexbox>
    </>
  );
};

Layout.displayName = 'DesktopConversationLayout';

export default Layout;
