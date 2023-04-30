import fs from 'fs/promises'
import camelcase from 'camelcase'
import { rimraf } from 'rimraf'
import { transform } from '@svgr/core'
import { dirname } from 'path'

let transformer = async (svg, componentName, format) => {
  const jsCode = await transform(svg, { ref: true, titleProp: true }, { componentName })

  if (format === 'esm') {
    return jsCode
  }

  return jsCode
    .replace('import * as React from "react"', 'const React = require("react")')
    .replace('export default', 'module.exports =')
}

async function getIcons(styleType) {
  let files = await fs.readdir(`./optimized/${styleType}`)
  return Promise.all(
    files.map(async (file) => ({
      svg: await fs.readFile(`./optimized/${styleType}/${file}`, 'utf8'),
      componentName: `${camelcase(file.replace(/\.svg$/, ''), {
        pascalCase: true,
      })}Icon`,
    }))
  )
}

function exportAll(icons, format, includeExtension = true) {
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

async function ensureWrite(file, text) {
  await fs.mkdir(dirname(file), { recursive: true })
  await fs.writeFile(file, text, 'utf8')
}

async function ensureWriteJson(file, json) {
  await ensureWrite(file, JSON.stringify(json, null, 2) + '\n')
}

async function buildIcons(styleType, format) {
  let outDir = `./${styleType}`
  if (format === 'esm') {
    outDir += '/esm'
  }

  let icons = await getIcons(styleType)

  await Promise.all(
    icons.flatMap(async ({ componentName, svg }) => {
      let content = await transformer(svg, componentName, format)
      let types = `import * as React from 'react';\ndeclare const ${componentName}: React.ForwardRefExoticComponent<React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & { title?: string, titleId?: string } & React.RefAttributes<SVGSVGElement>>;\nexport default ${componentName};\n`

      return [
        ensureWrite(`${outDir}/${componentName}.js`, content),
        ...(types ? [ensureWrite(`${outDir}/${componentName}.d.ts`, types)] : []),
      ]
    })
  )

  await ensureWrite(`${outDir}/index.js`, exportAll(icons, format))

  await ensureWrite(`${outDir}/index.d.ts`, exportAll(icons, 'esm', false))
}

/**
 * @param {string[]} styleTypes
 */
async function buildExports(styleTypes) {
  let pkg = {}

  // To appease Vite's optimizeDeps feature which requires a root-level import
  pkg[`.`] = {
    import: `./index.esm.js`,
    require: `./index.js`,
  }

  // For those that want to read the version from package.json
  pkg[`./package.json`] = { default: './package.json' }

  // Explicit exports for each package:
  for (let styleType of styleTypes) {
    pkg[`./${styleType}`] = {
      types: `./${styleType}/index.d.ts`,
      import: `./${styleType}/esm/index.js`,
      require: `./${styleType}/index.js`,
    }
    pkg[`./${styleType}/*`] = {
      types: `./${styleType}/*.d.ts`,
      import: `./${styleType}/esm/*.js`,
      require: `./${styleType}/*.js`,
    }
    pkg[`./${styleType}/*.js`] = {
      types: `./${styleType}/*.d.ts`,
      import: `./${styleType}/esm/*.js`,
      require: `./${styleType}/*.js`,
    }

    // This dir is basically an implementation detail, but it's needed for
    // backwards compatibility in case people were importing from it directly.
    pkg[`./${styleType}/esm/*`] = {
      types: `./${styleType}/*.d.ts`,
      import: `./${styleType}/esm/*.js`,
    }
    pkg[`./${styleType}/esm/*.js`] = {
      types: `./${styleType}/*.d.ts`,
      import: `./${styleType}/esm/*.js`,
    }
  }

  return pkg
}

async function main(styleType) {
  const cjsPackageJson = { module: './esm/index.js', sideEffects: false }
  const esmPackageJson = { type: 'module', sideEffects: false }

  console.log(`Building ${styleType} package...`)

  await Promise.all([rimraf(`./${styleType}/static/*`)])

  await Promise.all([
    buildIcons(styleType, 'cjs'),
    buildIcons(styleType, 'esm'),
    ensureWriteJson(`./${styleType}/esm/package.json`, esmPackageJson),
    ensureWriteJson(`./${styleType}/package.json`, cjsPackageJson),
  ])

  let packageJson = JSON.parse(await fs.readFile(`./package.json`, 'utf8'))

  packageJson.exports = await buildExports([styleType])

  await ensureWriteJson(`./package.json`, packageJson)

  return console.log(`Finished building ${styleType} package.`)
}

let styleType = 'static'

main(styleType)
