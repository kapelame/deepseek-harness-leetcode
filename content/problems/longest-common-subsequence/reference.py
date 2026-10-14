def longestCommonSubsequence(text1, text2):
    prev = [0] * (len(text2) + 1)
    for a in text1:
        cur = [0]
        for j, b in enumerate(text2):
            cur.append(prev[j] + 1 if a == b else max(prev[j + 1], cur[j]))
        prev = cur
    return prev[-1]
