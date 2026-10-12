export default {
  app: {
    name: 'Tombola Studio',
    tagline: 'Configure and start your raffle',
    quit: 'Quit'
  },
  nav: {
    configurator: 'Configurator',
    run: 'Start',
    export: 'Export…',
    exported: 'Exported',
    about: 'About'
  },
  common: {
    add: 'Add',
    remove: 'Remove',
    delete: 'Delete',
    save: 'Save',
    reset: 'Reset',
    cancel: 'Cancel',
    close: 'Close',
    generate: 'Generate',
    copy: 'Copy',
    copied: 'Copied!',
    moveUp: 'Move up',
    moveDown: 'Move down',
    none: 'None'
  },
  config: {
    title: 'Configurator',
    subtitle: 'The preview on the right updates live.',
    tabs: {
      general: 'General',
      theme: 'Theme',
      prizes: 'Prizes',
      numbers: 'Ticket numbers',
      tickets: 'Tickets'
    },
    language: 'Language',
    general: {
      title: 'General settings',
      options: 'Options',
      music: 'Background music',
      chooseMusic: 'Choose custom music',
      defaultMusic: 'Default music',
      resetMusic: 'Remove',
      unique: 'Draw each ticket number only once',
      reverse: 'Start with the last prize'
    },
    theme: {
      title: 'Choose a theme',
      hint: 'Pick one of the themes with a matching background image.'
    },
    prizes: {
      title: 'Prizes',
      hint: 'Empty rows are skipped. The order equals the draw order.',
      prize: 'Prize',
      position: 'Prize no.',
      name: 'Label',
      number: 'Fixed number',
      addPrize: 'Add prize',
      addFixed: 'Add fixed number',
      fixedTitle: 'Fixed numbers (pre-assigned prizes)',
      fixedHint: 'The prize number refers to the prizes listed above (e.g. 4 = 4th prize). When this prize is drawn, exactly the stored ticket number is drawn. This function is useful when a specific guest is to reliably receive a specific prize. For this, their ticket number must be determined unnoticed after distributing the tickets and assigned to the desired prize. Even simpler is to discreetly hand the matching ticket to the desired guest already during distribution.'
    },
    text: {
      title: 'Text',
      tombolaTitle: 'Tombola title',
      prizeLabel: 'Prize label',
      preview: 'Example'
    },
    numbers: {
      title: 'Ticket numbers',
      hint: 'When the corresponding option is enabled under «General», each of these numbers is drawn exactly once. Unused tickets can also be disabled afterwards and are thus excluded from the draw in the final game. This is particularly useful when many tickets remain: unnecessary draws are avoided and the game stays engaging.',
      add: 'Add number',
      placeholder: 'Enter number',
      active: 'Active',
      enableAll: 'Enable all',
      toggleHint: 'Click a number to enable / disable it',
      enabled: 'Enable',
      disabled: 'Disable'
    }
  },
  run: {
    fullscreen: 'Full screen',
    exitFullscreen: 'Exit full screen',
    start: 'Start',
    spin: 'Spin',
    next: 'Next prize',
    prev: 'Previous prize',
    reset: 'Reset',
    prize: 'Prize',
    of: 'of',
    waiting: 'Ready for the next draw',
    locked: 'Locked – press Shift to unlock',
    remaining: 'Remaining numbers',
    finished: 'All numbers drawn'
  },
  preview: {
    title: 'Preview'
  },
  random: {
    title: 'Random ticket numbers',
    hint: 'Generates unique ticket numbers in the range 100–999 and replaces the list above.',
    quantity: 'Quantity'
  },
  lose: {
    title: 'Generate tickets',
    hint: 'Export all ticket numbers as a print-ready PDF.',
    template: 'Template',
    showIndex: 'Show ticket index',
    showIndexHint: 'Show the ticket position (e.g. "1/10") at the bottom right.',
    label: 'Ticket number',
    count: 'Tickets',
    pages: 'Pages',
    preview: 'Preview',
    export: 'Export PDF',
    exportCsv: 'Export as CSV',
    exported: 'Saved to',
    error: 'Error',
    templates: {
      classic: 'Classic',
      minimal: 'Minimal',
      retro: 'Retro',
      festive: 'Festive',
      elegant: 'Elegant',
      ocean: 'Ocean',
      kids: 'Kids',
      ticket: 'Ticket Stub',
      neon: 'Neon'
    }
  },
  about: {
    title: 'About this app',
    version: 'Version',
    platform: 'Platform',
    storage: 'Storage location',
    description:
      'Tombola Studio is a modern remake of the classic tombola web app – a native desktop application built with Neutralinojs, Vue and Nuxt UI.'
  },
  themes: {
    pinkbubbles: 'Pink Bubbles',
    summer: 'Summer',
    colorfulstripes: 'Colorful Stripes',
    greennature: 'Green Nature',
    yellowflowers: 'Yellow Flowers',
    midnight: 'Midnight',
    christmas: 'Christmas',
    autumn: 'Autumn',
    ocean: 'Ocean',
    neonarcade: 'Neon Arcade'
  }
}
