import './style.css'
import $ from 'jquery'

const $app = $(document.querySelector<HTMLDivElement>('#app')!)

const conf = {
  lineHeight: 18,
}

const codeItems: string[][] = new Array(10000).fill(0).map(() => {
  return Math.random().toString(16).split('')
})

const $lines = $(`<div></div>`)

$lines.css({
  height: codeItems.length * conf.lineHeight,
  position: 'relative',
})

$app.append($lines)

interface LineData {
  id: string
  dom: JQuery<HTMLElement>
  top: number
}

const lineItems = new Map<string, LineData>()

function updateLines(start: number, end: number, cache = false) {
  for (let idx = start; idx < end; idx++) {
    const codeLine = codeItems[idx]
    if (!codeLine) continue

    const id = `line${idx}`

    if ($(`#${id}`)[0]) continue

    const exist = lineItems.get(id)
    const data = exist || {
      id,
      dom: createCodeLine(codeLine),
      top: conf.lineHeight * idx,
    }

    if (exist) {
      $lines.append(data.dom)
      continue
    }

    const el = data.dom

    el.attr('id', id)

    el.css({
      position: 'absolute',
      top: data.top,
    })

    if (!cache) {
      $lines.append(el)
    }

    lineItems.set(id, data)
  }

  $lines.find('.code-line').each((_, el) => {
    const idx = parseInt(el.id.slice('line'.length))
    if (idx >= start && idx <= end) {
      return
    }

    el.remove()
  })
}

function updateLinesWrapper(offsetY = 0) {
  const hMin = window.scrollY + offsetY

  const hMax = hMin + window.innerHeight

  const firstIdx = ~~(hMin / conf.lineHeight)
  const lastIdx = ~~(hMax / conf.lineHeight) + 1

  updateLines(firstIdx, lastIdx)
}

updateLinesWrapper()

updateLines(0, codeItems.length, true)

window.addEventListener(
  'wheel',
  (ev) => {
    ev.preventDefault()


    const ts = performance.now()
    updateLinesWrapper(ev.deltaY)
    console.log('update:', (performance.now() - ts).toFixed(2))

    window.scrollTo({
      top: window.scrollY + ev.deltaY,
    })
  },
  {
    passive: false,
  },
)

function createCodeLine(line: string[]) {
  const $div = $(`
  <div class="code-line">${line.map((code) => `<span>${code}</span>`).join('')}</div> 
  `)

  $div.css({
    height: conf.lineHeight,
  })

  return $div
}
