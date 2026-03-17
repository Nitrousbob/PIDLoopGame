// Fixed-capacity circular buffer
export class RingBuffer {
  constructor(capacity) {
    this.capacity = capacity
    this.data = []
  }

  push(item) {
    this.data.push(item)
    if (this.data.length > this.capacity) {
      this.data.shift()
    }
  }

  toArray() {
    return this.data
  }

  last(n) {
    if (n >= this.data.length) return this.data
    return this.data.slice(this.data.length - n)
  }

  get length() {
    return this.data.length
  }

  clear() {
    this.data = []
  }
}
