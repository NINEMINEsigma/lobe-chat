import { ReactNode } from 'react';

export interface LayoutProps {
  children: ReactNode;
  conversation: ReactNode;
  portal: ReactNode;
  topic: ReactNode;
  // Project-Label 在这种定义里新增ReactNode以控制传递的布局children
}
