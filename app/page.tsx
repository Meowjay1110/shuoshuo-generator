"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Trash2 } from 'lucide-react'

export default function Home() {
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [result, setResult] = useState<any[]>([])

  useEffect(() => {
    fetchSayings()
  }, [])

  const fetchSayings = async () => {
    const response = await fetch('/api/generate')
    const json = await response.json()
    setResult(json)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const currentDate = new Date().toISOString().replace('T', ' ').substring(0, 19)
    const sayingData = {
      date: currentDate,
      content: content,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    }
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sayingData),
    })
    const json = await response.json()
    setResult(json)
    setContent('')
    setTags('')
  }

  const handleDelete = async (index: number) => {
    const response = await fetch('/api/generate', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ index }),
    })
    const json = await response.json()
    setResult(json)
  }

  const handleDeleteAll = async () => {
    const response = await fetch('/api/generate', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ index: -1 }),
    })
    const json = await response.json()
    setResult(json)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">说说生成器</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>添加新说说</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">内容</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">标签 (用逗号分隔)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="标签1, 标签2, 标签3"
                />
              </div>
              <Button type="submit" className="w-full">添加说说</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              所有保存的说说
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAll}
                className="ml-2"
              >
                删除所有
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {result.length > 0 ? (
                result.map((saying, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-100 rounded-lg relative">
                    <p className="font-bold">{saying.date}</p>
                    <p>{saying.content}</p>
                    <p className="text-sm text-gray-500">
                      标签: {Array.isArray(saying.tags) ? saying.tags.join(', ') : '无标签'}
                    </p>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleDelete(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">删除</span>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">还没有保存的说说</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}