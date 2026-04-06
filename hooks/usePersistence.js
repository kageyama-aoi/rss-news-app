"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "../lib/workspace-copy";

/**
 * localStorage との読み書きを一元管理
 */
export function usePersistence() {
  const [readMap, setReadMap] = useState({});
  const [laterMap, setLaterMap] = useState({});
  const [notesMap, setNotesMap] = useState({});
  const [sourcePrefs, setSourcePrefs] = useState({});

  // 初期化時に localStorage から読み込み
  useEffect(() => {
    setReadMap(readStorage(STORAGE_KEYS.readMap, {}));
    setLaterMap(readStorage(STORAGE_KEYS.laterMap, {}));
    setNotesMap(readStorage(STORAGE_KEYS.notesMap, {}));
    setSourcePrefs(readStorage(STORAGE_KEYS.sourcePrefs, {}));
  }, []);

  // 変更時に localStorage に保存
  useEffect(() => writeStorage(STORAGE_KEYS.readMap, readMap), [readMap]);
  useEffect(() => writeStorage(STORAGE_KEYS.laterMap, laterMap), [laterMap]);
  useEffect(() => writeStorage(STORAGE_KEYS.notesMap, notesMap), [notesMap]);
  useEffect(() => writeStorage(STORAGE_KEYS.sourcePrefs, sourcePrefs), [sourcePrefs]);

  return {
    readMap,
    setReadMap,
    laterMap,
    setLaterMap,
    notesMap,
    setNotesMap,
    sourcePrefs,
    setSourcePrefs
  };
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
