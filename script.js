let canvas = document.querySelector("canvas")

canvas.width = innerWidth
canvas.height =innerHeight

let ctx = canvas.getContext("2d")

window.addEventListener("resize", ()=> {
    canvas.width = innerWidth
    canvas.height =innerHeight
})

function drawBackground() {
    ctx.fillStyle = "lightblue"
    ctx.fillRect(0,0, canvas.width, canvas.height)

    ctx.fillStyle = "green"
    ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4)

    ctx.fillStyle = "grey"
    ctx.fillRect(
        canvas.width * 0.3,
        0,
        canvas.width * 0.4,
        canvas.height
    )
}

drawBackground()

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

let vehicle = new Vehicle(
    canvas.width / 2,
    canvas.height - 100
)

vehicle.draw()

class Pothole {
    constructor(x, y, width = 45, height = 30) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.hit = false
    }
draw() {
    ctx.fillStyle = "grey"

    ctx.beginPath()
    ctx.ellipse(
        this.x,
        this.y,
        this.width / 2,
        this.height / 2,
        0,
        0,
        Math.PI * 2
    )
    ctx.fill()
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
    ctx.fillStyle = "#3f6f45"

    ctx.fillRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
    )

    ctx.fillStyle = "white"
    ctx.font = "20px Arial"
    ctx.textAlign = "center"

    ctx.fillText("Charging Station", this.x, this.y + 5)
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
    ctx.fillStyle = this.active
     ? "#B428284D" 
     : "#28B45026"

     ctx.fillRect(
        this.x,
        this.y,
        this.width,
        this.height
     )

        ctx.strokeStyle = this.active
        ? "#B42828"
        : "#28B450"

        ctx.lineWidth = 2

        ctx.strokeRect(
            this.x,
            this.y,
            this.width,
            this.height
        )

        ctx.fillStyle = "white"
        ctx.font = "20px Arial"
        ctx.textAlign = "center"

        ctx.fillText(
            this.active ? "Load Shedding Active" : "Load Shedding Inactive",
            this.x + 6,
            this.y + 18
        )
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

// positions are fractions of the canvas width and height, so they will scale with the canvas size
let potholes = [
    new Pothole(canvas.width * 0.35, canvas.height * 0.3),
    new Pothole(canvas.width * 0.65, canvas.height * 0.4),
    new Pothole(canvas.width * 0.45, canvas.height * 0.75),
    new Pothole(canvas.width * 0.8, canvas.height * 0.6)
]

let solarMicrogridZones = [
    new SolarMicrogridZones(canvas.width * 0.1, canvas.height * 0.15),
    new SolarMicrogridZones(canvas.width * 0.75, canvas.height * 0.2)
]

let loadSheddingZones = [
    new LoadSheddingZone(canvas.width * 0.05, canvas.height * 0.05),
    new LoadSheddingZone(canvas.width * 0.75, canvas.height * 0.05)
]

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
        }
    })
}

function handleSolarMicrogridZones() {

    solarMicrogridZones.forEach((zone) => {

        if (checkCollision(vehicle, zone)) {
            vehicle.battery += 0.25

            if (vehicle.battery > vehicle.maxBattery) {
                vehicle.battery = vehicle.maxBattery
            }

}
    })
}
function handleLoadSheddingZonesCollisions() {
    loadSheddingZones.forEach((zone) => {

        if (zone.active && checkCollision(vehicle, zone)) {
            // drain the battery slightly faster when in a load shedding zone
            vehicle.battery -= 0.5
        }
    })
}

function drawHUD() {

    ctx.fillStyle = "black"

    ctx.font = "20px Arial"

    ctx.fillText("Score: 0", 20, 30)
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

    loadSheddingZones.forEach((zone) => {
        zone.draw()
    })

    solarMicrogridZones.forEach((zone) => {
        zone.draw()
    })  

    potholes.forEach((pothole) => {
        pothole.draw()
    })

    vehicle.update()
    vehicle.draw()

    drawHUD()

    requestAnimationFrame(animate)
}

animate()