def robCircle(nums):
    if len(nums) <= 2:
        return max(nums)
    take = skip = 0
    for x in nums[1:-1]:
        take, skip = skip + x, max(take, skip)
    return max(take, skip)
