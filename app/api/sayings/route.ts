import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

const SAYINGS_KEY = 'sayings'

interface Saying {
  date: string;
  content: string;
  tags: string[];
}

/**
 * 异步获取说说列表
 * 
 * 此函数尝试从键值存储中加载说说列表。如果列表不存在，则创建一个新的列表并保存到存储中。
 * 
 * @returns {Promise<Saying[]>} 返回一个承诺，该承诺解析为说说数组
 */
async function getSayings(): Promise<Saying[]> {
  try {
    // 从键值存储中获取说说列表
    let sayings = await kv.get<Saying[]>(SAYINGS_KEY);
    console.log(getSayings);

// 如果从存储中加载的说说列表为空，则初始化一个新的空数组
// 这确保了后续的操作可以针对一个存在的数组对象进行，而不是对null或undefined
  if (!sayings) {
    sayings = []
  }
    // 返回找到的说说列表
    return sayings;
  } catch (error) {
    // 如果发生错误，记录详细的错误日志并返回一个空数组
    console.error('Error getting sayings:', error);
    // 增加更详细的错误处理逻辑
    throw new Error('Failed to fetch sayings');
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
  try {
    const sayings = await getSayings(); // 获取说说列表，此处使用了await来等待getSayings函数的异步操作完成
    return NextResponse.json(sayings); // 将获取到的说说列表通过NextResponse.json方法转换为JSON响应返回
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json({ error: 'Failed to fetch sayings' }, { status: 500 });
  }
}