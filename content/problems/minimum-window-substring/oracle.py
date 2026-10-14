from collections import Counter
def minWindow(s, t):
    need = Counter(t)
    for length in range(len(t), len(s) + 1):
        for i in range(len(s) - length + 1):
            if not (need - Counter(s[i:i + length])):
                return s[i:i + length]
    return ""
