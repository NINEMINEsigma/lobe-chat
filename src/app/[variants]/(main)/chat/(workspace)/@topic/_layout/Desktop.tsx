'use client';

import { PropsWithChildren } from 'react';
import { useSearchParams } from 'next/navigation';
import { Flexbox } from 'react-layout-kit';

import Header from '../features/Header';

const Layout = ({ children }: PropsWithChildren) => {
  const searchParams = useSearchParams();
  const assistant = searchParams.get('assistant');

  return (
    <>
      {assistant !== 'schedule' && <Header />}
      <Flexbox height={'100%'} style={{ overflow: 'hidden', position: 'relative' }} width={'100%'}>
        {children}
      </Flexbox>
    </>
  );
};

export default Layout;
