'use client';

import { useEffect, useRef, useState } from 'react';
import { FiExternalLink, FiLink, FiPlay, FiUpload, FiX, FiYoutube } from 'react-icons/fi';
import toast from 'react-hot-toast';
import YouTubePlayer from '@/components/news/YouTubePlayer';
import { getYouTubeStudioUploadUrl } from '@/constants/youtube';
import { getYouTubeWatchUrl, isValidYouTubeUrl } from '@/utils/youtube';

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function uploadVideoToYouTube(file, { title, description, privacyStatus, onProgress }) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title || file.name.replace(/\.[^.]+$/, ''));
    fd.append('description', description || '');
    fd.append('privacyStatus', privacyStatus || 'public');

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.min(90, Math.round((e.loaded / e.total) * 90)));
      }
    });
    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300 && data.success && data.data?.videoId) {
          if (onProgress) onProgress(100);
          resolve(data.data.videoId);
          return;
        }
        reject(new Error(data.message || 'YouTube पर अपलोड विफल'));
      } catch {
        reject(new Error('YouTube प्रतिक्रिया अमान्य'));
      }
    });
    xhr.addEventListener('error', () => reject(new Error('नेटवर्क त्रुटि — CORS/कनेक्शन विफल')));
    xhr.addEventListener('abort', () => reject(new Error('अपलोड रद्द')));
    xhr.open('POST', '/api/youtube/upload');
    xhr.send(fd);
  });
}

export default function YouTubeVideoField({
  value,
  onChange,
  articleTitle = '',
  articleExcerpt = '',
}) {
  const [tab, setTab] = useState(value?.trim() ? 'link' : 'upload');
  const [channelUrl, setChannelUrl] = useState('');
  const [channelId, setChannelId] = useState('');
  const [apiConfigured, setApiConfigured] = useState(false);
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState('public');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    fetch('/api/youtube/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setChannelUrl(data.data.channelUrl || '');
          setChannelId(data.data.channelId || '');
          setApiConfigured(data.data.apiConfigured === true);
          setYoutubeConnected(data.data.connected === true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [videoPreview]);

  const clearVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview('');
    setVideoTitle('');
    setVideoDescription('');
    setPrivacyStatus('public');
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error('केवल वीडियो फ़ाइल चुनें');
      return;
    }
    if (file.size > 512 * 1024 * 1024) {
      toast.error('वीडियो 512MB से छोटा होना चाहिए');
      return;
    }
    setVideoFile(file);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(URL.createObjectURL(file));

    // Prefill like YouTube Studio "Video details"
    const fallbackName = file.name.replace(/\.[^.]+$/, '');
    setVideoTitle((articleTitle || fallbackName).slice(0, 100));
    setVideoDescription((articleExcerpt || '').slice(0, 5000));
    setPrivacyStatus('public');
  };

  const openStudioUpload = () => {
    const url = getYouTubeStudioUploadUrl(channelId || undefined);
    const w = 900;
    const h = 700;
    const left = Math.max(0, (window.screen.width - w) / 2);
    const top = Math.max(0, (window.screen.height - h) / 2);
    popupRef.current = window.open(
      url,
      'cgfile-youtube-upload',
      `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
    if (!popupRef.current) {
      window.open(url, '_blank', 'noopener,noreferrer');
      toast('YouTube Studio नई टैब में खुला', { icon: 'ℹ️' });
    } else {
      toast.success('YouTube Studio अपलोड विंडो खुली');
    }
  };

  const handleDirectUpload = async () => {
    if (!videoFile) {
      toast.error('पहले मोबाइल/गैलरी से वीडियो चुनें');
      return;
    }
    if (!youtubeConnected) {
      toast.error('Admin → सेटिंग्स से पहले YouTube कनेक्ट करें');
      openStudioUpload();
      return;
    }
    if (!videoTitle.trim()) {
      toast.error('वीडियो शीर्षक आवश्यक है');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const videoId = await uploadVideoToYouTube(videoFile, {
        title: videoTitle.trim().slice(0, 100),
        description: videoDescription.trim().slice(0, 5000),
        privacyStatus,
        onProgress: setUploadProgress,
      });
      onChange(getYouTubeWatchUrl(videoId));
      setTab('link');
      clearVideo();
      toast.success('वीडियो CGFile चैनल पर अपलोड हो गया');
    } catch (err) {
      toast.error(err.message || 'अपलोड विफल');
    }
    setUploading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
          <FiPlay className="w-4 h-4 text-red-600" />
          YouTube वीडियो
        </h3>
        {channelUrl && (
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-red-600 hover:underline flex items-center gap-1"
          >
            <FiYoutube className="w-3.5 h-3.5" />
            CGFile चैनल
          </a>
        )}
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3">
        <button
          type="button"
          onClick={() => setTab('link')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
            tab === 'link'
              ? 'bg-white dark:bg-gray-900 text-red-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FiLink className="w-3.5 h-3.5" />
          लिंक जोड़ें
        </button>
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
            tab === 'upload'
              ? 'bg-white dark:bg-gray-900 text-red-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FiUpload className="w-3.5 h-3.5" />
          मोबाइल से अपलोड
        </button>
      </div>

      {tab === 'link' ? (
        <>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <p className="text-xs text-gray-400 mt-2">
            YouTube, youtu.be, Shorts या embed लिंक समर्थित हैं
          </p>
          {value?.trim() && (
            <div className="mt-3">
              {isValidYouTubeUrl(value) ? (
                <YouTubePlayer url={value} title="YouTube preview" />
              ) : (
                <p className="text-xs text-red-500">अमान्य YouTube URL</p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
         
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {!videoFile ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 hover:border-red-400 hover:text-red-600 transition-colors flex flex-col items-center gap-2"
            >
              <FiUpload className="w-6 h-6" />
              <span>कैमरा / गैलरी से वीडियो चुनें</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {videoPreview && (
                  <video
                    src={videoPreview}
                    controls
                    playsInline
                    className="w-full max-h-48 bg-black object-contain"
                  />
                )}
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 flex items-center justify-between gap-2 text-xs">
                  <span className="text-gray-600 dark:text-gray-300 truncate">{videoFile.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-gray-400">{formatFileSize(videoFile.size)}</span>
                    <button
                      type="button"
                      onClick={clearVideo}
                      disabled={uploading}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                      title="हटाएँ"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Video details — like YouTube Studio */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-3 bg-gray-50/70 dark:bg-gray-800/40">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Video details</h4>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Title (required)
                  </label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value.slice(0, 100))}
                    maxLength={100}
                    disabled={uploading}
                    placeholder="वीडियो का शीर्षक"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-[10px] text-gray-400 text-right mt-0.5">{videoTitle.length}/100</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value.slice(0, 5000))}
                    maxLength={5000}
                    rows={4}
                    disabled={uploading}
                    placeholder="Tell viewers about your video..."
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                  <p className="text-[10px] text-gray-400 text-right mt-0.5">{videoDescription.length}/5000</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Visibility
                  </label>
                  <select
                    value={privacyStatus}
                    onChange={(e) => setPrivacyStatus(e.target.value)}
                    disabled={uploading}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </select>
                </div>

               
              </div>
            </div>
          )}

          {uploading && (
            <div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">अपलोड हो रहा है… {uploadProgress}%</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {youtubeConnected && apiConfigured ? (
              <button
                type="button"
                onClick={handleDirectUpload}
                disabled={!videoFile || uploading || !videoTitle.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <FiYoutube className="w-4 h-4" />
                {uploading ? 'अपलोड हो रहा है…' : 'CGFile चैनल पर अपलोड'}
              </button>
            ) : null}
            {/* <button
              type="button"
              onClick={openStudioUpload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <FiExternalLink className="w-4 h-4" />
              YouTube Studio खोलें
            </button> */}
          </div>

          {!youtubeConnected && apiConfigured && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              सीधे अपलोड के लिए{' '}
              <a href="/admin/settings" className="underline font-medium">
                Admin → सेटिंग्स
              </a>{' '}
              से Google अकाउंट कनेक्ट करें।
            </p>
          )}

          <button
            type="button"
            onClick={() => setTab('link')}
            className="text-xs text-red-600 hover:underline"
          >
            पहले से अपलोड है? लिंक जोड़ें →
          </button>
        </div>
      )}
    </div>
  );
}
