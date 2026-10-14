def adjust(args, rng, size):
    nums, target = args
    if size == "large":
        nums = sorted(rng.randint(0, 50) for _ in range(len(nums)))
        target = rng.randint(-1, 51)
    return [nums, target]
