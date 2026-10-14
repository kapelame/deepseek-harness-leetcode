def change(amount, coins):
    ways = [1] + [0] * amount
    for coin in coins:
        for x in range(coin, amount + 1):
            ways[x] += ways[x - coin]
    return ways[amount]
