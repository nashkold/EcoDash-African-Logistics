let canvas = document.querySelector("canvas")

canvas.width = innerWidth
canvas.height =innerHeight

let weatherElement = document.querySelector("#weather")
let clockElement = document.querySelector("#clock")

// Day / night cycle settings (24 hours over ~4 mins starting at 06:00)
let gameHour = 6
let hoursPerFrame = 24 / 7200
let sunHeight = 0
let nightOpacity = 0

// Weather cycle settings 
let weatherStates = ["Clear", "Cloudy", "Rain", "Clear"]
let weatherIndex = 0
let weatherTimer = 0
// frames per weather state
let weatherDuration = 600
let currentWeather = "Clear"
// 0 to 1 smooth fade
let rainAmount = 0
let AmountOfclouds = 0

let numberOfclouds = [
    { x: 100, y: 40, size: 1 },
    { x: 400, y: 75, size: 0.8 },
    { x: 700, y: 35, size: 1.2 },
    { x: 900, y: 80, size: 0.7 }
]

let raindrops = []
for (let i = 0; i < 150; i++) {
    raindrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 8 + Math.random() * 8,
        speed: 8 + Math.random() * 6
    })
}

let ctx = canvas.getContext("2d")

// making the road horizontal and the grass vertical
let horizonY = canvas.height * 0.6
let roadTop = canvas.height * 0.6
let roadBottom = canvas.height * 0.8
let roadMiddle = (roadTop + roadBottom) / 2

window.addEventListener("resize", ()=> {
    canvas.width = innerWidth
    canvas.height =innerHeight

    horizonY = canvas.height * 0.6
    roadTop = canvas.height * 0.6
    roadBottom = canvas.height * 0.8
    roadMiddle = (roadTop + roadBottom) / 2
})

function updateTime() {
    gameHour = (gameHour + hoursPerFrame) % 24

    // Sine wave: 06:00 = 0, 12:00 = 1, 18:00 = 0, 00:00 = -1
    sunHeight = Math.sin(((gameHour - 6) / 24) * 2 * Math.PI)

    // Canvas overlay darkens when the sun drops below the horizon
    nightOpacity = Math.max(0, -sunHeight) * 0.7
}

function getTimeLabel() {
    let hours = Math.floor(gameHour)
    let minutes = Math.floor((gameHour - hours) * 60)

    let period = "Night"
    if (gameHour >= 5 && gameHour < 11) period = "Morning"
    else if (gameHour >= 11 && gameHour < 17) period = "Day"
    else if (gameHour >= 17 && gameHour < 21) period = "Evening"

    return String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0") + " " + period
}

function updateWeather() {
    weatherTimer++

    if (weatherTimer >= weatherDuration) {
        weatherTimer = 0
        weatherIndex = (weatherIndex + 1) % weatherStates.length
    }
    currentWeather = weatherStates[weatherIndex]

    // Smooth transition/fading targets
    let rainTarget = currentWeather === "Rain" ? 1 : 0
    let cloudTarget = currentWeather === "Clear" ? 0 : 1
    rainAmount += (rainTarget - rainAmount) * 0.02
    cloudAmount += (cloudTarget - cloudAmount) * 0.02

    clouds.forEach((cloud) => {
        cloud.x += 0.15 * cloud.size
        if (cloud.x > canvas.width + 60) cloud.x = -60
    })

    raindrops.forEach((drop) => {
        drop.y += drop.speed
        drop.x -= drop.speed * 0.2
        if (drop.y > canvas.height) {
            drop.y = -10
            drop.x = Math.random() * canvas.width
        }
        if (drop.x < 0) drop.x = canvas.width
    })
}

// Calculate solar efficiency based on time of day and weather conditions
function getSolarEfficiency() {
    let daylight = Math.max(0.3, sunHeight)
    let weatherFactor = 1
    if (currentWeather === "Cloudy") weatherFactor = 0.6
    if (currentWeather === "Rain") weatherFactor = 0.3
    return daylight * weatherFactor
}

// Cloud data configuration
let cloudAmount = 0.5
let clouds = [
    { x: canvas.width * 0.15, y: horizonY * 0.3, size: 1 },
    { x: canvas.width * 0.45, y: horizonY * 0.25, size: 1.3 },
    { x: canvas.width * 0.75, y: horizonY * 0.35, size: 0.9 }
]

// Grass blade generator
let GrassBlades = []
for (let i = 0; i < 50; i++) {
    GrassBlades.push({
        x: Math.random() * canvas.width,
        y: horizonY + 20 + Math.random() * (roadTop - horizonY - 20)
    })
}

// background drawing function, draws the sky, grass and road
function drawHills (baseY, hillHeight, frequency, phase, color) {
    ctx.beginPath()
    ctx.moveTo(0, baseY + 30)
    for (let x = 0; x <= canvas.width; x+= 10) {
        ctx.lineTo(x, baseY + hillHeight * Math.sin((x / canvas.width) * frequency * Math.PI * 2 + phase))
    }
    ctx.lineTo(canvas.width, baseY + 30)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
}

function drawClouds() {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.35 + 0.5 * cloudAmount})`
    clouds.forEach((cloud) => {
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath()
            ctx.arc(cloud.x + i * 22 * cloud.size, cloud.y + (i === 0 ? -8 : 0), 20 * cloud.size, 0, Math.PI * 2)
            ctx.fill()
        }
    })
}

function drawWeather() {
    // Cloudiness overlay
    ctx.fillStyle = "rgba(90, 100, 110, " + 0.18 * cloudAmount + ")"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (rainAmount > 0.02) {
        // Translucent blue rain overlay
        ctx.fillStyle = "rgba(40, 60, 90, " + 0.28 * rainAmount + ")"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Darkened edge reducing visible area
        let fog = ctx.createRadialGradient(vehicle.x, vehicle.y, 200, vehicle.x, vehicle.y, 460)
        fog.addColorStop(0, "rgba(20, 30, 45, 0)")
        fog.addColorStop(1, "rgba(20, 30, 45, " + 0.55 * rainAmount + ")")
        ctx.fillStyle = fog
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Animated rain streaks
        ctx.strokeStyle = "rgba(200, 220, 255, " + 0.7 * rainAmount + ")"
        ctx.lineWidth = 1.5
        ctx.beginPath()
        raindrops.forEach((drop) => {
            ctx.moveTo(drop.x, drop.y)
            ctx.lineTo(drop.x + drop.length * 0.2, drop.y - drop.length)
        })
        ctx.stroke()
    }
}

function drawDayNight() {
    // Night overlay driven by sunHeight sine wave
    ctx.fillStyle = "rgba(8, 12, 45, " + nightOpacity + ")"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Orange tint during sunrise and sunset
    let tint = Math.max(0, 1 - Math.abs(sunHeight) * 3)
    if (tint > 0) {
        ctx.fillStyle = "rgba(255, 120, 40, " + 0.2 * tint + ")"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
}

function drawGrass() {
    ctx.strokeStyle = "green"
    ctx.lineWidth = 2
    GrassBlades.forEach((blade) => {
        ctx.beginPath()
        ctx.moveTo(blade.x - 4, blade.y)
        ctx.lineTo(blade.x - 6, blade.y - 9)
        ctx.moveTo(blade.x, blade.y)
        ctx.lineTo(blade.x, blade.y - 12)
        ctx.moveTo(blade.x + 4, blade.y)
        ctx.lineTo(blade.x + 6, blade.y - 9)
        ctx.stroke()
    })
}

function drawUtilityPoles() {
    let poleBaseY = roadTop - 5
    ctx.strokeStyle = "#5a3d28"
    ctx.lineWidth = 3

    for (let x = 60; x < canvas.width; x += 150) {
        ctx.beginPath()
        ctx.moveTo(x, poleBaseY)
        ctx.lineTo(x, poleBaseY - 100)
        ctx.moveTo(x - 10, poleBaseY - 100)
        ctx.lineTo(x + 10, poleBaseY - 100)
        ctx.stroke()
    }

    // Draw power lines
    ctx.lineWidth = 1.5
    for (let x = 60; x < canvas.width; x += 150) {
        ctx.beginPath()
        ctx.moveTo(x, poleBaseY - 100)
        ctx.quadraticCurveTo(x + 75, poleBaseY - 120, x + 150, poleBaseY - 100)
        ctx.stroke()
    }
}

function drawRoad() {
    ctx.fillStyle = "orange"
    ctx.fillRect(0, roadTop - 14, canvas.width, roadBottom - roadTop + 28)

    ctx.fillStyle = "grey"
    ctx.fillRect(0, roadTop, canvas.width, roadBottom - roadTop)

    ctx.fillStyle = "yellow"
    ctx.fillRect(0, roadTop + 4, canvas.width, 3)
    ctx.fillRect(0, roadBottom - 7, canvas.width, 3)

    ctx.fillStyle = "white"
    for (let x = 0; x < canvas.width; x += 60) {
        ctx.fillRect(x, roadMiddle - 2, 30, 4)
    }
}

function drawSignPost(x, y) {
    ctx.strokeStyle = "#444"
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x, y - 50)
    ctx.stroke()
}

function drawRoadSigns() {
    let baseY = roadTop - 8
    let signY = baseY - 58
    ctx.textAlign = "center"

    drawSignPost(485, baseY)
    ctx.save()
    ctx.translate(485, signY)
    ctx.rotate(Math.PI / 4)
    ctx.fillStyle = "#f2c230"
    ctx.fillRect(-13, -13, 26, 26)
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2
    ctx.strokeRect(-13, -13, 26, 26)
    ctx.restore()
    ctx.fillStyle = "black"
    ctx.font = "bold 16px Arial"
    ctx.fillText("!", 485, signY + 6)
}

function drawBackground() {
    //sky
    let sky = ctx.createLinearGradient(0, 0, 0, horizonY)
    sky.addColorStop(0, "#5aa9dd")
    sky.addColorStop(1, "#f6d9a0")
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, canvas.width, horizonY + 2)
 
    drawClouds()
    drawHills(horizonY, 40, 0.008, 0, "#8a6a3d")
    drawHills(horizonY + 10, 25, 0.013, 2, "#6f8a3c")

    // dry grass/ground
     let grass = ctx.createLinearGradient(0, horizonY, 0, canvas.height)
    grass.addColorStop(0, "#c9a85a")
    grass.addColorStop(1, "#a5883e")
    ctx.fillStyle = grass
    ctx.fillRect(0, horizonY + 10, canvas.width, canvas.height - horizonY - 10)

    drawGrass()
    drawUtilityPoles()
    drawRoad()
    drawRoadSigns()
}

//old background drawing function, draws the sky, grass and road
//    ctx.fillStyle = "lightblue"
//    ctx.fillRect(0,0, canvas.width, canvas.height)

//    ctx.fillStyle = "green"
//    ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4)

//    ctx.fillStyle = "grey"
//    ctx.fillRect(
//        canvas.width * 0.3,
//        0,
//        canvas.width * 0.4,
//        canvas.height
//    )
//}
//drawBackground()

let keys = {}

window.addEventListener("keydown", (event)=> {
    keys[event.key.toLocaleLowerCase()] = true
})

window.addEventListener("keyup", (event)=> {
    keys[event.key.toLocaleLowerCase()] = false
})

class Vehicle {

    constructor(x, y) {
        this.x = x
        this.y = y
        this.width = 60
        this.height = 30

        this.vx = 0
        this.vy = 0

        //direction of the vehicle in degrees
        this.angle = 0

        // movement tuning
        this.acceleration = 0.15
        this.maxSpeed = 5
        this.friction = 0.95

        //battery
        this.battery = 100
        this.maxBattery = 100
        this.batteryConsumptionRate = 0.015
    }

    update() {
        // steering (left & right)
        if (keys["a"] || keys["arrowleft"]) {
            this.angle -= 0.05
        }

        if (keys["d"] || keys["arrowright"]) {
            this.angle += 0.05
        }

        // foward and backward movement, using the vehicle's angle to determine the direction of movement
        if (keys["w"] || keys["arrowup"]) {
            this.vx += Math.cos(this.angle) * 0.1
            this.vy += Math.sin(this.angle) * 0.1
        }

        if (keys["s"] || keys["arrowdown"]) {
            this.vx -= Math.cos(this.angle) * 0.1
            this.vy -= Math.sin(this.angle) * 0.1
        }

        // Make sure the vehicle doesn't exceed the maximum speed
        let currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)

        if (currentSpeed > this.maxSpeed) {
            let scale = this.maxSpeed / currentSpeed
            this.vx *= scale
            this.vy *= scale
        }

        // Apply friction to slow down the vehicle when not accelerating
        this.vx *= this.friction
        this.vy *= this.friction

        // Update the vehicle's position based on its velocity
        this.x += this.vx
        this.y += this.vy

        // keep the vehicle inside the canvas
        if (this.x - this.width / 2 < 0) {
            this.x = this.width / 2
            this.vx = 0
        }
 
        if (this.x + this.width / 2 > canvas.width) {
            this.x = canvas.width - this.width / 2
            this.vx = 0
        }
 
        if (this.y - this.height / 2 < 0) {
            this.y = this.height / 2
            this.vy = 0
        }
 
        if (this.y + this.height / 2 > canvas.height) {
            this.y = canvas.height - this.height / 2
            this.vy = 0
        }

        // battery consumption
        let movementSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)

        if (movementSpeed > 0.1) {
            this.battery -= this.batteryConsumptionRate * movementSpeed

        // Rain increases vehicle friction and battery usage
if (movementSpeed > 0.1) {
            this.battery -= this.batteryConsumptionRate * movementSpeed * (1 + 0.3 * rainAmount)
}
        }

        // Ensure battery doesn't go below 0
        if (this.battery < 0) {
            this.battery = 0
            this.vx = 0
            this.vy = 0
        }

        if (this.battery > this.maxBattery) {
            this.battery = this.maxBattery
        }
    }

    draw() {

        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.angle)

        ctx.fillStyle = "yellow"

    ctx.fillRect(
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
    )

    ctx.fillStyle = "black"

    ctx.beginPath()
    ctx.arc(
        -this.width / 2 + 15,
        this.height / 2,
        7,
        0,
        Math.PI * 2
    )
    ctx.fill()

    ctx.beginPath()
    ctx.arc(
        this.width / 2 - 15,
        this.height / 2,
        7,
        0,
        Math.PI * 2
    )
    ctx.fill()

    ctx.restore()
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        }
    }
}

class Pothole {
    constructor(x, y, width = 45, height = 30) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.hit = false
    }
draw() {
  ctx.beginPath()
        ctx.ellipse(this.x, this.y, this.width / 2, this.height / 2, 0, 0, Math.PI * 2)
        ctx.fillStyle = "#5a3d1e"
        ctx.fill()
        ctx.lineWidth = 3
        ctx.strokeStyle = "#d9822b"
        ctx.stroke()
    }

getBounds() {
    return {
        x: this.x - this.width / 2,
        y: this.y - this.height / 2,
        width: this.width,
        height: this.height
    }
}
}

class SolarMicrogridZones {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.width = 75
        this.height = 75
    }

draw() {
    let left = this.x - this.width / 2
        let top = this.y - this.height / 2
 
        // teal charging zone
        ctx.fillStyle = "#3fa79a"
        ctx.beginPath()
        ctx.roundRect(left, top, this.width, this.height, 14)
        ctx.fill()
 
        // solar panel with grid lines
        ctx.fillStyle = "#1d3b6b"
        ctx.fillRect(left + 12, top + 10, this.width - 24, 26)
        ctx.strokeStyle = "#7fb2e5"
        ctx.lineWidth = 1
        for (let i = 1; i < 4; i++) {
            let lineX = left + 12 + i * (this.width - 24) / 4
            ctx.beginPath()
            ctx.moveTo(lineX, top + 10)
            ctx.lineTo(lineX, top + 36)
            ctx.stroke()
        }
        ctx.beginPath()
        ctx.moveTo(left + 12, top + 23)
        ctx.lineTo(left + this.width - 12, top + 23)
        ctx.stroke()
 
        ctx.fillStyle = "white"
        ctx.font = "bold 12px Arial"
        ctx.textAlign = "center"
        ctx.fillText("CHARGING", this.x, top + 56)
        ctx.fillText("STATION", this.x, top + 71)
}

getBounds() {
    return {
        x: this.x - this.width / 2,
        y: this.y - this.height / 2,
        width: this.width,
        height: this.height
    }
}
}

class LoadSheddingZone {
constructor(x, y, width = 120, height = 120) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.active = true

}

draw() {
    ctx.fillStyle = this.active ? "rgba(25, 25, 25, 0.65)" : "rgba(40, 180, 80, 0.15)"
        ctx.fillRect(this.x, this.y, this.width, this.height)
 
        ctx.strokeStyle = this.active ? "#B42828" : "#28B450"
        ctx.lineWidth = 2
        ctx.strokeRect(this.x, this.y, this.width, this.height)

     ctx.fillStyle = this.active ? "#ff5a4d" : "#28B450"
        ctx.font = "bold 14px Arial"
        ctx.textAlign = "center"
        ctx.fillText(this.active ? "LOAD SHEDDING" : "POWER ON", this.x + this.width / 2, this.y + 20)
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        }
    }
}

class DeliveryTarget {
    constructor(x, y,) {
        this.x = x
        this.y = y
        this.width = 35
        this.height = 35
        this.collected = false
    }

    draw() {
        if (this.collected) return

        ctx.fillStyle = "orange"
        ctx.fillRect(
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height
        )

        ctx.beginPath()
        for (let i = 0; i < 10; i++) {
            let starRadius = i % 2 === 0 ? 12 : 5
            let starAngle = -Math.PI / 2 + i * Math.PI / 5
            ctx.lineTo(this.x + starRadius * Math.cos(starAngle), this.y + starRadius * Math.sin(starAngle))
        }
        ctx.closePath()
        ctx.fillStyle = "#1f8a3a"
        ctx.fill()

        ctx.fillStyle = "white"
        ctx.font = "20px Arial"
        ctx.textAlign = "center"
        ctx.fillText("Delivery", this.x, this.y + 5)
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        }
    }
}

// Check if two zones are too close to each other, returns true if they are too close, false otherwise
function checkZoneGap(zone1, zone2, minGap) {
    let b1 = zone1.getBounds()
    let b2 = zone2.getBounds()

    let dx = Math.max(0, Math.max(b1.x - (b2.x + b2.width), b2.x - (b1.x + b1.width)))
    let dy = Math.max(0, Math.max(b1.y - (b2.y + b2.height), b2.y - (b1.y + b1.height)))

    return Math.hypot(dx, dy) >= minGap
}

//randomly generate positions for the zones, ensuring they are not too close to each other
function findFreeSpot(type, options = {}) {
    let maxAttempts = 200

    // Top boundary: top peak of the power lines (roadTop - 5 - 120)
    let minY = roadTop - 125
    let maxY = canvas.height

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        let x, y

        // Potholes only appear on the road surface
        if (type === "pothole") {
            x = 60 + Math.random() * (canvas.width - 120)
            y = roadTop + 12 + Math.random() * (roadBottom - roadTop - 24)
            return new Pothole(x, y)
        }

        // Delivery target can be placed inside a load shedding zone
        if (type === "delivery" && options.insideZone) {
            let zone = options.insideZone
            let dx = zone.x + zone.width / 2
            let dy = zone.y + zone.height / 2
            return new DeliveryTarget(dx, dy)
        }

        x = 80 + Math.random() * (canvas.width - 160)

        if (type === "loadShedding") {
            // LoadSheddingZone uses x, y as top-left corner
            let zoneHeight = 120
            y = minY + Math.random() * (maxY - minY - zoneHeight - 20)
            
            let candidate = new LoadSheddingZone(x, y)
            let valid = solarMicrogridZones.every((solar) => checkZoneGap(candidate, solar, 110))
            if (valid) return candidate

        } else if (type === "solar") {
            // SolarMicrogridZones uses x, y as center (height = 75)
            let halfHeight = 37.5
            y = (minY + halfHeight) + Math.random() * (maxY - (minY + halfHeight) - halfHeight - 20)

            let candidate = new SolarMicrogridZones(x, y)
            let valid = loadSheddingZones.every((ls) => checkZoneGap(candidate, ls, 110))
            if (valid) return candidate

        } else if (type === "delivery") {
            // DeliveryTarget uses x, y as center (height = 35)
            let halfHeight = 17.5
            y = (minY + halfHeight) + Math.random() * (maxY - (minY + halfHeight) - halfHeight - 20)

            return new DeliveryTarget(x, y)
        }
    }

    // Fallbacks ensuring items stay below power lines
    if (type === "loadShedding") return new LoadSheddingZone(100, minY)
    if (type === "solar") return new SolarMicrogridZones(canvas.width - 150, minY + 40)
    if (type === "pothole") return new Pothole(canvas.width / 2, (roadTop + roadBottom) / 2)
    return new DeliveryTarget(canvas.width / 2, minY + 40)
}

// Collision detection function, true if the two objects are colliding, false otherwise
function checkCollision(firstObject, secondObject) {

    let first = firstObject.getBounds()
    let second = secondObject.getBounds()

    return (
    first.x < second.x + second.width &&
           first.x + first.width > second.x &&
           first.y < second.y + second.height &&
           first.y + first.height > second.y
    )
}

let vehicle = new Vehicle(canvas.width / 2, canvas.height - 100)
let loadSheddingZones = []
let solarMicrogridZones = []
let potholes = []
let deliveryTargets = []
let score = 0

// initialize world elements according to these logic rules
function initWorld() {
    loadSheddingZones = []
    solarMicrogridZones = []
    potholes = []
    deliveryTargets = []

    //spawn the load shedding zones
    for (let i = 0; i < 2; i++) {
        loadSheddingZones.push(findFreeSpot("loadShedding"))
    }

    //spawn charging stations
    for (let i = 0; i < 2; i++) {
        solarMicrogridZones.push(findFreeSpot("solar"))
    }

    //spawn 3 to 7 deliveries
    let numberOfDeliveryTargets = Math.floor(Math.random() * 5) + 3
    
    // one delivery will always been in a loadshedding zone
    if(loadSheddingZones.length > 0) {
        let targetZone = loadSheddingZones[Math.floor(Math.random() * loadSheddingZones.length)]
        deliveryTargets.push(findFreeSpot("delivery", { insideZone: targetZone }))
    }

    //randomly place the remaining deliveries
    for (let i = deliveryTargets.length; i < numberOfDeliveryTargets; i++) {
        deliveryTargets.push(findFreeSpot("delivery"))
    }

    //spawn the potholes on the road only
    for (let i = 0; i < 4; i++) {
        potholes.push(findFreeSpot("pothole"))
    }
}

initWorld()


// positions are fractions of the canvas width and height, so they will scale with the canvas size
//let potholes = [
//    new Pothole(canvas.width * 0.35, canvas.height * 0.3),
//    new Pothole(canvas.width * 0.65, canvas.height * 0.4),
//    new Pothole(canvas.width * 0.45, canvas.height * 0.75),
//    new Pothole(canvas.width * 0.8, canvas.height * 0.6)
//

// let solarMicrogridZones = [
//     new SolarMicrogridZones(canvas.width * 0.1, canvas.height * 0.15),
//     new SolarMicrogridZones(canvas.width * 0.75, canvas.height * 0.2)
// ]

// let loadSheddingZones = [
//     new LoadSheddingZone(canvas.width * 0.05, canvas.height * 0.05),
//     new LoadSheddingZone(canvas.width * 0.75, canvas.height * 0.05)
// ]
 
// // let the number of delivery be randomly generated between 3 and 7
// let score = 0
// let deliveryTargets = []
// let numberOfDeliveryTargets = Math.floor(Math.random() * 5) + 3

// for (let i = 0; i < numberOfDeliveryTargets; i++) {
//     // ensure the targets are not too close to the edges of the canvas
//     let randX = Math.random() * (canvas.width - 100) + 50
//     let randY = Math.random() * (canvas.height -100) + 50
//     deliveryTargets.push(new DeliveryTarget(randX, randY))
// }

//left empty so that loadshedding stays constant
function updateLoadShedding() {
}

function handlePotholeCollisions() {

    potholes.forEach((pothole) => {

    if (!pothole.hit && checkCollision(vehicle, pothole)) 
        {
            pothole.hit = true

            vehicle.battery -= 3

            // reduce the vehicle's speed when hitting a pothole
            vehicle.vx *= 0.2
            vehicle.vy *= 0.2

            score -= 25
        }
    })
}

function handleSolarMicrogridZones() {

    solarMicrogridZones.forEach((zone) => {

        if (checkCollision(vehicle, zone)) {
            vehicle.battery += 0.25

            if (vehicle.battery > vehicle.maxBattery) {
                vehicle.battery = vehicle.maxBattery

            // Recharging scaled by solar efficiency (time of day + weather)
                vehicle.battery += 0.25 * getSolarEfficiency()
            }

}
    })
}
function handleLoadSheddingZonesCollisions() {
    loadSheddingZones.forEach((zone) => {

        if (zone.active && checkCollision(vehicle, zone)) {
            // drain the battery slightly faster when in a load shedding zone
            vehicle.battery -= 0.15
        }
    })
}

function handleDeliveryTargets() {
    deliveryTargets.forEach((target) => { 
        if (!target.collected && checkCollision(vehicle, target)) {
            target.collected = true
            score += 150
        }
    })
}

function drawHUD() {

    ctx.fillStyle = "black"
    ctx.font = "20px Arial"
    ctx.textAlign = "left"

    ctx.fillText("Score: " + score, 20, 30)
    ctx.fillText("Battery: " + Math.round(vehicle.battery) + "%", 20, 60)
    ctx.fillText("Distance: 0 km", 20, 90)
}

function animate() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    )

    drawBackground()

    updateLoadShedding()

    // Event handling
    handlePotholeCollisions()
    handleSolarMicrogridZones()
    handleLoadSheddingZonesCollisions()
    handleDeliveryTargets()

    // draw objects
    loadSheddingZones.forEach((zone) => {
        zone.draw()
    })

    solarMicrogridZones.forEach((zone) => {
        zone.draw()
    })  

    potholes.forEach((pothole) => {
        pothole.draw()
    })

    deliveryTargets.forEach((target) => {
        target.draw()
    })

    vehicle.update()
    vehicle.draw()

    drawWeather()
    drawDayNight()

    drawHUD()

    requestAnimationFrame(animate)
}

animate()