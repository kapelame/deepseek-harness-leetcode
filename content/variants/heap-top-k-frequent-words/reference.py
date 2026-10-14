import heapq
from collections import Counter
def topKFrequentWords(words, k):
    counts = Counter(words)
    return heapq.nsmallest(k, counts, key=lambda w: (-counts[w], w))
