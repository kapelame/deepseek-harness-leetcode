from collections import Counter


def longestAtMostTwice(s):
    best = 0
    for i in range(len(s)):
        for j in range(i, len(s)):
            if max(Counter(s[i:j + 1]).values()) <= 2:
                best = max(best, j - i + 1)
    return best
