import {useState} from 'react';
import {register, login} from '../api/auth';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import InputField from '../components/InputField';
import Modal from '../components/Modal';
import { validateUsername, validatePassword, validatePasswordConfirmation } from '../utils/validation';
import { UserPlus, LogIn, AlertCircle, CheckCircle } from 'lucide-react';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const {login: doLogin} = useAuth();
    const navigate = useNavigate();

    const validateForm = (): boolean => {
        const usernameValidation = validateUsername(username);
        const passwordValidation = validatePassword(password);
        const confirmPasswordValidation = validatePasswordConfirmation(password, confirmPassword);

        setUsernameError(usernameValidation.isValid ? '' : usernameValidation.error || '');
        setPasswordError(passwordValidation.isValid ? '' : passwordValidation.error || '');
        setConfirmPasswordError(confirmPasswordValidation.isValid ? '' : confirmPasswordValidation.error || '');

        return usernameValidation.isValid && passwordValidation.isValid && confirmPasswordValidation.isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await register(username, password);
            const response = await login(username, password);
            doLogin(response.token, response.user);
            navigate('/tickets');
        } catch (err: any) {
            console.error('Registration failed', err);
            setErrorMessage(
                err?.response?.data?.message || 
                'Registration failed. Username might already be taken.'
            );
            setShowErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full animate-scale-in">
                    <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                        <div className="text-center">
                            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <UserPlus className="h-6 w-6 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Create Account
                            </h2>
                            <p className="text-gray-600">Join us and start managing your tickets</p>
                        </div>

                        <div className="space-y-4">
                            <InputField
                                type="text"
                                label="Username"
                                value={username}
                                onChange={setUsername}
                                placeholder="Choose a username"
                                required
                                error={usernameError}
                            />

                            <InputField
                                type="password"
                                label="Password"
                                value={password}
                                onChange={setPassword}
                                placeholder="Create a password"
                                required
                                error={passwordError}
                                showPasswordToggle
                            />

                            <InputField
                                type="password"
                                label="Confirm Password"
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                placeholder="Confirm your password"
                                required
                                error={confirmPasswordError}
                                showPasswordToggle
                            />
                        </div>

                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-blue-900 mb-1">Password Requirements:</p>
                                    <ul className="space-y-1 text-blue-800">
                                        <li>• At least 6 characters long</li>
                                        <li>• Contains at least one letter and one number</li>
                                        <li>• Both passwords must match</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-success w-full py-3 rounded-lg text-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <UserPlus size={20} />
                            )}
                            {isLoading ? 'Creating Account...' : 'Create Account'}
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
                            className="btn btn-secondary w-full py-3 rounded-lg text-lg font-medium flex items-center justify-center gap-2"
                        >
                            <LogIn size={20} />
                            Sign In
                        </button>
                    </form>
                </div>
            </div>

            <Modal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title="Registration Failed"
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