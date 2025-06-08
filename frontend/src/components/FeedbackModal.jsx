import { useState } from "react";
import {
    X,
    ChevronDown
} from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose }) => {
    const [selectedTopic, setSelectedTopic] = useState('');
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);

    const topics = [
        'Bug Report',
        'Feature Request',
        'General Feedback',
        'UI/UX Improvement',
        'Performance Issue',
        'Other'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Add send logic here
        console.log('Feedback submitted:', { selectedTopic, feedback, rating });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
        {/* <div className="fixed inset-0 bg-white/20 backdrop-blur-lg flex items-center justify-center z-[60] p-4"> */}
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900">Send Feedback</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Topic Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Select a topic...
                        </label>
                        <div className="relative">
                            <select
                                value={selectedTopic}
                                onChange={(e) => setSelectedTopic(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-slate-700"
                                required
                            >
                                <option value="">Select a topic...</option>
                                {topics.map((topic) => (
                                    <option key={topic} value={topic}>
                                        {topic}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Feedback Textarea */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Your feedback...
                        </label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Your feedback..."
                            rows={4}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-700"
                            required
                        />
                    </div>

                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Rate your experience
                        </label>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${star <= rating
                                            ? 'bg-yellow-100 text-yellow-500'
                                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                        }`}
                                >
                                    {star === 1 && '😞'}
                                    {star === 2 && '😕'}
                                    {star === 3 && '😐'}
                                    {star === 4 && '🙂'}
                                    {star === 5 && '😊'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Send Button */}
                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-lg hover:bg-slate-800 transition-colors font-medium"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;