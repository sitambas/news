'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiMessageSquare, FiThumbsUp, FiCornerUpLeft, FiSend, FiTrash2 } from 'react-icons/fi';
import { timeAgo } from '@/utils/helpers';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

function CommentItem({ comment, onReply, onDelete, currentUser }) {
  const isOwner = currentUser?.id === comment.author?._id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 font-bold text-sm flex-shrink-0">
          {comment.author?.avatar ? (
            <img src={comment.author.avatar} alt={comment.author.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            comment.author?.name?.[0] || 'U'
          )}
        </div>
        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/author/${comment.author?.username}`} className="font-semibold text-sm text-gray-900 dark:text-white hover:text-red-600">
                {comment.author?.name || 'अज्ञात'}
              </Link>
              <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
              {comment.isEdited && <span className="text-xs text-gray-400">(संपादित)</span>}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 ml-2">
            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 transition-colors">
              <FiThumbsUp className="w-3 h-3" />
              <span>{comment.likeCount || 0}</span>
            </button>
            <button
              onClick={() => onReply(comment)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 transition-colors"
            >
              <FiCornerUpLeft className="w-3 h-3" />
              जवाब दें
            </button>
            {isOwner && (
              <button
                onClick={() => onDelete(comment._id)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <FiTrash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <div className="ml-11 mt-2 space-y-3 pl-3 border-l-2 border-gray-100 dark:border-gray-800">
          {comment.replies.map((reply) => (
            <div key={reply._id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                {reply.author?.name?.[0] || 'U'}
              </div>
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-xs text-gray-900 dark:text-white">{reply.author?.name}</span>
                  <span className="text-xs text-gray-400">{timeAgo(reply.createdAt)}</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function CommentSection({ articleId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!articleId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/comments?articleId=${articleId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setComments(data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [articleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      toast.error('टिप्पणी के लिए लॉगिन करें');
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          content: newComment,
          parentId: replyTo?._id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (replyTo) {
          setComments((prev) =>
            prev.map((c) =>
              c._id === replyTo._id
                ? { ...c, replies: [...(c.replies || []), data.data] }
                : c
            )
          );
        } else {
          setComments((prev) => [data.data, ...prev]);
        }
        setNewComment('');
        setReplyTo(null);
        toast.success('टिप्पणी पोस्ट हुई!');
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('टिप्पणी पोस्ट करने में विफल');
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        toast.success('टिप्पणी हटाई गई');
      }
    } catch {
      toast.error('टिप्पणी हटाने में विफल');
    }
  };

  return (
    <section id="comments" className="mt-10">
      <div className="flex items-center gap-2 mb-6">
        <FiMessageSquare className="w-5 h-5 text-red-600" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          टिप्पणियाँ ({comments.length})
        </h3>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
        {replyTo && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
            <span className="text-gray-500">जवाब दें</span>
            <span className="font-semibold text-gray-900 dark:text-white">{replyTo.author?.name}</span>
            <button onClick={() => setReplyTo(null)} className="ml-auto text-gray-400 hover:text-red-600">✕</button>
          </div>
        )}
        {isAuthenticated() ? (
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 font-bold text-sm flex-shrink-0">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 flex items-end gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="अपने विचार साझा करें..."
                rows={2}
                className="flex-1 resize-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">बातचीत में शामिल हों</p>
            <div className="flex justify-center gap-3">
              <Link href="/auth/login" className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                टिप्पणी के लिए लॉगिन करें
              </Link>
              <Link href="/auth/register" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                साइन अप
              </Link>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-6">टिप्पणियाँ लोड हो रही हैं...</p>
      ) : comments.length > 0 ? (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onReply={setReplyTo}
              onDelete={handleDelete}
              currentUser={user}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-6">अभी कोई टिप्पणी नहीं — पहली टिप्पणी करें</p>
      )}
    </section>
  );
}
