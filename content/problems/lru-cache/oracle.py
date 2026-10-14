class LRUCache:
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
            self.order.remove(key)
        self.order.append(key)
        self.values[key] = value
        if len(self.order) > self.capacity:
            old = self.order.pop(0)
            del self.values[old]
