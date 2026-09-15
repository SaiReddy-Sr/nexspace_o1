'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Link from 'next/link'

interface MarkdownViewerProps {
  content: string
}

// Unindent text to fix issues where users paste content with leading spaces
// which causes everything to render as a code block.
const unindent = (text: string) => {
  const lines = text.split('\n')
  let minSpaces = Infinity
  for (const line of lines) {
    if (line.trim().length === 0) continue
    const leadingSpaces = line.match(/^ {1,}/)?.[0].length || 0
    if (leadingSpaces < minSpaces) minSpaces = leadingSpaces
  }
  if (minSpaces > 0 && minSpaces !== Infinity) {
    return lines.map(line => line.startsWith(' '.repeat(minSpaces)) ? line.slice(minSpaces) : line).join('\n')
  }
  return text
}

const processText = (text: string) => {
  const parts = text.split(/(#[a-zA-Z0-9_-]+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('#') && part.length > 1) {
      const tag = part.slice(1);
      return (
        <Link 
          key={i} 
          href={`/?tag=${tag}`} 
          className="inline-flex items-center px-2 py-0.5 mx-0.5 rounded text-[11px] font-mono font-bold bg-accent/20 text-accent hover:bg-accent hover:text-white transition-colors border border-accent/20"
        >
          {part}
        </Link>
      )
    }
    return part;
  });
}

const processChildren = (children: React.ReactNode): React.ReactNode => {
  return React.Children.map(children, child => {
    if (typeof child === 'string') {
      return processText(child);
    }
    if (React.isValidElement(child)) {
      // Do not process hashtags inside code, pre, or a tags
      if (child.type === 'code' || child.type === 'pre' || child.type === 'a') {
        return child;
      }
      if (child.props && (child.props as any).children) {
        return React.cloneElement(child, {
          ...child.props,
          children: processChildren((child.props as any).children)
        } as any);
      }
    }
    return child;
  });
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  const safeContent = unindent(content || 'No content provided.')

  return (
    <div className="prose prose-invert max-w-full overflow-hidden break-words prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:bg-[#1E1E2E] prose-pre:p-0 prose-a:text-accent hover:prose-a:text-accent-hover prose-blockquote:border-l-accent prose-blockquote:bg-accent/10 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-foreground/90 prose-li:marker:text-accent">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p({ node, children, ...props }: any) {
            return <p {...props}>{processChildren(children)}</p>
          },
          li({ node, children, ...props }: any) {
            return <li {...props}>{processChildren(children)}</li>
          },
          h1({ node, children, ...props }: any) {
            return <h1 {...props}>{processChildren(children)}</h1>
          },
          h2({ node, children, ...props }: any) {
            return <h2 {...props}>{processChildren(children)}</h2>
          },
          h3({ node, children, ...props }: any) {
            return <h3 {...props}>{processChildren(children)}</h3>
          },
          code({node, inline, className, children, ...props}: any) {
            const match = /language-(\w+)/.exec(className || '')
            const contentStr = String(children).trim()
            
            const isInline = !match && !contentStr.includes('\n')

            if (!isInline) {
              // Check if code block contains video links (allowing query params)
              const videoRegex = /(?:https?:\/\/)?(?:www\.)?loom\.com\/share\/[a-z0-9]+|(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+/im;
              
              if (videoRegex.test(contentStr)) {
                // Split the code block by the video link, ensuring it matches exactly on its own line
                const parts = contentStr.split(/(^(?:https?:\/\/)?(?:www\.)?loom\.com\/share\/[a-z0-9]+(?:[?&]\S*)?$|^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+(?:[?&]\S*)?$)/im);
                
                return (
                  <div className="space-y-4 my-6">
                    {parts.map((part, idx) => {
                      const trimmed = part.trim()
                      if (!trimmed) return null;
                      
                      const loomMatch = trimmed.match(/^(?:https?:\/\/)?(?:www\.)?loom\.com\/share\/([a-z0-9]+)/i)
                      if (loomMatch) {
                        return <iframe key={idx} src={`https://www.loom.com/embed/${loomMatch[1]}`} className="w-full aspect-video rounded-xl shadow-lg border border-border max-w-3xl block" frameBorder="0" allowFullScreen />
                      }
                      
                      const ytMatch = trimmed.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/i)
                      if (ytMatch) {
                        return <iframe key={idx} src={`https://www.youtube.com/embed/${ytMatch[1]}`} className="w-full aspect-video rounded-xl shadow-lg border border-border max-w-3xl block" frameBorder="0" allowFullScreen />
                      }
                      
                      return (
                        <SyntaxHighlighter
                          key={idx}
                          {...props}
                          style={vscDarkPlus as any}
                          language={match ? match[1] : 'text'}
                          PreTag="div"
                          className="rounded-md !m-0 !bg-[#181825] p-4 text-sm max-w-full overflow-x-auto"
                        >
                          {part.replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      )
                    })}
                  </div>
                )
              }

              return (
                <SyntaxHighlighter
                  {...props}
                  style={vscDarkPlus as any}
                  language={match ? match[1] : 'text'}
                  PreTag="div"
                  className="rounded-md !m-0 !bg-[#181825] p-4 text-sm max-w-full overflow-x-auto"
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              )
            }

            return (
              <code {...props} className={`${className || ''} bg-white/10 text-accent rounded px-1.5 py-0.5 text-sm`}>
                {children}
              </code>
            )
          },
          a({ node, href, children, ...props }: any) {
            if (href) {
              const loomMatch = href.match(/(?:https?:\/\/)?(?:www\.)?loom\.com\/share\/([a-z0-9]+)/i)
              if (loomMatch && String(children) === href) {
                return (
                  <iframe 
                    src={`https://www.loom.com/embed/${loomMatch[1]}`} 
                    frameBorder="0" 
                    allowFullScreen 
                    className="w-full aspect-video rounded-xl shadow-lg border border-border my-6 max-w-3xl block"
                  />
                )
              }
              const ytMatch = href.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/i)
              if (ytMatch && String(children) === href) {
                return (
                  <iframe 
                    src={`https://www.youtube.com/embed/${ytMatch[1]}`} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen 
                    className="w-full aspect-video rounded-xl shadow-lg border border-border my-6 max-w-3xl block"
                  />
                )
              }
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:text-accent-hover" {...props}>
                {children}
              </a>
            )
          }
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  )
}
