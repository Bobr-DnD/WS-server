import Room from './room.entity.js';

class RoomManager {
    constructor() {
        this.rooms = new Map();
    }

    getOrCreate(roomId) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Room(roomId));
        }
        return this.rooms.get(roomId);
    }

    join(socketId, roomId) {
        const room = this.getOrCreate(roomId);
        room.addMember(socketId);
        return room;
    }

    leave(socketId, roomId) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.removeMember(socketId);
            if (room.size === 0) this.rooms.delete(roomId);
        }
    }

    leaveAll(socketId) {
        this.rooms.forEach((room) => {
            room.removeMember(socketId);
        });
    }

    getRooms() {
        return Array.from(this.rooms.values()).map(room => room.toJSON());
    }
}

export const roomManager = new RoomManager();
