"use client";

import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface TinyEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

export default function TinyEditor({ value, onChange, placeholder = "Start writing...", height = 400 }: TinyEditorProps) {
  return (
    <Editor
      apiKey="j5716mkwfqq7lrhswqmjubgdp0090kx11l2wsqhfoc64sg6c"
      value={value}
      onEditorChange={(content: string) => onChange(content)}
      init={{
        height: height,
        menubar: false,
        plugins: [
          'advlist autolink lists link image charmap preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table help wordcount'
        ],
        toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | preview media | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        placeholder: placeholder,
        image_advtab: true,
        image_uploadtab: true,
        images_upload_url: '/api/upload-image',
        images_upload_handler: (blobInfo, success, failure) => {
          // For now, convert to base64 and store as data URL
          const reader = new FileReader();
          reader.onload = () => {
            success(reader.result as string);
          };
          reader.readAsDataURL(blobInfo.blob());
        },
        automatic_uploads: false,
        file_picker_types: 'image',
        file_picker_callback: (callback, value, meta) => {
          if (meta.filetype === 'image') {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  const result = reader.result as string;
                  callback(result, { alt: file.name });
                };
                reader.readAsDataURL(file);
              }
            };
            input.click();
          }
        }
      }}
    />
  );
}
