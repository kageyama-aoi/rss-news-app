"use client";

import { useEffect, useMemo, useState } from "react";
import { buildTopicGroups, dedupeArticles, getArticleKey, isArticleVisible, groupBySource } from "../lib/article-utils";
import { COPY } from "../lib/workspace-copy";
import { usePersistence } from "./usePersistence";
import { useUIState } from "./useUIState";
import { useFeedData } from "./useFeedData";
import { useSearch } from "./useSearch";
import { useSave } from "./useSave";
import { withSearchBucket } from "../lib/search-utils";

/**
 * 複合フック: 各機能別フックを統合して UI に必要な state を提供
 */
export function useNewsWorkspace() {
  // 永続化層
  const { readMap, setReadMap, laterMap, setLaterMap, notesMap, setNotesMap, sourcePrefs, setSourcePrefs, savedViews, setSavedViews } = usePersistence();

  // UI 状態層
  const { isDesktopNavOpen, setIsDesktopNavOpen, isSearchCollapsed, setIsSearchCollapsed, isFeedCollapsed, setIsFeedCollapsed, expandedSources, setExpandedSources, hideShorts, setHideShorts, unreadOnly, setUnreadOnly, hideMuted, setHideMuted, groupTopics, setGroupTopics, selectedKey, setSelectedKey } = useUIState();

  // フィード取得層
  const { news, savedNews, loading, savedLoading, error, savedError, fetchedAt, isSavedAvailable, allSources, loadNews, loadSavedNews, getVisibleFeed, getVisibleSaved } = useFeedData();

  // 検索層
  const { searchKeyword, setSearchKeyword, searchScope, setSearchScope, viewName, setViewName, clearSearch, performSearch } = useSearch();

  // 保存・要約層
  const { summaryLoadingMap, summaryMap, saveLoadingMap, saveMessageMap, manualSaveLoading, manualSaveMessage, manualTitle, setManualTitle, manualUrl, setManualUrl, manualSource, setManualSource, summarizeTitle, saveNews, saveManualNews } = useSave(loadSavedNews);

  // ソース設定の初期化
  useEffect(() => {
    if (allSources.length === 0) {
      return;
    }

    setSourcePrefs((current) => {
      const next = { ...current };
      let changed = false;

      allSources.forEach((source) => {
        if (!next[source]) {
          next[source] = { enabled: true, muted: false };
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [allSources]);

  const activeStatus = loading || savedLoading || manualSaveLoading ? COPY.busy : COPY.ready;

  // 可視フィード（フィルタ適用）
  const visibleFeed = useMemo(() => getVisibleFeed(sourcePrefs, hideMuted, hideShorts, readMap, unreadOnly), [sourcePrefs, hideMuted, hideShorts, readMap, unreadOnly]);

  const visibleSaved = useMemo(() => getVisibleSaved(sourcePrefs, hideMuted, hideShorts, readMap, unreadOnly), [sourcePrefs, hideMuted, hideShorts, readMap, unreadOnly]);

  // 後で読むキュー
  const queueItems = useMemo(() => {
    const map = new Map();
    [...visibleFeed, ...visibleSaved].forEach((article) => {
      const key = getArticleKey(article);
      if (laterMap[key] && !map.has(key)) {
        map.set(key, article);
      }
    });
    return [...map.values()];
  }, [visibleFeed, visibleSaved, laterMap]);

  // グループ化フィード
  const groupedFeed = useMemo(() => groupBySource(visibleFeed), [visibleFeed]);

  // 検索結果
  const searchResults = useMemo(() => {
    const pool =
      searchScope === "feed"
        ? visibleFeed
        : searchScope === "saved"
          ? visibleSaved
          : searchScope === "queue"
            ? queueItems
            : searchScope === "unread"
              ? [...visibleFeed, ...visibleSaved].filter((article) => !readMap[getArticleKey(article)])
              : dedupeArticles([...visibleFeed, ...visibleSaved]);

    return performSearch(searchKeyword, searchScope, pool, readMap, notesMap);
  }, [visibleFeed, visibleSaved, queueItems, searchScope, searchKeyword, readMap, notesMap, performSearch]);

  // トピックグルーピング
  const relatedGroups = useMemo(() => (groupTopics ? buildTopicGroups(visibleFeed) : []), [groupTopics, visibleFeed]);

  // 選択中の記事
  const selectedArticle = useMemo(() => {
    if (!selectedKey) {
      return null;
    }
    return [...news, ...savedNews].find((article) => getArticleKey(article) === selectedKey) || null;
  }, [selectedKey, news, savedNews]);

  const unreadCount = visibleFeed.filter((article) => !readMap[getArticleKey(article)]).length;
  const selectedNote = selectedArticle ? notesMap[getArticleKey(selectedArticle)] || "" : "";

  // ビュー管理
  const saveCurrentView = () => {
    setSavedViews((current) => performSaveView(current, viewName, searchKeyword, searchScope, hideShorts, unreadOnly, hideMuted));
    setViewName("");
  };

  const applySavedView = (view) => {
    setSearchKeyword(view.query || "");
    setSearchScope(view.scope || "all");
    setHideShorts(view.hideShorts ?? true);
    setUnreadOnly(view.unreadOnly ?? false);
    setHideMuted(view.hideMuted ?? true);
  };

  const removeSavedView = (viewId) => {
    setSavedViews((current) => current.filter((view) => view.id !== viewId));
  };

  // トグル操作
  const toggleRead = (article) => {
    const key = getArticleKey(article);
    setReadMap((current) => ({ ...current, [key]: !current[key] }));
  };

  const toggleLater = (article) => {
    const key = getArticleKey(article);
    setLaterMap((current) => ({ ...current, [key]: !current[key] }));
  };

  const updateNote = (article, value) => {
    const key = getArticleKey(article);
    setNotesMap((current) => ({ ...current, [key]: value }));
  };

  const toggleSourceEnabled = (source) => {
    setSourcePrefs((current) => ({
      ...current,
      [source]: {
        enabled: !(current[source]?.enabled ?? true),
        muted: current[source]?.muted ?? false
      }
    }));
  };

  const toggleSourceMuted = (source) => {
    setSourcePrefs((current) => ({
      ...current,
      [source]: {
        enabled: current[source]?.enabled ?? true,
        muted: !(current[source]?.muted ?? false)
      }
    }));
  };

  return {
    activeStatus,
    allSources,
    applySavedView,
    clearSearch,
    error,
    expandedSources,
    fetchedAt,
    groupTopics,
    groupedFeed,
    hideMuted,
    hideShorts,
    isDesktopNavOpen,
    isFeedCollapsed,
    isSavedAvailable,
    isSearchCollapsed,
    laterMap,
    loadNews,
    loadSavedNews,
    loading,
    manualSaveLoading,
    manualSaveMessage,
    manualSource,
    manualTitle,
    manualUrl,
    notesMap,
    queueItems,
    readMap,
    relatedGroups,
    removeSavedView,
    saveCurrentView,
    saveLoadingMap,
    saveManualNews,
    saveMessageMap,
    saveNews,
    savedError,
    savedLoading,
    savedViews,
    searchKeyword,
    searchResults,
    searchScope,
    selectedArticle,
    selectedNote,
    setExpandedSources,
    setGroupTopics,
    setHideMuted,
    setHideShorts,
    setIsDesktopNavOpen,
    setIsFeedCollapsed,
    setIsSearchCollapsed,
    setManualSource,
    setManualTitle,
    setManualUrl,
    setSearchKeyword,
    setSearchScope,
    setSelectedKey,
    setUnreadOnly,
    setViewName,
    sourcePrefs,
    summarizeTitle,
    summaryLoadingMap,
    summaryMap,
    toggleLater,
    toggleRead,
    toggleSourceEnabled,
    toggleSourceMuted,
    unreadCount,
    unreadOnly,
    updateNote,
    viewName,
    visibleFeed,
    visibleSaved
  };
}

function performSaveView(currentViews, viewName, searchKeyword, searchScope, hideShorts, unreadOnly, hideMuted) {
  const trimmed = viewName.trim();

  if (!trimmed) {
    return currentViews;
  }

  return [
    {
      id: `${Date.now()}`,
      name: trimmed,
      query: searchKeyword,
      scope: searchScope,
      hideShorts,
      unreadOnly,
      hideMuted
    },
    ...currentViews
  ];
}
