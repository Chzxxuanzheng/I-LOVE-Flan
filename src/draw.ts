import bgUrl from '@/bg.png'

const bg = new Image()
bg.src = bgUrl
/**
 * 画布渲染上下文，负责精灵绘制与更新。
 */
export class DrawCtx {
	/** 2D 渲染上下文 */
	private ctx: CanvasRenderingContext2D
	/** 更新钩子集合 */
	private updateHook: (() => void)[] = []
	/** 所有精灵集合 */
	private sprites: DrawSprite[] = []
	/** 当前画布宽度 */
	private w: number
	/** 当前画布高度 */
	private h: number
	/**
	 * 构造一个画布渲染上下文。
	 * @param id 画布元素 id
	 */
	constructor(id: string) {
		let ctx = (<HTMLCanvasElement>document.getElementById(id))?.getContext('2d')
		if (!ctx) {
			window.alert('出错了！！\n(>_<)')
			throw new Error('Failed to get canvas context')
		}
		this.ctx = ctx
	}
	/**
	 * 启动渲染循环。
	 */
	start(){
		window.requestAnimationFrame(this.updateProcess.bind(this))
	}
	/**
	 * 添加更新钩子。
	 * @param hook 钩子函数
	 */
	addUpdateHook(hook: () => void) {
		this.updateHook.push(hook)
	}
	/**
	 * 添加精灵。
	 * @param sprite 精灵对象
	 */
	addSprite(sprite: DrawSprite) {
		this.sprites.push(sprite)
	}
	/**
	 * 渲染主循环。
	 * @async
	 */
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
	/**
	 * 绘制背景。
	 * @private
	 */
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

/**
 * 可绘制精灵接口。
 */
export interface DrawSprite{
	/**
	 * 在画布上绘制精灵。
	 * @param ctx Canvas 2D 上下文
	 */
	draw(ctx: CanvasRenderingContext2D): Promise<void>
}