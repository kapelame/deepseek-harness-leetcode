from collections import OrderedDict
class MRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = OrderedDict()

    def get(self, key):
        if key not in self.items:
            return -1
        self.items.move_to_end(key)
        return self.items[key]

    def put(self, key, value):
        if key in self.items:
            self.items[key] = value
            self.items.move_to_end(key)
            return
        if len(self.items) >= self.capacity:
            self.items.popitem(last=True)
        self.items[key] = value
