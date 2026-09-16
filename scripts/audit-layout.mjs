import { chromium } from 'playwright'

const BASE = process.env.BASE || 'http://localhost:4173'
const ROUTES = ['/', '/techniques', '/technique/o-goshi', '/dojo', '/mon-judo', '/dojo/ceinture-noire', '/dojo/ceinture-noire/2e-dan', '/dojo/ceinture-noire/3e-dan']
const VIEWPORTS = [
  { name: 'iPhone SE', width: 320, height: 568 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'Tablette', width: 768, height: 1024 },
  { name: 'Bureau', width: 1440, height: 900 },
]

const browser = await chromium.launch()
let problems = 0

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 })
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'networkidle' })
    await page.waitForTimeout(250)

    const report = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth
      const scrollW = document.documentElement.scrollWidth
      const offenders = []
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        const over = Math.round(Math.max(r.right - docW, -r.left))
        if (over > 1) {
          const cs = getComputedStyle(el)
          if (cs.position === 'fixed') continue
          offenders.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className?.baseVal ?? el.className ?? '').toString().slice(0, 70),
            text: (el.textContent || '').trim().slice(0, 34),
            over,
          })
        }
      }
      // Cibles tactiles trop petites
      const small = []
      for (const el of document.querySelectorAll('a, button')) {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        if (el.classList.contains('sr-only')) continue // lien d'évitement, visible au focus
        if (r.height < 28 || r.width < 28) small.push({ text: (el.textContent || '').trim().slice(0, 26), h: Math.round(r.height), w: Math.round(r.width) })
      }
      return { docW, scrollW, offenders: offenders.slice(0, 6), offenderCount: offenders.length, small: small.slice(0, 5) }
    })

    const overflow = report.scrollW - report.docW
    const flag = overflow > 1 ? 'DÉBORDE' : 'ok'
    if (overflow > 1) problems++
    console.log(`${vp.name.padEnd(10)} ${route.padEnd(22)} ${flag} (page ${report.scrollW} > ${report.docW})`)
    if (overflow > 1) {
      for (const o of report.offenders) console.log(`    +${o.over}px  <${o.tag}> "${o.text}"  ${o.cls}`)
      if (report.offenderCount > 6) console.log(`    … ${report.offenderCount - 6} autres`)
    }
    if (vp.width <= 390 && report.small.length) {
      console.log(`    cibles < 28px : ${report.small.map((s) => `"${s.text}" ${s.w}x${s.h}`).join(', ')}`)
    }
  }
  await page.close()
}

await browser.close()
console.log(problems === 0 ? '\nAucun débordement horizontal.' : `\n${problems} page(s) en débordement.`)
