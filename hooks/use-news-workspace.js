"use client";

import { useEffect, useMemo, useState } from "react";

import {
  buildTopicGroups,
  dedupeArticles,
  getArticleKey,
  groupBySource,
  isArticleVisible
} from "../lib/article-utils";
import { COPY, STORAGE_KEYS } from "../lib/workspace-copy";

export function useNewsWorkspace() {
  const [news, setNews] = useState([]);
  const [savedNews, setSavedNews] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchScope, setSearchScope] = useState("all");
  const [viewName, setViewName] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [manualSource, setManualSource] = useState("Manual Save");
  const [loading, setLoading] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const [manualSaveLoading, setManualSaveLoading] = useState(false);
  const [manualSaveMessage, setManualSaveMessage] = useState("");
  const [error, setError] = useState("");
  const [savedError, setSavedError] = useState("");
  const [summaryLoadingMap, setSummaryLoadingMap] = useState({});
  const [summaryMap, setSummaryMap] = useState({});
  const [saveLoadingMap, setSaveLoadingMap] = useState({});
  const [saveMessageMap, setSaveMessageMap] = useState({});
  const [fetchedAt, setFetchedAt] = useState(null);
  const [selectedKey, setSelectedKey] = useState("");
  const [readMap, setReadMap] = useState({});
  const [laterMap, setLaterMap] = useState({});
  const [notesMap, setNotesMap] = useState({});
  const [sourcePrefs, setSourcePrefs] = useState({});
  const [savedViews, setSavedViews] = useState([]);
  const [hideShorts, setHideShorts] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [hideMuted, setHideMuted] = useState(true);
  const [groupTopics, setGroupTopics] = useState(true);
  const [isDesktopNavOpen, setIsDesktopNavOpen] = useState(false);
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(true);
  const [isFeedCollapsed, setIsFeedCollapsed] = useState(true);
  const [expandedSources, setExpandedSources] = useState({});

  useEffect(() => {
    setReadMap(readStorage(STORAGE_KEYS.readMap, {}));
    setLaterMap(readStorage(STORAGE_KEYS.laterMap, {}));
    setNotesMap(readStorage(STORAGE_KEYS.notesMap, {}));
    setSourcePrefs(readStorage(STORAGE_KEYS.sourcePrefs, {}));
    setSavedViews(readStorage(STORAGE_KEYS.savedViews, []));
  }, []);

  useEffect(() => writeStorage(STORAGE_KEYS.readMap, readMap), [readMap]);
  useEffect(() => writeStorage(STORAGE_KEYS.laterMap, laterMap), [laterMap]);
  useEffect(() => writeStorage(STORAGE_KEYS.notesMap, notesMap), [notesMap]);
  useEffect(() => writeStorage(STORAGE_KEYS.sourcePrefs, sourcePrefs), [sourcePrefs]);
  useEffect(() => writeStorage(STORAGE_KEYS.savedViews, savedViews), [savedViews]);

  const loadNews = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/rss", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("ニュースの取得に失敗しました。");
      }

      const data = await response.json();
      setNews(data);
      setFetchedAt(new Date().toISOString());
    } catch (err) {
      setError(err.message || "予期しないエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedNews = async () => {
    setSavedLoading(true);
    setSavedError("");

    try {
      const response = await fetch("/api/news", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "保存済みニュースの取得に失敗しました。");
      }

      setSavedNews(data);
    } catch (err) {
      const message = err.message || "保存済みニュースを取得できませんでした。";
      setSavedError(message);
      setSavedNews([]);
    } finally {
      setSavedLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
    loadSavedNews();
  }, []);

  const isSavedAvailable = !savedError.includes("未設定");
  const allSources = useMemo(
    () =>
      [...new Set([...news, ...savedNews].map((article) => article.source || COPY.sourceFallback))].sort(
        (left, right) => left.localeCompare(right, "ja")
      ),
    [news, savedNews]
  );

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

  const activeStatus =
    loading || savedLoading || manualSaveLoading ? COPY.busy : COPY.ready;

  const visibleFeed = useMemo(
    () =>
      news
        .filter((article) => isArticleVisible(article, sourcePrefs, hideMuted, hideShorts))
        .filter((article) => !unreadOnly || !readMap[getArticleKey(article)]),
    [news, sourcePrefs, hideMuted, hideShorts, unreadOnly, readMap]
  );

  const visibleSaved = useMemo(
    () =>
      savedNews
        .filter((article) => isArticleVisible(article, sourcePrefs, hideMuted, hideShorts))
        .filter((article) => !unreadOnly || !readMap[getArticleKey(article)]),
    [savedNews, sourcePrefs, hideMuted, hideShorts, unreadOnly, readMap]
  );

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

  const groupedFeed = useMemo(() => groupBySource(visibleFeed), [visibleFeed]);

  const searchResults = useMemo(() => {
    const pool =
      searchScope === "feed"
        ? visibleFeed
        : searchScope === "saved"
          ? visibleSaved
          : searchScope === "queue"
            ? queueItems
            : searchScope === "unread"
              ? [...visibleFeed, ...visibleSaved].filter(
                  (article) => !readMap[getArticleKey(article)]
                )
              : dedupeArticles([...visibleFeed, ...visibleSaved]);

    const query = searchKeyword.trim().toLowerCase();

    if (!query) {
      return searchScope === "all" ? [] : pool.map(withSearchBucket(searchScope));
    }

    return pool
      .filter((article) => {
        const haystack = [
          article.title,
          article.source,
          article.summary,
          notesMap[getArticleKey(article)] || ""
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      })
      .map(withSearchBucket(searchScope));
  }, [visibleFeed, visibleSaved, queueItems, searchScope, searchKeyword, readMap, notesMap]);

  const relatedGroups = useMemo(
    () => (groupTopics ? buildTopicGroups(visibleFeed) : []),
    [groupTopics, visibleFeed]
  );

  const selectedArticle = useMemo(() => {
    if (!selectedKey) {
      return null;
    }

    return [...news, ...savedNews].find((article) => getArticleKey(article) === selectedKey) || null;
  }, [selectedKey, news, savedNews]);

  const unreadCount = visibleFeed.filter((article) => !readMap[getArticleKey(article)]).length;
  const selectedNote = selectedArticle ? notesMap[getArticleKey(selectedArticle)] || "" : "";

  const clearSearch = () => {
    setSearchKeyword("");
    setSearchScope("all");
  };

  const saveCurrentView = () => {
    const trimmed = viewName.trim();

    if (!trimmed) {
      return;
    }

    setSavedViews((current) => [
      {
        id: `${Date.now()}`,
        name: trimmed,
        query: searchKeyword,
        scope: searchScope,
        hideShorts,
        unreadOnly,
        hideMuted
      },
      ...current
    ]);
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

  const summarizeTitle = async (article) => {
    const key = getArticleKey(article);

    setSummaryLoadingMap((current) => ({ ...current, [key]: true }));

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: article.title })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "AI要約に失敗しました。");
      }

      setSummaryMap((current) => ({ ...current, [key]: data.summary }));
    } catch (err) {
      setSummaryMap((current) => ({
        ...current,
        [key]: `エラー: ${err.message || "要約できませんでした。"}`
      }));
    } finally {
      setSummaryLoadingMap((current) => ({ ...current, [key]: false }));
    }
  };

  const saveNews = async (article) => {
    const key = getArticleKey(article);

    setSaveLoadingMap((current) => ({ ...current, [key]: true }));
    setSaveMessageMap((current) => ({ ...current, [key]: "" }));

    try {
      const response = await fetch("/api/news/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          link: article.link,
          source: article.source,
          summary: summaryMap[key] || ""
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "ニュース保存に失敗しました。");
      }

      setSaveMessageMap((current) => ({ ...current, [key]: data.message }));
      loadSavedNews();
    } catch (err) {
      setSaveMessageMap((current) => ({
        ...current,
        [key]: `エラー: ${err.message || "保存できませんでした。"}`
      }));
    } finally {
      setSaveLoadingMap((current) => ({ ...current, [key]: false }));
    }
  };

  const saveManualNews = async () => {
    setManualSaveLoading(true);
    setManualSaveMessage("");

    try {
      if (!manualTitle.trim() || !manualUrl.trim()) {
        throw new Error("タイトルとURLを入力してください。");
      }

      const response = await fetch("/api/news/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: manualTitle.trim(),
          link: manualUrl.trim(),
          source: manualSource.trim() || "Manual Save",
          summary: ""
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "手動保存に失敗しました。");
      }

      setManualSaveMessage(data.message);
      setManualTitle("");
      setManualUrl("");
      loadSavedNews();
    } catch (err) {
      setManualSaveMessage(`エラー: ${err.message || "保存できませんでした。"}`);
    } finally {
      setManualSaveLoading(false);
    }
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

function withSearchBucket(scope) {
  return (article) => ({
    ...article,
    searchBucket:
      scope === "feed"
        ? "フィード"
        : scope === "saved"
          ? "保存済み"
          : scope === "queue"
            ? "後で読む"
            : scope === "unread"
              ? "未読"
              : "すべて"
  });
}

function readStorage(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}
