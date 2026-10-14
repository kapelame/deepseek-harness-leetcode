def coinChange(coins, amount):
    inf = amount + 1
    dp = [0] + [inf] * amount
    for x in range(1, amount + 1):
        for c in coins:
            if c <= x and dp[x - c] + 1 < dp[x]:
                dp[x] = dp[x - c] + 1
    return -1 if dp[amount] == inf else dp[amount]
