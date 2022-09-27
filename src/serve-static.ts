import { existsSync, readFileSync } from 'fs'
import type { Handler } from 'hono/dist/hono'
import { getFilePath } from 'hono/utils/filepath'
import { getMimeType } from 'hono/utils/mime'

export type ServeStaticOptions = {
  root?: string
  path?: string
  index?: string // default is 'index.html'
}

export const serveStatic = (options: ServeStaticOptions = { root: '' }): Handler => {
  return async (c, next): Promise<Response | undefined> => {
    // Do nothing if Response is already set
    if (c.res && c.finalized) {
      await next()
    }
    const url = new URL(c.req.url)

    let path = getFilePath({
      filename: options.path ?? url.pathname,
      root: options.root,
      defaultDocument: options.index ?? 'index.html',
    })
    path = `./${path}`

    if (existsSync(path)) {
      const content = readFileSync(path)
      if (content) {
        const mimeType = getMimeType(path)
        if (mimeType) {
          c.res.headers.set('Content-Type', mimeType)
        }
        // Return Response object
        return c.body(content)
      }
    }

    console.warn(`Static file: ${path} is not found`)
    await next()
    return
  }
}