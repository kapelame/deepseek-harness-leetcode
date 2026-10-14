def findAnagrams(s, p):
    if len(p) > len(s):
        return []
    need = [0] * 26
    have = [0] * 26
    for ch in p:
        need[ord(ch) - 97] += 1
    out = []
    for i, ch in enumerate(s):
        have[ord(ch) - 97] += 1
        if i >= len(p):
            have[ord(s[i - len(p)]) - 97] -= 1
        if i >= len(p) - 1 and have == need:
            out.append(i - len(p) + 1)
    return out
