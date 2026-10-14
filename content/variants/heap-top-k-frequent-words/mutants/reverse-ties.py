from collections import Counter
def topKFrequentWords(words, k):
    counts = Counter(words)
    return sorted(counts, key=lambda w: (-counts[w], [-ord(c) for c in w]))[:k]
