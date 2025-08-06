import React, { useEffect, useState, useContext } from 'react';
import CommentItem from '../components/CommentItem';
import CommentForm from '../components/CommentForm';
import { useParams } from 'react-router-dom';
import { fetchComments, addComment, deleteComment } from '../api/comments';
import { fetchTicket } from '../api/tickets';
import { AuthContext } from '../context/AuthContext';
import type { Comment } from '../../../shared/types/comment';

const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(AuthContext);
  const [ticket, setTicket] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const t = await fetchTicket(id);
      setTicket(t);
      const c = await fetchComments(id);
      setComments(Array.isArray(c) ? c : []);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;
    const comment = await addComment(id, newComment);
    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment(commentId);
    setComments(comments.filter(c => c._id !== commentId));
  };

  if (loading) return <div>Loading...</div>;
  if (!ticket) return <div>Ticket not found</div>;

  const pageStyles = {
    container: {
      maxWidth: 700,
      margin: '40px auto',
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
      padding: 32,
      fontFamily: 'Segoe UI, Arial, sans-serif',
    },
    title: {
      fontSize: 28,
      fontWeight: 700,
      marginBottom: 8,
    },
    meta: {
      color: '#888',
      fontSize: 14,
      marginBottom: 8,
    },
    desc: {
      margin: '12px 0 0 0',
      color: '#444',
      fontSize: 16,
    },
    hr: {
      border: 0,
      borderTop: '1px solid #eee',
      margin: '32px 0 24px 0',
    },
    commentsTitle: {
      fontSize: 22,
      fontWeight: 600,
      marginBottom: 12,
    },
    commentList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    commentSection: {
      marginTop: 32,
      background: '#f9f9f9',
      borderRadius: 8,
      padding: 20,
    },
    commentForm: {
      marginTop: 24,
      padding: 20,
      background: '#f5f7fa',
      borderRadius: 8,
    },
  };

  return (
    <div style={pageStyles.container}>
      <h2 style={pageStyles.title}>Ticket Details</h2>
      <div>
        <div style={pageStyles.meta}><b>ID:</b> {ticket._id}</div>
        <div style={pageStyles.meta}><b>Status:</b> {ticket.status}</div>
        <div style={pageStyles.meta}><b>Created:</b> {new Date(ticket.createdAt).toLocaleString()}</div>
        <div style={pageStyles.meta}><b>Title:</b> {ticket.title}</div>
        {ticket.description && <div style={pageStyles.desc}><b>Description:</b> {ticket.description}</div>}
      </div>
      <hr style={pageStyles.hr} />
      <h3 style={pageStyles.commentsTitle}>Comments</h3>
      <ul style={pageStyles.commentList}>
        {Array.isArray(comments) && comments.map(comment => (
          <CommentItem
            key={comment._id}
            comment={comment}
            canDelete={user && comment.user._id === user.userId}
            onDelete={handleDelete}
          />
        ))}
      </ul>
      {user && (
        <section style={pageStyles.commentForm}>
          <h4 style={{ margin: 0, marginBottom: 12 }}>Leave a Comment</h4>
          <CommentForm
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onSubmit={handleAddComment}
          />
        </section>
      )}
    </div>
  );
};

export default TicketDetails;
