export default {
  app: {
    name: 'Tombola Studio',
    tagline: 'Tombola konfigurieren und starten',
    quit: 'Beenden'
  },
  nav: {
    configurator: 'Konfigurator',
    run: 'Start',
    export: 'Export…',
    exported: 'Exportiert',
    about: 'Über'
  },
  common: {
    add: 'Hinzufügen',
    remove: 'Entfernen',
    delete: 'Löschen',
    save: 'Speichern',
    reset: 'Zurücksetzen',
    cancel: 'Abbrechen',
    close: 'Schließen',
    generate: 'Generieren',
    copy: 'Kopieren',
    copied: 'Kopiert!',
    moveUp: 'Nach oben',
    moveDown: 'Nach unten',
    none: 'Keine'
  },
  config: {
    title: 'Konfigurator',
    subtitle: 'Die Vorschau rechts aktualisiert sich live.',
    tabs: {
      general: 'Allgemein',
      theme: 'Design',
      prizes: 'Preise',
      numbers: 'Losnummern',
      tickets: 'Lose'
    },
    language: 'Sprache',
    general: {
      title: 'Allgemeine Einstellungen',
      options: 'Optionen',
      music: 'Hintergrundmusik',
      chooseMusic: 'Eigene Musik wählen',
      defaultMusic: 'Standardmusik',
      resetMusic: 'Entfernen',
      unique: 'Jede Losnummer nur einmal ziehen',
      reverse: 'Beginnen beim letzten Preis'
    },
    theme: {
      title: 'Design auswählen',
      hint: 'Wähle eines der Themes mit passendem Hintergrundbild.'
    },
    prizes: {
      title: 'Preise',
      hint: 'Leere Zeilen werden übersprungen. Die Reihenfolge entspricht der Ziehungsreihenfolge.',
      prize: 'Preis',
      position: 'Preis-Nr.',
      name: 'Bezeichnung',
      number: 'Feste Nummer',
      addPrize: 'Preis hinzufügen',
      addFixed: 'Feste Nummer hinzufügen',
      fixedTitle: 'Feste Nummern (fest zugewiesene Preise)',
      fixedHint: 'Die Preis-Nr. bezieht sich auf die oben aufgeführten Preise (z. B. 4 = 4. Preis). Bei der Ziehung dieses Preises wird exakt die hinterlegte Losnummer gezogen. Diese Funktion ist sinnvoll, wenn ein bestimmter Gast einen bestimmten Preis zuverlässig erhalten soll. Dazu muss seine Losnummer nach dem Verteilen der Lose unbemerkt ermittelt und dem gewünschten Preis zugeordnet werden. Noch einfacher ist es, dem gewünschten Gast bereits bei der Verteilung unauffällig das passende Los zuzustecken.'
    },
    text: {
      title: 'Texte',
      tombolaTitle: 'Tombola-Titel',
      prizeLabel: 'Preis-Bezeichnung',
      preview: 'Beispiel'
    },
    numbers: {
      title: 'Losnummern',
      hint: 'Wenn die entsprechende Option unter «Allgemein» aktiviert ist, wird jede dieser Nummern genau einmal gezogen. Nicht verteilte Lose können auch nachträglich deaktiviert werden und sind damit von der Ziehung im Endspiel ausgeschlossen. Das ist besonders sinnvoll, wenn viele Lose übrig geblieben sind: So werden unnötige Ziehungen vermieden und das Spiel bleibt kurzweilig.',
      add: 'Nummer hinzufügen',
      placeholder: 'Nummer eingeben',
      active: 'Aktiv',
      enableAll: 'Alle aktivieren',
      toggleHint: 'Nummer anklicken, um sie zu aktivieren / deaktivieren',
      enabled: 'Aktivieren',
      disabled: 'Deaktivieren'
    }
  },
  run: {
    fullscreen: 'Vollbild',
    exitFullscreen: 'Vollbild beenden',
    start: 'Start',
    spin: 'Los ziehen',
    next: 'Nächster Preis',
    prev: 'Vorheriger Preis',
    reset: 'Zurücksetzen',
    prize: 'Preis',
    of: 'von',
    waiting: 'Bereit für die nächste Ziehung',
    locked: 'Gesperrt – Shift zum Entsperren',
    remaining: 'Verbleibende Nummern',
    finished: 'Alle Nummern gezogen'
  },
  preview: {
    title: 'Vorschau'
  },
  random: {
    title: 'Zufallsnummern für Lose',
    hint: 'Erzeugt eindeutige Losnummern im Bereich 100–999 und ersetzt die Liste oben.',
    quantity: 'Anzahl'
  },
  lose: {
    title: 'Lose generieren',
    hint: 'Alle Losnummern als druckfertiges PDF exportieren.',
    template: 'Vorlage',
    showIndex: 'Losindex anzeigen',
    showIndexHint: 'Die Position des Loses (z.B. «1/10») unten rechts anzeigen.',
    label: 'Losnummer',
    count: 'Lose',
    pages: 'Seiten',
    preview: 'Vorschau',
    export: 'PDF exportieren',
    exportCsv: 'Als CSV exportieren',
    exported: 'Gespeichert unter',
    error: 'Fehler',
    templates: {
      classic: 'Klassisch',
      minimal: 'Minimal',
      retro: 'Retro',
      festive: 'Festlich',
      elegant: 'Elegant',
      ocean: 'Ozean',
      kids: 'Kinder',
      ticket: 'Abriss',
      neon: 'Neon'
    }
  },
  about: {
    title: 'Über diese App',
    version: 'Version',
    platform: 'Plattform',
    storage: 'Speicherort',
    description:
      'Tombola Studio ist eine moderne Neuauflage der klassischen Tombola-Web-App – als native Desktop-Anwendung mit Neutralinojs, Vue und Nuxt UI.'
  },
  themes: {
    pinkbubbles: 'Pink Bubbles',
    summer: 'Sommer',
    colorfulstripes: 'Bunte Streifen',
    greennature: 'Grüne Natur',
    yellowflowers: 'Gelbe Blumen',
    midnight: 'Mitternacht',
    christmas: 'Weihnachten',
    autumn: 'Herbst',
    ocean: 'Ozean',
    neonarcade: 'Neon Arcade'
  }
}
