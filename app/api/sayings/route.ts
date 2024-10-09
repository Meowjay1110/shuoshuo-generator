import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

const SAYINGS_KEY = 'sayings'

interface Saying {
  date: string;
  content: string;
  tags: string[];
}

/**
 * 异步获取格言列表
 * 
 * 此函数尝试从键值存储中加载格言列表如果列表不存在，则创建一个新的列表并保存到存储中
 * 
 * @returns {Promise<Saying[]>} 返回一个承诺，该承诺解析为格言数组
 */
async function getSayings(): Promise<Saying[]> {
  try {
    // 从键值存储中获取格言列表
    let sayings = await kv.get<Saying[]>(SAYINGS_KEY)
    
    // 如果没有找到格言列表，则创建一个新的列表并保存到键值存储中
    if (!sayings) {
      sayings = [] as Saying[]
      await kv.set(SAYINGS_KEY, sayings)
    }

    // 返回找到的格言列表
    return sayings || []
  } catch (error) {
    // 如果发生错误，打印错误信息并返回一个空数组
    console.error('Error getting sayings:', error)
    return []
  }
}

/**
 * 异步函数GET，用于获取说说列表
 * 
 * 此函数通过调用getSayings函数来获取一组说说，并通过NextResponse.json方法将其作为JSON响应返回
 * 它主要用于处理HTTP GET请求，向客户端返回数据
 * 
 * @returns {Promise<NextResponse>} 返回一个Promise对象，该对象解析为包含说说列表的NextResponse对象
 */
export async function GET() {
  const sayings = await getSayings() // 获取说说列表，此处使用了await来等待getSayings函数的异步操作完成
  return NextResponse.json(sayings) // 将获取到的说说列表通过NextResponse.json方法转换为JSON响应返回
}