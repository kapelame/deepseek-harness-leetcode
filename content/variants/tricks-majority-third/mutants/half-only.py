def majorityThird(nums):
    return sorted(v for v in set(nums) if nums.count(v) * 2 > len(nums))
