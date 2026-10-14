def maxSubarraySumCircular(nums):
    best_max = cur_max = nums[0]
    best_min = cur_min = nums[0]
    for x in nums[1:]:
        cur_max = max(x, cur_max + x)
        best_max = max(best_max, cur_max)
        cur_min = min(x, cur_min + x)
        best_min = min(best_min, cur_min)
    total = sum(nums)
    if best_max < 0:
        return best_max
    return max(best_max, total - best_min)
