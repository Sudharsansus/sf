"""Scaffold an @isaii/* workspace package: package.json, tsconfig, eslint, vitest, README.

Usage: python tooling/scripts/scaffold-package.py <name> "<description>" [dep@version ...] [--react]
Idempotent for config files; never overwrites src/ or tests/.
"""
import json, os, sys

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    react = '--react' in sys.argv
    name, desc, deps = args[0], args[1], args[2:]
    root = os.path.join(os.path.dirname(__file__), '..', '..', 'packages', name)
    os.makedirs(os.path.join(root, 'src'), exist_ok=True)
    os.makedirs(os.path.join(root, 'tests'), exist_ok=True)

    dependencies = {}
    for d in deps:
        at = d.rfind('@')
        pkg, ver = (d[:at], d[at + 1:]) if at > 0 else (d, '*')
        dependencies[pkg] = ver
    pkg = {
        'name': f'@isaii/{name}',
        'version': '0.0.0',
        'private': True,
        'description': desc,
        'type': 'module',
        'exports': {'.': './src/index.ts'},
        'scripts': {'typecheck': 'tsc --noEmit', 'lint': 'eslint .', 'test': 'vitest run'},
        'dependencies': dict(sorted(dependencies.items())),
        'devDependencies': {'@isaii/config': '*', '@types/node': '22.20.5'},
    }
    path = os.path.join(root, 'package.json')
    if os.path.exists(path):
        old = json.load(open(path, encoding='utf-8'))
        old['dependencies'] = {**old.get('dependencies', {}), **pkg['dependencies']}
        pkg = {**pkg, **{k: v for k, v in old.items() if k in ('exports', 'scripts')}, 'dependencies': dict(sorted(old['dependencies'].items()))}
    write(path, json.dumps(pkg, indent=2) + '\n')
    preset = 'library' if react else 'node'
    write(os.path.join(root, 'tsconfig.json'), json.dumps({
        'extends': f'@isaii/config/typescript/{preset}.json',
        'include': ['src/**/*', 'tests/**/*'],
        'exclude': ['node_modules'],
    }, indent=2) + '\n')
    write(os.path.join(root, 'eslint.config.mjs'),
          "import { config } from '@isaii/config/eslint'\nexport default config({ tsconfigRootDir: import.meta.dirname })\n")
    vitest = 'react' if react else 'node'
    write(os.path.join(root, 'vitest.config.ts'),
          f"import {{ {vitest}Config }} from '@isaii/config/vitest/{vitest}'\nexport default {vitest}Config()\n")
    readme = os.path.join(root, 'README.md')
    if not os.path.exists(readme):
        write(readme, f'# @isaii/{name}\n\n{desc}\n\nPublic API: `src/index.ts`. Tests: `npm test -w @isaii/{name}`.\n')
    print('scaffolded', name)

def write(path, content):
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)

if __name__ == '__main__':
    main()
