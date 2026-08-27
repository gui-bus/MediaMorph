import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const TARGET_DIRS = ['src', 'electron', 'scripts']
const TARGET_FILES = ['vite.config.ts', 'tailwind.config.js', 'postcss.config.js', 'electron-builder.json5']
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.css', '.json5'])
const IGNORE_DIRS = new Set(['node_modules', 'dist', 'dist-electron', 'release', '.git', '.vscode'])

function stripCommentsFromCode(code, ext) {
  if (ext === '.css') {
    return code.replace(/\/\*[\s\S]*?\*\//g, '')
  }

  // Pre-strip JSX comments like {/* comment */}
  if (ext === '.tsx' || ext === '.jsx') {
    code = code.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '')
  }

  let result = ''
  let i = 0
  const len = code.length

  let inSingleQuote = false
  let inDoubleQuote = false
  let inTemplateString = false
  let inLineComment = false
  let inBlockComment = false
  let isEscaped = false

  while (i < len) {
    const char = code[i]
    const nextChar = i + 1 < len ? code[i + 1] : ''

    if (inLineComment) {
      if (char === '\n' || char === '\r') {
        inLineComment = false
        result += char
      }
      i++
      continue
    }

    if (inBlockComment) {
      if (char === '*' && nextChar === '/') {
        inBlockComment = false
        i += 2
        continue
      }
      i++
      continue
    }

    if (inSingleQuote) {
      result += char
      if (isEscaped) {
        isEscaped = false
      } else if (char === '\\') {
        isEscaped = true
      } else if (char === "'") {
        inSingleQuote = false
      }
      i++
      continue
    }

    if (inDoubleQuote) {
      result += char
      if (isEscaped) {
        isEscaped = false
      } else if (char === '\\') {
        isEscaped = true
      } else if (char === '"') {
        inDoubleQuote = false
      }
      i++
      continue
    }

    if (inTemplateString) {
      result += char
      if (isEscaped) {
        isEscaped = false
      } else if (char === '\\') {
        isEscaped = true
      } else if (char === '`') {
        inTemplateString = false
      }
      i++
      continue
    }

    // Check for comment starts
    if (char === '/' && nextChar === '/') {
      inLineComment = true
      i += 2
      continue
    }

    if (char === '/' && nextChar === '*') {
      inBlockComment = true
      i += 2
      continue
    }

    // Check for string starts
    if (char === "'") {
      inSingleQuote = true
      isEscaped = false
      result += char
      i++
      continue
    }

    if (char === '"') {
      inDoubleQuote = true
      isEscaped = false
      result += char
      i++
      continue
    }

    if (char === '`') {
      inTemplateString = true
      isEscaped = false
      result += char
      i++
      continue
    }

    result += char
    i++
  }

  // Remove trailing whitespace from each line and collapse excess blank lines
  const lines = result.split('\n').map((line) => line.trimEnd())
  const cleanedLines = []
  let prevEmpty = false

  for (const line of lines) {
    if (line.trim() === '') {
      if (!prevEmpty) {
        cleanedLines.push('')
        prevEmpty = true
      }
    } else {
      cleanedLines.push(line)
      prevEmpty = false
    }
  }

  return cleanedLines.join('\n')
}

async function getFilesToProcess(dir) {
  const files = []
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.has(entry.name)) {
          const sub = await getFilesToProcess(fullPath)
          files.push(...sub)
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name)
        if (EXTENSIONS.has(ext) && entry.name !== 'strip-comments.js') {
          files.push(fullPath)
        }
      }
    }
  } catch (err) {
    console.error(`Erro ao ler diretório ${dir}:`, err)
  }
  return files
}

async function run() {
  console.log('🧹 Iniciando remoção de comentários do código-fonte...')

  const allFiles = []

  for (const dir of TARGET_DIRS) {
    const fullDir = path.join(rootDir, dir)
    const files = await getFilesToProcess(fullDir)
    allFiles.push(...files)
  }

  for (const file of TARGET_FILES) {
    const fullFile = path.join(rootDir, file)
    try {
      await fs.access(fullFile)
      allFiles.push(fullFile)
    } catch {}
  }

  let modifiedCount = 0

  for (const filePath of allFiles) {
    const ext = path.extname(filePath)
    const original = await fs.readFile(filePath, 'utf-8')
    const stripped = stripCommentsFromCode(original, ext)

    if (original !== stripped) {
      await fs.writeFile(filePath, stripped, 'utf-8')
      const relative = path.relative(rootDir, filePath)
      console.log(`✓ Comentários removidos: ${relative}`)
      modifiedCount++
    }
  }

  console.log(`\n🎉 Concluído! ${modifiedCount} arquivos limpos de comentários.`)
}

run().catch((err) => {
  console.error('Falha ao executar strip-comments:', err)
  process.exit(1)
})
