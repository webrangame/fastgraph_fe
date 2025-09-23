"use client";

import { X, Zap, GripVertical, FileText, Link, ExternalLink, Image, AlertCircle, FileText as PdfIcon } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { setEndNodeSidebarWidth } from '@/redux/slice/uiSlice';

interface EndNodeSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarType: 'output' | 'media';
  finalData?: any;
  finalizedArtifactLinks?: any[];
  initialWidth?: number;
  onWidthChange?: (width: number) => void;
}

export function EndNodeSidebar({ 
  isOpen, 
  onClose, 
  sidebarType,
  finalData,
  finalizedArtifactLinks = [],
  initialWidth = 400,
  onWidthChange
}: EndNodeSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  
  const dispatch = useDispatch();
  const savedEndWidth = useSelector((state: any) => state.ui?.sidebar?.endNodeWidth);
  const [width, setWidth] = useState<number>(savedEndWidth || initialWidth);
  
  // State for tracking resize activity
  const [isActivelyResizing, setIsActivelyResizing] = useState(false);
  
  // Constraints for resizing
  const MIN_WIDTH = 300;
  const MAX_WIDTH = 800;

  // Debounced Redux update to avoid excessive dispatches during resize
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      dispatch(setEndNodeSidebarWidth(width));
    }, 200);
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [width, dispatch]);

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    setIsActivelyResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'none';
    
    // Add active state to sidebar for visual feedback
    if (sidebarRef.current) {
      sidebarRef.current.style.transition = 'none';
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current) return;
    
    // Cancel previous animation frame to avoid stacking
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Use requestAnimationFrame for smooth performance
    animationFrameRef.current = requestAnimationFrame(() => {
      const newWidth = window.innerWidth - e.clientX;
      const constrainedWidth = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH);
      
      setWidth(constrainedWidth);
      onWidthChange?.(constrainedWidth);
    });
  }, [MIN_WIDTH, MAX_WIDTH, onWidthChange]);

  const handleMouseUp = useCallback(() => {
    isResizingRef.current = false;
    setIsActivelyResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.body.style.pointerEvents = '';
    
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Restore transition for smooth width changes when not resizing
    if (sidebarRef.current) {
      sidebarRef.current.style.transition = 'transform 300ms ease-in-out';
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Handle mouse events for resizing
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isOpen, handleMouseMove, handleMouseUp]);

  // Get content based on sidebar type
  // Normalize finalData when it may arrive as a Python-style string (finalizedResult)
  const normalizeFinalData = (data: any) => {
    // If data is already an object, return as-is
    if (typeof data === 'object' && data !== null) {
      return data;
    }
    
    // If data is a string, try to extract content using multiple strategies
    if (typeof data === 'string') {
      const raw = data as string;
      
      // Strategy 1: Extract the main result from poet_agent.outputs.poem_output.result
      // This pattern handles the deeply nested structure with escaped quotes
      const poemOutputMatch = raw.match(/'poem_output':\s*\{[\s\S]*?'result':\s*"([\s\S]*?)(?="[,}])/);
      if (poemOutputMatch) {
        let content = poemOutputMatch[1];
        // Clean up escaped content
        content = content.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        return { 
          results: { 
            poet_agent: { 
              outputs: { 
                poem_output: { 
                  result: content 
                } 
              } 
            } 
          } 
        };
      }
      
      // Strategy 2: Extract the first 'result' field that appears in the string
      const genericResultMatch = raw.match(/'result':\s*"([\s\S]*?)(?="[,}])/);
      if (genericResultMatch) {
        let content = genericResultMatch[1];
        content = content.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        return { result: content };
      }
      
      // Strategy 3: Try to parse artifacts array with URLs
      const artifactsMatch = raw.match(/'artifacts':\s*\[([\s\S]*?)\]/);
      if (artifactsMatch) {
        // Extract URLs from artifacts array
        const urlMatches = artifactsMatch[1].match(/'url':\s*'([^']+)'/g);
        if (urlMatches) {
          const urls = urlMatches.map(match => match.match(/'url':\s*'([^']+)'/)?.[1]).filter(Boolean);
          if (urls.length > 0) {
            return { media_links: urls };
          }
        }
      }
      
      // Strategy 4: Try to parse media_links array
      const mediaLinksMatch = raw.match(/'media_links':\s*\[([\s\S]*?)\]/);
      if (mediaLinksMatch) {
        const items = mediaLinksMatch[1]
          .split(',')
          .map(s => s.trim())
          .map(s => s.replace(/^'/, '').replace(/'$/, ''))
          .filter(Boolean);
        return { media_links: items };
      }
      
      // Strategy 5: If we can't parse it, return it wrapped so our extraction logic can try
      return { raw_string: raw };
    }
    
    return data; // as-is if nothing matches
  };

  const getContent = () => {
    const normalized = normalizeFinalData(finalData);
    if (!normalized) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <div className="p-4 theme-card-bg rounded-full mb-4">
            {sidebarType === 'output' ? (
              <FileText className="w-12 h-12 theme-text-muted" />
            ) : (
              <Link className="w-12 h-12 theme-text-muted" />
            )}
          </div>
          <h3 className="text-base font-medium theme-text-primary mb-2">
            No {sidebarType === 'output' ? 'output' : 'media links'} available 
          </h3>
          <p className="theme-text-secondary text-sm max-w-xs">
            {sidebarType === 'output' 
              ? 'The workflow output will appear here when available'
              : 'Media links will appear here when available'
            }
          </p>
        </div>
      );
    }

    if (sidebarType === 'output') {
      // Enhanced function to extract output data from various structure patterns
      const extractOutputData = (obj: any): any => {
        if (!obj || typeof obj !== 'object') return undefined;
        
        // Pattern 1: finalizedResult structure - results.agent_name.outputs.output_name.result
        if (obj.results && typeof obj.results === 'object') {
          for (const agentKey of Object.keys(obj.results)) {
            const agent = obj.results[agentKey];
            
            // Check for outputs with nested results
            if (agent?.outputs && typeof agent.outputs === 'object') {
              for (const outputKey of Object.keys(agent.outputs)) {
                const output = agent.outputs[outputKey];
                if (output?.result) {
                  return output.result;
                }
              }
            }
            
            // Check for direct agent result
            if (agent?.result) {
              return agent.result;
            }
          }
        }
        
        // Pattern 2: Direct outputs structure
        if (obj.outputs && typeof obj.outputs === 'object') {
          for (const outputKey of Object.keys(obj.outputs)) {
            const output = obj.outputs[outputKey];
            if (output?.result) {
              return output.result;
            }
          }
        }
        
        // Pattern 3: final_data structure
        if (obj.final_data && typeof obj.final_data === 'object') {
          // Look for any output with result
          for (const key of Object.keys(obj.final_data)) {
            const value = obj.final_data[key];
            if (value?.result) {
              return value.result;
            }
          }
        }
        
        // Pattern 4: Direct result field
        if (obj.result) {
          return obj.result;
        }
        
        // Pattern 5: Legacy poem_output structure
        if (obj.poem_output?.result) {
          return obj.poem_output.result;
        }
        
        // Pattern 6: Raw string fallback - try to extract any meaningful content
        if (obj.raw_string && typeof obj.raw_string === 'string') {
          const raw = obj.raw_string;
          
          // Look for any content that appears to be the main result
          // Try to find patterns like 'result': "content" or "raw_output": "content"
          const resultPatterns = [
            /'raw_output':\s*"([\s\S]*?)(?="[,}])/,
            /'result':\s*"([\s\S]*?)(?="[,}])/,
            /"result":\s*"([\s\S]*?)(?="[,}])/,
            // Look for any substantial text content in quotes
            /"(ANALYSIS:[\s\S]*?)(?="[,}])/,
            /'(ANALYSIS:[\s\S]*?)(?='[,}])/
          ];
          
          for (const pattern of resultPatterns) {
            const match = raw.match(pattern);
            if (match && match[1] && match[1].length > 50) { // Ensure we get substantial content
              let content = match[1];
              content = content.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
              return content;
            }
          }
          
          // If no patterns match, return a truncated version of the raw string for debugging
          return raw.length > 500 ? `${raw.substring(0, 500)}...` : raw;
        }
        
        return undefined;
      };

      const outputData = extractOutputData(normalized) || 'No output data available';
      
      return (
        <div className="p-4 space-y-4">
          <div className="theme-card-bg rounded-lg p-4 border theme-border">
            <h3 className="text-sm font-semibold theme-text-primary mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Workflow Output
            </h3>
            <div className="text-sm theme-text-secondary whitespace-pre-wrap break-words">
              {typeof outputData === 'string' ? outputData : JSON.stringify(outputData, null, 2)}
            </div>
          </div>
        </div>
      );
    } else {
      // Enhanced function to extract media links from various structure patterns
      const extractMediaLinks = (obj: any): string[] => {
        if (!obj || typeof obj !== 'object') return [];
        
        // Pattern 1: finalizedResult structure - results.agent_name.outputs.output_name (array of links)
        if (obj.results && typeof obj.results === 'object') {
          for (const agentKey of Object.keys(obj.results)) {
            const agent = obj.results[agentKey];
            
            // Check for outputs with media_links
            if (agent?.outputs && typeof agent.outputs === 'object') {
              for (const outputKey of Object.keys(agent.outputs)) {
                const output = agent.outputs[outputKey];
                if (Array.isArray(output) && output.length > 0) {
                  // Check if this looks like media links (URLs or file paths)
                  const hasMediaLinks = output.some(item => 
                    typeof item === 'string' && 
                    (item.includes('http') || item.includes('.mp4') || item.includes('.jpg') || item.includes('.png'))
                  );
                  if (hasMediaLinks) return output;
                }
                if (Array.isArray(output?.media_links)) {
                  return output.media_links;
                }
              }
            }
            
            // Check for direct media_links in agent
            if (Array.isArray(agent?.media_links)) {
              return agent.media_links;
            }
          }
        }
        
        // Pattern 2: Direct outputs structure
        if (obj.outputs && typeof obj.outputs === 'object') {
          for (const outputKey of Object.keys(obj.outputs)) {
            const output = obj.outputs[outputKey];
            if (Array.isArray(output?.media_links)) {
              return output.media_links;
            }
          }
        }
        
        // Pattern 3: final_data structure
        if (obj.final_data && typeof obj.final_data === 'object') {
          for (const key of Object.keys(obj.final_data)) {
            const value = obj.final_data[key];
            if (Array.isArray(value?.media_links)) {
              return value.media_links;
            }
          }
        }
        
        // Pattern 4: Direct media_links field
        if (Array.isArray(obj.media_links)) {
          return obj.media_links;
        }
        
        return [];
      };

      // Check finalizedArtifactLinks first (highest priority)
      let mediaLinks: string[] = [];
      
      console.log('🔍 EndNodeSidebar Media Links Debug:', {
        sidebarType,
        finalizedArtifactLinksLength: finalizedArtifactLinks?.length,
        finalizedArtifactLinks: finalizedArtifactLinks,
        normalizedData: normalized,
        finalDataType: typeof finalData,
        finalDataKeys: finalData && typeof finalData === 'object' ? Object.keys(finalData) : 'not-object'
      });
      
      if (Array.isArray(finalizedArtifactLinks) && finalizedArtifactLinks.length > 0) {
        mediaLinks = finalizedArtifactLinks
          .filter(artifact => artifact?.url && (
            artifact?.type === 'image' || 
            artifact?.type === 'video' || 
            artifact?.type === 'audio' ||
            artifact?.type === 'media' ||
            !artifact?.type  // Include items without type specified
          ))
          .map(artifact => artifact.url);
        console.log('✅ Using finalizedArtifactLinks:', mediaLinks);
      }
      
      // Fallback to extracting from normalized data
      if (mediaLinks.length === 0) {
        mediaLinks = extractMediaLinks(normalized);
        console.log('🔄 Fallback to extractMediaLinks:', mediaLinks);
      }
      
      // Helper function to get file name and type from URL
      const getFileInfo = (url: string) => {
        const fileName = url.split('/').pop() || 'Media File';
        const fileExtension = fileName.split('.').pop()?.toLowerCase();
        
        let fileType = 'Media';
        let icon = ExternalLink;
        
        if (fileExtension) {
          switch (fileExtension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
            case 'svg':
              fileType = 'Image';
              break;
            case 'mp4':
            case 'webm':
            case 'avi':
            case 'mov':
              fileType = 'Video';
              break;
            case 'mp3':
            case 'wav':
            case 'ogg':
              fileType = 'Audio';
              break;
            case 'pdf':
              fileType = 'PDF';
              break;
            default:
              fileType = 'File';
          }
        }
        
        return { fileName, fileType, icon };
      };
      
      // Image Preview Component
      const ImagePreview = ({ url, fileName, onError }: { url: string; fileName: string; onError: () => void }) => {
        const [isLoading, setIsLoading] = useState(true);
        const [hasError, setHasError] = useState(false);

        const handleLoad = () => {
          setIsLoading(false);
        };

        const handleError = () => {
          setIsLoading(false);
          setHasError(true);
          onError();
        };

        if (hasError) {
          return (
            <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Preview unavailable</p>
              </div>
            </div>
          );
        }

        return (
          <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            )}
            <img
              src={url}
              alt={fileName}
              onLoad={handleLoad}
              onError={handleError}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
            />
          </div>
        );
      };

      // PDF Preview Component
      const PDFPreview = ({ url, fileName, onError }: { url: string; fileName: string; onError: () => void }) => {
        const [isLoading, setIsLoading] = useState(true);
        const [hasError, setHasError] = useState(false);
        const iframeRef = useRef<HTMLIFrameElement>(null);

        const handleLoad = () => {
          setIsLoading(false);
        };

        const handleError = () => {
          setIsLoading(false);
          setHasError(true);
          onError();
        };

        useEffect(() => {
          const iframe = iframeRef.current;
          if (iframe) {
            const timer = setTimeout(() => {
              if (isLoading) {
                handleError();
              }
            }, 10000); // 10 second timeout

            return () => clearTimeout(timer);
          }
        }, [isLoading]);

        if (hasError) {
          return (
            <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <PdfIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">PDF preview unavailable</p>
                <p className="text-xs text-gray-400">Click to open</p>
              </div>
            </div>
          );
        }

        return (
          <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-xs text-gray-500">Loading PDF...</p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={`${url}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
              onLoad={handleLoad}
              onError={handleError}
              className={`w-full h-full border-0 transition-opacity duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              title={`PDF Preview: ${fileName}`}
              sandbox="allow-same-origin"
            />
            {/* PDF Overlay Indicator */}
            <div className="absolute top-2 right-2 bg-red-500/90 text-white text-xs px-2 py-1 rounded-md font-medium">
              PDF
            </div>
          </div>
        );
      };

      return (
        <div className="p-4 space-y-4">
          <div className="theme-card-bg rounded-lg p-4 border theme-border">
            <h3 className="text-sm font-semibold theme-text-primary mb-3 flex items-center">
              <Link className="w-4 h-4 mr-2" />
                Artifacts Links
            </h3>
            {Array.isArray(mediaLinks) && mediaLinks.length > 0 ? (
              <div className="space-y-3">
                {mediaLinks.map((m, idx) => {
                  const { fileName, fileType } = getFileInfo(m);
                  const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
                  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension);
                  const isPDF = fileExtension === 'pdf';
                  
                  return (
                    <div key={idx} className="group theme-card-bg rounded-lg p-3 border theme-border hover:theme-shadow-sm transition-all duration-200">
                      {/* Image Preview for image files */}
                      {isImage && (
                        <div className="mb-3">
                          <ImagePreview 
                            url={m} 
                            fileName={fileName}
                            onError={() => {}}
                          />
                        </div>
                      )}
                      
                      {/* PDF Preview for PDF files */}
                      {isPDF && (
                        <div className="mb-3">
                          <PDFPreview 
                            url={m} 
                            fileName={fileName}
                            onError={() => {}}
                          />
                        </div>
                      )}
                      
                      {/* File Info and Link */}
                      <a
                        href={m}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-2 rounded-lg theme-hover-bg transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                        title={`Open ${fileName} in new tab`}
                      >
                        <div className="p-2 rounded-md bg-blue-500/10 border border-blue-500/20 flex-shrink-0">
                          {isImage ? (
                            <Image className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : isPDF ? (
                            <PdfIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                          ) : (
                            <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm theme-text-primary font-medium truncate">
                              {fileName}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              fileType === 'Image' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                              fileType === 'Video' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' :
                              fileType === 'Audio' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' :
                              fileType === 'PDF' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                              'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                            }`}>
                              {fileType}
                            </span>
                          </div>
                          <div className="text-xs theme-text-muted truncate">
                            {m}
                          </div>
                        </div>
                        <div className="opacity-100 transition-opacity duration-200 flex-shrink-0">
                          <ExternalLink className="w-4 h-4 theme-text-muted" />
                        </div>
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Image className="w-12 h-12 theme-text-muted mx-auto mb-3 opacity-50" />
                <p className="text-sm theme-text-muted mb-1">No Artifacts links available</p>
                <p className="text-xs theme-text-muted">
                  Artifacts links will appear here when available
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  const getTitle = () => {
    return sidebarType === 'output' ? 'Workflow Output' : 'Artifacts';
  };

  const getIcon = () => {
    return sidebarType === 'output' ? FileText : Link;
  };

  const Icon = getIcon();

  return (
    <div 
      ref={sidebarRef}
      className={`fixed top-0 right-0 h-full theme-sidebar-bg theme-border shadow-2xl z-[10000] transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`} 
      style={{ width: `${width}px` }}
    >
      {/* Resize Handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/20 active:bg-blue-500/30 transition-all duration-150 group z-10"
        onMouseDown={handleMouseDown}
        style={{
          background: isActivelyResizing ? 'rgba(59, 130, 246, 0.3)' : undefined
        }}
      >
        {/* Visual indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 theme-border group-hover:bg-blue-500 transition-colors duration-150" />
        
        {/* Grip icon */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 scale-90 group-hover:scale-100">
          <GripVertical className="w-3 h-3 text-blue-500 drop-shadow-sm" />
        </div>
        
        {/* Hover area extension */}
        <div className="absolute -left-1 -right-1 top-0 bottom-0" />
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 theme-border shrink-0 theme-header-bg" style={{ borderBottomWidth: '1px' }}>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="p-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg shadow-lg">
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold theme-text-primary flex items-center space-x-2">
              <span>{getTitle()}</span>
            </h2>
            <p className="text-xs theme-text-secondary">
              Workflow End • Final Results
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={onClose}
            className="p-2 theme-text-secondary theme-hover-bg rounded-lg transition-all duration-200 group"
            title="Close sidebar"
          >
            <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 overflow-y-auto theme-bg">
        {getContent()}
      </div>

      {/* Status Bar */}
      <div className="theme-border p-3 theme-header-bg flex items-center justify-between text-xs theme-text-secondary" style={{ borderTopWidth: '1px' }}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>Workflow completed</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-mono">{width}px</span>
        </div>
      </div>
    </div>
  );
}
