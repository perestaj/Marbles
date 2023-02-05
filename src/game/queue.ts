export class Queue<T> {
    private state: T[];

    constructor() {
        this.state = [];
    }

    public enqueue(item: T): void {
        this.state.push(item);
    }

    public dequeue(): T | undefined {
        if (!this.state || this.state.length === 0) {
            return undefined;
        }
        
        let item = this.state.splice(0, 1);
        return item[0];
    }

    public get length(): number {
        return this.state.length;
    }
}