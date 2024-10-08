"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Trash2, Copy } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useTheme } from "next-themes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Home() {
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [result, setResult] = useState<any[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      fetchSayings(storedToken)
    }
  }, [])

  const login = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json()
      if (data.token) {
        setToken(data.token)
        localStorage.setItem('token', data.token)
        fetchSayings(data.token)
        toast({
          title: "登录成功",
          description: "欢迎回来！",
          duration: 3000,
        })
      } else {
        throw new Error(data.error || '登录失败')
      }
    } catch (error) {
      toast({
        title: "登录失败",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const logout = () => {
    setToken('')
    localStorage.removeItem('token')
    setResult([])
    toast({
      title: "已登出",
      description: "您已成功登出。",
      duration: 3000,
    })
  }

  const fetchSayings = async (authToken: string) => {
    try {
      const response = await fetch('/api/generate', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })
      if (!response.ok) {
        throw new Error('获取说说失败')
      }
      const json = await response.json()
      setResult(json)
    } catch (error) {
      toast({
        title: "获取说说失败",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const currentDate = new Date().toISOString()
      const sayingData = {
        date: currentDate,
        content: content,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      }
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sayingData),
      })
      if (!response.ok) {
        throw new Error('添加说说失败')
      }
      const json = await response.json()
      setResult(json)
      setContent('')
      setTags('')
      toast({
        title: "添加成功",
        description: "新的说说已成功添加。",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "添加失败",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (index: number) => {
    toast({
      title: "确认删除",
      description: "您确定要删除这条说说吗？",
      action: (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">删除</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                此操作无法撤销。确定要删除这条说说吗？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmDelete(index)}>
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
      variant: "destructive",
    })
  }

  const confirmDelete = async (index: number) => {
    try {
      const response = await fetch('/api/generate', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ index }),
      })
      if (!response.ok) {
        throw new Error('删除说说失败')
      }
      const json = await response.json()
      setResult(json)
      toast({
        title: "删除成功",
        description: "说说已成功删除。",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "删除失败",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteAll = () => {
    toast({
      title: "确认删除所有",
      description: "您确定要删除所有说说吗？",
      action: (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">删除所有</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除所有说说</AlertDialogTitle>
              <AlertDialogDescription>
                此操作无法撤销。确定要删除所有说说吗？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteAll}>
                确认删除所有
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
      variant: "destructive",
    })
  }

  const confirmDeleteAll = async () => {
    try {
      const response = await fetch('/api/generate', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ index: -1 }),
      })
      if (!response.ok) {
        throw new Error('删除所有说说失败')
      }
      const json = await response.json()
      setResult(json)
      toast({
        title: "删除成功",
        description: "所有说说已成功删除。",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "删除失败",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const copyJsonUrl = async () => {
    const url = `${window.location.origin}/api/sayings`
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "复制成功",
        description: "JSON 访问 URL 已复制到剪贴板。",
        duration: 3000,
      })

      // 测试 API 访问
      const response = await fetch(url)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`API 访问失败: ${errorData.error || response.statusText}`)
      }
      const data = await response.json()
      console.log('API 访问成功:', data)
      toast({
        title: "API 访问成功",
        description: "成功获取 JSON 数据。",
        duration: 3000,
      })
    } catch (error) {
      console.error('API 访问错误:', error)
      toast({
        title: "API 访问失败",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  if (!token) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>登录</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); login(); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">登录</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">说说生成器</h1>
        <div className="flex items-center space-x-4">
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择主题" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">浅色</SelectItem>
              <SelectItem value="dark">深色</SelectItem>
              <SelectItem value="system">系统</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={logout}>登出</Button>
        </div>
      </div>
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
                  placeholder="标签1,标签2,标签3"
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
      <div className="mt-6 flex justify-center">
        <div className="flex items-center">
          <Input
            value={`${window.location.origin}/api/sayings`}
            readOnly
            className="mr-2 flex-grow"
          />
          <Button onClick={copyJsonUrl}>
            <Copy className="h-4 w-4 mr-2" />
            复制 JSON URL
          </Button>
        </div>
      </div>
    </div>
  )
}