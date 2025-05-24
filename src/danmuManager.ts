import { BigDanmu } from "~/bigDanmu"
import { DrawCtx, DrawSprite } from "~/draw"
import { SmallDanmu } from "~/smallDanmu"

enum LineDir{
	left,
	right,
	up,
	down,
	leftDown,
	rightDown,
}

/**
 * 弹幕管理器，负责生成和管理所有小弹幕。
 * @implements {DrawSprite}
 */
export class DanmuManager implements DrawSprite {
	/** 最大弹幕数量 */
	private MAX_DANMUS: number = 600
	/** 大弹幕实例 */
	private bigDanmu: BigDanmu
	/** 所有小弹幕集合 */
	private smallDanmus: Map<string, SmallDanmu> = new Map()
	/** 画布上下文 */
	private drawCtx: DrawCtx
	/** 缩放系数 */
	private size: number
	/** 轨迹生成钩子集合 */
	private hooks: Map<string, Function> = new Map()
	/** 当前画布宽度 */
	private w: number
	/** 当前画布高度 */
	private h: number
	/** 当前弹幕数量 */
	public danmusNumber: number = 0
	/** 钩子休眠计数 */
	private hookSleep: number = 0
	/**
	 * 构造一个弹幕管理器实例。
	 * @param draw 画布上下文
	 * @param size 缩放系数
	 */
	constructor(draw: DrawCtx, size: number) {
		this.size = size
		this.drawCtx = draw
		this.drawCtx.addUpdateHook(()=>{this.update()})
		this.drawCtx.addSprite(this)
	}
	/**
	 * 设置大弹幕实例。
	 * @param bigDanmu 大弹幕实例
	 */
	setBigDanmu(bigDanmu: BigDanmu) {
		this.bigDanmu = bigDanmu
	}
	/**
	 * 绘制所有小弹幕。
	 * @param ctx Canvas 2D 上下文
	 */
	async draw(ctx: CanvasRenderingContext2D): Promise<void> {
		const drawPromises: Promise<void>[] = []
		this.smallDanmus.forEach((danmu) => {drawPromises.push(danmu.draw(ctx))})
		await Promise.all(drawPromises)
	}
	/**
	 * 更新所有小弹幕状态。
	 */
	async update() {
		if(!this.bigDanmu){
			window.alert('出错了！！\n(>_<)')
			throw new Error("BigDanmu not set")
		}
		this.w = document.documentElement.clientWidth
		this.h = document.documentElement.clientHeight

		this.hookSleep++
		if(this.hookSleep > 4) {
			if (this.hooks.size > 0) this.hooks.forEach((hook) => hook())
			else this.newLineCheck()
			this.hookSleep = 0
		}
		const updatePromises: Promise<void>[] = []
		this.smallDanmus.forEach((danmu) => {updatePromises.push(danmu.update(this.bigDanmu))})
		await Promise.all(updatePromises)
	}
	/**
	 * 新增一个小弹幕。
	 * @param x x 坐标
	 * @param y y 坐标
	 */
	public newDanmu(x: number, y: number) {
		let smallDanmu = new SmallDanmu({x: x, y: y}, this, this.size)
		this.smallDanmus.set(smallDanmu.getId(), smallDanmu)
		this.danmusNumber ++
	}
	/**
	 * 移除指定 id 的小弹幕。
	 * @param id 小弹幕唯一标识
	 */
	public removeDanmu(id: string) {
		this.smallDanmus.delete(id)
	}
	// 阶段1 发两波横向弹幕 阶段2 先发一波3个左斜弹幕 再发一波3个右斜弹幕
	private lineStage: number = 0
	private lineRunning: boolean = false
	/**
	 * 检查是否需要生成新弹幕轨迹。
	 * @private
	 */
	private newLineCheck(){
		if (this.danmusNumber > this.MAX_DANMUS) return
		if (this.lineRunning) return
		if (this.lineStage == 0) {
			this.lineStage1()
			this.lineStage = 1
		} else if (this.lineStage == 1) {
			this.lineStage2()
			this.lineStage = 0
		}
	}
	/**
	 * 轨迹生成阶段1，生成横向弹幕。
	 * @private
	 */
	private lineStage1(){
		this.createLandsLine()
		this.lineRunning = true
		setTimeout(() => {
			this.lineRunning = false
			this.createLandsLine()
		}, 500)
	}
	/**
	 * 轨迹生成阶段2，生成斜向弹幕。
	 * @private
	 */
	private lineStage2(){
		this.createSlantLine(LineDir.leftDown)
		this.lineRunning = true
		setTimeout(() => {
			this.lineRunning = false
			this.createSlantLine(LineDir.rightDown)
		}, 1000)
	}
	/**
	 * 生成横向弹幕轨迹。
	 * @private
	 */
	private createLandsLine() {
		const lineStart1 = (Math.random()) * (this.h - 2 * this.size) + this.size
		const lineStart2 = (Math.random()) * (this.h - 2 * this.size) + this.size
		const lineStart3 = (Math.random()) * (this.w - 2 * this.size) + this.size
		const lineStart4 = (Math.random()) * (this.w - 2 * this.size) + this.size
		this.newLine(lineStart1, LineDir.left)
		this.newLine(lineStart2, LineDir.right)
		this.newLine(lineStart3, LineDir.up)
		this.newLine(lineStart4, LineDir.down)
	}
	/**
	 * 生成斜向弹幕轨迹。
	 * @param type 斜向类型
	 * @private
	 */
	private createSlantLine(type: LineDir) {
		const lineStart1 = (Math.random()) * (this.h - 2 * this.size) + this.size
		const lineStart2 = (Math.random()) * (this.h - 2 * this.size) + this.size
		const lineStart3 = (Math.random()) * (this.h - 2 * this.size) + this.size
		this.newLine(lineStart1, type)
		this.newLine(lineStart2, type)
		this.newLine(lineStart3, type)
	}
	/**
	 * 新建一条弹幕轨迹。
	 * @param startPos 起始位置
	 * @param type 轨迹类型
	 * @private
	 */
	private newLine(startPos: number, type: LineDir) {
		const id = window.crypto.randomUUID()
		let nowPos: {x: number, y: number}
		let step: {x: number, y: number}
		switch (type) {
			case LineDir.left:
				nowPos = {x: this.w, y: startPos}
				step = {x: -20 * this.size, y: 0}
				break
			case LineDir.right:
				nowPos = {x: 0, y: startPos}
				step = {x: 20 * this.size, y: 0}
				break
			case LineDir.up:
				nowPos = {x: startPos, y: this.h}
				step = {x: 0, y: -20 * this.size}
				break
			case LineDir.down:
				nowPos = {x: startPos, y: 0}
				step = {x: 0, y: 20 * this.size}
				break
			case LineDir.leftDown:
				nowPos = {x: this.w, y: startPos}
				step = {x: -20 * this.size, y: 20 * this.size}
				break
			case LineDir.rightDown:
				nowPos = {x: 0, y: startPos}
				step = {x: 20 * this.size, y: 20 * this.size}
				break
		}
		const manger = this
		function update() {
			nowPos.x += step.x
			nowPos.y += step.y
			manger.newDanmu(nowPos.x, nowPos.y)
			if (nowPos.x < manger.size * 20 || nowPos.x > manger.w - manger.size * 20 || nowPos.y < manger.size * 20 || nowPos.y > manger.h - manger.size * 20) {
				manger.hooks.delete(id)
			}
		}
		this.hooks.set(id, update)
	}
}