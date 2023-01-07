
public class Allocator {

    private static final int NO_AVAILABLE_MEMORY_BLOCK = -1;
    private static final int DUMMY_MEMORY_ID = -2;
    private static final int FREE_MEMORY_ID = 0;

    //Dummy 'head' and 'tail' in order to avoid constant checking for 'null' of 'current.previous' and 'current.next'
    Memory head;
    Memory tail;

    public Allocator(int initialFreeMemorySize) {
        head = new Memory(DUMMY_MEMORY_ID);
        tail = new Memory(DUMMY_MEMORY_ID);
        Memory current = new Memory(FREE_MEMORY_ID);

        head.next = current;
        tail.previous = current;

        current.memorySize = initialFreeMemorySize;
        current.previous = head;
        current.next = tail;
    }

    public int allocate(int memorySize, int memoryID) {
        Memory current = head.next;
        int indexAllocation = 0;

        while (current != tail) {

            if (current.memoryID == FREE_MEMORY_ID) {

                if (current.memorySize > memorySize) {

                    Memory memoryBlock = new Memory(memoryID);
                    memoryBlock.memorySize = memorySize;
                    memoryBlock.next = current;
                    memoryBlock.previous = current.previous;

                    current.memorySize -= memorySize;
                    current.previous.next = memoryBlock;
                    current.previous = memoryBlock;
                    return indexAllocation;
                }
                if (current.memorySize == memorySize) {
                    current.memoryID = memoryID;
                    return indexAllocation;
                }
            }
            indexAllocation += current.memorySize;
            current = current.next;
        }
        return NO_AVAILABLE_MEMORY_BLOCK;
    }

    public int free(int memoryID) {
        Memory current = head.next;
        int totalFreedMemorySize = 0;

        while (current != tail) {

            if (current.memoryID == memoryID) {
                totalFreedMemorySize += current.memorySize;
                current.memoryID = FREE_MEMORY_ID;

                if (current.previous.memoryID == FREE_MEMORY_ID && current.next.memoryID == FREE_MEMORY_ID) {
                    mergePreviousAndNextIntoCurrentMemoryBlock(current);
                } else if (current.previous.memoryID == FREE_MEMORY_ID) {
                    mergePreviousIntoCurrentMemoryBlock(current);
                } else if (current.next.memoryID == FREE_MEMORY_ID) {
                    mergeNextIntoCurrentMemoryBlock(current);
                }
            }
            current = current.next;

        }
        return totalFreedMemorySize;
    }

    private void mergePreviousAndNextIntoCurrentMemoryBlock(Memory current) {
        current.memorySize += current.previous.memorySize + current.next.memorySize;
        current.previous = current.previous.previous;
        current.next = current.next.next;

        current.previous.next = current;
        current.next.previous = current;
    }

    private void mergePreviousIntoCurrentMemoryBlock(Memory current) {
        current.memorySize += current.previous.memorySize;
        current.previous = current.previous.previous;
        current.previous.next = current;
    }

    private void mergeNextIntoCurrentMemoryBlock(Memory current) {
        current.memorySize += current.next.memorySize;
        current.next = current.next.next;
        current.next.previous = current;
    }
}

class Memory {

    int memoryID;
    int memorySize;
    Memory previous;
    Memory next;

    Memory(int memoryID) {
        this.memoryID = memoryID;
    }
}
