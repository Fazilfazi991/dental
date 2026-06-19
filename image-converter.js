const converterForm = document.querySelector("#image-converter-form");
const converterFile = document.querySelector("#converter-file");
const converterFormat = document.querySelector("#converter-format");
const converterQuality = document.querySelector("#converter-quality");
const qualityValue = document.querySelector("#quality-value");
const converterPreview = document.querySelector("#converter-preview");
const converterStatus = document.querySelector("#converter-status");
const converterDownload = document.querySelector("#converter-download");

let previewUrl = "";
let downloadUrl = "";

const revokeUrl = (url) => {
  if (url) {
    URL.revokeObjectURL(url);
  }
};

const setStatus = (message, isError = false) => {
  converterStatus.textContent = message;
  converterStatus.classList.toggle("is-error", isError);
};

if (converterQuality && qualityValue) {
  converterQuality.addEventListener("input", () => {
    qualityValue.textContent = `${converterQuality.value}%`;
  });
}

if (converterFile && converterPreview) {
  converterFile.addEventListener("change", () => {
    revokeUrl(previewUrl);
    revokeUrl(downloadUrl);
    downloadUrl = "";
    converterDownload.hidden = true;
    converterDownload.removeAttribute("href");

    const file = converterFile.files?.[0];
    if (!file) {
      converterPreview.innerHTML = "<span>No image selected</span>";
      setStatus("");
      return;
    }

    previewUrl = URL.createObjectURL(file);
    converterPreview.innerHTML = `<img src="${previewUrl}" alt="Selected image preview" />`;
    setStatus(`${file.name} selected.`);
  });
}

if (converterForm) {
  converterForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = converterFile.files?.[0];
    if (!file) {
      setStatus("Please upload an image first.", true);
      return;
    }

    const submitButton = converterForm.querySelector("button[type='submit']");
    submitButton.disabled = true;
    setStatus("Converting image...");
    revokeUrl(downloadUrl);
    converterDownload.hidden = true;
    converterDownload.removeAttribute("href");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("format", converterFormat.value);
      formData.append("quality", converterQuality.value);

      const response = await fetch("/api/convert-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unable to convert image." }));
        throw new Error(error.error || "Unable to convert image.");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const fallbackName = `converted-image.${converterFormat.value === "jpeg" ? "jpg" : converterFormat.value}`;
      const filename = /filename="([^"]+)"/.exec(disposition)?.[1] || fallbackName;

      downloadUrl = URL.createObjectURL(blob);
      converterDownload.href = downloadUrl;
      converterDownload.download = filename;
      converterDownload.hidden = false;
      setStatus(`Converted successfully. New file size: ${(blob.size / 1024).toFixed(1)} KB.`);
    } catch (error) {
      setStatus(error.message, true);
    } finally {
      submitButton.disabled = false;
    }
  });
}
