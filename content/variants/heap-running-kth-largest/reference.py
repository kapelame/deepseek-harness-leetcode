import heapq
def kthLargestPrefixes(nums, k):
    heap, out = [], []
    for x in nums:
        if len(heap) < k:
            heapq.heappush(heap, x)
        elif x > heap[0]:
            heapq.heapreplace(heap, x)
        if len(heap) == k:
            out.append(heap[0])
    return out
