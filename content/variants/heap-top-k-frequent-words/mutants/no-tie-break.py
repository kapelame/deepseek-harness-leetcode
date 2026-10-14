from collections import Counter
def topKFrequentWords(words, k):
    return [w for w, _ in Counter(words).most_common(k)]
