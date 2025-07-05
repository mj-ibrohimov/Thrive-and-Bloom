

import React, { createContext, ReactNode, useContext, useState } from 'react';

interface FancyTabBarContextValue {
  isTabBarVisible: boolean;
  hideTabBar: () => void;
  showTabBar: () => void;
}

const FancyTabBarContext = createContext<FancyTabBarContextValue>({
  isTabBarVisible: true,
  hideTabBar: () => {},
  showTabBar: () => {},
});

export const useFancyTabBar = () => useContext(FancyTabBarContext);

export const FancyTabBarProvider = ({ children }: { children: ReactNode }) => {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);

  const hideTabBar = () => setIsTabBarVisible(false);
  const showTabBar = () => setIsTabBarVisible(true);

  return (
    <FancyTabBarContext.Provider
      value={{ isTabBarVisible, hideTabBar, showTabBar }}
    >
      {children}
    </FancyTabBarContext.Provider>
  );
};