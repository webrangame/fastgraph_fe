"use client";

import React, { useState } from 'react';
import { usePublishWorkflowMutation } from '@/lib/api/publishApi';
import toast from 'react-hot-toast';

interface UploadArtifactsTesterProps {
  onTestComplete?: (result: any) => void;
}

export function UploadArtifactsTester({ onTestComplete }: UploadArtifactsTesterProps) {
  const [publishWorkflow, { isLoading: isPublishing }] = usePublishWorkflowMutation();
  const [testResults, setTestResults] = useState<any[]>([]);

  const testCases = [
    {
      name: "Valid Request",
      data: {
        requestId: `req_${Date.now()}_valid`,
        workflowId: `workflow_${Date.now()}_valid`,
        overriddenResult: JSON.stringify({
          results: {
            poet_agent: {
              outputs: {
                poem_output: {
                  result: "This is a test poem for valid request."
                }
              }
            }
          }
        }),
        overriddenArtifactLinks: [
          {
            artifact_0: {
              url: "https://example.com/test-image.jpg",
              type: "image",
              name: "Test Image"
            }
          }
        ],
        workflowPrompt: "Test workflow for valid request"
      }
    },
    {
      name: "Empty Artifacts",
      data: {
        requestId: `req_${Date.now()}_empty`,
        workflowId: `workflow_${Date.now()}_empty`,
        overriddenResult: JSON.stringify({ result: "Empty artifacts test" }),
        overriddenArtifactLinks: [],
        workflowPrompt: "Test workflow with empty artifacts"
      }
    },
    {
      name: "Invalid Data",
      data: {
        requestId: `req_${Date.now()}_invalid`,
        workflowId: `workflow_${Date.now()}_invalid`,
        overriddenResult: "invalid json string",
        overriddenArtifactLinks: "not an array",
        workflowPrompt: "Test workflow with invalid data"
      }
    }
  ];

  const runTest = async (testCase: typeof testCases[0]) => {
    const startTime = Date.now();
    let result: any = {};

    try {
      console.log(`🧪 Running test: ${testCase.name}`);
      console.log('📤 Test data:', testCase.data);

      const response = await publishWorkflow(testCase.data).unwrap();
      
      result = {
        testName: testCase.name,
        success: true,
        duration: Date.now() - startTime,
        response,
        error: null
      };

      console.log(`✅ Test ${testCase.name} succeeded:`, response);
      toast.success(`Test "${testCase.name}" passed!`);

    } catch (error: any) {
      result = {
        testName: testCase.name,
        success: false,
        duration: Date.now() - startTime,
        response: null,
        error: {
          message: error?.message || 'Unknown error',
          status: error?.status,
          data: error?.data,
          type: typeof error,
          constructor: error?.constructor?.name,
          stringified: JSON.stringify(error, null, 2)
        }
      };

      console.group(`❌ Test ${testCase.name} failed - Detailed Error Info`);
      console.error('Error object:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Error status:', error?.status);
      console.error('Error data:', error?.data);
      console.error('Error stringified:', JSON.stringify(error, null, 2));
      console.groupEnd();

      toast.error(`Test "${testCase.name}" failed: ${result.error.message}`);
    }

    setTestResults(prev => [...prev, result]);
    onTestComplete?.(result);
  };

  const runAllTests = async () => {
    setTestResults([]);
    console.log('🚀 Running all upload artifacts tests...');
    
    for (const testCase of testCases) {
      await runTest(testCase);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('✅ All tests completed!');
    toast.success('All tests completed!');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upload Artifacts Tester</h2>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={runAllTests}
          disabled={isPublishing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isPublishing ? 'Running Tests...' : 'Run All Tests'}
        </button>
        
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-2"
        >
          Clear Results
        </button>
      </div>

      <div className="space-y-4">
        {testCases.map((testCase, index) => (
          <div key={index} className="border rounded p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">{testCase.name}</h3>
              <button
                onClick={() => runTest(testCase)}
                disabled={isPublishing}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
              >
                Run Test
              </button>
            </div>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(testCase.data, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      {testResults.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Test Results</h3>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className={`border rounded p-4 ${
                result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{result.testName}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? 'PASSED' : 'FAILED'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {result.duration}ms
                    </span>
                  </div>
                </div>
                
                {result.success ? (
                  <div>
                    <p className="text-sm text-green-700 mb-2">✅ Test passed successfully</p>
                    <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                      {JSON.stringify(result.response, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-red-700 mb-2">❌ Test failed</p>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Message:</span> {result.error.message}
                      </div>
                      {result.error.status && (
                        <div>
                          <span className="font-medium">Status:</span> {result.error.status}
                        </div>
                      )}
                      {result.error.data && (
                        <div>
                          <span className="font-medium">Data:</span>
                          <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-x-auto">
                            {JSON.stringify(result.error.data, null, 2)}
                          </pre>
                        </div>
                      )}
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium">Full Error Details</summary>
                        <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-x-auto">
                          {result.error.stringified}
                        </pre>
                      </details>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
