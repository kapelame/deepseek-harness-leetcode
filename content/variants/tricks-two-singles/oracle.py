def singleNumbers(nums):
    return sorted(v for v in set(nums) if nums.count(v) == 1)
