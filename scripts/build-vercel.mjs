import { cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputDirectory = resolve(root, 'dist')
const applications = [
  { name: 'call-experience', outputName: 'calls', basePath: '/calls/' },
  { name: 'payment-experience', outputName: 'payments', basePath: '/payments/' },
  { name: 'form-experience', outputName: 'forms', basePath: '/forms/' },
]
const publicNpmEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !name.toUpperCase().startsWith('NPM_')),
)

await rm(outputDirectory, { recursive: true, force: true })
await mkdir(outputDirectory, { recursive: true })
const npmConfigDirectory = await mkdtemp(resolve(tmpdir(), 'solace-npm-'))
const emptyNpmConfig = resolve(npmConfigDirectory, 'npmrc')
await writeFile(emptyNpmConfig, '')

try {
  for (const application of applications) {
    const applicationDirectory = resolve(root, application.name)
    execFileSync('npm', [
      'ci',
      '--registry=https://registry.npmjs.org/',
      '--userconfig=/dev/null',
      `--globalconfig=${emptyNpmConfig}`,
    ], {
      cwd: applicationDirectory,
      env: publicNpmEnvironment,
      stdio: 'inherit',
    })
    execFileSync('npm', ['run', 'build'], {
      cwd: applicationDirectory,
      env: { ...process.env, VITE_BASE_PATH: application.basePath },
      stdio: 'inherit',
    })
    await cp(resolve(applicationDirectory, 'dist'), resolve(outputDirectory, application.outputName), { recursive: true })
  }
} finally {
  await rm(npmConfigDirectory, { recursive: true, force: true })
}