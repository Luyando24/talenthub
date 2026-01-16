'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import 'react-quill-new/dist/quill.snow.css'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    // Custom modules for the toolbar
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    }), [])

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'link'
    ]

    return (
        <div className="bg-background">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="min-h-[150px] [&_.ql-container]:min-h-[150px] [&_.ql-toolbar]:bg-muted/50 [&_.ql-toolbar]:border-input [&_.ql-container]:border-input [&_.ql-container]:bg-background [&_.ql-container]:text-foreground [&_.ql-editor]:text-foreground [&_.ql-picker-label]:text-foreground [&_.ql-stroke]:stroke-foreground [&_.ql-fill]:fill-foreground"
            />
        </div>
    )
}
