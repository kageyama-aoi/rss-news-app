"use client";

import { useState } from "react";

/**
 * UI パネルの開閉状態を管理
 */
export function useUIState() {
  const [isDesktopNavOpen, setIsDesktopNavOpen] = useState(false);
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(true);
  const [isFeedCollapsed, setIsFeedCollapsed] = useState(true);
  const [expandedSources, setExpandedSources] = useState({});
  const [hideShorts, setHideShorts] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [hideMuted, setHideMuted] = useState(true);
  const [groupTopics, setGroupTopics] = useState(true);
  const [selectedKey, setSelectedKey] = useState("");

  return {
    isDesktopNavOpen,
    setIsDesktopNavOpen,
    isSearchCollapsed,
    setIsSearchCollapsed,
    isFeedCollapsed,
    setIsFeedCollapsed,
    expandedSources,
    setExpandedSources,
    hideShorts,
    setHideShorts,
    unreadOnly,
    setUnreadOnly,
    hideMuted,
    setHideMuted,
    groupTopics,
    setGroupTopics,
    selectedKey,
    setSelectedKey
  };
}
