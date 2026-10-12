export default {
  app: {
    name: 'Tombola Studio',
    tagline: 'Tombola configurar e startar',
    quit: 'Terminar'
  },
  nav: {
    configurator: 'Configurator',
    run: 'Start',
    export: 'Export…',
    exported: 'Exportà',
    about: 'Questa app'
  },
  common: {
    add: 'Adenzar',
    remove: 'Far',
    delete: 'Sterger',
    save: 'Salvar',
    reset: 'Revertar',
    cancel: 'Cancelnar',
    close: 'Far',
    generate: 'Generar',
    copy: 'Copiar',
    copied: 'Copià!',
    moveUp: 'En avanti',
    moveDown: 'En avall',
    none: 'Nagin'
  },
  config: {
    title: 'Configurator',
    subtitle: 'La previsualisaziun a dretga s’actuala live.',
    tabs: {
      general: 'General',
      theme: 'Design',
      prizes: 'Prems',
      numbers: 'Numerals da sort',
      tickets: 'Sorts'
    },
    language: 'Lingua',
    general: {
      title: 'Configuraziuns generalas',
      options: 'Optgions',
      music: 'Musica da fund',
      chooseMusic: 'Tgirar musica persunala',
      defaultMusic: 'Musica standard',
      resetMusic: 'Far',
      unique: 'Tira numera da sort na st’ina giada',
      reverse: 'Cumenzar cul ultim premie'
    },
    theme: {
      title: 'Tgirar design',
      hint: 'Tgiai in dals themes cun fund adaptà.'
    },
    prizes: {
      title: 'Prems',
      hint: 'Linias vidas saltadas. L’ordna corresponda a l’ordna da tirada.',
      prize: 'Premie',
      position: 'Numeral da premie',
      name: 'Descripziun',
      number: 'Numer fix',
      addPrize: 'Adenzar in premie',
      addFixed: 'Adenzar in numer fix',
      fixedTitle: 'Numeros fixes (prems attribuïts)',
      fixedHint: 'Il numeral da premie se referescha aux prems listads sur (ex. 4 = 4. premie). Al tirar quest premie viene tira exact il numeral da sort registerà. Questa funziona è utile cun ver che vul receiving in premie specific. Per questo debei il ses numeral da sort esser determinà sin saver e attribuì al premie giust. Ancor pli simpl è di far già en il distribuer sin saver al gast il sort giust.'
    },
    text: {
      title: 'Texts',
      tombolaTitle: 'Titel da tombola',
      prizeLabel: 'Descripziun da premie',
      preview: 'Exempel'
    },
    numbers: {
      title: 'Numerals da sort',
      hint: 'Na che l’optgida è activada en «General», tira numeral da sort exact ina giada. Numerals da sort non distribuìs pon esser deactivats ed èn duscha exclusi dals tirada final. Questo è specialmain utile cun many numerals restants: las tiradas becomes e il giu rest’ divertaint.',
      add: 'Adenzar nummer',
      placeholder: 'Metter nummer',
      active: 'Activ',
      enableAll: 'Activar tuts',
      toggleHint: 'Cliquer sur nummer per activar/deactivar',
      enabled: 'Activar',
      disabled: 'Deactivar'
    }
  },
  run: {
    fullscreen: 'Full screen',
    exitFullscreen: 'Far full screen',
    start: 'Start',
    spin: 'Tirar sort',
    next: 'Prochain premie',
    prev: 'Precedent premie',
    reset: 'Revertar',
    prize: 'Premie',
    of: 'da',
    waiting: 'Ready per la proxima tirada',
    locked: 'Blocà – Shift per deblocar',
    remaining: 'Numerals restants',
    finished: 'Tuts numerals tirads'
  },
  preview: {
    title: 'Previsualisaziun'
  },
  random: {
    title: 'Numerals da sort random',
    hint: 'Creia numerals da sort unics en l’area 100–999 e substituesca la lista surve.',
    quantity: 'Quantitad'
  },
  lose: {
    title: 'Generar sorts',
    hint: 'Exportar tut numerals da sort come PDF per stampar.',
    template: 'Model',
    showIndex: 'Afidar index da sort',
    showIndexHint: 'Afidar la posiziun da sort (ex. «1/10») a drecha a bas.',
    label: 'Numeral da sort',
    count: 'Sorts',
    pages: 'Paginas',
    preview: 'Previsualisaziun',
    export: 'Exportar como PDF',
    exportCsv: 'Exportar come CSV',
    exported: 'Salvar sut',
    error: 'Error',
    templates: {
      classic: 'Classica',
      minimal: 'Minimala',
      retro: 'Retro',
      festive: 'Festiva',
      elegant: 'Eleganta',
      ocean: 'Ocean',
      kids: 'Kids',
      ticket: 'Abriss',
      neon: 'Neon'
    }
  },
  about: {
    title: 'Questa app',
    version: 'Version',
    platform: 'Plataforma',
    storage: 'Storage',
    description:
      'Tombola Studio è ina moderna re-ediziun da la classica app da tombola – come app natively cun Neutralinojs, Vue e Nuxt UI.'
  },
  themes: {
    pinkbubbles: 'Pink Bubbles',
    summer: 'Stag',
    colorfulstripes: 'Strips colorads',
    greennature: 'Natura verd',
    yellowflowers: 'Flurs gels',
    midnight: 'Mesanuit',
    christmas: 'Christmas',
    autumn: 'Autumn',
    ocean: 'Ocean',
    neonarcade: 'Neon Arcade'
  }
}