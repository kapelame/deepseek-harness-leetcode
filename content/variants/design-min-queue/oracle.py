class MinQueue:
    def __init__(self):
        self.items = []

    def push(self, val):
        self.items.append(val)

    def pop(self):
        self.items.pop(0)

    def front(self):
        return self.items[0]

    def getMin(self):
        return min(self.items)
