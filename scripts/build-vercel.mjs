import { cp, mkdir, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputDirectory = resolve(root, 'dist')
const applications = [
  { name: 'call-experience', outputName: 'calls', basePath: '/calls/' },
  { name: 'payment-experience', outputName: 'payments', basePath: '/payments/' },
]

await rm(outputDirectory, { recursive: true, force: true })
await mkdir(outputDirectory, { recursive: true })

for (const application of applications) {
  const applicationDirectory = resolve(root, application.name)
  execFileSync('npm', ['ci', '--registry=https://registry.npmjs.org/'], {
    cwd: applicationDirectory,
    stdio: 'inherit',
  })
  execFileSync('npm', ['run', 'build'], {
    cwd: applicationDirectory,
    env: { ...process.env, VITE_BASE_PATH: application.basePath },
    stdio: 'inherit',
  })
  await cp(resolve(applicationDirectory, 'dist'), resolve(outputDirectory, application.outputName), { recursive: true })
}