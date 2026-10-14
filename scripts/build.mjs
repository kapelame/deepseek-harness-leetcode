#!/usr/bin/env node
/**
 * Build dsh-plugin-learn from source inside a DeepSeek Harness checkout.
 *
 * The Learn sources compile as three DSH workspace packages because they use
 * the DSH build pipeline (TypeScript project references, the client bundle
 * preset, and the Typert generator). This script copies them into a checkout,
 * builds it, and assembles the built artifacts into this package's `lib/`.
 *
 *   node scripts/build.mjs <dsh-checkout>                  build, then assemble
 *   node scripts/build.mjs <dsh-checkout> --skip-install   build without running pnpm install first
 *   node scripts/build.mjs <dsh-checkout> --assemble-only  assemble an existing build
 *
 * Tested with checkouts at tag dsh-v0.2.0-rc.2 and later 0.2.x commits.
 */
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const [checkoutArg, ...flags] = process.argv.slice(2)
if (checkoutArg === undefined) {
  console.error('usage: node scripts/build.mjs <dsh-checkout> [--skip-install | --assemble-only]')
  process.exit(2)
}
const dsh = resolve(checkoutArg)
const experimental = join(dsh, 'packages/experimental')
if (!existsSync(join(dsh, 'tsconfig.base.json')) || !existsSync(experimental)) {
  console.error(`build: ${dsh} is not a DeepSeek Harness checkout`)
  process.exit(2)
}

/** Old workspace names and the names they take inside this package. */
const RENAMES = [
  ['@deepseek-ai/dsh-experimental-client-ui-learn', 'dsh-plugin-learn'],
  ['@deepseek-ai/dsh-experimental-api-learn', 'dsh-plugin-learn'],
  ['@deepseek-ai/dsh-experimental-learn', 'dsh-plugin-learn/service'],
]
const PACKAGES = ['learn', 'api-learn', 'client-ui-learn']

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd, stdio: 'inherit',
    env: { ...process.env, npm_config_verify_deps_before_run: 'false', pnpm_config_verify_deps_before_run: 'false' },
  })
  if (result.status !== 0) throw new Error(`build: ${command} ${args.join(' ')} exited with ${String(result.status ?? result.signal)}`)
}

function insertOnce(file, anchor, text) {
  const source = readFileSync(file, 'utf8')
  if (source.includes(text)) return
  if (!source.includes(anchor)) throw new Error(`build: ${file} has no line ${JSON.stringify(anchor.trim())}`)
  writeFileSync(file, source.replace(anchor, anchor + text))
}

function stage() {
  for (const name of PACKAGES) {
    const target = join(experimental, name)
    // Keep node_modules so an installed checkout can rebuild with --skip-install.
    if (existsSync(target)) {
      for (const entry of readdirSync(target)) if (entry !== 'node_modules') rmSync(join(target, entry), { recursive: true, force: true })
    }
    cpSync(join(root, 'source', name), target, { recursive: true })
  }
  cpSync(join(root, 'content'), join(experimental, 'learn/content'), { recursive: true })
  cpSync(join(root, 'runtime'), join(experimental, 'learn/runtime'), { recursive: true })
  const paths = ['learn', 'learn/types', 'api-learn', 'api-learn/types', 'client-ui-learn', 'client-ui-learn/client'].map((spec) => {
    const [pkg, sub] = spec.split('/')
    const file = sub === undefined ? 'index.ts' : sub === 'client' ? 'client/index.ts' : 'types.ts'
    return `      "@deepseek-ai/dsh-experimental-${spec}": ["./packages/experimental/${pkg}/src/${file}"],\n`
  }).join('')
  insertOnce(join(dsh, 'tsconfig.base.json'), '    "paths": {\n', paths)
  insertOnce(join(dsh, 'tsconfig.host.json'), '  "references": [\n',
    '    { "path": "./packages/experimental/learn" },\n    { "path": "./packages/experimental/api-learn" },\n')
  insertOnce(join(dsh, 'tsconfig.client.json'), '  "references": [\n', '    { "path": "./packages/experimental/client-ui-learn" },\n')
}

function renamed(file) {
  let text = readFileSync(file, 'utf8')
  for (const [from, to] of RENAMES) text = text.split(from).join(to)
  return text
}

function assemble() {
  const lib = join(root, 'lib')
  rmSync(lib, { recursive: true, force: true })
  mkdirSync(lib)
  const built = name => join(experimental, name, 'lib')
  const copies = [
    [join(built('learn'), 'index.js'), 'service.js'],
    [join(built('api-learn'), 'index.js'), 'index.js'],
    [join(built('api-learn'), 'typert.host.js'), 'typert.host.js'],
    [join(built('api-learn'), 'typert.host.d.ts'), 'typert.host.d.ts'],
    [join(built('api-learn'), 'typert.remote-client.js'), 'typert.remote-client.js'],
    [join(built('client-ui-learn'), 'client.js'), 'client.js'],
  ]
  for (const [from, to] of copies) {
    if (!existsSync(from)) throw new Error(`build: missing ${from}; build the checkout first`)
    writeFileSync(join(lib, to), renamed(from))
  }
  // The Remote controller imports the service by its workspace name; inside one package it is a sibling module.
  const index = join(lib, 'index.js')
  writeFileSync(index, readFileSync(index, 'utf8').split('"dsh-plugin-learn/service"').join('"./service.js"')
    .split("'dsh-plugin-learn/service'").join("'./service.js'"))
  console.log(`build: assembled ${copies.length} artifacts into lib/`)
}

if (!flags.includes('--assemble-only')) {
  stage()
  if (!flags.includes('--skip-install')) run('pnpm', ['install'], dsh)
  run('npx', ['tsx', 'scripts/build.ts'], dsh)
}
assemble()
