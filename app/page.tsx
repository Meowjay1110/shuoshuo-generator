"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Trash2, Copy } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoonIcon, SunIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons"

interface Saying {
  date: string;
  content: string;
  tags: string[];
}
export default function Home() {
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [result, setResult] = useState<any[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const { toast } = useToast()
  const { setTheme } = useTheme()
  const [isLoginExpired, setIsLoginExpired] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      fetchSayings(storedToken)
    }
  }, [])

  /**
   * 异步登录函数，用于向后端API发送登录请求，并处理登录响应
   * 
   * 尝试通过POST请求向'/api/login'发送用户名和密码，接收服务器响应
   * 如果服务器返回有效的token，则将token存储到本地存储，并记录登录时间
   * 同时，更新登录状态，调用fetchSayings函数获取格言数据，并显示登录成功的提示
   * 如果登录失败，捕获错误并显示登录失败的提示
   */
  const login = async () => {
    try {
      // 发送登录请求，包括用户名和密码
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      // 解析服务器返回的JSON数据
      const data = await response.json()
      // 如果数据中包含token，表示登录成功
      if (data.token) {
        setToken(data.token)
        localStorage.setItem('token', data.token)
        localStorage.setItem('loginTime', Date.now().toString())
        setIsLoginExpired(false)
        fetchSayings(data.token)
        toast({
          title: "登录成功",
          description: "欢迎回来！",
        })
      } else {
        // 如果数据中没有token，抛出错误，处理登录失败的情况
        throw new Error(data.error || '登录失败')
      }
    } catch (error: unknown) {
      // 捕获并处理登录过程中的任何错误
      toast({
        title: "登录失败",
        description: error instanceof Error ? error.message : "发生未知错误",
        variant: "destructive",
      })
    }
  }

  /**
   * 执行登出操作
   * 
   * 此函数负责清除用户会话，包括移除存储的令牌和结果数据，并显示登出通知
   * 它通过清除本地存储的令牌和结果数据来实现登出，并通过toast通知用户已成功登出
   */
  const logout = () => {
    setToken('') // 清除令牌
    localStorage.removeItem('token') // 从本地存储中移除令牌
    setResult([]) // 重置结果数据
    toast({
      title: "已登出",
      description: "您已成功登出。",
    }) // 显示登出通知
  }

  /**
   * 异步获取说说
   * @param authToken 用户的认证令牌，用于授权
   */
  const fetchSayings = async (authToken: string) => {
    try {
      // 向生成说说的API发送请求
      const response = await fetch('/api/generate', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })
      // 检查响应状态
      if (!response.ok) {
        throw new Error('获取说说失败')
      }
      // 解析响应的JSON数据
      const json = await response.json()
      // 更新结果状态
      setResult(json)
    } catch (error: unknown) {
      // 显示错误通知
      toast({
        title: "获取说说失败",
        description: error instanceof Error ? error.message : "发生未知错误",
        variant: "destructive",
      })
    }
  }

  /**
   * 处理表单提交的异步函数
   * @param {React.FormEvent} e - 表单提交事件
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // 阻止表单的默认提交行为
    e.preventDefault()

    // 创建一个新的说说对象，包含当前日期、内容和标签
    const newSaying: Saying = {
      date: new Date().toISOString(),
      content: content,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    }

    try {
      // 发送POST请求到API以生成新的说说
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newSaying),
      })

      // 如果响应不成功，则抛出错误
      if (!response.ok) {
        throw new Error('添加说说失败')
      }

      // 解析响应的JSON数据
      const json = await response.json()

      // 更新状态，清空内容和标签，显示成功提示
      setResult(json)
      setContent('')
      setTags('')
      toast({
        title: "添加成功",
        description: "新的说说已成功添加。",
      })
    } catch (error: unknown) {
      // 发生错误时，显示失败提示
      toast({
        title: "添加失败",
        description: error instanceof Error ? error.message : "发生未知错误",
        variant: "destructive",
      })
    }
  }

  /**
   * 异步处理删除请求
   * @param index 要删除的说说的索引
   */
  const handleDelete = async (index: number) => {
    try {
      // 发送DELETE请求到服务器，请求删除指定索引的说说
      const response = await fetch('/api/generate', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ index }),
      })
      // 如果响应状态不是OK，抛出错误
      if (!response.ok) {
        throw new Error('删除说说失败')
      }
      // 解析响应JSON，并更新结果
      const json = await response.json()
      setResult(json)
      // 显示删除成功的提示
      toast({
        title: "删除成功",
        description: "说说已成功删除。",
      })
    } catch (error: unknown) {
      // 显示删除失败的提示，包含错误信息
      toast({
        title: "删除失败",
        description: error instanceof Error ? error.message : "发生未知错误",
        variant: "destructive",
      })
    }
  }

  /**
   * 异步函数，用于删除所有说说
   * 该函数通过发送DELETE请求到'/api/generate'端点来删除所有说说
   * 如果删除成功，更新结果状态并显示成功提示
   * 如果删除失败，显示错误提示
   */
  const handleDeleteAll = async () => {
    try {
      // 发送DELETE请求，附带Content-Type和Authorization头，以及一个表示删除所有说说的特殊索引
      const response = await fetch('/api/generate', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ index: -1 }),
      })
      // 如果服务器响应不是OK，则抛出错误
      if (!response.ok) {
        throw new Error('删除所有说说失败')
      }
      // 解析服务器响应的JSON，并更新结果状态
      const json = await response.json()
      setResult(json)
      // 显示删除成功的提示
      toast({
        title: "删除成功",
        description: "所有说说已成功删除。",
      })
    } catch (error: unknown) {
      // 显示删除失败的提示，包含错误信息
      toast({
        title: "删除失败",
        description: error instanceof Error ? error.message : "发生未知错误",
        variant: "destructive",
      })
    }
  }

  /**
   * 异步函数：复制JSON访问URL到剪贴板并尝试访问该URL
   * 
   * 此函数首先构造一个JSON访问的URL，然后尝试将该URL复制到用户的剪贴板。
   * 随后，它尝试访问该URL以获取JSON数据。如果访问成功，它会记录数据并显示成功提示。
   * 如果访问失败，它会捕获错误并显示错误提示。
   */
  const copyJsonUrl = async () => {
    // 构造JSON访问的URL
    const url = `${window.location.origin}/api/sayings`
  
    try {
      // 尝试将URL复制到剪贴板
      await navigator.clipboard.writeText(url)
      toast({
        title: "复制成功",
        description: "JSON 访问 URL 已复制到剪贴板。",
      })

      // 尝试访问JSON API
      const response = await fetch(url)
      if (!response.ok) {
        // 如果响应不成功，则解析错误信息并抛出错误
        const errorData = await response.json()
        throw new Error(`API 访问失败: ${errorData.error || response.statusText}`)
      }
      // 解析响应的JSON数据
      const data = await response.json()
      console.log('API 访问成功:', data)
      toast({
        title: "API 访问成功",
        description: "成功获取 JSON 数据。",
      })
    } catch (error: unknown) {
      // 捕获并处理访问JSON API时的错误
      console.error('API 访问错误:', error)
      toast({
        title: "API 访问失败",
        description: error instanceof Error ? error.message : "发生未知错误",
        variant: "destructive",
      })
    }
  }

  const checkLoginExpiration = useCallback(() => {
    const loginTime = localStorage.getItem('loginTime')
    if (loginTime) {
      const expirationTime = new Date(parseInt(loginTime) + 60 * 60 * 1000) // 1 hour
      if (new Date() > expirationTime) {
        setIsLoginExpired(true)
        setToken('')
        localStorage.removeItem('token')
        localStorage.removeItem('loginTime')
      }
    }
  }, [])

  if (!token) {
    return (
      <div className="container mx-auto p-4">
        <Card className="w-full max-w-md mx-auto">
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
      {isLoginExpired && (
        <Alert variant="destructive" className="mb-4">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>登录已过期</AlertTitle>
          <AlertDescription>
            您的登录状态已过期，请重新登录。
          </AlertDescription>
        </Alert>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">说说管理器</h1>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          浅色
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          深色
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          跟随系统设置
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
          <Button onClick={logout}>登出</Button>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card text-card-foreground">
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
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">标签 (用逗号分隔)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="标签1,标签2,标签3"
                  className="bg-background text-foreground"
                />
              </div>
              <Button type="submit" className="w-full">添加说说</Button>
            </form>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              所有保存的说说
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">删除所有</Button>
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
                    <AlertDialogAction onClick={handleDeleteAll}>
                      确认删除所有
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full">
              {result.length > 0 ? (
                result.map((saying, index) => (
                  <div key={index} className="mb-4 p-4 bg-muted rounded-lg relative">
                    <p className="font-bold">
                      {new Date(saying.date).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                      })}
                    </p>
                    <p>{saying.content}</p>
                    <p className="text-sm text-muted-foreground">
                      标签: {Array.isArray(saying.tags) ? saying.tags.join(', ') : '无标签'}
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">删除</span>
                        </Button>
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
                          <AlertDialogAction onClick={() => handleDelete(index)}>
                            确认删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic">还没有保存的说说</p>
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
            className="mr-2 flex-grow bg-background text-foreground"
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