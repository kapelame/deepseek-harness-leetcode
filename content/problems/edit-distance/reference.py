def minDistance(word1, word2):
    prev = list(range(len(word2) + 1))
    for i, a in enumerate(word1, 1):
        cur = [i]
        for j, b in enumerate(word2, 1):
            if a == b:
                cur.append(prev[j - 1])
            else:
                cur.append(1 + min(prev[j], cur[j - 1], prev[j - 1]))
        prev = cur
    return prev[-1]
