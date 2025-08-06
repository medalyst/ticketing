import React, { useState } from 'react';

interface CommentFormProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
}

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  resize: 'vertical',
  borderRadius: 6,
  border: '1px solid #ccc',
  padding: '10px 12px',
  fontSize: 15,
  fontFamily: 'inherit',
  background: '#f9f9f9',
  boxSizing: 'border-box',
};

const buttonStyle: React.CSSProperties = {
  alignSelf: 'flex-end',
  background: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: 4,
  padding: '8px 20px',
  fontSize: 15,
  fontWeight: 500,
  cursor: 'pointer',
  opacity: 1,
  transition: 'opacity 0.2s',
};

const buttonDisabledStyle: React.CSSProperties = {
  ...buttonStyle,
  opacity: 0.6,
  cursor: 'not-allowed',
};

const CommentForm: React.FC<CommentFormProps> = ({ value, onChange, onSubmit, loading }) => {
  const [error, setError] = useState<string | null>(null);

  const validate = (val: string) => {
    if (!val.trim()) return 'Comment is required.';
    if (val.trim().length < 2) return 'Comment must be at least 2 characters.';
    if (val.length > 300) return 'Comment must be less than 300 characters.';
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
    setError(validate(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    const err = validate(value);
    setError(err);
    if (err) {
      e.preventDefault();
      return;
    }
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle} noValidate>
      <textarea
        value={value}
        onChange={handleChange}
        required
        rows={3}
        style={textareaStyle}
        placeholder="Write your comment here..."
        disabled={loading}
        maxLength={300}
      />
      {error && <span style={{ color: 'red', fontSize: 13 }}>{error}</span>}
      <button
        type="submit"
        style={loading || !value.trim() || !!error ? buttonDisabledStyle : buttonStyle}
        disabled={loading || !value.trim() || !!error}
      >
        {loading ? 'Adding...' : 'Add Comment'}
      </button>
    </form>
  );
};

export default CommentForm;
