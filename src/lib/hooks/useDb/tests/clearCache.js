async function getIndexedDB() {
  try {
    const db = await openDatabase();
    const data = await getData(db, REACT_INDEXED_DB_STORE_KEY);
    const size = new Blob([data], { type: "text/plain" }).size;
    return size > 52428800; // 50MB
  } catch (error) {
    console.error("Error accessing IndexedDB:", error);
  }
  return false;
}

const clearOverFlowingData = async () => {
  const isIndexedDBFull = await getIndexedDB();

  if (isIndexedDBFull) {
    const cachedPages = store.getState().cachedPages;
    const { oldestPageID } = Object.entries(cachedPages).reduce(
      (acc, [pageID, { date }]) => {
        const currentDate = new Date(date);
        if (!acc.oldestDate || currentDate < acc.oldestDate) {
          return { oldestPageID: pageID, oldestDate: currentDate };
        }
        return acc;
      },
      { oldestPageID: null, oldestDate: null }
    );
    dispatch(deleteCachedPage({ pageID: oldestPageID }));
    clearOverFlowingData(); // Recursively call until memory is under threshold
  }
};