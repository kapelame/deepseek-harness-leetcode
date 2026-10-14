def kthLargestPrefixes(nums, k):
    out, best = [], None
    for i, x in enumerate(nums):
        best = x if best is None else max(best, x)
        if i >= k - 1:
            out.append(best)
    return out
