class Room {
    constructor(id) {
        this.id = id;
        this.members = new Set();
    }

    addMember(socketId) {
        this.members.add(socketId);
    }

    removeMember(socketId) {
        this.members.delete(socketId);
    }

    get size() {
        return this.members.size;
    }

    toJSON() {
        return {
            id: this.id,
            members: Array.from(this.members)
        };
    }
}

export default Room;
