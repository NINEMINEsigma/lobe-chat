import { usePathname, useSearchParams } from 'next/navigation';

import { ProfileTabs, SettingsTabs, SidebarTabKey } from '@/store/global/initialState';

/**
 * Returns the active tab key (chat/market/settings/...)
 */
export const useActiveTabKey = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const assistant = searchParams.get('assistant');

  const baseTab = pathname.split('/').find(Boolean)! as SidebarTabKey;
  
  // 如果是chat页面且有assistant=schedule参数，返回Schedule
  if (baseTab === SidebarTabKey.Chat && assistant === 'schedule') {
    return SidebarTabKey.Schedule;
  }

  return baseTab;
};

/**
 * Returns the active setting page key (common/sync/agent/...)
 */
export const useActiveSettingsKey = () => {
  const pathname = usePathname();

  const tabs = pathname.split('/').at(-1);

  if (tabs === 'settings') return SettingsTabs.Common;

  return tabs as SettingsTabs;
};

/**
 * Returns the active profile page key (profile/security/stats/...)
 */
export const useActiveProfileKey = () => {
  const pathname = usePathname();

  const tabs = pathname.split('/').at(-1);

  if (tabs === 'profile') return ProfileTabs.Profile;

  return tabs as ProfileTabs;
};
