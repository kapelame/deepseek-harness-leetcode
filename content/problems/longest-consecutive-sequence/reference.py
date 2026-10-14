def longestConsecutive(nums):
    values = set(nums)
    best = 0
    for x in values:
        if x - 1 not in values:
            y = x
            while y + 1 in values:
                y += 1
            best = max(best, y - x + 1)
    return best
