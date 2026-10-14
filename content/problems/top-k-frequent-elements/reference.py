import heapq
from collections import Counter
def topKFrequent(nums, k):
    return [value for value, _ in heapq.nlargest(k, Counter(nums).items(), key=lambda item: item[1])]
