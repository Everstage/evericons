import fs from 'fs/promises'
import camelcase from 'camelcase'
import TransformReactJSX from '@babel/plugin-transform-react-jsx'
import { transformAsync } from '@babel/core'
import { ensureWrite, exportAll } from './utils.js'

async function transformer(lottieWrapper, format) {
  let { code } = await transformAsync(lottieWrapper, {
    plugins: [[TransformReactJSX, { useBuiltIns: true }]],
  })

  if (format === 'esm') {
    return code
  }

  return code
    .replace('import * as React from "react"', 'const React = require("react")')
    .replace('export default', 'module.exports =')
}

async function getIcons() {
  let files = await fs.readdir(`./src/lotties`)
  return Promise.all(
    files.map(async (file) => {
      const componentName = `${camelcase(file.replace(/\.json$/, ''), {
        pascalCase: true,
      })}Lottie`
      const lottieWrapperTemplate = await fs.readFile(`./src/LottieComponentTemplate.txt`, 'utf8')
      const lottieWrapper = lottieWrapperTemplate
        .replace('{ComponentName}', componentName)
        // read the file and replace
        .replace('{LottieJson}', `./${file}`)

      return {
        lottieWrapper: lottieWrapper,
        componentName,
      }
    })
  )
}

export async function buildLotties(format) {
  let outDir = `./lotties`
  if (format === 'esm') {
    outDir += '/esm'
  }

  let icons = await getIcons()

  await Promise.all(
    icons.flatMap(async ({ componentName, lottieWrapper }) => {
      let content = await transformer(lottieWrapper, componentName, format)
      return [ensureWrite(`${outDir}/${componentName}.js`, content)]
    })
  )

  await ensureWrite(`${outDir}/index.js`, exportAll(icons, format))

  await ensureWrite(`${outDir}/index.d.ts`, exportAll(icons, 'esm', false))
}
