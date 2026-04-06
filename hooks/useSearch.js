"use client";

import { useCallback, useState } from "react";
import { getArticleKey } from "../lib/article-utils";

const SCOPE_LABELS = {
  feed: "フィード",
  saved: "保存済み",
  queue: "後で読む",
  unread: "未読",
  all: "すべて"
};

function withSearchBucket(scope) {
  const label = SCOPE_LABELS[scope] ?? "すべて";
  return (article) => ({ ...article, searchBucket: label });
}

/**
 * 検索キーワード・スコープの管理と記事検索を担当
 */
export function useSearch() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchScope, setSearchScope] = useState("all");

  const clearSearch = () => {
    setSearchKeyword("");
    setSearchScope("all");
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
    clearSearch,
    performSearch
  };
}
