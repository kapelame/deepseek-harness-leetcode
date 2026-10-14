def adjust(args, rng, size):
    nums, _ = args
    k = rng.randint(1, len(nums)) if size == "small" else rng.randint(len(nums) // 4, len(nums) // 2)
    return [nums, k]
