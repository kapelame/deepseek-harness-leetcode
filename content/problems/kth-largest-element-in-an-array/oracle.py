def findKthLargest(nums, k):
    values = list(nums)
    for _ in range(k - 1):
        values.remove(max(values))
    return max(values)
