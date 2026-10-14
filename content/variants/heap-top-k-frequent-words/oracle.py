def topKFrequentWords(words, k):
    distinct = sorted(set(words))
    distinct.sort(key=lambda w: -words.count(w))
    return distinct[:k]
