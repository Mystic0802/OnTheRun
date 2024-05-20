import display_render from "./display_render.js";
let socket_path = "/game"



class DisplaySocket {
    constructor(__renderer, __socket) {
        this.renderer = __renderer
        this.socket = __socket
        this.socket.on('connect', () => {
            console.log(`Got connection to ${socket_path}`)
        })
        this.socket.emit('display_get', 'test')
    }

}

const socket = io({
    path: socket_path
});


let display_socket = new DisplaySocket(display_render.renderer, socket)
