// features/feedback/components/SettingFeedback.tsx

import { useState } from "react";
import { Button } from "../../../components/widgets/button";
import { Input } from "../../../components/widgets/input";
import { Label } from "../../../components/widgets/label";
import { Textarea } from "../../../components/widgets/textarea";
import { useToastStore } from "../../../store/toastStore";
import { useFeedbackStore } from "../../../features/feedback/store/feedbackStore";

interface FeedbackFormProps {
  onSuccess?: () => void;
}

const SettingFeedback = ({ onSuccess }: FeedbackFormProps) => {
  const { sendFeedback, loading } = useFeedbackStore();
  const showToast = useToastStore(state => state.showToast);

  const [formData, setFormData] = useState({
    message: "",
    email: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({
    message: false
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors.message) {
      setErrors({ message: false });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.message.trim()) {
      setErrors({ message: true });
      showToast({
        type: 'error',
        message: 'Please enter your feedback message'
      });
      return;
    }

    // Send feedback
    const result = await sendFeedback(
      formData.message.trim(),
      formData.email.trim() || undefined
    );

    // Show toast
    showToast(result);

    // On success
    if (result.type === 'success') {
      setSubmitted(true);
      setFormData({ message: "", email: "" });

      if (onSuccess) onSuccess();
    }
  };

  // Success view
  if (submitted) {
    return (
      <div className="grid gap-4 rounded-md border border-primary/50 bg-primary/5 p-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className="w-8 h-8 text-primary"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </div>

        <div className="text-lg font-semibold text-primary">
          Thank you for your feedback!
        </div>
        
        <p className="text-sm text-gray-600">
          We appreciate you taking the time to help us improve the platform. 
          We'll review your feedback and get back to you if needed.
        </p>

        <Button
          variant="outline"
          onClick={() => setSubmitted(false)}
          className="mx-auto mt-2"
        >
          Send another message
        </Button>
      </div>
    );
  }

  // Form view
  return (
    <div className="flex flex-col justify-between w-full h-full">
      <div className="grid grid-cols-1 gap-6">
        <div className="grid gap-2">
          <Label htmlFor="message" required>
            Your Feedback
          </Label>
          <Textarea
            id="message"
            name="message"
            placeholder="What do you like? What should we improve? Any issues or ideas?"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            hasError={errors.message}
          />
        </div>

        <div className="grid gap-2">
          <Label required={false} htmlFor="email">
            Email for reply (optional)
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Leave empty to use your account email"
            value={formData.email}
            onChange={handleChange}
          />
          <p className="text-xs text-gray-500 mt-1">
            We'll use the email associated with your user account to contact you if needed.
            Only provide a different email here if your user account email is not available.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-8 pt-6">
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={loading || !formData.message.trim()}
          >
            {loading ? "Sending..." : "Submit Feedback"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingFeedback;