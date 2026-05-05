import { useState } from "react";
import { api } from "../api/client";

export default function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpload(e) {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(
        "/documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setMessage("File processed successfully.");
      setFile(null);

      if (onUploadSuccess) {
        onUploadSuccess(response.data.data);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Upload failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Upload Document</h2>
      <p className="muted">
        Upload PDF, JPG, JPEG, or PNG supplier/company form.
      </p>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Upload & Extract"}
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}