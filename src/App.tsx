import React, { useState } from 'react';
import { Bot, Code2, Send, Sparkles, Terminal } from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Generate code for: ${prompt}\n\nProvide the code in a markdown code block with appropriate language syntax highlighting.`
        }]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      });

      setResponse(response.data.content[0].text);
    } catch (err) {
      setError('Failed to generate code. Please try again.');
      console.error('Error calling Claude API:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950 py-4">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Bot className="w-8 h-8 text-purple-500" />
          <h1 className="text-2xl font-bold">Claude Code Assistant</h1>
          <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full text-sm font-medium">
            3.7
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xl font-semibold">
              <Terminal className="text-green-500" />
              <h2>Input</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-[300px] bg-gray-800 rounded-lg p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe the code you want to generate..."
              />
              <button
                type="submit"
                disabled={isLoading || !prompt}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Generate Code
                  </>
                )}
              </button>
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
            </form>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xl font-semibold">
              <Code2 className="text-blue-500" />
              <h2>Generated Code</h2>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 min-h-[300px] overflow-auto">
              {response ? (
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={atomOneDark}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {response}
                </ReactMarkdown>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
                  <Sparkles className="w-8 h-8" />
                  <p>Generated code will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;