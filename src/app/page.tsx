'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Play, Copy, Check, Server, Globe, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface EndpointData {
  method: 'GET';
  path: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
}

interface ApiResponse {
  status: boolean;
  code: number;
  message: string;
  data: any;
}

const endpoints: EndpointData[] = [
  {
    method: 'GET',
    path: '/api/latest',
    description: 'Retrieve the latest drama releases from DramaBox'
  },
  {
    method: 'GET',
    path: '/api/trending',
    description: 'Get trending dramas with ranking information'
  },
  {
    method: 'GET',
    path: '/api/search',
    description: 'Search for dramas by title or keyword',
    parameters: [
      {
        name: 'q',
        type: 'string',
        required: true,
        description: 'Search query (supports Indonesian and English)'
      }
    ]
  },
  {
    method: 'GET',
    path: '/api/detail/{bookId}',
    description: 'Get detailed information about a specific drama',
    parameters: [
      {
        name: 'bookId',
        type: 'string',
        required: true,
        description: 'Unique identifier for the drama'
      }
    ]
  },
  {
    method: 'GET',
    path: '/api/stream/{bookId}/{episode}',
    description: 'Get streaming URL for a specific episode',
    parameters: [
      {
        name: 'bookId',
        type: 'string',
        required: true,
        description: 'Unique identifier for the drama'
      },
      {
        name: 'episode',
        type: 'string',
        required: true,
        description: 'Episode number or ID'
      }
    ]
  }
];

export default function ApiDocumentation() {
  const [responses, setResponses] = useState<Record<string, ApiResponse>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [inputs, setInputs] = useState<Record<string, Record<string, string>>>({});
  const [copied, setCopied] = useState<string>('');
  const [hostname, setHostname] = useState<string>('localhost:3000');

  useEffect(() => {
    // Set hostname on client side
    if (typeof window !== 'undefined') {
      setHostname(window.location.hostname);
    }
  }, []);

  const handleInputChange = (endpointPath: string, paramName: string, value: string) => {
    setInputs(prev => ({
      ...prev,
      [endpointPath]: {
        ...prev[endpointPath],
        [paramName]: value
      }
    }));
  };

  const buildEndpointUrl = (endpoint: EndpointData): string => {
    let url = endpoint.path;
    
    if (endpoint.parameters) {
      endpoint.parameters.forEach(param => {
        const value = inputs[endpoint.path]?.[param.name];
        if (value) {
          if (param.name === 'q') {
            url += `?q=${encodeURIComponent(value)}`;
          } else {
            url = url.replace(`{${param.name}}`, value);
          }
        }
      });
    }
    
    return url;
  };

  const isReadyToExecute = (endpoint: EndpointData): boolean => {
    if (!endpoint.parameters) return true;
    
    return endpoint.parameters.every(param => {
      if (!param.required) return true;
      return inputs[endpoint.path]?.[param.name];
    });
  };

  const executeEndpoint = async (endpoint: EndpointData) => {
    const url = buildEndpointUrl(endpoint);
    
    setLoading(prev => ({ ...prev, [endpoint.path]: true }));
    
    try {
      const response = await fetch(url);
      const data: ApiResponse = await response.json();
      
      setResponses(prev => ({
        ...prev,
        [endpoint.path]: data
      }));
    } catch (error) {
      setResponses(prev => ({
        ...prev,
        [endpoint.path]: {
          status: false,
          code: 500,
          message: error instanceof Error ? error.message : 'Network error',
          data: null
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [endpoint.path]: false }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'POST':
        return 'bg-green-500 hover:bg-green-600';
      case 'PUT':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'DELETE':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Zap className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">DramaBox API</h1>
              </div>
              <Badge variant="secondary" className="text-xs">v1.0.0</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                {hostname}
              </Badge>
            </div>
          </div>
          
          <p className="mt-2 text-muted-foreground">
            Interactive API documentation for DramaBox drama streaming service (Indonesian version)
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              API Endpoints
            </CardTitle>
            <CardDescription>
              Click on any endpoint below to explore and test the API functionality
            </CardDescription>
          </CardHeader>
        </Card>

        <Accordion type="multiple" className="space-y-4">
          {endpoints.map((endpoint) => (
            <AccordionItem key={endpoint.path} value={endpoint.path} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <Badge className={`${getMethodColor(endpoint.method)} text-white text-xs px-2 py-1`}>
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {endpoint.path}
                  </code>
                  <span className="text-muted-foreground text-sm">
                    {endpoint.description}
                  </span>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="pb-4">
                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground">{endpoint.description}</p>
                  </div>

                  {/* Parameters */}
                  {endpoint.parameters && (
                    <div>
                      <h4 className="font-semibold mb-3">Parameters</h4>
                      <div className="space-y-3">
                        {endpoint.parameters.map((param) => (
                          <div key={param.name} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium">{param.name}</label>
                              <Badge variant={param.required ? "destructive" : "secondary"} className="text-xs">
                                {param.required ? 'Required' : 'Optional'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {param.type}
                              </Badge>
                            </div>
                            <Input
                              placeholder={`Enter ${param.name}...`}
                              value={inputs[endpoint.path]?.[param.name] || ''}
                              onChange={(e) => handleInputChange(endpoint.path, param.name, e.target.value)}
                              className="max-w-md"
                            />
                            <p className="text-xs text-muted-foreground">{param.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Try it out button */}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => executeEndpoint(endpoint)}
                      disabled={!isReadyToExecute(endpoint) || loading[endpoint.path]}
                      className="flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      {loading[endpoint.path] ? 'Loading...' : 'Try it out'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(buildEndpointUrl(endpoint))}
                      className="flex items-center gap-2"
                    >
                      {copied === buildEndpointUrl(endpoint) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copied === buildEndpointUrl(endpoint) ? 'Copied!' : 'Copy URL'}
                    </Button>
                  </div>

                  {/* Response */}
                  {responses[endpoint.path] && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">Response</h4>
                        <Badge variant={responses[endpoint.path].status ? "default" : "destructive"}>
                          {responses[endpoint.path].code}
                        </Badge>
                      </div>
                      
                      <div className="bg-muted rounded-lg p-4">
                        <div className="mb-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Status:</span>
                            <Badge variant={responses[endpoint.path].status ? "default" : "destructive"}>
                              {responses[endpoint.path].status ? 'Success' : 'Error'}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Message:</span> {responses[endpoint.path].message}
                          </div>
                        </div>
                        
                        <div className="relative">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                            <code>{JSON.stringify(responses[endpoint.path], null, 2)}</code>
                          </pre>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-gray-300"
                            onClick={() => copyToClipboard(JSON.stringify(responses[endpoint.path], null, 2))}
                          >
                            {copied === JSON.stringify(responses[endpoint.path], null, 2) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>DramaBox API Documentation • Built with Next.js & Shadcn UI</p>
            <p className="mt-1">Interactive testing environment for drama streaming API (dramabox.web.id)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}