"use client";

const SHARED_COURSE_ASSET_DB = "akadverse-shared-course-assets";
const SHARED_COURSE_ASSET_STORE = "notes";

type StoredAsset = {
  id: string;
  blob: Blob;
  name: string;
  type: string;
};

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(SHARED_COURSE_ASSET_DB, 1);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(SHARED_COURSE_ASSET_STORE)) {
        database.createObjectStore(SHARED_COURSE_ASSET_STORE, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const database = await openDatabase();

  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(SHARED_COURSE_ASSET_STORE, mode);
    const store = transaction.objectStore(SHARED_COURSE_ASSET_STORE);
    const request = callback(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      reject(transaction.error);
      database.close();
    };
  });
}

export async function saveSharedCourseAsset(file: File, assetId: string) {
  await withStore("readwrite", (store) =>
    store.put({
      id: assetId,
      blob: file,
      name: file.name,
      type: file.type,
    } satisfies StoredAsset),
  );
}

export async function getSharedCourseAssetUrl(assetId: string) {
  const asset = await withStore<StoredAsset | undefined>("readonly", (store) =>
    store.get(assetId),
  );

  if (!asset?.blob) {
    return null;
  }

  return URL.createObjectURL(asset.blob);
}

export async function deleteSharedCourseAsset(assetId: string) {
  await withStore("readwrite", (store) => store.delete(assetId));
}
