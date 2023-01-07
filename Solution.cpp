
#include <memory>
using namespace std;

struct Memory {
    int memoryID;
    int memorySize{};
    shared_ptr<Memory> previous;
    shared_ptr<Memory> next;

    explicit Memory(int memoryID) : memoryID {memoryID}{}
};

class Allocator {
    
    inline static const int NO_AVAILABLE_MEMORY_BLOCK = -1;
    inline static const int DUMMY_MEMORY_ID = -2;
    inline static const int FREE_MEMORY_ID = 0;

    //Dummy 'head' and 'tail' in order to avoid constant checking for 'null' of 'current.previous' and 'current.next'
    shared_ptr<Memory> head;
    shared_ptr<Memory> tail;

public:
    explicit Allocator(int initialFreeMemorySize) {
        head = make_shared<Memory>(DUMMY_MEMORY_ID);
        tail = make_shared<Memory>(DUMMY_MEMORY_ID);
        shared_ptr<Memory> current{ make_shared<Memory>(FREE_MEMORY_ID)};

        head->next = current;
        tail->previous = current;

        current->memorySize = initialFreeMemorySize;
        current->previous = head;
        current->next = tail;
    }

    int allocate(int memorySize, int memoryID) const {
        shared_ptr<Memory> current = head->next;
        int indexAllocation = 0;

        while (current != tail) {

            if (current->memoryID == FREE_MEMORY_ID) {

                if (current->memorySize > memorySize) {

                    shared_ptr<Memory> memoryBlock{ make_shared<Memory>(memoryID)};
                    memoryBlock->memorySize = memorySize;
                    memoryBlock->next = current;
                    memoryBlock->previous = current->previous;

                    current->memorySize -= memorySize;
                    current->previous->next = memoryBlock;
                    current->previous = memoryBlock;
                    return indexAllocation;
                }
                if (current->memorySize == memorySize) {
                    current->memoryID = memoryID;
                    return indexAllocation;
                }
            }
            indexAllocation += current->memorySize;
            current = current->next;
        }
        return NO_AVAILABLE_MEMORY_BLOCK;
    }

    int free(int memoryID) const {
        shared_ptr<Memory> current = head->next;
        int totalFreedMemorySize = 0;

        while (current != tail) {

            if (current->memoryID == memoryID) {
                totalFreedMemorySize += current->memorySize;
                current->memoryID = FREE_MEMORY_ID;

                if (current->previous->memoryID == FREE_MEMORY_ID && current->next->memoryID == FREE_MEMORY_ID) {
                    mergePreviousAndNextIntoCurrentMemoryBlock(current);
                } else if (current->previous->memoryID == FREE_MEMORY_ID) {
                    mergePreviousIntoCurrentMemoryBlock(current);
                } else if (current->next->memoryID == FREE_MEMORY_ID) {
                    mergeNextIntoCurrentMemoryBlock(current);
                }
            }
            current = current->next;
        }
        return totalFreedMemorySize;
    }

private:
    void mergePreviousAndNextIntoCurrentMemoryBlock(shared_ptr<Memory> current) const {
        current->memorySize += current->previous->memorySize + current->next->memorySize;
        current->previous = current->previous->previous;
        current->next = current->next->next;

        current->previous->next = current;
        current->next->previous = current;
    }

    void mergePreviousIntoCurrentMemoryBlock(shared_ptr<Memory> current) const {
        current->memorySize += current->previous->memorySize;
        current->previous = current->previous->previous;
        current->previous->next = current;
    }

    void mergeNextIntoCurrentMemoryBlock(shared_ptr<Memory> current) const {
        current->memorySize += current->next->memorySize;
        current->next = current->next->next;
        current->next->previous = current;
    }
};
