const LINE_WRAP_COLUMN = 80

function wrapLine (line, baseIndent) {
  if (line.length <= LINE_WRAP_COLUMN) return line

  const openEnd = line.indexOf('">')
  if (openEnd === -1) return line

  const prefix = line.slice(0, openEnd + 2)
  const aClose = '</a>'
  const closeStart = line.lastIndexOf(aClose)
  if (closeStart === -1) return line

  const text = line.slice(openEnd + 2, closeStart)
  const suffix = line.slice(closeStart)
  const textIndent = ' '.repeat(prefix.length)
  const avail = Math.max(LINE_WRAP_COLUMN - prefix.length, 20)

  if (prefix.length + text.length + suffix.length <= LINE_WRAP_COLUMN) {
    return line
  }

  const words = text.split(' ')
  const lines = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word
    if (testLine.length <= avail) {
      currentLine = testLine
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)

  if (lines.length === 0) return line
  if (lines.length === 1) return line

  const result = []
  for (let i = 0; i < lines.length; i++) {
    if (i === 0) {
      result.push(prefix + lines[i])
    } else if (i === lines.length - 1) {
      result.push(textIndent + lines[i] + suffix)
    } else {
      result.push(textIndent + lines[i])
    }
  }
  return result.join('\n')
}

const line = '<li><a href="#this-is-an-extremely-long-heading-title-that-will-definitely-wrap-when-displayed">This is an extremely long heading title that will definitely wrap when displayed</a>'
const indent = '                    '
console.log('Input length:', line.length)
console.log('Result:')
const out = wrapLine(line, indent)
console.log(out)
console.log('\nLine lengths:')
out.split('\n').forEach((l, i) => console.log(i, l.length, JSON.stringify(l)))
