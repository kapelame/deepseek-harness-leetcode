def valid(args):
    amount, coins = args
    ways = [1] + [0] * amount
    for c in coins:
        for x in range(c, amount + 1):
            ways[x] += ways[x - c]
    return ways[amount] <= 2 ** 31 - 1
