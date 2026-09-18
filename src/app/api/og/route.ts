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
    
    // Extract favicon/logo
    let logo = $('link[rel="apple-touch-icon"]').attr('href') || 
               $('link[rel="icon"]').attr('href') || 
               $('link[rel="shortcut icon"]').attr('href') ||
               '/favicon.ico'

    // Handle relative URLs
    const urlObj = new URL(url)
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`

    if (image && !image.startsWith('http')) {
      image = `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`
    }
    
    if (logo && !logo.startsWith('http')) {
      logo = `${baseUrl}${logo.startsWith('/') ? '' : '/'}${logo}`
    }

    return NextResponse.json({
      title: title || '',
      description: description || '',
      image: image || '',
      logo: logo || ''
    })
  } catch (error) {
    console.error('Error fetching OG data:', error)
    return NextResponse.json({ error: 'Failed to fetch OpenGraph data' }, { status: 500 })
  }
}
