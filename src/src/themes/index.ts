export interface ThemePalette {
  /** Odometer bezel gradient (top / bottom). */
  odometerFrom: string
  odometerTo: string
  /** Gradient applied to the individual digit faces. */
  digitFrom: string
  digitTo: string
  digitText: string
  digitBorder: string
  titleColor: string
  titleFont: string
  prizeColor: string
  prizeFont: string
  /** Glow colour for the prize text; empty string disables the glow. */
  prizeGlow: string
  labelColor: string
  accent: string
  /** Colour overlay painted over the background image for readability. */
  overlay: string
}

export interface ThemeDefinition {
  id: string
  /** i18n key resolved by the renderer. */
  nameKey: string
  /** Public-relative path to the background image. */
  background: string
  palette: ThemePalette
}

const DEFAULT_FONTS = {
  titleFont: '"Arizonia", "Brush Script MT", cursive',
  prizeFont: '"Rye", Georgia, serif'
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'pinkbubbles',
    nameKey: 'themes.pinkbubbles',
    background: 'themes/pinkbubbles/background.jpg',
    palette: {
      ...DEFAULT_FONTS,
      odometerFrom: '#ca1ba0',
      odometerTo: '#70207f',
      digitFrom: '#ffffff',
      digitTo: '#cccccc',
      digitText: '#c41a9e',
      digitBorder: '#444444',
      titleColor: '#ffffff',
      prizeColor: '#ffffff',
      prizeGlow: 'rgba(255,255,255,0.85)',
      labelColor: '#ffffff',
      accent: '#ff5fd0',
      overlay: 'rgba(60,0,50,0.28)'
    }
  },
  {
    id: 'summer',
    nameKey: 'themes.summer',
    background: 'themes/summer/background.jpg',
    palette: {
      ...DEFAULT_FONTS,
      odometerFrom: '#ffd34d',
      odometerTo: '#f08a24',
      digitFrom: '#fffdf5',
      digitTo: '#ffe6b8',
      digitText: '#c1521a',
      digitBorder: '#7a3b12',
      titleColor: '#ffffff',
      prizeColor: '#fff7e6',
      prizeGlow: 'rgba(255,214,120,0.9)',
      labelColor: '#ffffff',
      accent: '#ff8a3c',
      overlay: 'rgba(90,40,0,0.22)'
    }
  },
  {
    id: 'colorfulstripes',
    nameKey: 'themes.colorfulstripes',
    background: 'themes/colorfulstripes/background.jpg',
    palette: {
      ...DEFAULT_FONTS,
      odometerFrom: 'hsl(41,80%,53%)',
      odometerTo: '#a02914',
      digitFrom: '#ffffff',
      digitTo: '#cccccc',
      digitText: '#182958',
      digitBorder: '#444444',
      titleColor: '#ffffff',
      prizeColor: '#ffffff',
      prizeGlow: 'rgba(255,255,255,1)',
      labelColor: '#ffffff',
      accent: '#f0b429',
      overlay: 'rgba(0,0,0,0.2)'
    }
  },
  {
    id: 'greennature',
    nameKey: 'themes.greennature',
    background: 'themes/greennature/background.jpg',
    palette: {
      ...DEFAULT_FONTS,
      odometerFrom: '#7ed957',
      odometerTo: '#1e5631',
      digitFrom: '#ffffff',
      digitTo: '#d8f5cf',
      digitText: '#1e5631',
      digitBorder: '#14401f',
      titleColor: '#ffffff',
      prizeColor: '#eafff0',
      prizeGlow: 'rgba(150,255,180,0.85)',
      labelColor: '#ffffff',
      accent: '#7ed957',
      overlay: 'rgba(0,40,10,0.28)'
    }
  },
  {
    id: 'yellowflowers',
    nameKey: 'themes.yellowflowers',
    background: 'themes/yellowflowers/background.jpg',
    palette: {
      ...DEFAULT_FONTS,
      odometerFrom: '#ffe066',
      odometerTo: '#c98a00',
      digitFrom: '#fffef5',
      digitTo: '#fff3c4',
      digitText: '#8a5a00',
      digitBorder: '#6b4600',
      titleColor: '#ffffff',
      prizeColor: '#fffbe6',
      prizeGlow: 'rgba(255,236,150,0.9)',
      labelColor: '#ffffff',
      accent: '#ffd21f',
      overlay: 'rgba(80,60,0,0.22)'
    }
  },
  {
    id: 'midnight',
    nameKey: 'themes.midnight',
    background: 'themes/midnight/background.jpg',
    palette: {
      ...DEFAULT_FONTS,
      odometerFrom: '#3a5b8c',
      odometerTo: '#0b1523',
      digitFrom: '#eaf2ff',
      digitTo: '#b9ccf0',
      digitText: '#1b2c4a',
      digitBorder: '#0b1523',
      titleColor: '#eaf2ff',
      prizeColor: '#dce9ff',
      prizeGlow: 'rgba(120,170,255,0.8)',
      labelColor: '#cfe3ff',
      accent: '#5b8bff',
      overlay: 'rgba(2,8,20,0.45)'
    }
  },
  {
    id: 'christmas',
    nameKey: 'themes.christmas',
    background: 'themes/christmas/background.jpg',
    palette: {
      ...DEFAULT_FONTS,
      odometerFrom: '#e53935',
      odometerTo: '#7f1d1d',
      digitFrom: '#fffef7',
      digitTo: '#ffe9b0',
      digitText: '#8c1c1c',
      digitBorder: '#5b0f0f',
      titleColor: '#fff6d5',
      prizeColor: '#fff2a8',
      prizeGlow: 'rgba(255,200,120,0.85)',
      labelColor: '#e8f5e9',
      accent: '#43a047',
      overlay: 'rgba(30,5,5,0.35)'
    }
  },
  {
    id: 'autumn',
    nameKey: 'themes.autumn',
    background: 'themes/autumn/background.jpg',
    palette: {
      ...DEFAULT_FONTS,
      odometerFrom: '#f59e0b',
      odometerTo: '#7c2d12',
      digitFrom: '#fffaf0',
      digitTo: '#ffe2bd',
      digitText: '#7c2d12',
      digitBorder: '#5c1f0a',
      titleColor: '#ffedd5',
      prizeColor: '#fff3e0',
      prizeGlow: 'rgba(255,170,90,0.85)',
      labelColor: '#ffe8cc',
      accent: '#e07b1f',
      overlay: 'rgba(50,20,0,0.32)'
    }
  },
  {
    id: 'ocean',
    nameKey: 'themes.ocean',
    background: 'themes/ocean/background.jpg',
    palette: {
      ...DEFAULT_FONTS,
      odometerFrom: '#22d3ee',
      odometerTo: '#0c4a6e',
      digitFrom: '#ffffff',
      digitTo: '#cdefff',
      digitText: '#0e5a7a',
      digitBorder: '#083b52',
      titleColor: '#e0f7ff',
      prizeColor: '#e0f7ff',
      prizeGlow: 'rgba(120,220,255,0.85)',
      labelColor: '#d6f2ff',
      accent: '#2ea8c9',
      overlay: 'rgba(0,25,45,0.35)'
    }
  },
  {
    id: 'neonarcade',
    nameKey: 'themes.neonarcade',
    background: 'themes/neonarcade/background.jpg',
    palette: {
      ...DEFAULT_FONTS,
      odometerFrom: '#ff00cc',
      odometerTo: '#3333ff',
      digitFrom: '#1a0033',
      digitTo: '#3d0080',
      digitText: '#00ffd5',
      digitBorder: '#ff00cc',
      titleColor: '#ff6fe0',
      prizeColor: '#00ffd5',
      prizeGlow: 'rgba(255,0,204,0.9)',
      labelColor: '#ff9df0',
      accent: '#00ffd5',
      overlay: 'rgba(10,0,30,0.45)'
    }
  }
]
