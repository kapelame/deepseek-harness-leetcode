def countDistinctPairs(nums, target):
    values = set(nums)
    return sum(1 for value in values if value <= target - value and target - value in values)
