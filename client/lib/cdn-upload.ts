const UPLOAD_API = "https://disruptinglabs.com/data/api/uploadImages.php";
const BASE_URL = "https://disruptinglabs.com/data/api";
const MAIN_FOLDER = "bolsadecafe";

/**
 * Uploads a file to the Disrupting Labs CDN and returns the public URL.
 * @param file     The File object to upload.
 * @param uploadId Subfolder/namespace on the CDN (e.g. "blog-42", "blog-temp-1234567890").
 */
export async function uploadImageToCDN(
  file: File,
  uploadId: string,
): Promise<string> {
  const formData = new FormData();
  formData.append("main_folder", MAIN_FOLDER);
  formData.append("id", uploadId);
  formData.append("main_image", file);

  const res = await fetch(UPLOAD_API, { method: "POST", body: formData });

  if (!res.ok) {
    throw new Error(`CDN request failed: ${res.status}`);
  }

  const data = await res.json();

  if (!data.success || !data.main_image?.path) {
    throw new Error("CDN upload failed: " + (data.error ?? "unknown error"));
  }

  return BASE_URL + data.main_image.path;
}
