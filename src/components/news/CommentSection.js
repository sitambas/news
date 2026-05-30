'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiMessageSquare, FiThumbsUp, FiCornerUpLeft, FiSend, FiTrash2 } from 'react-icons/fi';
import { timeAgo } from '@/utils/helpers';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

function CommentItem({ comment, onReply, onDelete, currentUser }) {
  const [showReplies, setShowReplies] = useState(true);
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
                {comment.author?.name || 'Anonymous'}
              </Link>
              <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
              {comment.isEdited && <span className="text-xs text-gray-400">(edited)</span>}
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
              Reply
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

      {/* Replies */}
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
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  // Sample comments for demo
  const demoComments = [
    {
      _id: 'c1',
      author: { name: 'John Smith', username: 'johnsmith', avatar: '' },
      content: 'This is a historic moment. The question is whether countries will actually follow through on their commitments.',
      createdAt: new Date(Date.now() - 1000 * 60 * 15),
      likeCount: 12,
      replies: [
        {
          _id: 'r1',
          author: { name: 'Emma Davis', username: 'emmadavis' },
          content: 'Exactly. Track records have not been encouraging, but the verification mechanism this time seems more robust.',
          createdAt: new Date(Date.now() - 1000 * 60 * 10),
        }
      ],
    },
    {
      _id: 'c2',
      author: { name: 'Michael Chen', username: 'michaelchen', avatar: '' },
      content: 'The $2 trillion climate fund is the most significant part of this deal. That is real money that can drive actual change.',
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
      likeCount: 8,
      replies: [],
    },
  ];

  const displayComments = comments.length > 0 ? comments : demoComments;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      toast.error('Please login to comment');
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
        setComments((prev) => [data.data, ...prev]);
        setNewComment('');
        setReplyTo(null);
        toast.success('Comment posted!');
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to post comment');
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        toast.success('Comment deleted');
      }
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <section id="comments" className="mt-10">
      <div className="flex items-center gap-2 mb-6">
        <FiMessageSquare className="w-5 h-5 text-red-600" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Comments ({displayComments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
        {replyTo && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
            <span className="text-gray-500">Replying to</span>
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
                placeholder="Share your thoughts..."
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
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Join the conversation</p>
            <div className="flex justify-center gap-3">
              <Link href="/auth/login" className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                Login to Comment
              </Link>
              <Link href="/auth/register" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Comment List */}
      <div className="space-y-5">
        {displayComments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            onReply={setReplyTo}
            onDelete={handleDelete}
            currentUser={user}
          />
        ))}
      </div>
    </section>
  );
}
