import {useState} from 'react';
import {register, login} from '../api/auth';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {login: doLogin} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(username, password);
            const response = await login(username, password);
            doLogin(response.token, response.user);
            navigate('/tickets');
        } catch (err) {
            console.error('Registration failed', err);
            alert('Registration failed');
        }
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full animate-scale-in">
                <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                        Create Account
                    </h2>

                    <div className="space-y-4">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            required
                        />

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-success w-full py-3 rounded-lg text-lg font-medium"
                    >
                        Register
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"/>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLoginClick}
                        className="btn btn-secondary w-full py-3 rounded-lg text-lg font-medium"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}