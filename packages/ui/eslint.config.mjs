import { config } from '@isaii/config/eslint'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  ...config({ tsconfigRootDir: import.meta.dirname }),
  { plugins: { 'react-hooks': reactHooks }, rules: { ...reactHooks.configs.recommended.rules, 'react-hooks/set-state-in-effect': 'warn', 'react-hooks/immutability': 'warn' } },
]
