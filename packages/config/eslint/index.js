// Shared ESLint flat config. Layer rules keep dependencies flowing one way:
//   app → domain → capability → ai-core → platform
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import boundaries from 'eslint-plugin-boundaries'

export const LAYERS = [
  { type: 'app', pattern: 'apps/*' },
  { type: 'tooling', pattern: 'packages/evals' },
  { type: 'domain', pattern: 'packages/domain-*' },
  { type: 'capability', pattern: 'packages/(agents|voice|media|guardrails|db|storage|queue|ui|sdk)' },
  { type: 'ai-core', pattern: 'packages/(ai-gateway|prompts)' },
  { type: 'platform', pattern: 'packages/(core|env|logger|telemetry|cache|flags|i18n|contracts|security|config)' },
]

/** Which layers each layer may import. Nothing may import apps; tooling (evals) sits beside apps. */
const below = {
  app: ['domain', 'capability', 'ai-core', 'platform'],
  tooling: ['domain', 'capability', 'ai-core', 'platform'],
  domain: ['domain', 'capability', 'ai-core', 'platform'],
  capability: ['capability', 'ai-core', 'platform'],
  'ai-core': ['ai-core', 'platform'],
  platform: ['platform'],
}

/** @param {{ tsconfigRootDir?: string }} [opts] */
export function config(opts = {}) {
  return tseslint.config(
    { ignores: ['**/*.snap', '**/dist/**', '**/.next/**', '**/coverage/**', '**/node_modules/**', '**/*.config.*', '**/next-env.d.ts'] },
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
        'boundaries/dependencies': [2, {
          default: 'disallow',
          policies: Object.entries(below).map(([from, allow]) => ({
            from: { element: { type: from } },
            allow: { to: { element: { types: { anyOf: allow } } } },
          })),
        }],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_', ignoreRestSiblings: true }],
        'no-empty': ['error', { allowEmptyCatch: true }],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
      },
    },
    {
      files: ['**/tests/**', '**/*.test.*', '**/scripts/**', '**/src/cli.ts', '**/src/server.ts'],
      rules: { 'no-console': 'off', '@typescript-eslint/no-explicit-any': 'off' },
    },
  )
}

export default config()
