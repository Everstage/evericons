import fs from 'fs/promises'
import { dirname } from 'path'

export async function ensureWrite(file, text) {
  await fs.mkdir(dirname(file), { recursive: true })
  await fs.writeFile(file, text, 'utf8')
}

export async function ensureWriteJson(file, json) {
  await ensureWrite(file, JSON.stringify(json, null, 2) + '\n')
}

// export all icons to a single file
export function exportAll(icons, format, includeExtension = true) {
  return icons
    .map(({ componentName }) => {
      let extension = includeExtension ? '.js' : ''
      if (format === 'esm') {
        return `export { default as ${componentName} } from './${componentName}${extension}'`
      }
      return `module.exports.${componentName} = require("./${componentName}${extension}")`
    })
    .join('\n')
}
