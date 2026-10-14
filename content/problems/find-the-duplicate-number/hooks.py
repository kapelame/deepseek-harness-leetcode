def adjust(args, rng, size):
    n = rng.randint(1, 7) if size == "small" else 20000
    nums = list(range(1, n + 1))
    duplicate = rng.randint(1, n)
    extra = rng.randint(1, max(1, n // 3))
    positions = rng.sample(range(n), min(extra, n))
    nums.append(duplicate)
    for p in positions:
        if nums[p] != duplicate:
            nums[p] = duplicate
    rng.shuffle(nums)
    return [nums]
