"use client";

import { useEffect, useMemo, useState } from "react";
import { buildTopicGroups, groupBySource, isArticleVisible, getArticleKey } from "../lib/article-utils";
import { COPY } from "../lib/workspace-copy";

/**
 * RSS フィード取得と可視化フィルタを管理
 */
export function useFeedData() {
  const [news, setNews] = useState([]);
  const [savedNews, setSavedNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedError, setSavedError] = useState("");
  const [fetchedAt, setFetchedAt] = useState(null);

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

  // 初期読み込み
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

  // フィルタリング適用されたフィード
  const getVisibleFeed = (sourcePrefs, hideMuted, hideShorts, readMap = {}, unreadOnly = false) => {
    return news
      .filter((article) => isArticleVisible(article, sourcePrefs, hideMuted, hideShorts))
      .filter((article) => !unreadOnly || !readMap[getArticleKey(article)]);
  };

  const getVisibleSaved = (sourcePrefs, hideMuted, hideShorts, readMap = {}, unreadOnly = false) => {
    return savedNews
      .filter((article) => isArticleVisible(article, sourcePrefs, hideMuted, hideShorts))
      .filter((article) => !unreadOnly || !readMap[getArticleKey(article)]);
  };

  return {
    news,
    savedNews,
    loading,
    savedLoading,
    error,
    savedError,
    fetchedAt,
    isSavedAvailable,
    allSources,
    loadNews,
    loadSavedNews,
    getVisibleFeed,
    getVisibleSaved
  };
}

