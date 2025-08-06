import React from 'react';
import type { Comment } from '../../../shared/types/comment';

interface CommentItemProps {
  comment: Comment;
  canDelete: boolean;
  onDelete: (id: string) => void;
}


const commentStyle: React.CSSProperties = {
  background: '#f5f7fa',
  borderRadius: 8,
  padding: '12px 16px',
  marginBottom: 12,
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  fontSize: 15,
  lineHeight: 1.6,
  position: 'relative',
  listStyle: 'none',
};

const metaStyle: React.CSSProperties = {
  color: '#888',
  fontSize: 13,
  marginBottom: 4,
};

const contentStyle: React.CSSProperties = {
  marginBottom: 6,
  color: '#222',
};

const deleteBtnStyle: React.CSSProperties = {
  marginLeft: 8,
  background: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: 4,
  padding: '2px 10px',
  fontSize: 13,
  cursor: 'pointer',
  float: 'right',
};

const CommentItem: React.FC<CommentItemProps> = ({ comment, canDelete, onDelete }) => (
  <li style={commentStyle}>
    <div style={metaStyle}>
      <b>{comment.user.username}</b> &middot; {new Date(comment.createdAt).toLocaleString()}
      {canDelete && (
        <button onClick={() => onDelete(comment._id)} style={deleteBtnStyle}>Delete</button>
      )}
    </div>
    <div style={contentStyle}>{comment.content}</div>
  </li>
);

export default CommentItem;
