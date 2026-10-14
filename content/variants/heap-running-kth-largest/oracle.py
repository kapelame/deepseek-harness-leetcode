def kthLargestPrefixes(nums, k):
    return [sorted(nums[:i + 1], reverse=True)[k - 1] for i in range(k - 1, len(nums))]
