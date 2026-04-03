"use client";

import { useCallback, useState } from "react";
import { dedupeArticles, getArticleKey } from "../lib/article-utils";
import { withSearchBucket } from "../lib/search-utils";

/**
 * 検索・ビュー保存機能を管理
 */
export function useSearch() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchScope, setSearchScope] = useState("all");
  const [viewName, setViewName] = useState("");

  const clearSearch = () => {
    setSearchKeyword("");
    setSearchScope("all");
  };

  const saveCurrentView = (currentViews, hideShorts, unreadOnly, hideMuted) => {
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
  };

  const applySavedView = (view, setters) => {
    const { setSearchKeyword: setSK, setSearchScope: setSS, setHideShorts: setSH, setUnreadOnly: setSU, setHideMuted: setSHM } = setters;
    setSK(view.query || "");
    setSS(view.scope || "all");
    setSH(view.hideShorts ?? true);
    setSU(view.unreadOnly ?? false);
    setSHM(view.hideMuted ?? true);
  };

  const removeSavedView = (viewId, currentViews) => {
    return currentViews.filter((view) => view.id !== viewId);
  };

  const performSearch = useCallback((keyword, scope, pool, readMap, notesMap) => {
    const query = keyword.trim().toLowerCase();

    if (!query) {
      return scope === "all" ? [] : pool.map(withSearchBucket(scope));
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
      .map(withSearchBucket(scope));
  }, []);

  return {
    searchKeyword,
    setSearchKeyword,
    searchScope,
    setSearchScope,
    viewName,
    setViewName,
    clearSearch,
    saveCurrentView,
    applySavedView,
    removeSavedView,
    performSearch
  };
}
