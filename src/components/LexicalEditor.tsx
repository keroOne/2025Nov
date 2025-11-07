import React, { useEffect, useState, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { Button } from '@fluentui/react-components';
import { 
  TextBoldRegular, 
  TextItalicRegular, 
  TextUnderlineRegular,
  TextHeader1Regular,
  TextHeader2Regular,
  TextHeader3Regular,
  LinkRegular,
  ListRegular,
  NumberSymbolRegular,
} from '@fluentui/react-icons';
import { 
  $getRoot, 
  $getSelection, 
  $isRangeSelection, 
  FORMAT_TEXT_COMMAND,
  $isParagraphNode,
} from 'lexical';
import { 
  $createHeadingNode, 
  $isHeadingNode,
  HeadingNode,
  QuoteNode,
} from '@lexical/rich-text';
import { 
  $isLinkNode,
  LinkNode,
  TOGGLE_LINK_COMMAND,
} from '@lexical/link';
import { 
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  ListNode,
  ListItemNode,
} from '@lexical/list';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $createParagraphNode } from 'lexical';

interface LexicalEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// Lexicalエディタの設定
const editorConfig = {
  namespace: 'TodoEditor',
  theme: {
    paragraph: 'editor-paragraph',
    heading: {
      h1: 'editor-heading-h1',
      h2: 'editor-heading-h2',
      h3: 'editor-heading-h3',
    },
    text: {
      bold: 'editor-text-bold',
      italic: 'editor-text-italic',
      underline: 'editor-text-underline',
    },
    link: 'editor-link',
    list: {
      nested: {
        listitem: 'editor-nested-listitem',
      },
      ol: 'editor-list-ol',
      ul: 'editor-list-ul',
      listitem: 'editor-listitem',
    },
    quote: 'editor-quote',
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    LinkNode,
  ],
  onError: (error: Error) => {
    console.error('Lexical error:', error);
  },
};

// HTMLをエディタに設定するプラグイン（初期値のみ設定）
function SetInitialValuePlugin({ value }: { value: string }) {
  const [editor] = useLexicalComposerContext();
  const isFirstMount = useRef(true);
  const initialValueRef = useRef<string | null>(null);

  useEffect(() => {
    // 初回マウント時のみ初期値を設定
    if (isFirstMount.current) {
      isFirstMount.current = false;
      initialValueRef.current = value;
      
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        
        if (value && value.trim()) {
          try {
            const parser = new DOMParser();
            const dom = parser.parseFromString(value, 'text/html');
            const body = dom.body;
            const nodes = $generateNodesFromDOM(editor, body);
            
            if (nodes.length === 0) {
              const paragraph = $createParagraphNode();
              root.append(paragraph);
            } else {
              const processedNodes: any[] = [];
              
              for (const node of nodes) {
                const nodeType = node.getType();
                if (nodeType === 'text') {
                  const textContent = node.getTextContent();
                  if (textContent.trim() === '') {
                    continue;
                  }
                  const paragraph = $createParagraphNode();
                  paragraph.append(node);
                  processedNodes.push(paragraph);
                } else {
                  processedNodes.push(node);
                }
              }
              
              if (processedNodes.length === 0) {
                const paragraph = $createParagraphNode();
                root.append(paragraph);
              } else {
                root.append(...processedNodes);
              }
            }
          } catch (error) {
            console.error('Failed to parse HTML:', error);
            const paragraph = $createParagraphNode();
            root.append(paragraph);
          }
        } else {
          const paragraph = $createParagraphNode();
          root.append(paragraph);
        }
      });
    }
  }, [editor]); // valueを依存配列から削除

  return null;
}

// 変更をHTMLに変換して親コンポーネントに通知するプラグイン
function CustomOnChangePlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();
  const onChangeRef = useRef(onChange);

  // onChangeの参照を最新に保つ
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editor, null);
        onChangeRef.current(htmlString);
      });
    });
  }, [editor]);

  return null;
}

// ツールバーコンポーネント
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [blockType, setBlockType] = useState<string>('paragraph');
  const [isLink, setIsLink] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat('bold'));
          setIsItalic(selection.hasFormat('italic'));
          setIsUnderline(selection.hasFormat('underline'));
          
          // ブロックタイプを取得
          const anchorNode = selection.anchor.getNode();
          let currentBlockType = 'paragraph';
          if ($isHeadingNode(anchorNode)) {
            currentBlockType = anchorNode.getTag();
          } else if ($isParagraphNode(anchorNode)) {
            currentBlockType = 'paragraph';
          }
          setBlockType(currentBlockType);
          
          // リンクの状態を確認
          const linkNode = anchorNode.getParent()?.getParent();
          setIsLink($isLinkNode(linkNode) || $isLinkNode(anchorNode.getParent()));
        }
      });
    });
  }, [editor]);

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  };

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
  };

  const formatUnderline = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
  };

  const formatHeading = (headingSize: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        nodes.forEach((node) => {
          if ($isHeadingNode(node) || $isParagraphNode(node)) {
            const headingNode = $createHeadingNode(headingSize);
            node.replace(headingNode);
            headingNode.select();
          }
        });
      }
    });
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        nodes.forEach((node) => {
          if ($isHeadingNode(node)) {
            const paragraph = $createParagraphNode();
            node.replace(paragraph);
            paragraph.select();
          }
        });
      }
    });
  };

  const insertLink = () => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    } else {
      const url = prompt('URLを入力してください:');
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    }
  };

  const insertUnorderedList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const insertOrderedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      padding: '8px',
      borderBottom: '1px solid #edebe9',
      backgroundColor: '#faf9f8',
      flexWrap: 'wrap',
    }}>
      <Button
        appearance={isBold ? 'primary' : 'subtle'}
        icon={<TextBoldRegular />}
        onClick={formatBold}
        size="small"
        title="太字 (Ctrl+B)"
      />
      <Button
        appearance={isItalic ? 'primary' : 'subtle'}
        icon={<TextItalicRegular />}
        onClick={formatItalic}
        size="small"
        title="斜体 (Ctrl+I)"
      />
      <Button
        appearance={isUnderline ? 'primary' : 'subtle'}
        icon={<TextUnderlineRegular />}
        onClick={formatUnderline}
        size="small"
        title="下線 (Ctrl+U)"
      />
      <div style={{ width: '1px', backgroundColor: '#edebe9', margin: '0 4px' }} />
      <Button
        appearance={blockType === 'h1' ? 'primary' : 'subtle'}
        icon={<TextHeader1Regular />}
        onClick={() => formatHeading('h1')}
        size="small"
        title="見出し1"
      />
      <Button
        appearance={blockType === 'h2' ? 'primary' : 'subtle'}
        icon={<TextHeader2Regular />}
        onClick={() => formatHeading('h2')}
        size="small"
        title="見出し2"
      />
      <Button
        appearance={blockType === 'h3' ? 'primary' : 'subtle'}
        icon={<TextHeader3Regular />}
        onClick={() => formatHeading('h3')}
        size="small"
        title="見出し3"
      />
      <Button
        appearance={blockType === 'paragraph' ? 'primary' : 'subtle'}
        onClick={formatParagraph}
        size="small"
        title="段落"
      >
        P
      </Button>
      <div style={{ width: '1px', backgroundColor: '#edebe9', margin: '0 4px' }} />
      <Button
        appearance={isLink ? 'primary' : 'subtle'}
        icon={<LinkRegular />}
        onClick={insertLink}
        size="small"
        title="リンク"
      />
      <Button
        appearance="subtle"
        icon={<ListRegular />}
        onClick={insertUnorderedList}
        size="small"
        title="箇条書きリスト"
      />
      <Button
        appearance="subtle"
        icon={<NumberSymbolRegular />}
        onClick={insertOrderedList}
        size="small"
        title="番号付きリスト"
      />
    </div>
  );
}

export const LexicalEditor: React.FC<LexicalEditorProps> = ({ value, onChange, placeholder }) => {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div style={{ 
        position: 'relative',
        minHeight: '200px',
        border: '1px solid #edebe9',
        borderRadius: '4px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <ToolbarPlugin />
        <div style={{ position: 'relative', flex: 1 }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                style={{
                  minHeight: '200px',
                  padding: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#323130',
                }}
              />
            }
            placeholder={
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  fontSize: '14px',
                  color: '#605e5c',
                  pointerEvents: 'none',
                }}
              >
                {placeholder || '内容を入力...'}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <SetInitialValuePlugin value={value} />
        <CustomOnChangePlugin onChange={onChange} />
      </div>
    </LexicalComposer>
  );
};
