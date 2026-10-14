from collections import Counter
def adjust(args, rng, size):
    nums, _ = args
    if size == "large":
        nums = [rng.randint(-300, 300) for _ in nums]
    counts = sorted(Counter(nums).values(), reverse=True)
    options = [k for k in range(1, len(counts) + 1) if k == len(counts) or counts[k - 1] != counts[k]]
    return [nums, rng.choice(options)]
