import fs from 'fs/promises'
import camelcase from 'camelcase'
import TransformReactJSX from '@babel/plugin-transform-react-jsx'
import { transformAsync } from '@babel/core'
import { ensureWrite, exportAll } from './utils.js'

// transform the lottie wrapper to a react component
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

// get all lottie json files
async function getLottieJsons(format) {
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
        .replace('{LottieJson}', format === 'esm' ? `../${file}` : `./${file}`)

      return {
        lottieWrapper: lottieWrapper,
        componentName,
      }
    })
  )
}

// build lottie components
export async function buildLotties(format) {
  let outDir = `./lotties`
  if (format === 'esm') {
    outDir += '/esm'
  }

  let icons = await getLottieJsons(format)

  await Promise.all(
    icons.flatMap(async ({ componentName, lottieWrapper }) => {
      let content = await transformer(lottieWrapper, componentName, format)
      return [ensureWrite(`${outDir}/${componentName}.js`, content)]
    })
  )

  await ensureWrite(`${outDir}/index.js`, exportAll(icons, format))

  await ensureWrite(`${outDir}/index.d.ts`, exportAll(icons, 'esm', false))
}
