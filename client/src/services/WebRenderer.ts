import { Renderer } from "./Renderer"

export class WebRenderer implements Renderer {
  private iframe = document.createElement("iframe")
  private mountElement: HTMLElement | null = null

  constructor() {
    this.iframe.src = "index.html"
    this.iframe.style.border = "none"
    this.iframe.style.width = "100%"
    this.iframe.style.height = "100%"
  }

  mount(element: HTMLElement): void {
    this.mountElement = element
    element.appendChild(this.iframe)
  }

  unmount(): void {
    this.mountElement?.removeChild(this.iframe)
  }

  dispose(): void {}
}
