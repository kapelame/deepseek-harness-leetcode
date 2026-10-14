import heapq
def kthLargestPrefixes(nums, k):
    out = []
    for i in range(k - 1, len(nums)):
        out.append(heapq.nsmallest(k, nums[:i + 1])[-1])
    return out
