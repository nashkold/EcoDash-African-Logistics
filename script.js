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

class Vehicle {

    constructor(x, y) {
        this.x = x
        this.y = y
        this.width = 60
        this.height = 30
    }

    draw() {

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
    ctx.fillText("Battery: 100%", 20, 60)
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
    vehicle.draw()
    drawHUD

    requestAnimationFrame(animate)
}