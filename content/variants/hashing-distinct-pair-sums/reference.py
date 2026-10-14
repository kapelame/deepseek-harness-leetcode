from collections import Counter


def countDistinctPairs(nums, target):
    counts = Counter(nums)
    total = 0
    for value in counts:
        other = target - value
        if value < other and other in counts:
            total += 1
        elif value == other and counts[value] >= 2:
            total += 1
    return total
