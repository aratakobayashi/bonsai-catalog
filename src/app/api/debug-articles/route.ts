import { NextRequest, NextResponse } from 'next/server'
import { ArticleManager } from '@/lib/cms/article-manager'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const contentDir = path.join(process.cwd(), 'public/content/guides')

    // Check if directory exists
    let dirExists = false
    try {
      await fs.access(contentDir)
      dirExists = true
    } catch (e) {
      dirExists = false
    }

    // List files in directory
    let files: string[] = []
    if (dirExists) {
      try {
        files = await fs.readdir(contentDir)
      } catch (e) {
        files = [`Error reading directory: ${e}`]
      }
    }

    // Try to get articles
    let articles: any[] = []
    let articleError = ''
    try {
      const articleManager = new ArticleManager()
      articles = await articleManager.getAllArticles()
    } catch (e) {
      articleError = e instanceof Error ? e.message : String(e)
    }

    return NextResponse.json({
      success: true,
      debug: {
        contentDir,
        dirExists,
        fileCount: files.length,
        files: files.slice(0, 10), // Show first 10 files
        articlesCount: articles.length,
        articleError,
        sampleArticleTitles: articles.slice(0, 5).map(a => a.title),
        nodeEnv: process.env.NODE_ENV,
        cwd: process.cwd()
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    })
  }
}