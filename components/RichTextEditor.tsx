'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

// @ts-ignore
const RichTextEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false, // CRITICAL for Next.js SSR
    onUpdate: ({ editor }) => {
      // Send JSON to the parent component
      onChange(editor.getJSON());
    },
  })

  return (
    <div className="border p-4 rounded-md">
      {/* You can build your custom toolbar here */}
      <EditorContent editor={editor} className="prose max-w-none focus:outline-none" />
    </div>
  )
}
export default RichTextEditor;