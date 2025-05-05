'use strict';
const small = new Image()
small.src = './small.png'

function randomUUID() {
    const hexDigits = '0123456789abcdef';
    let uuid = '';

    for (let i = 0; i < 36; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) {
            uuid += '-';
        } else if (i === 14) {
            uuid += '4';
        } else if (i === 19) {
            uuid += hexDigits[(Math.floor(Math.random() * 4) + 8)];
        } else {
            uuid += hexDigits[Math.floor(Math.random() * 16)];
        }
    }
    return uuid;
}

function IsPhone() {
	//获取浏览器navigator对象的userAgent属性（浏览器用于HTTP请求的用户代理头的值）
	var info = navigator.userAgent;
	//通过正则表达式的test方法判断是否包含“Mobile”字符串
	var isPhone = /mobile/i.test(info);
	//如果包含“Mobile”（是手机设备）则返回true
	return isPhone;
}

const SIZE = IsPhone() ? 1:2

const speakList = [
	'芙兰什么的最喜欢了~',
	'本命',
	'想和你在一起',
	'初恋',
	'喜欢你',
	'人生苦短,我爱芙兰',
	'我爱你',
]

let m = {
	x:0,
	y:0
}

if(IsPhone()){
	addEventListener('touchstart',e=>{
		m.y=e.touches[0].clientY
		m.x=e.touches[0].clientX
	})
	document.addEventListener('touchmove',e=>{
		m.y=e.touches[0].clientY
		m.x=e.touches[0].clientX	
	})
}
else addEventListener('mousemove',e=>{
	m.x = e.clientX	
	m.y = e.clientY
})

class Point{
	constructor(range, ran, speedRate){
		let size = Math.random() * (range[1] - range[0]) + range[0]
		let t = Math.random() * 2 * Math.PI;
		let x = 16 * Math.pow(Math.sin(t), 3);
		let y = -13 * Math.cos(t) + 5 * Math.cos(2 * t) + 2 * Math.cos(3 * t) + Math.cos(4 * t);
		this.baseTargetX = x * size
		this.baseTargetY = y * size
		this.x = this.baseTargetX
		this.y = this.baseTargetY
		this.mx = 0
		this.my = 0
		this.round = Math.random() * SIZE
		this.ran = ran
	}

	draw(ctx){
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.round, 0, 2 * Math.PI);
		ctx.fill();
	}
}

let round = 0

class inPoint extends Point{
	constructor(){
		super([1, 2], 1.5 * SIZE)
		let size = 4 * SIZE - 1 / (Math.random() + 0.5) * SIZE
		let t = Math.random() * 2 * Math.PI
		let x = 16 * Math.pow(Math.sin(t), 3);
		let y = -13 * Math.cos(t) + 5 * Math.cos(2 * t) + 2 * Math.cos(3 * t) + Math.cos(4 * t);
		this.baseTargetX = x * size
		this.baseTargetY = y * size
	}

	update(x,y){
		let targetX = this.baseTargetX * (20 + Math.sin(round)) / 20 + x
		let targetY = this.baseTargetY * (20 + Math.sin(round)) / 20 + y

		this.round += 0.01 * SIZE

		if(this.round > 1 * SIZE){
			this.round = 0
			this.mx = 0
			this.my = 0
		}else{
			this.mx += this.ran * (Math.random() - 0.5) * 0.1 * SIZE
			this.my += this.ran * (Math.random() - 0.5) * 0.1 * SIZE
		}
		this.x = targetX + this.mx
		this.y = targetY + this.my
	}
}

class outPoint extends Point{
	constructor(){
		super([1 * SIZE, 3.5 * SIZE], 3 * SIZE)
	}

	update(x,y){
		let targetX = this.baseTargetX + x
		let targetY = this.baseTargetY + y

		this.round += 0.001 * SIZE

		if(this.round > 1 * SIZE){
			this.round = 0
			this.mx = 0
			this.my = 0
		}else{
			this.mx += this.ran * (Math.random() - 0.5) * 0.2 * SIZE
			this.my += this.ran * (Math.random() - 0.5) * 0.2 * SIZE
		}
		this.x = targetX + this.mx
		this.y = targetY + this.my
	}
}

class Big{
	constructor(){
		this.x = m.x
		this.y = m.y
		this.size = SIZE
		this.points = []
		for (let i = 0; i < 700; i++) {
			this.points.push(new inPoint())
		}
		for (let i = 0; i < 700; i++) {
			this.points.push(new outPoint())
		}
	}

	update(){
		this.points.forEach(point => {
			point.update(this.x,this.y)
		})

		round += 0.01

		let distanceX = Math.abs(m.x - this.x)
		let distanceY = Math.abs(m.y - this.y)
		let distance = Math.sqrt(distanceX**2 + distanceY**2)
		if(distance < 1){
			this.x = m.x
			this.y = m.y
			console.log(m.x,m.y)
			return
		}
		else if(distance < 50) var speed = 3
		else speed = Math.sqrt(distance) / 5
		
		var speedX = speed * distanceX / distance
		var speedY = speed * distanceY / distance

		if(m.x > this.x)this.x += speedX
		else this.x -= speedX

		if(m.y > this.y)this.y += speedY
		else this.y -= speedY
	}

	draw(ctx){
		ctx.fillStyle = 'red'
		this.points.forEach(point => {
			point.draw(ctx)
		})
	}
}

class Danmu{
	constructor(x,y,uuid){
		this.x = x
		this.y = y
		this.uuid = uuid
		this.speedX = 0
		this.speedY = 0
		this.baseSize = SIZE
		this.size = 5 * this.baseSize
	}

	update(){
		if(this.size>this.baseSize)this.size -= 0.3 * this.baseSize
		else this.size = this.baseSize
		this.x += this.speedX
		this.y += this.speedY
		if(this.x<0||this.x>w||this.y<0||this.y>h)danmus.delete(this.uuid)
		let distanceX = Math.abs(bigDanmu.x - this.x)
		let distanceY = Math.abs(bigDanmu.y - this.y)
		let distance = Math.sqrt(distanceX**2 + distanceY**2)
		if(distance > 150)return
		let speed = Math.sqrt(distance) * 0.01
		this.speedX += (this.x - bigDanmu.x) / distance * speed
		this.speedY += (this.y - bigDanmu.y) / distance * speed
	}

	draw(ctx){
		ctx.globalAlpha = this.baseSize * this.baseSize / (this.size * this.size)
		ctx.drawImage(small, 0, 0, 16, 16, this.x - 8*this.size, this.y - 8*this.size, 16*this.size, 16*this.size)
		ctx.globalAlpha = 1
	}
}

let bigDanmu = null

function addDanmu(x,y){
	let id = randomUUID()
	danmus.set(id,new Danmu(x,y,id))
}

function init(){
	bigDanmu = new Big()
	requestAnimationFrame(draw)
}

let w = document.documentElement.clientWidth
let h = document.documentElement.clientHeight

let danmus = new Map()
let addLines = new Map()

let nowTime = 0

let nowLines = 0 // 8个换一个mod
let nowDirection = 0 // 0: 左 1: 上 2: 右 3: 下 // 0 2: 左 1 3 右
let nowMod = 0 // 0: 正向 1: 斜向

function update(){
	if(danmus.size < 300 && addLines.size<4){
		let direction = nowDirection
		// 正向
		if(nowMod == 0){
			let id = randomUUID()
			if(direction == 0||direction == 2) var position = (0.1 + Math.random() * 0.8) * h
			else var position = (0.1 + Math.random() * 0.8) * w
			switch(direction){
				case 0: var nowPosision = 0; break
				case 1: var nowPosision = 0; break
				case 2: var nowPosision = w; break
				case 3: var nowPosision = h; break
			}
			addLines.set(id, ()=>{
				if(nowTime !== 0)return
				switch(direction){
					case 0: nowPosision += 20 * SIZE; break
					case 1: nowPosision += 20 * SIZE; break
					case 2: nowPosision -= 20 * SIZE; break
					case 3: nowPosision -= 20 * SIZE; break
				}
				if(direction == 0||direction == 2) addDanmu(nowPosision,position)
				else addDanmu(position, nowPosision)
				if(direction == 0||direction == 2){
					if(nowPosision > w || nowPosision < 0)addLines.delete(id)
				}else{
					if(nowPosision > h || nowPosision < 0)addLines.delete(id)
				}
			})
		// 斜向
		}else{
			let id = randomUUID()
			let start = (0.1 + Math.random() * 0.8) * h
			if(direction == 0||direction == 2)var x = 0
			else var x = w
			let y = start
			addLines.set(id,()=>{
				if(nowTime !== 0)return
				y += 14 * SIZE
				if(direction == 0||direction == 2)x += 14 * SIZE
				else x -= 14 * SIZE
				addDanmu(x,y)
				if(y > h)addLines.delete(id)
				if(x<0||x>w)addLines.delete(id)
			})
		}
		nowLines ++
		nowDirection ++
		if(nowDirection>3)nowDirection = 0
		if(nowLines>8){
			nowLines = 0
			if(nowMod == 0)nowMod = 1
			else nowMod = 0
		}
	}
	addLines.forEach(f=>f())
	nowTime ++
	if(nowTime>4)nowTime = 0
}

function draw(){
	const ctx = document.getElementById('canvas').getContext('2d')
	w = document.documentElement.clientWidth
	h = document.documentElement.clientHeight
	ctx.canvas.width = w
	ctx.canvas.height = h

	
	// 绘制弹幕
	danmus.forEach(danmu => {
		danmu.update()
		danmu.draw(ctx)
	})
	ctx.save()


	// 大玉
	bigDanmu.update()
	bigDanmu.draw(ctx)
	ctx.save()


	// 绘制背景
	ctx.globalCompositeOperation = "destination-over"
	ctx.fillStyle = "#000000"
	ctx.fillRect(0, 0, w, h)
	ctx.save()


	update()
	requestAnimationFrame(draw)
}

addEventListener('DOMContentLoaded',e=>{
	init()
	setInterval(()=>{
		let div = document.createElement('div')
		div.innerText = speakList[Math.floor(Math.random()*speakList.length)]
		div.style.animation = 'show 3s linear'
		div.style.left = `${Math.random() * (w - div.innerText.length * 50 - 10)}px`
		div.style.top = `${Math.random() * (h - 50 - 10)}px`
		div.setAttribute('class', 'text')
		document.body.appendChild(div)
	}, 3000)
})
