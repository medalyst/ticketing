import { useState } from 'react';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/InputField';
import Modal from '../components/Modal';
import { validateUsername, validatePassword } from '../utils/validation';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const { login: doLogin } = useAuth();
    const navigate = useNavigate();

    const validateForm = (): boolean => {
        const usernameValidation = validateUsername(username);
        const passwordValidation = validatePassword(password);

        setUsernameError(usernameValidation.isValid ? '' : usernameValidation.error || '');
        setPasswordError(passwordValidation.isValid ? '' : passwordValidation.error || '');

        return usernameValidation.isValid && passwordValidation.isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await login(username, password);
            doLogin(response.token, response.user);
            navigate('/tickets');
        } catch (err: any) {
            console.error('Login failed', err);
            setErrorMessage(
                err?.response?.data?.message || 
                'Login failed. Please check your credentials and try again.'
            );
            setShowErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full animate-scale-in">
                    <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                        <div className="text-center">
                            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <LogIn className="h-6 w-6 text-blue-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-gray-600">Sign in to your account</p>
                        </div>

                        <div className="space-y-4">
                            <InputField
                                type="text"
                                label="Username"
                                value={username}
                                onChange={setUsername}
                                placeholder="Enter your username"
                                required
                                error={usernameError}
                            />

                            <InputField
                                type="password"
                                label="Password"
                                value={password}
                                onChange={setPassword}
                                placeholder="Enter your password"
                                required
                                error={passwordError}
                                showPasswordToggle
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full py-3 rounded-lg text-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <LogIn size={20} />
                            )}
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">or</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleRegisterClick}
                            className="btn btn-secondary w-full py-3 rounded-lg text-lg font-medium flex items-center justify-center gap-2"
                        >
                            <UserPlus size={20} />
                            Create Account
                        </button>
                    </form>
                </div>
            </div>

            <Modal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title="Login Failed"
            >
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-gray-700 mb-4">{errorMessage}</p>
                        <button
                            onClick={() => setShowErrorModal(false)}
                            className="btn btn-primary px-4 py-2 rounded-lg"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}