import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEInstance } from 'tinymce';

interface TinyMCEEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<TinyMCEInstance | null>(null);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div style={{ 
      border: '1px solid #edebe9',
      borderRadius: '4px',
      backgroundColor: '#ffffff',
      height: '100%',
      minHeight: '300px',
    }}>
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        onInit={(_evt, editor) => {
          editorRef.current = editor;
          // 初期値を設定
          if (value) {
            editor.setContent(value);
          }
        }}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: '100%',
          menubar: false,
          base_url: '/tinymce',
          suffix: '.min',
          plugins: [
            'advlist', 'anchor', 'autolink', 'autoresize', 'charmap', 'code', 'codesample',
            'directionality', 'emoticons', 'fullscreen', 'help', 'image', 'insertdatetime',
            'link', 'lists', 'media', 'nonbreaking', 'pagebreak', 'preview', 'quickbars',
            'save', 'searchreplace', 'table', 'visualblocks', 'visualchars', 'wordcount'
          ],
          toolbar: 'undo redo | formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code preview fullscreen',
          content_style: 'body { font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif; font-size: 14px; line-height: 1.6; color: #323130; }',
          placeholder: placeholder || '内容を入力...',
        }}
      />
    </div>
  );
};
