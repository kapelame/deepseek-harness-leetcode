def countPairs(nums, target):
    counts = {}
    total = 0
    for value in nums:
        total += counts.get(target - value, 0)
        counts[value] = counts.get(value, 0) + 1
    return total
