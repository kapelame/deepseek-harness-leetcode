from collections import Counter


def _pair_count(values, target):
    counts = Counter(values)
    total = 0
    for value, count in counts.items():
        other = target - value
        total += count * (count - 1) if other == value else count * counts.get(other, 0)
    return total // 2


def adjust(args, rng, size):
    nums = args[0]
    i, j = rng.sample(range(len(nums)), 2)
    return [nums, nums[i] + nums[j]]


def valid(args):
    nums, target = args
    return -10 ** 9 <= target <= 10 ** 9 and _pair_count(nums, target) == 1
