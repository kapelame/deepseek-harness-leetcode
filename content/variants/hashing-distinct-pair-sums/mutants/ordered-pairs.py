from collections import Counter


def countDistinctPairs(nums, target):
    counts = Counter(nums)
    total = 0
    for value in counts:
        other = target - value
        if other in counts and (other != value or counts[value] >= 2):
            total += 1
    return total
