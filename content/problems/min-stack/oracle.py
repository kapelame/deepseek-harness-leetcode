class MinStack:
    def __init__(self):
        self.items = []

    def push(self, val):
        self.items.append(val)

    def pop(self):
        self.items.pop()

    def top(self):
        return self.items[-1]

    def getMin(self):
        return min(self.items)
