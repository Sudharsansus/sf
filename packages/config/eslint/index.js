// Shared ESLint flat config. Layer rules keep dependencies flowing one way:
//   app → domain → capability → ai-core → platform
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import boundaries from 'eslint-plugin-boundaries'

export const LAYERS = [
  { type: 'app', pattern: 'apps/*', mode: 'folder' },
  { type: 'domain', pattern: 'packages/domain-*', mode: 'folder' },
  { type: 'capability', pattern: 'packages/(agents|voice|media|guardrails|db|storage|queue|ui|sdk|evals)', mode: 'folder' },
  { type: 'ai-core', pattern: 'packages/(ai-gateway|prompts)', mode: 'folder' },
  { type: 'platform', pattern: 'packages/(core|env|logger|telemetry|cache|flags|i18n|contracts|security|config)', mode: 'folder' },
]

const below = {
  app: ['domain', 'capability', 'ai-core', 'platform'],
  domain: ['domain', 'capability', 'ai-core', 'platform'],
  capability: ['capability', 'ai-core', 'platform'],
  'ai-core': ['ai-core', 'platform'],
  platform: ['platform'],
}

/** @param {{ tsconfigRootDir?: string }} [opts] */
export function config(opts = {}) {
  return tseslint.config(
    { ignores: ['**/dist/**', '**/.next/**', '**/coverage/**', '**/node_modules/**', '**/*.config.*', '**/next-env.d.ts'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
      languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: opts.tsconfigRootDir } },
      plugins: { boundaries },
      settings: {
        'boundaries/elements': LAYERS,
        'boundaries/root-path': new URL('../../../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
        'import/resolver': { typescript: { alwaysTryTypes: true, project: ['apps/*/tsconfig.json', 'packages/*/tsconfig.json'] } },
      },
      rules: {
        'boundaries/element-types': [2, {
          default: 'disallow',
          rules: Object.entries(below).map(([from, allow]) => ({ from, allow })),
        }],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_', ignoreRestSiblings: true }],
        'no-empty': ['error', { allowEmptyCatch: true }],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
      },
    },
    {
      files: ['**/tests/**', '**/*.test.*', '**/scripts/**'],
      rules: { 'no-console': 'off', '@typescript-eslint/no-explicit-any': 'off' },
    },
  )
}

export default config()
