def majorityThird(nums):
    limit = len(nums) // 3
    return sorted(v for v in set(nums) if nums.count(v) > limit)
