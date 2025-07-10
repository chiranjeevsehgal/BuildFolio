// components/ResumeUpload.jsx
import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap,
} from "lucide-react";
import axios from "axios";

const ResumeUpload = ({ onDataExtracted, showMessage }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error' | null
  const [hasAnalyzed, setHasAnalyzed] = useState(false); // Track if file has been analyzed
  const fileInputRef = useRef(null);

  // Supported file types
  const supportedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  const supportedExtensions = [".pdf", ".doc", ".docx"];

  // Validate file
  const validateFile = (file) => {
    if (!file) return { valid: false, error: "No file selected" };

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: "File size must be less than 10MB" };
    }

    // Check file type
    if (!supportedTypes.includes(file.type)) {
      return { valid: false, error: "Please upload a PDF, DOC, or DOCX file" };
    }

    return { valid: true };
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    const validation = validateFile(file);

    if (!validation.valid) {
      showMessage("error", validation.error);
      return;
    }

    setSelectedFile(file);
    setUploadStatus(null);
    setHasAnalyzed(false); // Reset analyzed state when new file is selected
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Clear selected file
  const clearFile = () => {
    setSelectedFile(null);
    setUploadStatus(null);
    setHasAnalyzed(false); // Reset analyzed state
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload and parse resume
  const handleUpload = async () => {
    if (!selectedFile) {
      showMessage("error", "Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("resume", selectedFile);

      // Make API call
      const response = await axios.post("/profiles/upload-resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 60 second timeout for resume processing
      });

      if (response.data.success) {
        setUploadStatus("success");
        setHasAnalyzed(true); // Mark as analyzed after successful processing
        // Call callback with extracted data
        if (onDataExtracted && response.data.data) {
          onDataExtracted(response.data.data);
        }
      } else {
        throw new Error(response.data.message || "Failed to parse resume");
      }
    } catch (error) {
      console.error("Resume upload error:", error);
      setUploadStatus("error");

      let errorMessage = "Failed to process resume. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Upload timed out. Please try with a smaller file.";
      } else if (!navigator.onLine) {
        errorMessage = "No internet connection. Please check your network.";
      }

      showMessage("error", errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200 w-full max-w-none">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4 sm:mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-slate-800">
            Quick Profile Setup
          </h3>
          <p className="text-sm text-slate-600">
            Upload your resume to auto-fill your profile information
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragging
            ? "border-blue-400 bg-blue-50"
            : selectedFile
              ? "border-green-400 bg-green-50"
              : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={supportedExtensions.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {!selectedFile ? (
          <>
            <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-3 sm:mb-4" />
            <h4 className="text-base sm:text-lg font-medium text-slate-700 mb-2">
              Upload your resume
            </h4>
            <p className="text-sm text-slate-500 mb-3 sm:mb-4 px-2">
              Drag and drop your file here, or click to browse
            </p>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            <div className="text-center sm:text-left">
              <p className="font-medium text-slate-700 break-words">
                {selectedFile.name}
              </p>
              <p className="text-sm text-slate-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
        )}

        {/* Upload Status */}
        {uploadStatus && (
          <div className="mt-4 flex items-center justify-center space-x-2">
            {uploadStatus === "success" ? (
              <>
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-600 font-medium text-center">
                  Resume processed successfully!
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-600 font-medium text-center">
                  Failed to process resume
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {selectedFile && (
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleUpload}
            disabled={isUploading || hasAnalyzed}
            className={`flex-1 cursor-pointer px-4 sm:px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base ${
              hasAnalyzed
                ? "bg-gray-400 text-white"
                : "bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700"
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span>Processing Resume...</span>
              </>
            ) : hasAnalyzed ? (
              <>
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Already Analyzed</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Extract Information</span>
                <span className="sm:hidden">Extract Info</span>
              </>
            )}
          </button>

          <button
            onClick={clearFile}
            disabled={isUploading}
            className="px-4 sm:px-6 py-3 border cursor-pointer border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
