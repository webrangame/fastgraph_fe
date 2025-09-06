'use client';
import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Check, AlertCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SecuritySettings() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      length: password.length >= minLength,
      uppercase: hasUpperCase,
      lowercase: hasLowerCase,
      number: hasNumbers,
      special: hasSpecial
    };
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    // Validation
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const validation = validatePassword(formData.newPassword);
      if (!validation.length || !validation.uppercase || !validation.lowercase || !validation.number) {
        newErrors.newPassword = 'Password must meet all requirements below';
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call for UI demo
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Password changed successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
    } catch (err) {
      toast.error('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validation = validatePassword(formData.newPassword);

  return (
    <div className="theme-card-bg rounded-lg p-6 theme-border border theme-shadow">
      <div className="flex items-center mb-6">
        <Shield className="w-6 h-6 theme-text-primary mr-3" />
        <h2 className="text-xl font-semibold theme-text-primary">Security Settings</h2>
      </div>
      
      <div className="space-y-6">
        {/* Password Security Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <Lock className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                Password Security
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Choose a strong password to keep your account secure. We recommend using a unique password that you don't use elsewhere.
              </p>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div>
          <h3 className="text-lg font-medium theme-text-primary mb-4">Change Password</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block theme-text-secondary text-sm font-medium mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className={`w-full py-3 px-4 theme-input-bg theme-border theme-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 pr-12 ${
                    errors.currentPassword ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Enter your current password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 theme-text-muted hover:theme-text-primary transition-colors"
                  disabled={isLoading}
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block theme-text-secondary text-sm font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className={`w-full py-3 px-4 theme-input-bg theme-border theme-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 pr-12 ${
                    errors.newPassword ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Enter your new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 theme-text-muted hover:theme-text-primary transition-colors"
                  disabled={isLoading}
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Requirements */}
              {formData.newPassword && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs theme-text-muted mb-2">Password must contain:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center text-xs">
                      <Check className={`w-3 h-3 mr-2 ${validation.length ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className={validation.length ? 'text-green-500' : 'theme-text-muted'}>
                        8+ characters
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <Check className={`w-3 h-3 mr-2 ${validation.uppercase ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className={validation.uppercase ? 'text-green-500' : 'theme-text-muted'}>
                        Uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <Check className={`w-3 h-3 mr-2 ${validation.lowercase ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className={validation.lowercase ? 'text-green-500' : 'theme-text-muted'}>
                        Lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <Check className={`w-3 h-3 mr-2 ${validation.number ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className={validation.number ? 'text-green-500' : 'theme-text-muted'}>
                        Number
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block theme-text-secondary text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full py-3 px-4 theme-input-bg theme-border theme-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 pr-12 ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Confirm your new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 theme-text-muted hover:theme-text-primary transition-colors"
                  disabled={isLoading}
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && formData.newPassword && (
                <div className="mt-2">
                  {formData.newPassword === formData.confirmPassword ? (
                    <p className="text-green-500 text-xs flex items-center">
                      <Check className="w-3 h-3 mr-1" />
                      Passwords match
                    </p>
                  ) : (
                    <p className="text-red-500 text-xs flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Passwords don't match
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                  isLoading
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Changing Password...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Security Options */}
        <div className="pt-6 border-t theme-border">
          <h3 className="text-lg font-medium theme-text-primary mb-4">Additional Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg theme-input-bg">
              <div>
                <h4 className="font-medium theme-text-primary">Two-Factor Authentication</h4>
                <p className="text-sm theme-text-muted">Add an extra layer of security to your account</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Enable
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg theme-input-bg">
              <div>
                <h4 className="font-medium theme-text-primary">Login Sessions</h4>
                <p className="text-sm theme-text-muted">Manage your active login sessions</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
