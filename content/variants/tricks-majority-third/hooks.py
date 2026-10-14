def adjust(args, rng, size):
    nums = args[0]
    if size == "large" and rng.random() < 0.7:
        heavy = [rng.randint(-1000000000, 1000000000) for _ in range(rng.randint(1, 2))]
        count = len(nums) // 3 + 1
        planted = [h for h in heavy for _ in range(count)]
        nums = planted + nums[:len(nums) - len(planted)]
        rng.shuffle(nums)
    return [nums]
