import fs from 'fs/promises'
import camelcase from 'camelcase'
import { rimraf } from 'rimraf'
import { transform } from '@svgr/core'
import { transformAsync } from '@babel/core'
import TransformReactJSX from '@babel/plugin-transform-react-jsx'
import { ensureWrite, ensureWriteJson, exportAll } from './utils.js'
import { buildLotties } from './build-lotties.js'

async function transformer(svg, componentName, format) {
  // convert svg to react component
  const component = await transform(
    svg,
    { plugins: ['@svgr/plugin-jsx'], ref: true, titleProp: true },
    { componentName }
  )

  // convert react component to js
  let { code } = await transformAsync(component, {
    plugins: [[TransformReactJSX, { useBuiltIns: true }]],
  })

  if (format === 'esm') {
    return code
  }

  return code
    .replace('import * as React from "react"', 'const React = require("react")')
    .replace('export default', 'module.exports =')
}

// get all icons from the optimized folder
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

async function main() {
  const cjsPackageJson = { module: './esm/index.js', sideEffects: false }
  const esmPackageJson = { type: 'module', sideEffects: false }

  console.log(`Building package...`)

  await Promise.all([
    rimraf(`./outlined/*`),
    rimraf(`./duocolor/*`),
    rimraf(`./duotone/*`),
    rimraf(`./solid/*`),
    rimraf(`./lotties/*`),
  ])

  await Promise.all([
    buildIcons('outlined', 'cjs'),
    buildIcons('outlined', 'esm'),
    buildIcons('duocolor', 'cjs'),
    buildIcons('duocolor', 'esm'),
    buildIcons('duotone', 'cjs'),
    buildIcons('duotone', 'esm'),
    buildIcons('solid', 'cjs'),
    buildIcons('solid', 'esm'),
    buildLotties('cjs'),
    buildLotties('esm'),
    ensureWriteJson(`./outlined/esm/package.json`, esmPackageJson),
    ensureWriteJson(`./outlined/package.json`, cjsPackageJson),
    ensureWriteJson(`./duocolor/esm/package.json`, esmPackageJson),
    ensureWriteJson(`./duocolor/package.json`, cjsPackageJson),
    ensureWriteJson(`./duotone/esm/package.json`, esmPackageJson),
    ensureWriteJson(`./duotone/package.json`, cjsPackageJson),
    ensureWriteJson(`./solid/esm/package.json`, esmPackageJson),
    ensureWriteJson(`./solid/package.json`, cjsPackageJson),
    ensureWriteJson(`./lotties/esm/package.json`, esmPackageJson),
    ensureWriteJson(`./lotties/package.json`, cjsPackageJson),
  ])

  let packageJson = JSON.parse(await fs.readFile(`./package.json`, 'utf8'))

  packageJson.exports = await buildExports(['outlined', 'duocolor', 'duotone', 'solid', 'lotties'])

  await ensureWriteJson(`./package.json`, packageJson)

  return console.log(`Finished building package.`)
}

main()
