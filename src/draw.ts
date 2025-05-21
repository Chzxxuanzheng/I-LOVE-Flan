import bgUrl from '@/bg.png'

const bg = new Image()
bg.src = bgUrl
export class DrawCtx {
	private ctx: CanvasRenderingContext2D
	private updateHook: (() => void)[] = []
	private sprites: DrawSprite[] = []
	private w: number
	private h: number
	constructor(id: string) {
		let ctx = (<HTMLCanvasElement>document.getElementById(id))?.getContext('2d')
		if (!ctx) {
			window.alert('出错了！！\n(>_<)')
			throw new Error('Failed to get canvas context')
		}
		this.ctx = ctx
	}
	start(){
		window.requestAnimationFrame(this.updateProcess.bind(this))
	}
	addUpdateHook(hook: () => void) {
		this.updateHook.push(hook)
	}
	addSprite(sprite: DrawSprite) {
		this.sprites.push(sprite)
	}
	async updateProcess() {
		this.w = document.documentElement.clientWidth
		this.h = document.documentElement.clientHeight
		this.ctx.canvas.width = this.w
		this.ctx.canvas.height = this.h

		// 绘制背景
		this.drawBg()

		// 更新钩子和精灵
		await Promise.all(this.updateHook.map(hook => hook()))

		// 绘制图像
		for (let i = 0; i < this.sprites.length; i++) {
			await this.sprites[i].draw(this.ctx)

			// 初始化
			this.ctx.globalAlpha = 1
			this.ctx.fillStyle = '#000000'
		}
		
		this.ctx.save()


		window.requestAnimationFrame(this.updateProcess.bind(this))
	}

	private drawBg(){
		this.ctx.fillStyle = "#000000"
		this.ctx.fillRect(0, 0, this.w, this.h)

		let bgPos: {left: number, top: number, width: number, height: number}
		if (this.w > this.h) {
			bgPos = {left: (this.w - this.h) / 2, top: 0, width: this.h, height: this.h}
		}else {
			bgPos = {left: 0, top: (this.h - this.w) / 2, width: this.w, height: this.w}
		}
		this.ctx.drawImage(bg, bgPos.left, bgPos.top, bgPos.width, bgPos.height)
	}
}

export interface DrawSprite{
	draw(ctx: CanvasRenderingContext2D): Promise<void>
}