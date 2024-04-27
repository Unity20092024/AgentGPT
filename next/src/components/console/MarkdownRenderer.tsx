import clsx from "clsx";
import React, { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/default.css";

interface CustomCodeBlockProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

const CustomCodeBlock: React.FC<CustomCodeBlockProps> = ({
  inline,
  className,
  children,
}) => {
  const language = className ? className.replace("language-", "") : "plaintext";

  return <code className={`hljs ${language}`}>{children}</code>;
};

const CustomLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  children,
  href,
}) => {
  return (
    <a
      className={clsx(
        "mx-0.5 rounded-full bg-sky-600 px-1.5 py-0.5 align-top text-[0.6rem] text-white",
        "transition-colors duration-300 hover:bg-sky-500 hover:text-white"
      )}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

const MarkdownRenderer: React.FC<{ children: string }> = ({ children }) => {
  return (
    <ReactMarkdown
      className="prose dark:prose-invert"
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        pre: CustomPre,
        code: CustomCodeBlock,
        h1: (props) => <h1 className="text-2xl font-bold sm:text-3xl">{props.children}</h1>,
        h2: (props) => <h2 className="text-xl font-bold sm:text-2xl">{props.children}</h2>,
        a: CustomLink,
        p: (props) => <p className="mb-4">{props.children}</p>,
        ul: (props) => (
          <ul className={clsx("mb-4 list-disc marker:text-neutral-400")}>
            {props.children}
          </ul>
        ),
        ol: (props) => (
          <ol className="mb-4 ml-8 list-decimal marker:text-neutral-400">
            {props.children}
          </ol>
        ),
        li: (props) => <li className="mb-1 ml-8">{props.children}</li>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

const CustomPre: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCopied, setIsCopied] = useState(false);

  const code = React.Children.toArray(children).find(
    (element: React.ReactElement) =>
      element.type === CustomCodeBlock && !element.props.inline
  );

  const handleCopyClick = useCallback(() => {
    if (code && React.isValidElement(code)) {
      const codeString = (code.props.children as React.ReactElement).props.children as string;
      navigator.clipboard.writeText(codeString);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  }, [code]);

  return (
    <div className="mb-4 flex flex-col">
      <div className="flex w-full items-center justify-between rounded-t-lg bg-slate-10 p-1 px-4 text-white">
        <div>Code</div>
        <button
          onClick={handleCopyClick}
          className="flex items-center gap-2 rounded px-2 py-1 hover:bg-slate-9 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-files"
          >
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
          {isCopied ? "Copied!" : "Copy Code"}
        </button>
      </div>
      <pre className="rounded-t-[0.5rem]">{children}</pre>
    </div>
  );
};

export default MarkdownRenderer;
