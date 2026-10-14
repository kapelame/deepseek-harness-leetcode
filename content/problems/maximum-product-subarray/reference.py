def maxProduct(nums):
    best = high = low = nums[0]
    for x in nums[1:]:
        candidates = (x, x * high, x * low)
        high, low = max(candidates), min(candidates)
        best = max(best, high)
    return best
