declare module 'odometer' {
  export interface OdometerOptions {
    el: HTMLElement | string
    value?: number | string
    format?: string
    duration?: number
    theme?: string
  }
  export default class Odometer {
    constructor(options: OdometerOptions)
    update(value: number | string): void
  }
}
