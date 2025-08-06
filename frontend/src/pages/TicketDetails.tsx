import React, { useEffect, useState, useContext } from 'react';
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
      setComments(c);
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

  return (
    <div>
      <h2>Ticket Details</h2>
      <div>
        <strong>{ticket.name}</strong> (#{ticket.number})<br />
        Status: {ticket.status}<br />
        Created: {new Date(ticket.createdAt).toLocaleString()}
      </div>
      <hr />
      <h3>Comments</h3>
      <ul>
        {comments.map(comment => (
          <li key={comment._id}>
            <b>{comment.user.username}</b> ({new Date(comment.createdAt).toLocaleString()}):<br />
            {comment.content}
            {user && comment.user._id === user._id && (
              <button onClick={() => handleDelete(comment._id)} style={{ marginLeft: 8 }}>Delete</button>
            )}
          </li>
        ))}
      </ul>
      {user && (
        <form onSubmit={handleAddComment}>
          <textarea value={newComment} onChange={e => setNewComment(e.target.value)} required />
          <br />
          <button type="submit">Add Comment</button>
        </form>
      )}
    </div>
  );
};

export default TicketDetails;
