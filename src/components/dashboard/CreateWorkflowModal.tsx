'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Plus, Upload, X, FileImage, FileVideo, FileText, File } from 'lucide-react';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkflowFormData) => void;
}

export interface WorkflowFormData {
  name: string;
  description: string;
  type: 'dynamic' | 'manual';
  files?: File[];
}

export function CreateWorkflowModal({ isOpen, onClose, onSubmit }: CreateWorkflowModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<WorkflowFormData>({
    defaultValues: {
      name: generateDefaultName(),
      description: '',
      type: 'dynamic'
    }
  });
  
  const formData = watch();

  // Generate a default workflow name
  function generateDefaultName(): string {
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
    return `Workflow ${timestamp}`;
  }

  // File handling functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      // Max file size: 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    const type = file.type.split('/')[0];
    if (type === 'image') return FileImage;
    if (type === 'video') return FileVideo;
    if (type === 'text' || file.type.includes('pdf')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        name: generateDefaultName(),
        description: '',
        type: 'dynamic'
      });
      setUploadedFiles([]);
    }
  }, [isOpen, reset]);

  const onSubmitHandler = async (data: WorkflowFormData) => {
    setIsSubmitting(true);
    
    // Include uploaded files in the form data
    const formDataWithFiles = {
      ...data,
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined
    };
    
    onSubmit(formDataWithFiles);
    handleClose();
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing during submission
    
    // Reset form
    reset({
      name: generateDefaultName(),
      description: '',
      type: 'dynamic'
    });
    setFocusedField(null);
    setIsSubmitting(false);
    setUploadedFiles([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Workflow"
      maxWidth="max-w-2xl"
      headerColor="blue"
      headerIcon="Workflow"
    >
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        {/* Workflow Name */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-1.5">
            Workflow Name *
          </label>
          <div className="relative">
            <input
              type="text"
              {...register('name', {
                required: 'Workflow name is required',
                maxLength: {
                  value: 200,
                  message: 'Workflow name must be 200 characters or less'
                }
              })}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              maxLength={200}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : focusedField === 'name'
                    ? 'focus:ring-blue-500 focus:border-blue-500 transform scale-[1.02]'
                    : 'focus:ring-blue-500'
              }`}
              placeholder="Enter workflow name"
              disabled={isSubmitting}
            />
            {focusedField === 'name' && !errors.name && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          {errors.name && (
            <div className="mt-1 text-xs text-red-500 flex items-center animate-in slide-in-from-left-2 duration-200">
              <Icon name="AlertCircle" className="w-3 h-3 mr-1" />
              <span>{errors.name.message}</span>
            </div>
          )}
        </div>

        {/* Workflow Description */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-1.5">
            Command *
          </label>
          <div className="relative">
            <textarea
              {...register('description', {
                required: 'Command is required'
              })}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
              rows={2}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : focusedField === 'description'
                    ? 'focus:ring-blue-500 focus:border-blue-500 transform scale-[1.02]'
                    : 'focus:ring-blue-500'
              }`}
              placeholder="Enter command..."
              disabled={isSubmitting}
            />
            {focusedField === 'description' && !errors.description && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          {errors.description && (
            <div className="mt-1 text-xs text-red-500 flex items-center animate-in slide-in-from-left-2 duration-200">
              <Icon name="AlertCircle" className="w-3 h-3 mr-1" />
              <span>{errors.description.message}</span>
            </div>
          )}
        </div>

        {/* Workflow Type */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-1.5">
            Workflow Type
          </label>
          <div className="relative">
            <select
              {...register('type', {
                required: 'Workflow type is required'
              })}
              onFocus={() => setFocusedField('type')}
              onBlur={() => setFocusedField(null)}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-1.5 pr-10 text-sm focus:outline-none focus:ring-2 transition-all duration-200 appearance-none ${
                errors.type
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : focusedField === 'type'
                    ? 'focus:ring-blue-500 focus:border-blue-500 transform scale-[1.02]'
                    : 'focus:ring-blue-500'
              }`}
              disabled={isSubmitting}
            >
              <option value="dynamic">Dynamic - Automatically triggered</option>
              <option value="manual">Manual - Manually triggered</option>
            </select>
            
            {/* Custom Dropdown Icon */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Icon
                name="ChevronDown"
                className={`w-3.5 h-3.5 theme-text-muted transition-transform duration-200 ${
                  focusedField === 'type' ? 'rotate-180' : ''
                }`}
              />
            </div>
            
            {focusedField === 'type' && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          {errors.type && (
            <div className="mt-1 text-xs text-red-500 flex items-center animate-in slide-in-from-left-2 duration-200">
              <Icon name="AlertCircle" className="w-3 h-3 mr-1" />
              <span>{errors.type.message}</span>
            </div>
          )}
        </div>

        {/* Media Upload Section */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-1.5">
            Media Files (Optional)
          </label>
          
          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-[1.02]'
                : 'theme-border hover:border-blue-400'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.csv,.json"
              disabled={isSubmitting}
            />
            <label
              htmlFor="file-upload"
              className={`flex flex-col items-center justify-center py-4 px-4 cursor-pointer ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-200 ${
                isDragging ? 'bg-blue-500 scale-110' : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                <Upload className={`w-5 h-5 ${
                  isDragging ? 'text-white' : 'text-gray-500'
                }`} />
              </div>
              <p className="text-xs font-medium theme-text-primary mb-0.5">
                {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs theme-text-muted">
                Images, videos, documents (Max 10MB)
              </p>
            </label>
          </div>

          {/* File Preview List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium theme-text-muted">
                  {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} selected
                </p>
                <button
                  type="button"
                  onClick={() => setUploadedFiles([])}
                  className="text-xs text-red-500 hover:text-red-600 transition-colors"
                  disabled={isSubmitting}
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-1.5 max-h-24 overflow-y-auto theme-scrollbar">
                {uploadedFiles.map((file, index) => {
                  const FileIcon = getFileIcon(file);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 theme-card rounded-lg border theme-border hover:border-blue-400 transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <FileIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium theme-text-primary truncate">
                            {file.name}
                          </p>
                          <p className="text-xs theme-text-muted">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="flex-shrink-0 ml-2 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        disabled={isSubmitting}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t theme-border mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            className="transition-all duration-200 hover:scale-105"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={Plus}
            disabled={isSubmitting}
            className={`transition-all duration-200 hover:scale-105 ${
              isSubmitting ? 'animate-pulse' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating...
              </>
            ) : (
              'Create Workflow'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}