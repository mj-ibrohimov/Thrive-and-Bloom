

import { BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useFancyTabBar } from '../context/FancyTabBarContext';

const FancyTabBar: React.FC<BottomTabBarProps> = props => {
  const { isTabBarVisible } = useFancyTabBar();
  if (!isTabBarVisible) return null;
  return <BottomTabBar {...props} />;
};

export default FancyTabBar;