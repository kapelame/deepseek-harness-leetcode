def adjust(args, rng, size):
    target, nums = args
    if rng.random() < 0.8:
        target = rng.randint(1, max(1, sum(nums) * 3 // 4)) if size == "small" else rng.randint(1, 20000 * 5000)
    return [target, nums]
