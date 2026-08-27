import { rcedit } from 'rcedit'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const exePath = path.resolve(__dirname, '../release/1.0.0/win-unpacked/MediaMorph.exe')
const iconPath = path.resolve(__dirname, '../build/icon.ico')

async function applyIcon() {
  if (!fs.existsSync(exePath)) {
    console.error('Executável não encontrado em:', exePath)
    return
  }
  if (!fs.existsSync(iconPath)) {
    console.error('Ícone não encontrado em:', iconPath)
    return
  }

  console.log('Aplicando ícone oficial ao MediaMorph.exe...')
  await rcedit(exePath, {
    icon: iconPath,
    'file-version': '1.2.0',
    'product-version': '1.2.0',
    'version-string': {
      FileDescription: 'MediaMorph',
      ProductName: 'MediaMorph',
      CompanyName: 'MediaMorph',
      LegalCopyright: 'Copyright © 2026 MediaMorph',
    },
  })
  console.log('✓ Ícone oficial aplicado com sucesso ao MediaMorph.exe!')
}

applyIcon().catch(console.error)
