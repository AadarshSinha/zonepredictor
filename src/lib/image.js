const MAX_SIZE = 1 * 1024 * 1024; // 1MB — above this we re-encode before upload
const MAX_WIDTH = 1280;
const QUALITY = 0.8;

/**
 * Shrink oversized screenshots in the browser so phone uploads stay fast and
 * comfortably under the backend's size limit.
 *
 * Files already under the threshold are returned untouched — no re-encode, no
 * quality loss, and no canvas dependency on that path.
 */
export function prepareImageForUpload(file) {
  return new Promise((resolve, reject) => {
    if (file.size <= MAX_SIZE) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () =>
        reject(new Error("That file could not be opened as an image."));

      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_WIDTH) {
          height = height * (MAX_WIDTH / width);
          width = MAX_WIDTH;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) =>
            blob
              ? resolve(blob)
              : reject(new Error("Could not compress that image.")),
          "image/jpeg",
          QUALITY
        );
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
}
