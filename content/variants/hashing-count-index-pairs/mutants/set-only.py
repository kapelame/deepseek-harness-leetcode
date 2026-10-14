def countPairs(nums, target):
    seen = set()
    total = 0
    for value in nums:
        if target - value in seen:
            total += 1
        seen.add(value)
    return total
