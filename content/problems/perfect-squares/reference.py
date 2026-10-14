def numSquares(n):
    squares = [j * j for j in range(1, int(n ** 0.5) + 1)]
    dp = [0] + [n] * n
    for x in range(1, n + 1):
        for sq in squares:
            if sq > x:
                break
            if dp[x - sq] + 1 < dp[x]:
                dp[x] = dp[x - sq] + 1
    return dp[n]
