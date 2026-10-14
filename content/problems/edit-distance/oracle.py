def minDistance(word1, word2):
    from functools import lru_cache
    @lru_cache(maxsize=None)
    def cost(i, j):
        if i == len(word1):
            return len(word2) - j
        if j == len(word2):
            return len(word1) - i
        if word1[i] == word2[j]:
            return cost(i + 1, j + 1)
        return 1 + min(cost(i + 1, j), cost(i, j + 1), cost(i + 1, j + 1))
    return cost(0, 0)
