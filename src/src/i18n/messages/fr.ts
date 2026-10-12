export default {
  app: {
    name: 'Tombola Studio',
    tagline: 'Préparez et lancez votre tombola',
    quit: 'Quitter'
  },
  nav: {
    configurator: 'Configurateur',
    run: 'Démarrer',
    export: 'Exporter…',
    exported: 'Exporté',
    about: 'À propos'
  },
  common: {
    add: 'Ajouter',
    remove: 'Retirer',
    delete: 'Supprimer',
    save: 'Enregistrer',
    reset: 'Réinitialiser',
    cancel: 'Annuler',
    close: 'Fermer',
    generate: 'Générer',
    copy: 'Copier',
    copied: 'Copié !',
    moveUp: 'Monter',
    moveDown: 'Descendre',
    none: 'Aucun'
  },
  config: {
    title: 'Configurateur',
    subtitle: 'L’aperçu à droite se met à jour en direct.',
    tabs: {
      general: 'Général',
      theme: 'Thème',
      prizes: 'Prix',
      numbers: 'Numéros',
      tickets: 'Billets'
    },
    language: 'Langue',
    general: {
      title: 'Paramètres généraux',
      options: 'Options',
      music: 'Musique de fond',
      chooseMusic: 'Choisir une musique',
      defaultMusic: 'Musique par défaut',
      resetMusic: 'Retirer',
      unique: 'Tirer chaque numéro une seule fois',
      reverse: 'Commencer par le dernier prix'
    },
    theme: {
      title: 'Choisir un thème',
      hint: 'Choisissez un thème avec une image de fond assortie.'
    },
    prizes: {
      title: 'Prix',
      hint: 'Les lignes vides sont ignorées. L’ordre correspond à l’ordre de tirage.',
      prize: 'Prix',
      position: 'N° du prix',
      name: 'Libellé',
      number: 'Numéro fixe',
      addPrize: 'Ajouter un prix',
      addFixed: 'Ajouter un numéro fixe',
      fixedTitle: 'Numéros fixes (prix prédéfinis)',
      fixedHint: 'Le n° du prix fait référence aux prix listés ci-dessus (ex. 4 = 4e prix). Lors du tirage de ce prix, c’est exactement le numéro de billet enregistré qui est tiré. Cette fonction est utile lorsque un invité spécifique doit recevoir un prix précis. Pour cela, son numéro de billet doit être déterminé sans être remarqué après la distribution des billets, puis attribué au prix souhaité. Il est encore plus simple de remettre discrètement au bon invité le bon billet dès la distribution.'
    },
    text: {
      title: 'Texte',
      tombolaTitle: 'Titre de la tombola',
      prizeLabel: 'Libellé du prix',
      preview: 'Exemple'
    },
    numbers: {
      title: 'Numéros de billet',
      hint: 'Lorsque l option correspondante est activée dans «Général», chacun de ces numéros est tiré exactement une fois. Les billets non distribués peuvent également être désactivés ultérieurement et sont ainsi exclus du tirage dans le jeu final. C est particulièrement utile lorsque de nombreux billets restent : les tirages inutiles sont évités et le jeu reste vivace.',
      add: 'Ajouter un numéro',
      placeholder: 'Saisir un numéro',
      active: 'Actifs',
      enableAll: 'Tout activer',
      toggleHint: 'Cliquez sur un numéro pour l’activer / le désactiver',
      enabled: 'Activer',
      disabled: 'Désactiver'
    }
  },
  run: {
    fullscreen: 'Plein écran',
    exitFullscreen: 'Quitter le plein écran',
    start: 'Démarrer',
    spin: 'Tirer prix',
    next: 'Prix suivant',
    prev: 'Prix précédent',
    reset: 'Réinitialiser',
    prize: 'Prix',
    of: 'sur',
    waiting: 'Prêt pour le prochain tirage',
    locked: 'Verrouillé – appuyez sur Maj pour déverrouiller',
    remaining: 'Numéros restants',
    finished: 'Tous les numéros ont été tirés'
  },
  preview: {
    title: 'Aperçu'
  },
  random: {
    title: 'Numéros aléatoires pour les billets',
    hint: 'Génère des numéros de billet uniques dans la plage 100–999 et remplace la liste ci-dessus.',
    quantity: 'Quantité'
  },
  lose: {
    title: 'Générer les billets',
    hint: 'Exportez tous les numéros de billet dans un PDF prêt à imprimer.',
    template: 'Modèle',
    showIndex: "Afficher l'index du billet",
    showIndexHint: "Afficher la position du billet (ex. «1/10») en bas à droite.",
    label: 'Numéro de billet',
    count: 'Billets',
    pages: 'Pages',
    preview: 'Aperçu',
    export: 'Exporter en PDF',
    exportCsv: 'Exporter en CSV',
    exported: 'Enregistré dans',
    error: 'Erreur',
    templates: {
      classic: 'Classique',
      minimal: 'Minimal',
      retro: 'Rétro',
      festive: 'Festif',
      elegant: 'Élégant',
      ocean: 'Océan',
      kids: 'Enfants',
      ticket: 'Souche',
      neon: 'Néon'
    }
  },
  about: {
    title: 'À propos de cette application',
    version: 'Version',
    platform: 'Plateforme',
    storage: 'Emplacement de stockage',
    description:
      'Tombola Studio est une refonte moderne de l’application web tombola classique – une application de bureau native construite avec Neutralinojs, Vue et Nuxt UI.'
  },
  themes: {
    pinkbubbles: 'Bulles roses',
    summer: 'Été',
    colorfulstripes: 'Rayures colorées',
    greennature: 'Nature verte',
    yellowflowers: 'Fleurs jaunes',
    midnight: 'Minuit',
    christmas: 'Noël',
    autumn: 'Automne',
    ocean: 'Océan',
    neonarcade: 'Neon Arcade'
  }
}
