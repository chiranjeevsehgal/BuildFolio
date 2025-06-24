import { ArrowLeft, Clock, RefreshCw, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';

const ForgotPasswordOTPVerification = ({ email, onVerified, onBack, tempToken, onResend, axios }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [canResend, setCanResend] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const inputRefs = useRef([]);

    // Timer effect
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendCooldown]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleInputChange = (index, value) => {
        // Only allow numeric input
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError(''); // Clear error when user types

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all fields are filled
        if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
            handleVerifyOTP(newOtp.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        // Handle enter
        if (e.key === 'Enter') {
            e.preventDefault();
            handleVerifyOTP(otp.join(''));
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

        if (pasteData.length === 6) {
            const newOtp = pasteData.split('');
            setOtp(newOtp);
            setError('');

            // Focus last input
            inputRefs.current[5]?.focus();

            // Auto-submit
            handleVerifyOTP(pasteData);
        }
    };

    const handleVerifyOTP = async (otpValue) => {
        if (otpValue.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('/auth/verify-reset-otp', {
                otp: otpValue,
                tempToken
            });

            if (response.data.success) {
                onVerified(response.data.resetToken, response.data.email);
            } else {
                toast.error(response.data.message || 'Invalid verification code')

                // Clear OTP inputs on error
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            console.error('OTP verification error:', error);

            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error('Failed to verify code. Please try again.')
            }

            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResend || isResending) return;

        setIsResending(true);
        setError('');

        try {
            const newTempToken = await onResend(tempToken);

            if (newTempToken) {
                // Reset timer and disable resend for 60 seconds
                setTimeLeft(600);
                setResendCooldown(60);
                setCanResend(false);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            setError('Failed to resend code. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const clearOTP = () => {
        setOtp(['', '', '', '', '', '']);
        setError('');
        inputRefs.current[0]?.focus();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
                    <Lock className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    Reset Password
                </h2>
                <p className="text-slate-600">
                    We've sent a 6-digit reset code to
                </p>
                <p className="font-semibold text-slate-800">{email}</p>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span>Code expires in: {formatTime(timeLeft)}</span>
            </div>

            {/* OTP Input */}
            <div className="space-y-4">
                <div className="flex justify-center space-x-3">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            disabled={isLoading}
                            className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                  transition-all duration-200 bg-slate-50 focus:bg-white placeholder:!text-gray-400
                  ${error ? 'border-red-300 bg-red-50' : 'border-slate-300'}
                  ${digit ? 'border-blue-400 bg-blue-50' : ''}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                            placeholder="-"
                        />
                    ))}
                </div>

                {/* Helper Text */}
                <p className="text-center text-sm text-slate-500">
                    Enter the 6-digit reset code sent to your email
                </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                <button
                    onClick={() => handleVerifyOTP(otp.join(''))}
                    disabled={isLoading || otp.join('').length !== 6}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 cursor-pointer text-white py-3 px-4 
              rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 
              font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed 
              flex items-center justify-center"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Verifying...
                        </>
                    ) : (
                        'Verify Code'
                    )}
                </button>

                {/* Resend Button */}
                <div className="flex items-center justify-center space-x-4 text-sm">
                    <span className="text-slate-600">Didn't receive the code?</span>
                    <button
                        onClick={handleResendOTP}
                        disabled={!canResend || isResending || resendCooldown > 0}
                        className="text-blue-600 hover:text-blue-700 cursor-pointer font-semibold transition-colors 
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                        {isResending ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Sending...</span>
                            </>
                        ) : resendCooldown > 0 ? (
                            <span>Resend in {resendCooldown}s</span>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                <span>Resend Code</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Utility Buttons */}
                <div className="flex space-x-3">
                    <button
                        onClick={onBack}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center px-4 py-2 border cursor-pointer border-slate-300 
                rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200  
                disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </button>

                    <button
                        onClick={clearOTP}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-xl cursor-pointer text-slate-700 
                bg-white hover:bg-slate-50 transition-all duration-200 
                disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Security Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Security Note</p>
                        <p>Never share this reset code with anyone. Our team will never ask for this code.</p>
                    </div>
                </div>
            </div>
            <Toaster
                    position="top-center"
                    reverseOrder={true}
                  />
        </div>
    );
};

export default ForgotPasswordOTPVerification;