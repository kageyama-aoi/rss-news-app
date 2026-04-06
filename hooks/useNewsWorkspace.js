"use client";

import { useCallback, useEffect, useMemo } from "react";
import { dedupeArticles, getArticleKey, isArticleVisible, groupBySource } from "../lib/article-utils";
import { usePersistence } from "./usePersistence";
import { useUIState } from "./useUIState";
import { useFeedData } from "./useFeedData";
import { useSearch } from "./useSearch";
import { useSave } from "./useSave";

/**
 * 複合フック: 各機能別フックを統合して UI に必要な state を提供
 */
export function useNewsWorkspace() {
  // 永続化層
  const {
    readMap, setReadMap,
    laterMap, setLaterMap,
    notesMap, setNotesMap,
    sourcePrefs, setSourcePrefs
  } = usePersistence();

  // UI 状態層
  const {
    activeTab, setActiveTab,
    isFilterCollapsed, setIsFilterCollapsed,
    expandedSources, setExpandedSources,
    hideShorts, setHideShorts,
    unreadOnly, setUnreadOnly,
    hideMuted, setHideMuted,
    groupTopics, setGroupTopics,
    selectedKey, setSelectedKey
  } = useUIState();

  // フィード取得層
  const {
    news, savedNews,
    loading, savedLoading,
    error, savedError,
    isSavedAvailable, allSources,
    loadNews, loadSavedNews
  } = useFeedData();

  // 検索層
  const {
    searchKeyword, setSearchKeyword,
    searchScope, setSearchScope,
    clearSearch, performSearch
  } = useSearch();

  // 保存・要約層
  const {
    summaryLoadingMap, summaryMap,
    saveLoadingMap, saveMessageMap,
    summarizeTitle, saveNews
  } = useSave(loadSavedNews);

  // ソース設定の初期化
  useEffect(() => {
    if (allSources.length === 0) return;

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

  // 可視フィード（共通フィルタ関数）
  const applyFilters = useCallback(
    (articles) =>
      articles
        .filter((article) => isArticleVisible(article, sourcePrefs, hideMuted, hideShorts))
        .filter((article) => !unreadOnly || !readMap[getArticleKey(article)]),
    [sourcePrefs, hideMuted, hideShorts, unreadOnly, readMap]
  );

  const visibleFeed = useMemo(() => applyFilters(news), [applyFilters, news]);
  const visibleSaved = useMemo(() => applyFilters(savedNews), [applyFilters, savedNews]);

  // 後で読むキュー（フィード + 保存済みから重複なし）
  const queueItems = useMemo(() => {
    const map = new Map();
    [...visibleFeed, ...visibleSaved].forEach((article) => {
      const key = getArticleKey(article);
      if (laterMap[key] && !map.has(key)) map.set(key, article);
    });
    return [...map.values()];
  }, [visibleFeed, visibleSaved, laterMap]);

  const groupedFeed = useMemo(() => groupBySource(visibleFeed), [visibleFeed]);

  // 検索結果
  const searchResults = useMemo(() => {
    const pool =
      searchScope === "feed"    ? visibleFeed :
      searchScope === "saved"   ? visibleSaved :
      searchScope === "queue"   ? queueItems :
      searchScope === "unread"  ? [...visibleFeed, ...visibleSaved].filter((a) => !readMap[getArticleKey(a)]) :
      dedupeArticles([...visibleFeed, ...visibleSaved]);

    return performSearch(searchKeyword, searchScope, pool, readMap, notesMap);
  }, [visibleFeed, visibleSaved, queueItems, searchScope, searchKeyword, readMap, notesMap, performSearch]);

  // 選択中の記事
  const selectedArticle = useMemo(() => {
    if (!selectedKey) return null;
    return [...news, ...savedNews].find((a) => getArticleKey(a) === selectedKey) || null;
  }, [selectedKey, news, savedNews]);

  const unreadCount = useMemo(
    () => visibleFeed.filter((a) => !readMap[getArticleKey(a)]).length,
    [visibleFeed, readMap]
  );
  const selectedNote = selectedArticle ? notesMap[getArticleKey(selectedArticle)] || "" : "";

  // アクション
  const toggleRead = (article) => {
    const key = getArticleKey(article);
    setReadMap((cur) => ({ ...cur, [key]: !cur[key] }));
  };

  const toggleLater = (article) => {
    const key = getArticleKey(article);
    setLaterMap((cur) => ({ ...cur, [key]: !cur[key] }));
  };

  const updateNote = (article, value) => {
    const key = getArticleKey(article);
    setNotesMap((cur) => ({ ...cur, [key]: value }));
  };

  const toggleSourceEnabled = (source) => {
    setSourcePrefs((cur) => ({
      ...cur,
      [source]: { enabled: !(cur[source]?.enabled ?? true), muted: cur[source]?.muted ?? false }
    }));
  };

  const toggleSourceMuted = (source) => {
    setSourcePrefs((cur) => ({
      ...cur,
      [source]: { enabled: cur[source]?.enabled ?? true, muted: !(cur[source]?.muted ?? false) }
    }));
  };

  return {
    // タブ
    activeTab, setActiveTab,
    // フィルター
    isFilterCollapsed,
    setFilterCollapsed: setIsFilterCollapsed,
    hideShorts, setHideShorts,
    unreadOnly, setUnreadOnly,
    hideMuted, setHideMuted,
    groupTopics, setGroupTopics,
    // ソース
    allSources, sourcePrefs,
    toggleSourceEnabled, toggleSourceMuted,
    // フィード
    groupedFeed, visibleFeed, visibleSaved,
    expandedSources, setExpandedSources,
    loading, error,
    loadNews,
    // キュー
    queueItems,
    // 保存済み
    isSavedAvailable, savedError, savedLoading,
    loadSavedNews,
    // 検索
    searchKeyword, setSearchKeyword,
    searchScope, setSearchScope,
    searchResults, clearSearch,
    // 選択・操作
    selectedArticle, selectedNote, setSelectedKey,
    unreadCount,
    readMap, laterMap, notesMap,
    toggleRead, toggleLater, updateNote,
    // 保存・要約
    saveNews, saveLoadingMap, saveMessageMap,
    summarizeTitle, summaryLoadingMap, summaryMap
  };
}
