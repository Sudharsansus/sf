#!/usr/bin/env node
// Scaffold an @isaii/* package:  npm run new:package -- <name> "<description>" [--react]
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const args = process.argv.slice(2).filter(a => !a.startsWith('--'))
const react = process.argv.includes('--react')
const [name, description = ''] = args
if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error('Usage: npm run new:package -- <kebab-name> "<description>" [--react]')
  process.exit(1)
}
const root = join(import.meta.dirname, '..', '..', 'packages', name)
if (existsSync(root)) { console.error(`packages/${name} already exists`); process.exit(1) }
for (const d of ['src', 'tests']) mkdirSync(join(root, d), { recursive: true })

const write = (rel, content) => writeFileSync(join(root, rel), content)
const preset = react ? 'react' : 'node'
write('package.json', JSON.stringify({
  name: `@isaii/${name}`, version: '0.0.0', private: true, description, type: 'module',
  exports: { '.': './src/index.ts' },
  scripts: { typecheck: 'tsc --noEmit', lint: 'eslint .', test: 'vitest run' },
  dependencies: {}, devDependencies: { '@isaii/config': '*', '@types/node': '22.20.5' },
}, null, 2) + '\n')
write('tsconfig.json', JSON.stringify({ extends: `@isaii/config/typescript/${react ? 'library' : 'node'}.json`, include: ['src/**/*', 'tests/**/*'], exclude: ['node_modules'] }, null, 2) + '\n')
write('eslint.config.mjs', "import { config } from '@isaii/config/eslint'\nexport default config({ tsconfigRootDir: import.meta.dirname })\n")
write('vitest.config.ts', `import { ${preset}Config } from '@isaii/config/vitest/${preset}'\nexport default ${preset}Config()\n`)
write('README.md', `# @isaii/${name}\n\n${description}\n\nPublic API: \`src/index.ts\`. Tests: \`npm test -w @isaii/${name}\`.\n`)
write('src/index.ts', 'export {}\n')
write('tests/index.test.ts', "import { describe, expect, it } from 'vitest'\n\ndescribe('package', () => {\n  it('loads', async () => {\n    expect(await import('../src')).toBeDefined()\n  })\n})\n")
console.log(`Created packages/${name}. Add its layer to packages/config/eslint/index.js, then run npm install.`)
