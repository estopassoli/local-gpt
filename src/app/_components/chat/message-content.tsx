'use client';

import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface MessageContentProps {
    content: string;
    role: 'USER' | 'ASSISTANT';
}

export default function MessageContent({ content, role }: MessageContentProps) {
    const [copiedBlocks, setCopiedBlocks] = useState<Set<string>>(new Set());
    const { theme } = useTheme();

    const copyToClipboard = async (text: string, blockId: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedBlocks(prev => new Set(prev).add(blockId));
            setTimeout(() => {
                setCopiedBlocks(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(blockId);
                    return newSet;
                });
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    if (role === 'USER') {
        // Para mensagens do usuário, renderização simples
        return (
            <div className="text-sm whitespace-pre-wrap wrap-break-word">
                {content}
            </div>
        );
    }

    // Para mensagens da IA, renderização com Markdown
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-em:text-foreground">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code: (props: any) => {
                        const { children, className, inline } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';
                        const codeString = String(children).replace(/\n$/, '');
                        const blockId = `code-${Date.now()}-${Math.random()}`;
                        
                        // Detectar se é um bloco de código baseado em múltiplos critérios
                        const isCodeBlock = !inline && (
                            (className && className.includes('language-')) ||
                            codeString.includes('\n') ||
                            codeString.length > 50
                        );

                        // Código inline (não em bloco)
                        if (inline) {
                            return (
                                <code className="px-1.5 py-0.5 bg-muted/50 rounded text-sm font-mono text-foreground border border-border">
                                    {children}
                                </code>
                            );
                        }

                        // Bloco de código com syntax highlighting
                        if (isCodeBlock) {
                            const syntaxTheme = theme === 'dark' ? oneDark : oneLight;
                            
                            // Auto-detectar linguagem se não especificada
                            let detectedLanguage = language;
                            if (!detectedLanguage) {
                                const code = codeString.toLowerCase();
                                if (code.includes('#include') || code.includes('std::') || code.includes('cout') || code.includes('cin') || code.includes('namespace')) {
                                    detectedLanguage = 'cpp';
                                } else if (code.includes('function') || code.includes('const ') || code.includes('=>') || code.includes('var ') || code.includes('let ')) {
                                    detectedLanguage = 'javascript';
                                } else if (code.includes('def ') || code.includes('import ') || code.includes('print(') || code.includes('if __name__')) {
                                    detectedLanguage = 'python';
                                } else if (code.includes('class ') && (code.includes('public ') || code.includes('private ') || code.includes('system.'))) {
                                    detectedLanguage = 'java';
                                } else if (code.includes('<html') || code.includes('<!doctype') || code.includes('<div') || code.includes('<body')) {
                                    detectedLanguage = 'html';
                                } else if (code.includes('{') && (code.includes('color:') || code.includes('margin:') || code.includes('padding:'))) {
                                    detectedLanguage = 'css';
                                } else if (code.includes('interface ') || code.includes('type ') || code.includes(': string') || code.includes(': number')) {
                                    detectedLanguage = 'typescript';
                                } else if (code.includes('select ') || code.includes('insert ') || code.includes('update ') || code.includes('create table')) {
                                    detectedLanguage = 'sql';
                                } else if (code.includes('#!/bin/bash') || code.includes('echo ') || code.includes('sudo ') || code.includes('grep ')) {
                                    detectedLanguage = 'bash';
                                } else if (code.startsWith('{') && code.includes('"') && code.includes(':')) {
                                    detectedLanguage = 'json';
                                }
                            }
                            
                            return (
                                <div className="relative group my-4">
                                    <div className="flex items-center justify-between bg-muted/50 px-4 py-2 text-xs rounded-t-md border border-border">
                                        <span className="font-medium capitalize text-muted-foreground">
                                            {detectedLanguage || 'código'}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                                            onClick={() => copyToClipboard(codeString, blockId)}
                                            title="Copiar código"
                                        >
                                            {copiedBlocks.has(blockId) ? (
                                                <Check className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>
                                    <div className="relative overflow-hidden rounded-b-md border-x border-b border-border">
                                        <SyntaxHighlighter
                                            style={syntaxTheme}
                                            language={detectedLanguage || 'text'}
                                            PreTag="div"
                                            customStyle={{
                                                margin: 0,
                                                borderRadius: 0,
                                                fontSize: '0.875rem',
                                                background: 'transparent',
                                            }}
                                            codeTagProps={{
                                                style: {
                                                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, "Liberation Mono", "Roboto Mono", monospace',
                                                }
                                            }}
                                        >
                                            {codeString}
                                        </SyntaxHighlighter>
                                    </div>
                                </div>
                            );
                        }

                        // Fallback para códigos sem linguagem especificada
                        return (
                            <div className="relative group my-4">
                                <div className="flex items-center justify-between bg-muted/50 px-4 py-2 text-xs rounded-t-md border border-border">
                                    <span className="font-medium text-muted-foreground">código</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                                        onClick={() => copyToClipboard(codeString, blockId)}
                                        title="Copiar código"
                                    >
                                        {copiedBlocks.has(blockId) ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}
                                    </Button>
                                </div>
                                <pre className="bg-muted/30 p-4 rounded-b-md overflow-x-auto text-sm border-x border-b border-border">
                                    <code className="font-mono text-foreground">{codeString}</code>
                                </pre>
                            </div>
                        );
                    },
                    pre: ({ children }) => (
                        <div>{children}</div>
                    ),
                    h1: ({ children }) => (
                        <h1 className="text-xl font-bold mt-6 mb-4 first:mt-0 text-foreground">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-lg font-semibold mt-5 mb-3 first:mt-0 text-foreground">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-base font-semibold mt-4 mb-2 first:mt-0 text-foreground">{children}</h3>
                    ),
                    p: ({ children }) => (
                        <p className="mb-3 last:mb-0 leading-relaxed text-foreground">{children}</p>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc pl-6 mb-3 space-y-1 text-foreground">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal pl-6 mb-3 space-y-1 text-foreground">{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li className="leading-relaxed text-foreground">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-accent pl-4 italic my-4 bg-muted/30 py-2 rounded-r-md">
                            <div className="text-muted-foreground">{children}</div>
                        </blockquote>
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-4">
                            <table className="min-w-full border-collapse border border-border bg-card">
                                {children}
                            </table>
                        </div>
                    ),
                    th: ({ children }) => (
                        <th className="border border-border bg-muted px-3 py-2 text-left font-semibold text-foreground">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="border border-border px-3 py-2 text-foreground">{children}</td>
                    ),
                    a: ({ children, href }) => (
                        <a
                            href={href}
                            className="text-primary hover:text-primary/80 underline underline-offset-4"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
