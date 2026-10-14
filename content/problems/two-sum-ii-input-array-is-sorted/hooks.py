from collections import Counter


def _pair_count(values, target):
    counts = Counter(values)
    total = 0
    for value, count in counts.items():
        other = target - value
        total += count * (count - 1) if other == value else count * counts.get(other, 0)
    return total // 2


def adjust(args, rng, size):
    numbers = args[0]
    if size == "large":
        odd = rng.randrange(-999, 1000, 2)
        even = rng.randrange(-1000, 1001, 2)
        others = [value - (value % 2) for value in numbers[:-2] if value - (value % 2) != even]
        return [sorted(others + [odd, even]), odd + even]
    i, j = sorted(rng.sample(range(len(numbers)), 2))
    return [numbers, numbers[i] + numbers[j]]


def valid(args):
    return _pair_count(args[0], args[1]) == 1
