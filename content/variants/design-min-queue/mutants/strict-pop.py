from collections import deque
class MinQueue:
    def __init__(self):
        self.items = deque()
        self.mins = deque()

    def push(self, val):
        self.items.append(val)
        while self.mins and self.mins[-1] >= val:
            self.mins.pop()
        self.mins.append(val)

    def pop(self):
        value = self.items.popleft()
        if self.mins[0] == value:
            self.mins.popleft()

    def front(self):
        return self.items[0]

    def getMin(self):
        return self.mins[0]
