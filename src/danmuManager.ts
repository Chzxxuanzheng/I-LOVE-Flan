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

export class DanmuManager implements DrawSprite {
	private MAX_DANMUS: number = 600
	private bigDanmu: BigDanmu
	private smallDanmus: Map<string, SmallDanmu> = new Map()
	private drawCtx: DrawCtx
	private size: number
	private hooks: Map<string, Function> = new Map()
	private w: number
	private h: number
	public danmusNumber: number = 0

	private hookSleep: number = 0
	constructor(draw: DrawCtx, size: number) {
		this.size = size
		this.drawCtx = draw
		this.drawCtx.addUpdateHook(()=>{this.update()})
		this.drawCtx.addSprite(this)
	}
	setBigDanmu(bigDanmu: BigDanmu) {
		this.bigDanmu = bigDanmu
	}
	async draw(ctx: CanvasRenderingContext2D): Promise<void> {
		const drawPromises: Promise<void>[] = []
		this.smallDanmus.forEach((danmu) => {drawPromises.push(danmu.draw(ctx))})
		await Promise.all(drawPromises)
	}
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
	public newDanmu(x: number, y: number) {
		let smallDanmu = new SmallDanmu({x: x, y: y}, this, this.size)
		this.smallDanmus.set(smallDanmu.getId(), smallDanmu)
		this.danmusNumber ++
	}
	public removeDanmu(id: string) {
		this.smallDanmus.delete(id)
	}
	// 阶段1 发两波横向弹幕 阶段2 先发一波3个左斜弹幕 再发一波3个右斜弹幕
	private lineStage: number = 0
	private lineRunning: boolean = false
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
	private lineStage1(){
		this.createLandsLine()
		this.lineRunning = true
		setTimeout(() => {
			this.lineRunning = false
			this.createLandsLine()
		}, 500)
	}
	private lineStage2(){
		this.createSlantLine(LineDir.leftDown)
		this.lineRunning = true
		setTimeout(() => {
			this.lineRunning = false
			this.createSlantLine(LineDir.rightDown)
		}, 1000)
	}
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
	private createSlantLine(type: LineDir) {
		const lineStart1 = (Math.random()) * (this.h - 2 * this.size) + this.size
		const lineStart2 = (Math.random()) * (this.h - 2 * this.size) + this.size
		const lineStart3 = (Math.random()) * (this.h - 2 * this.size) + this.size
		this.newLine(lineStart1, type)
		this.newLine(lineStart2, type)
		this.newLine(lineStart3, type)
	}
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