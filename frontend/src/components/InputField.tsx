import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputFieldProps {
    type?: 'text' | 'password' | 'email';
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    showPasswordToggle?: boolean;
    className?: string;
}

export default function InputField({ 
    type = 'text', 
    label, 
    value, 
    onChange, 
    placeholder, 
    required = false,
    error,
    showPasswordToggle = false,
    className = ''
}: InputFieldProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState(false);

    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

    const handleBlur = () => {
        setTouched(true);
    };

    const hasError = touched && error;

    return (
        <div className={`space-y-1 ${className}`}>
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
                <input
                    type={inputType}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        hasError 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300 hover:border-gray-400'
                    } ${showPasswordToggle ? 'pr-12' : ''}`}
                />
                {showPasswordToggle && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
            {hasError && (
                <p className="text-sm text-red-600 animate-fade-in">{error}</p>
            )}
        </div>
    );
}