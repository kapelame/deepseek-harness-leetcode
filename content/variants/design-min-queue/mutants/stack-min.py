class MinQueue:
    def __init__(self):
        self.items = []

    def push(self, val):
        self.items.append((val, val if not self.items else min(val, self.items[-1][1])))

    def pop(self):
        self.items.pop(0)

    def front(self):
        return self.items[0][0]

    def getMin(self):
        return self.items[-1][1]
