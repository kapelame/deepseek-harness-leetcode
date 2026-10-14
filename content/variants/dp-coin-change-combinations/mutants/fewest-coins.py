def change(amount, coins):
    inf = float("inf")
    best = [0] + [inf] * amount
    for x in range(1, amount + 1):
        for coin in coins:
            if coin <= x:
                best[x] = min(best[x], best[x - coin] + 1)
    return -1 if best[amount] == inf else best[amount]
