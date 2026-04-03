"use client";

import { useState } from "react";
import { getArticleKey } from "../lib/article-utils";

/**
 * 記事保存と AI 要約機能を管理
 */
export function useSave(onLoadSavedNews) {
  const [summaryLoadingMap, setSummaryLoadingMap] = useState({});
  const [summaryMap, setSummaryMap] = useState({});
  const [saveLoadingMap, setSaveLoadingMap] = useState({});
  const [saveMessageMap, setSaveMessageMap] = useState({});
  const [manualSaveLoading, setManualSaveLoading] = useState(false);
  const [manualSaveMessage, setManualSaveMessage] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [manualSource, setManualSource] = useState("Manual Save");

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
      onLoadSavedNews();
    } catch (err) {
      setSaveMessageMap((current) => ({
        ...current,
        [key]: `エラー: ${err.message || "保存できませんでした。"}`
      }));
    } finally {
      setSaveLoadingMap((current) => ({ ...current, [key]: false }));
    }
  };

  const saveManualNews = async (onLoadSavedNews) => {
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
      onLoadSavedNews();
    } catch (err) {
      setManualSaveMessage(`エラー: ${err.message || "保存できませんでした。"}`);
    } finally {
      setManualSaveLoading(false);
    }
  };

  return {
    summaryLoadingMap,
    summaryMap,
    saveLoadingMap,
    saveMessageMap,
    manualSaveLoading,
    manualSaveMessage,
    manualTitle,
    setManualTitle,
    manualUrl,
    setManualUrl,
    manualSource,
    setManualSource,
    summarizeTitle,
    saveNews,
    saveManualNews
  };
}
