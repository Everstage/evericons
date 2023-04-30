const fs = require('fs').promises
const camelcase = require('camelcase')
const { promisify } = require('util')
const rimraf = promisify(require('rimraf'))
const svgr = require('@svgr/core').default
const babel = require('@babel/core')
const { dirname } = require('path')

let transform = async (svg, componentName, format) => {
  let component = await svgr(svg, { ref: true, titleProp: true }, { componentName })
  let { code } = await babel.transformAsync(component, {
    plugins: [[require('@babel/plugin-transform-react-jsx'), { useBuiltIns: true }]],
  })

  if (format === 'esm') {
    return code
  }

  return code
    .replace('import * as React from "react"', 'const React = require("react")')
    .replace('export default', 'module.exports =')
}

async function getIcons(package) {
  let files = await fs.readdir(`./optimized/${package}`)
  return Promise.all(
    files.map(async (file) => ({
      svg: await fs.readFile(`./optimized/${package}/${file}`, 'utf8'),
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

async function buildIcons(package, format) {
  let outDir = `./${package}`
  if (format === 'esm') {
    outDir += '/esm'
  }

  let icons = await getIcons(package)

  await Promise.all(
    icons.flatMap(async ({ componentName, svg }) => {
      let content = await transform(svg, componentName, format)
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
 * @param {string[]} packages
 */
async function buildExports(packages) {
  let pkg = {}

  // To appease Vite's optimizeDeps feature which requires a root-level import
  pkg[`.`] = {
    import: `./index.esm.js`,
    require: `./index.js`,
  }

  // For those that want to read the version from package.json
  pkg[`./package.json`] = { default: './package.json' }

  // Explicit exports for each package:
  for (let package of packages) {
    pkg[`./${package}`] = {
      types: `./${package}/index.d.ts`,
      import: `./${package}/esm/index.js`,
      require: `./${package}/index.js`,
    }
    pkg[`./${package}/*`] = {
      types: `./${package}/*.d.ts`,
      import: `./${package}/esm/*.js`,
      require: `./${package}/*.js`,
    }
    pkg[`./${package}/*.js`] = {
      types: `./${package}/*.d.ts`,
      import: `./${package}/esm/*.js`,
      require: `./${package}/*.js`,
    }

    // This dir is basically an implementation detail, but it's needed for
    // backwards compatibility in case people were importing from it directly.
    pkg[`./${package}/esm/*`] = {
      types: `./${package}/*.d.ts`,
      import: `./${package}/esm/*.js`,
    }
    pkg[`./${package}/esm/*.js`] = {
      types: `./${package}/*.d.ts`,
      import: `./${package}/esm/*.js`,
    }
  }

  return pkg
}

async function main(package) {
  const cjsPackageJson = { module: './esm/index.js', sideEffects: false }
  const esmPackageJson = { type: 'module', sideEffects: false }

  console.log(`Building ${package} package...`)

  await Promise.all([rimraf(`./${package}/static/*`)])

  await Promise.all([
    buildIcons(package, 'cjs'),
    buildIcons(package, 'esm'),
    ensureWriteJson(`./${package}/esm/package.json`, esmPackageJson),
    ensureWriteJson(`./${package}/package.json`, cjsPackageJson),
  ])

  let packageJson = JSON.parse(await fs.readFile(`./package.json`, 'utf8'))

  packageJson.exports = await buildExports([package])

  await ensureWriteJson(`./package.json`, packageJson)

  return console.log(`Finished building ${package} package.`)
}

let package = 'static'

main(package)
