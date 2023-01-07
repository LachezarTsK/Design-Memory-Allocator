
class Allocator {

    static NO_AVAILABLE_MEMORY_BLOCK = -1;
    static DUMMY_MEMORY_ID = -2;
    static FREE_MEMORY_ID = 0;

    /**
     * @param {number} initialFreeMemorySize
     */
    constructor(initialFreeMemorySize) {
        //Dummy 'head' and 'tail' in order to avoid constant checking for 'null' of 'current.previous' and 'current.next'
        this.head = new Memory(Allocator.DUMMY_MEMORY_ID);
        this.tail = new Memory(Allocator.DUMMY_MEMORY_ID);
        let current = new Memory(Allocator.FREE_MEMORY_ID);

        this.head.next = current;
        this.tail.previous = current;

        current.memorySize = initialFreeMemorySize;
        current.previous = this.head;
        current.next = this.tail;
    }

    /** 
     * @param {number} memorySize 
     * @param {number} memoryID
     * @return {number}
     */
    allocate(memorySize, memoryID) {
        let current = this.head.next;
        let indexAllocation = 0;

        while (current !== this.tail) {

            if (current.memoryID === Allocator.FREE_MEMORY_ID) {

                if (current.memorySize > memorySize) {

                    let memoryBlock = new Memory(memoryID);
                    memoryBlock.memorySize = memorySize;
                    memoryBlock.next = current;
                    memoryBlock.previous = current.previous;

                    current.memorySize -= memorySize;
                    current.previous.next = memoryBlock;
                    current.previous = memoryBlock;
                    return indexAllocation;
                }
                if (current.memorySize === memorySize) {
                    current.memoryID = memoryID;
                    return indexAllocation;
                }
            }
            indexAllocation += current.memorySize;
            current = current.next;
        }
        return Allocator.NO_AVAILABLE_MEMORY_BLOCK;
    }

    /** 
     * @param {number} memoryID
     * @return {number}
     */
    free(memoryID) {
        let current = this.head.next;
        let totalFreedMemorySize = 0;

        while (current !== this.tail) {

            if (current.memoryID === memoryID) {
                totalFreedMemorySize += current.memorySize;
                current.memoryID = Allocator.FREE_MEMORY_ID;

                if (current.previous.memoryID === Allocator.FREE_MEMORY_ID && current.next.memoryID === Allocator.FREE_MEMORY_ID) {
                    this.mergePreviousAndNextIntoCurrentMemoryBlock(current);
                } else if (current.previous.memoryID === Allocator.FREE_MEMORY_ID) {
                    this.mergePreviousIntoCurrentMemoryBlock(current);
                } else if (current.next.memoryID === Allocator.FREE_MEMORY_ID) {
                    this.mergeNextIntoCurrentMemoryBlock(current);
                }
            }
            current = current.next;
        }
        return totalFreedMemorySize;
    }

    /** 
     * @param {Memory} current 
     * @return {void}
     */
    mergePreviousAndNextIntoCurrentMemoryBlock(current) {
        current.memorySize += current.previous.memorySize + current.next.memorySize;
        current.previous = current.previous.previous;
        current.next = current.next.next;

        current.previous.next = current;
        current.next.previous = current;
    }

    /** 
     * @param {Memory} current 
     * @return {void}
     */
    mergePreviousIntoCurrentMemoryBlock(current) {
        current.memorySize += current.previous.memorySize;
        current.previous = current.previous.previous;
        current.previous.next = current;
    }

    /** 
     * @param {Memory} current 
     * @return {void}
     */
    mergeNextIntoCurrentMemoryBlock(current) {
        current.memorySize += current.next.memorySize;
        current.next = current.next.next;
        current.next.previous = current;
    }
}


class Memory {

    /**
     * @param {number} memoryID
     */
    constructor(memoryID) {
        this.memoryID = memoryID;
        this.memorySize = 0;
        this.previous = null;
        this.next = null;
    }
}
