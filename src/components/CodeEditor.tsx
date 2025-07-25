import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, language, readOnly = false }) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Disable copy-paste in editor during tests
    if (!readOnly) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
        // Allow copy during development, disable in production
      });
      
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
        // Allow paste during development, disable in production
      });
      
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => {
        // Allow cut during development, disable in production
      });
    }
  };

  const getLanguageMapping = (lang: string) => {
    const mapping: { [key: string]: string } = {
      'python': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'javascript': 'javascript',
      'typescript': 'typescript',
    };
    return mapping[lang] || 'plaintext';
  };

  return (
    <div className="code-editor">
      <Editor
        height="400px"
        language={getLanguageMapping(language)}
        value={value}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          theme: 'vs-light',
          contextmenu: false,
          selectOnLineNumbers: false,
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          wordWrap: 'on',
          tabSize: 2,
          insertSpaces: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;