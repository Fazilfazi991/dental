(function () {
  const form = document.querySelector("#gallery-upload-form");
  const preview = document.querySelector("#case-preview");
  const list = document.querySelector("#managed-case-list");
  const count = document.querySelector("#managed-count");
  const status = document.querySelector("#admin-status");
  const layoutInputs = document.querySelectorAll('input[name="layout"]');
  const uploadGroups = document.querySelectorAll("[data-upload-mode]");

  if (!form || !window.DentivaGalleryStore) return;

  function selectedLayout() {
    return form.elements.layout.value;
  }

  function setStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle("is-error", Boolean(isError));
  }

  function updateUploadMode() {
    const layout = selectedLayout();
    uploadGroups.forEach((group) => {
      group.hidden = group.dataset.uploadMode !== layout;
    });
    renderPreview();
  }

  function fileUrl(input) {
    return input.files[0] ? URL.createObjectURL(input.files[0]) : "";
  }

  function renderPreview() {
    const layout = selectedLayout();
    const title = form.elements.title.value.trim() || "Smile Transformation";
    const beforeUrl = fileUrl(form.elements.beforeImage);
    const afterUrl = fileUrl(form.elements.afterImage);
    const combinedUrl = fileUrl(form.elements.combinedImage);

    preview.replaceChildren();
    const card = document.createElement("article");
    card.className = "gallery-case is-visible";
    card.innerHTML = `<div class="case-head"><span>New Case</span><strong></strong></div>`;
    card.querySelector("strong").textContent = title;

    if (layout === "combined" && combinedUrl) {
      card.insertAdjacentHTML("beforeend", `<figure class="single-result"><img src="${combinedUrl}" alt="Combined case preview" /></figure>`);
    } else if (layout === "pair" && beforeUrl && afterUrl) {
      card.insertAdjacentHTML(
        "beforeend",
        `<div class="before-after"><figure><img src="${beforeUrl}" alt="Before preview" /><figcaption>Before</figcaption></figure><figure><img src="${afterUrl}" alt="After preview" /><figcaption>After</figcaption></figure></div>`
      );
    } else {
      preview.innerHTML = "<p>Select the required image files to preview this case.</p>";
      return;
    }

    preview.appendChild(card);
  }

  async function renderLibrary() {
    const records = await window.DentivaGalleryStore.getAll();
    count.textContent = `${records.length} ${records.length === 1 ? "case" : "cases"}`;
    list.replaceChildren();

    if (!records.length) {
      list.innerHTML = '<p class="admin-empty">No locally managed cases yet.</p>';
      return;
    }

    records.forEach((record) => {
      const item = document.createElement("article");
      item.className = "admin-case-item";
      const thumbBlob = record.layout === "combined" ? record.combinedImage : record.afterImage;
      const thumbUrl = URL.createObjectURL(thumbBlob);
      item.innerHTML = `<img src="${thumbUrl}" alt="" /><div><strong></strong><span></span></div><button type="button" aria-label="Delete case">Delete</button>`;
      item.querySelector("strong").textContent = record.title;
      item.querySelector("span").textContent = record.layout === "combined" ? "Combined image" : "Before and after";
      item.querySelector("button").addEventListener("click", async () => {
        await window.DentivaGalleryStore.remove(record.id);
        setStatus("Case removed from the local gallery.");
        renderLibrary();
      });
      list.appendChild(item);
    });
  }

  layoutInputs.forEach((input) => input.addEventListener("change", updateUploadMode));
  form.addEventListener("input", renderPreview);
  form.addEventListener("change", renderPreview);
  form.addEventListener("reset", () => {
    setTimeout(() => {
      updateUploadMode();
      setStatus("");
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const layout = selectedLayout();
    const beforeImage = form.elements.beforeImage.files[0];
    const afterImage = form.elements.afterImage.files[0];
    const combinedImage = form.elements.combinedImage.files[0];

    if (layout === "pair" && (!beforeImage || !afterImage)) {
      setStatus("Choose both the before and after images.", true);
      return;
    }
    if (layout === "combined" && !combinedImage) {
      setStatus("Choose a combined before-and-after image.", true);
      return;
    }

    try {
      await window.DentivaGalleryStore.add({
        id: crypto.randomUUID ? crypto.randomUUID() : `case-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: form.elements.title.value.trim() || "Smile Transformation",
        layout,
        beforeImage: layout === "pair" ? beforeImage : null,
        afterImage: layout === "pair" ? afterImage : null,
        combinedImage: layout === "combined" ? combinedImage : null,
        createdAt: Date.now()
      });
      form.reset();
      updateUploadMode();
      setStatus("Case published to this browser's gallery.");
      renderLibrary();
    } catch (error) {
      console.error(error);
      setStatus("The case could not be saved. Try a smaller image or another browser.", true);
    }
  });

  updateUploadMode();
  renderLibrary();
})();
