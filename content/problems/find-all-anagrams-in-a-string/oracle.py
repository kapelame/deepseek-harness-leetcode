def findAnagrams(s, p):
    target = sorted(p)
    return [i for i in range(len(s) - len(p) + 1) if sorted(s[i:i + len(p)]) == target]
