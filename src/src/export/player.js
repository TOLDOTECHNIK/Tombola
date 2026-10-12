/*
 * Standalone tombola player used by the exported tombola.html.
 * It reads its configuration from window.__TOMBOLLA__ (injected above) and has
 * no external dependencies — all assets are embedded as data URIs.
 */
;(function () {
  'use strict'

  var DATA = window.__TOMBOLLA__ || {}
  var S = DATA.settings || {}
  var A = DATA.assets || {}
  var L = S.labels || {}

  var prizes = S.prizes || []
  var idx = 0
  var position = 0
  var spinning = false
  var locked = false
  var musicOn = S.backgroundMusic !== false
  var lastNumber = 0
  var pool = (S.numbers || []).slice()
  var unique = S.uniqueNumbers !== false
  var minGap = Number(S.minimumNumberGap) || 70
  var lockMs = (Number(S.odometerDuration) || 7000) + 1500
  var fixedByPos = {}
  var reserved = {}
  var idleTimer = null

  ;(S.fixedPrizes || []).forEach(function (f) {
    fixedByPos[f.position] = f.number
    reserved[f.number] = true
  })

  var elTitle = document.getElementById('title')
  var elLabel = document.getElementById('label')
  var elPrize = document.getElementById('prize')
    var elPrizeEnter = document.getElementById('prize-enter')
  var elOdo = document.getElementById('odometer')
  var elStatus = document.getElementById('status')
  var elRemaining = document.getElementById('remaining')
  var elBar = document.getElementById('bar')
  var music = document.getElementById('music')
  var rolling = document.getElementById('rolling')
  var odometer = null

  function text(id, value) {
    var el = document.getElementById(id)
    if (el) el.textContent = value
  }

  /* ---------------- odometer ---------------- */

  function buildOdometer() {
    odometer = new window.Odometer({
      el: elOdo,
      value: S.initialNumber || 999,
      duration: Number(S.odometerDuration) || 7000
    })
  }

  function showNumber(value) {
    if (odometer) odometer.update(value)
  }

  /* ---------------- drawing ---------------- */

  function available(n) {
    return unique ? pool.indexOf(n) >= 0 : true
  }
  function take(n) {
    if (!unique) return
    var i = pool.indexOf(n)
    if (i >= 0) pool.splice(i, 1)
  }

  function draw(prizePos) {
    var fixed = fixedByPos[prizePos]
    if (fixed !== undefined && available(fixed)) {
      take(fixed)
      lastNumber = fixed
      return fixed
    }
    if (unique && pool.length === 0) return null
    var source = function () {
      return unique ? pool : S.numbers || []
    }
    var candidate = null
    var tries = 0
    while (tries < 250) {
      var list = source()
      if (!list.length) return null
      candidate = list[Math.floor(Math.random() * list.length)]
      var tooClose = Math.abs(lastNumber - candidate) < minGap
      if (!reserved[candidate] && !tooClose) break
      candidate = null
      tries++
    }
    if (candidate === null) {
      var fallback = source()
      candidate = fallback.length ? fallback[Math.floor(Math.random() * fallback.length)] : null
    }
    if (candidate === null) return null
    take(candidate)
    lastNumber = candidate
    return candidate
  }

  /* ---------------- rendering ---------------- */

  var lastPrizeName = ''

  function renderPrize() {
    var p = prizes[idx] || null
    var prizeName = p ? p.name : ''
    elLabel.textContent = p ? p.position + '. ' + (S.prizeLabel || 'Preis') : ''
    elPrize.textContent = prizeName
    elRemaining.textContent = (L.remaining || 'Remaining') + ': ' + (unique ? pool.length : '\u221E')
    if (elPrizeEnter && prizeName !== lastPrizeName) {
      lastPrizeName = prizeName
      elPrizeEnter.classList.remove('prize-enter')
      void elPrizeEnter.offsetWidth
      elPrizeEnter.classList.add('prize-enter')
    }
  }

  function setStatus(value) {
    elStatus.textContent = value || ''
  }

  function next() {
    if (!prizes.length) return
    idx = (idx + 1) % prizes.length
    renderPrize()
  }
  function prev() {
    if (!prizes.length) return
    idx = (idx - 1 + prizes.length) % prizes.length
    renderPrize()
  }

  /* ---------------- audio ---------------- */

  function initAudio() {
    if (A.music) {
      music.src = A.music
      music.loop = true
      music.volume = musicOn ? 1 : 0
    }
    if (A.rolling) rolling.src = A.rolling
    if (musicOn) playMusic()
  }

  function playMusic() {
    if (!A.music) return
    music.play().catch(function () {})
  }

  function duck() {
    if (!A.music || !musicOn) return
    var from = music.volume
    music.volume = Math.max(0, from * 0.35)
    setTimeout(function () {
      music.volume = from
    }, lockMs)
  }

  /* ---------------- spin ---------------- */

  function spin() {
    if (spinning) return
    if (locked) return
    if (unique && pool.length === 0) {
      setStatus(L.finished || 'Finished')
      return
    }
    var prize = prizes[idx] || null
    var number = draw(prize ? prize.position : position + 1)
    if (number === null) return
    position++
    spinning = true
    showNumber(number)
    renderPrize()
    if (A.rolling) {
      try {
        rolling.currentTime = 0
      } catch (e) {}
      rolling.play().catch(function () {})
    }
    duck()
    setStatus(L.spinning || '\u2026')
    setTimeout(function () {
      spinning = false
      renderPrize()
      setStatus(unique && pool.length === 0 ? L.finished || '' : L.ready || '')
    }, lockMs)
  }

  function reset() {
    pool = (S.numbers || []).slice()
    idx = 0
    position = 0
    spinning = false
    lastNumber = 0
    renderPrize()
    setStatus(L.ready || '')
  }

  /* ---------------- controls ---------------- */

  function showBar() {
    document.body.classList.remove('idle')
    if (idleTimer) clearTimeout(idleTimer)
    idleTimer = setTimeout(function () {
      document.body.classList.add('idle')
    }, 1600)
  }

  function toggleMusic() {
    musicOn = !musicOn
    music.volume = musicOn ? 1 : 0
    if (musicOn) playMusic()
    updateMusicButton()
  }
  function updateMusicButton() {
    var btn = elBar.querySelector('[data-act="music"]')
    if (btn) btn.style.opacity = musicOn ? '1' : '0.4'
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen().catch(function () {})
  }

  function onKey(e) {
    switch (e.key) {
      case 'Shift':
        locked = true
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        spin()
        break
      case 'ArrowRight':
        e.preventDefault()
        next()
        break
      case 'ArrowLeft':
        e.preventDefault()
        prev()
        break
      case 's':
      case 'S':
        toggleMusic()
        break
      case 'f':
      case 'F':
        toggleFullscreen()
        break
    }
  }
  function onKeyUp(e) {
    if (e.key === 'Shift') locked = false
  }

  function onBarClick(e) {
    var btn = e.target.closest('[data-act]')
    if (!btn) return
    switch (btn.getAttribute('data-act')) {
      case 'spin':
        spin()
        break
      case 'next':
        next()
        break
      case 'prev':
        prev()
        break
      case 'reset':
        reset()
        break
      case 'music':
        toggleMusic()
        break
      case 'fullscreen':
        toggleFullscreen()
        break
    }
  }

  /* ---------------- init ---------------- */

  buildOdometer()
  elTitle.textContent = S.title || ''
  var spinBtn = elBar.querySelector('[data-act="spin"]')
  if (spinBtn) spinBtn.textContent = L.spin || 'Spin'
  renderPrize()
  setStatus(L.ready || '')
  initAudio()
  updateMusicButton()

  document.addEventListener('keydown', onKey)
  document.addEventListener('keyup', onKeyUp)
  document.addEventListener('mousemove', showBar)
  document.addEventListener('click', function () {
    if (musicOn) playMusic()
  })
  elBar.addEventListener('click', onBarClick)
  showBar()
})()
