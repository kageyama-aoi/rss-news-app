export function withSearchBucket(scope) {
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
