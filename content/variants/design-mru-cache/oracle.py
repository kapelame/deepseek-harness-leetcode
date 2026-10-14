class MRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.order = []
        self.values = {}

    def get(self, key):
        if key not in self.values:
            return -1
        self.order.remove(key)
        self.order.append(key)
        return self.values[key]

    def put(self, key, value):
        if key in self.values:
            self.values[key] = value
            self.order.remove(key)
            self.order.append(key)
            return
        if len(self.order) == self.capacity:
            victim = self.order.pop()
            del self.values[victim]
        self.order.append(key)
        self.values[key] = value
