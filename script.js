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
    keys[event.key.toLocaleLowerCase] = true
})

window.addEventListener("keyup", (event)=> {
    keys[event.key.toLocaleLowerCase] = false
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
        this.x,
        this.y,
        this.width,
        this.height
    )

    ctx.fillStyle = "black"

    ctx.beginPath()
    ctx.arc(
        this.x + 15,
        this.y + this.height,
        7,
        0,
        Math.PI * 2
    )
    ctx.fill()

    ctx.beginPath()
    ctx.arc(
        this.x + this.width - 15,
        this.y + this.height,
        7,
        0,
        Math.PI * 2
    )
    ctx.fill()
    }
}

let vehicle = new Vehicle(
    canvas.width / 2,
    canvas.height - 100
)

vehicle.draw()

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
    vehicle.update()
    vehicle.draw()
    drawHUD

    requestAnimationFrame(animate)
}

animate()