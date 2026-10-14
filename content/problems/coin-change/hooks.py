def adjust(args, rng, size):
    coins, amount = args
    if size == "large":
        coins = rng.sample(range(2, 60), len(coins))
    return [coins, amount]
