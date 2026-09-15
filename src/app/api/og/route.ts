import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    const html = await response.text()
    const $ = cheerio.load(html)

    const title = $('meta[property="og:title"]').attr('content') || $('title').text()
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content')
    let image = $('meta[property="og:image"]').attr('content')

    // Handle relative image URLs
    if (image && !image.startsWith('http')) {
      const urlObj = new URL(url)
      image = `${urlObj.protocol}//${urlObj.host}${image.startsWith('/') ? '' : '/'}${image}`
    }

    return NextResponse.json({
      title: title || '',
      description: description || '',
      image: image || ''
    })
  } catch (error) {
    console.error('Error fetching OG data:', error)
    return NextResponse.json({ error: 'Failed to fetch OpenGraph data' }, { status: 500 })
  }
}
