def longestAtMostTwice(s):
    counts = {}
    left = 0
    best = 0
    for right, ch in enumerate(s):
        counts[ch] = counts.get(ch, 0) + 1
        if counts[ch] > 2:
            counts = {ch: 1}
            left = right
        best = max(best, right - left + 1)
    return best
