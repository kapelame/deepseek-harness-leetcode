def countDistinctPairs(nums, target):
    seen = {}
    total = 0
    for value in nums:
        total += seen.get(target - value, 0)
        seen[value] = seen.get(value, 0) + 1
    return total
