def countPairs(nums, target):
    counts = {}
    total = 0
    for value in nums:
        counts[value] = counts.get(value, 0) + 1
        total += counts.get(target - value, 0)
    return total
