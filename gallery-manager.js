(function () {
  const DB_NAME = "dentiva-gallery";
  const STORE_NAME = "cases";
  const DB_VERSION = 1;

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function runTransaction(mode, callback) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const store = transaction.objectStore(STORE_NAME);
      const request = callback(store);

      transaction.oncomplete = () => {
        database.close();
        resolve(request ? request.result : undefined);
      };
      transaction.onerror = () => {
        database.close();
        reject(transaction.error);
      };
    });
  }

  const store = {
    async getAll() {
      const records = await runTransaction("readonly", (objectStore) => objectStore.getAll());
      return records.sort((a, b) => b.createdAt - a.createdAt);
    },

    add(record) {
      return runTransaction("readwrite", (objectStore) => objectStore.put(record));
    },

    remove(id) {
      return runTransaction("readwrite", (objectStore) => objectStore.delete(id));
    }
  };

  function imageUrl(blob) {
    return blob ? URL.createObjectURL(blob) : "";
  }

  function createManagedCard(record, number) {
    const article = document.createElement("article");
    article.className = "gallery-case managed-gallery-case is-visible";
    article.dataset.galleryId = record.id;

    const head = document.createElement("div");
    head.className = "case-head";
    head.innerHTML = `<span>Case ${String(number).padStart(2, "0")}</span><strong></strong>`;
    head.querySelector("strong").textContent = record.title || "Smile Transformation";
    article.appendChild(head);

    if (record.layout === "combined") {
      const figure = document.createElement("figure");
      figure.className = "single-result";
      const image = document.createElement("img");
      image.src = imageUrl(record.combinedImage);
      image.alt = `${record.title || "Smile transformation"} before and after result`;
      figure.appendChild(image);
      article.appendChild(figure);
    } else {
      const comparison = document.createElement("div");
      comparison.className = "before-after";
      [
        ["Before", record.beforeImage],
        ["After", record.afterImage]
      ].forEach(([label, blob]) => {
        const figure = document.createElement("figure");
        const image = document.createElement("img");
        const caption = document.createElement("figcaption");
        image.src = imageUrl(blob);
        image.alt = `${record.title || "Smile transformation"} ${label.toLowerCase()}`;
        caption.textContent = label;
        figure.append(image, caption);
        comparison.appendChild(figure);
      });
      article.appendChild(comparison);
    }

    return article;
  }

  async function renderManagedGalleries() {
    const containers = document.querySelectorAll("[data-managed-gallery]");
    if (!containers.length || !window.indexedDB) return;

    try {
      const records = await store.getAll();
      containers.forEach((container) => {
        const limit = Number(container.dataset.galleryLimit || 0);
        const visibleRecords = limit ? records.slice(0, limit) : records;
        const staticCards = Array.from(container.children);

        visibleRecords
          .slice()
          .reverse()
          .forEach((record, index) => {
            const number = staticCards.length + index + 1;
            container.prepend(createManagedCard(record, number));
          });

        if (limit && records.length) {
          Array.from(container.children).slice(limit).forEach((card) => card.remove());
        }
      });
    } catch (error) {
      console.error("Unable to load locally managed gallery cases.", error);
    }
  }

  window.DentivaGalleryStore = store;
  document.addEventListener("DOMContentLoaded", renderManagedGalleries);
})();
