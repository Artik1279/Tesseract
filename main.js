// Canvas
const canvas = document.getElementById('c1');
const c = canvas.getContext('2d');
// Pixel Dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
c.translate(canvas.width / 2, canvas.height / 2);
let rx = 0;
let ry = 0;
let rz = 0;
let rw = 0;

// Camera Data
const Camera = {
    // Focal Length
    focalLength: 35,
    wFocalLength: 12,
    // Pinhole Location
    x: 0, y: 0, z: 0, w: 0,
    // Camera Rotation
    rotX: 0, rotY: 0, rotZ: 0
};
Camera.z = -(Camera.focalLength ** 2);
Camera.w = -(Camera.wFocalLength ** 2);

// Vertex Object
class Vertex {
    constructor(x, y, z, w) {
        this.loc = [x / Camera.focalLength, y / Camera.focalLength, z / Camera.focalLength, w / Camera.focalLength];
        this.ploc = [];
    }
    // 3D Rotation Transformation
    rotate(xr, yr, zr, wr) {
        // 4D Rotation on YW Axis
        let yy = this.loc[1];
        this.loc[1] = yy * Math.cos(wr) - this.loc[3] * Math.sin(wr);
        this.loc[3] = yy * Math.sin(wr) + this.loc[3] * Math.cos(wr);
        // Constants
        let x = this.loc[0];
        let y = this.loc[1];
        let z = this.loc[2];
        // Rotation Data
        let sx = Math.sin(xr);
        let sy = Math.sin(yr);
        let sz = Math.sin(zr);
        let cx = Math.cos(xr);
        let cy = Math.cos(yr);
        let cz = Math.cos(zr);
        // Repeating Parts of Equation
        let eq1 = sz * y + cz * x;
        let eq2 = cz * y - sz * x;
        let eq3 = cy * z + sy * eq1;
        // Applying Transformations
        this.loc[0] = cy * eq1 - sy * z;
        this.loc[1] = sx * eq3 + cx * eq2;
        this.loc[2] = cx * eq3 - sx * eq2;
    }
    // Projected 2D Coordinates
    project() {
        // Projects 4D to 3D
        this.loc[3] -= Camera.w / Camera.wFocalLength;
        this.loc[0] = -this.loc[0] / this.loc[3] * Camera.wFocalLength;
        this.loc[1] = -this.loc[1] / this.loc[3] * Camera.wFocalLength;
        this.loc[2] = -this.loc[2] / this.loc[3] * Camera.wFocalLength;
        // Camera Location
        let x = this.loc[0] - Camera.x / Camera.focalLength;
        let y = this.loc[1] - Camera.y / Camera.focalLength;
        let z = this.loc[2] - Camera.z / Camera.focalLength;
        // Camera Rotation
        let sx = Math.sin(Camera.rotX);
        let sy = Math.sin(Camera.rotY);
        let sz = Math.sin(Camera.rotZ);
        let cx = Math.cos(Camera.rotX);
        let cy = Math.cos(Camera.rotY);
        let cz = Math.cos(Camera.rotZ);
        // Repeating Parts of Equation
        let eq1 = sz * y + cz * x;
        let eq2 = cz * y - sz * x;
        let eq3 = cy * z + sy * eq1;
        // Camera Transformations
        let dx = cy * eq1 - sy * z;
        let dy = sx * eq3 + cx * eq2;
        let dz = cx * eq3 - sx * eq2;
        // Projection
        this.ploc = [Camera.focalLength / dz * dx * Camera.focalLength, Camera.focalLength / dz * dy * Camera.focalLength];
    }
}

// Edge Object
class Edge {
    constructor(v1, v2) {
        this.v1 = v1;
        this.v2 = v2;
    }
    show() {
        c.beginPath();
        c.moveTo(this.v1.ploc[0], this.v1.ploc[1]);
        c.lineTo(this.v2.ploc[0], this.v2.ploc[1]);
        c.strokeStyle = 'white';
        c.lineWidth = 2;
        c.stroke();
    }
}

function draw() {
    requestAnimationFrame(draw);
    c.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    // Update rotation for multiple axes
    rx = (rx - 0.01) % (Math.PI * 2);
    ry = (ry - 0.012) % (Math.PI * 2);
    rz = (rz - 0.008) % (Math.PI * 2);
    rw = (rw - 0.01) % (Math.PI * 2);

    let edges = [];
    let w = 175;
    // Vertices
    let v = [];
    v[0] = new Vertex(-w / 2, w / 2, -w / 2, w / 2);
    v[1] = new Vertex(w / 2, w / 2, -w / 2, w / 2);
    v[2] = new Vertex(w / 2, w / 2, w / 2, w / 2);
    v[3] = new Vertex(-w / 2, w / 2, w / 2, w / 2);
    v[4] = new Vertex(-w / 2, -w / 2, -w / 2, w / 2);
    v[5] = new Vertex(w / 2, -w / 2, -w / 2, w / 2);
    v[6] = new Vertex(w / 2, -w / 2, w / 2, w / 2);
    v[7] = new Vertex(-w / 2, -w / 2, w / 2, w / 2);
    v[8] = new Vertex(-w / 2, w / 2, -w / 2, -w / 2);
    v[9] = new Vertex(w / 2, w / 2, -w / 2, -w / 2);
    v[10] = new Vertex(w / 2, w / 2, w / 2, -w / 2);
    v[11] = new Vertex(-w / 2, w / 2, w / 2, -w / 2);
    v[12] = new Vertex(-w / 2, -w / 2, -w / 2, -w / 2);
    v[13] = new Vertex(w / 2, -w / 2, -w / 2, -w / 2);
    v[14] = new Vertex(w / 2, -w / 2, w / 2, -w / 2);
    v[15] = new Vertex(-w / 2, -w / 2, w / 2, -w / 2);

    // Rotating and Projecting vertices
    for (let i = 0; i < v.length; i++) {
        // If Rotation is Needed
        if (Math.abs(rx) + Math.abs(ry) + Math.abs(rz) + Math.abs(rw) > 0) v[i].rotate(rx, ry, rz, rw);
        v[i].project();
    }

    // Edges
    const edgeIndices = [
        [0, 1], [1, 2], [2, 3], [3, 0], // Front cube edges
        [4, 5], [5, 6], [6, 7], [7, 4], // Back cube edges
        [0, 4], [1, 5], [2, 6], [3, 7], // Connecting front and back cubes
        [8, 9], [9, 10], [10, 11], [11, 8], // Second front cube edges
        [12, 13], [13, 14], [14, 15], [15, 12], // Second back cube edges
        [8, 12], [9, 13], [10, 14], [11, 15], // Connecting second front and back cubes
        [0, 8], [1, 9], [2, 10], [3, 11], // Connecting first front cube to second front cube
        [4, 12], [5, 13], [6, 14], [7, 15] // Connecting first back cube to second back cube
    ];

    for (let i = 0; i < edgeIndices.length; i++) {
        edges.push(new Edge(v[edgeIndices[i][0]], v[edgeIndices[i][1]]));
    }

    // Rendering Edges
    for (let i = 0; i < edges.length; i++) {
        edges[i].show();
    }
}
draw();
