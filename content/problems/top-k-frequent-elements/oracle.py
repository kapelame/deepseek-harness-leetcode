def topKFrequent(nums, k):
    counts = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    ordered = sorted(counts, key=lambda x: -counts[x])
    return ordered[:k]
