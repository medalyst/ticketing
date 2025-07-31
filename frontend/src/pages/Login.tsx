import { useState } from 'react';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  container: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    padding: '32px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    minWidth: '300px',
  },
  title: {
    textAlign: 'center' as const,
    margin: '0 0 16px 0',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  button: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  registerButton: {
    padding: '12px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  divider: {
    textAlign: 'center' as const,
    color: '#666',
    margin: '8px 0',
  },
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login: doLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await login(username, password);
      doLogin(token);
      navigate('/tickets');
    } catch (err) {
        console.error('Login failed', err);
      alert('Login failed');
    }
  };

   const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Login</h2>
        <input style={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
        <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
        <button style={styles.button} type="submit">Login</button>

        <div style={styles.divider}>or</div>
        
        <button 
          type="button" 
          style={styles.registerButton}
          onClick={handleRegisterClick}
        >
          Create Account
        </button>
      </form>
    </div>
  );
}
