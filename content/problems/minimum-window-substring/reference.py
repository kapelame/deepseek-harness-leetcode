from collections import Counter
def minWindow(s, t):
    need = Counter(t)
    missing = len(t)
    left = 0
    best = (0, 0)
    for right, ch in enumerate(s, 1):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1
        if missing == 0:
            while need[s[left]] < 0:
                need[s[left]] += 1
                left += 1
            if best == (0, 0) or right - left < best[1] - best[0]:
                best = (left, right)
            need[s[left]] += 1
            missing += 1
            left += 1
    return s[best[0]:best[1]]
