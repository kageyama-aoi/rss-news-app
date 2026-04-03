"use client";

import { useState } from "react";

/**
 * UI パネルの開閉状態を管理
 */
export function useUIState() {
  const [activeTab, setActiveTab] = useState("feed");
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);
  const [expandedSources, setExpandedSources] = useState({});
  const [hideShorts, setHideShorts] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [hideMuted, setHideMuted] = useState(true);
  const [groupTopics, setGroupTopics] = useState(true);
  const [selectedKey, setSelectedKey] = useState("");

  return {
    activeTab,
    setActiveTab,
    isFilterCollapsed,
    setIsFilterCollapsed,
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
