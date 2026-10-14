def change(amount, coins):
    ways = [1] + [0] * amount
    for x in range(1, amount + 1):
        for coin in coins:
            if coin <= x:
                ways[x] += ways[x - coin]
    return ways[amount]
