class MinStack:
    def __init__(self):
        self.items = []

    def push(self, val):
        self.items.append((val, val if not self.items else min(val, self.items[-1][1])))

    def pop(self):
        self.items.pop()

    def top(self):
        return self.items[-1][0]

    def getMin(self):
        return self.items[-1][1]
