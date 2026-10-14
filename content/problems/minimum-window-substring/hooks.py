from collections import Counter

def _windows(s, t):
    need = Counter(t)
    best = None
    for length in range(len(t), len(s) + 1):
        hits = [i for i in range(len(s) - length + 1) if not (need - Counter(s[i:i + length]))]
        if hits:
            return hits
    return []

def _unique_large(s, t):
    need = Counter(t)
    missing = len(t)
    have = Counter()
    left = 0
    best = None
    for right, ch in enumerate(s):
        have[ch] += 1
        if have[ch] <= need[ch]:
            missing -= 1
        while missing == 0:
            if best is None or right - left + 1 < best:
                best = right - left + 1
            have[s[left]] -= 1
            if have[s[left]] < need[s[left]]:
                missing += 1
            left += 1
    if best is None:
        return True
    window = Counter(s[:best])
    count = 1 if not (need - window) else 0
    for i in range(best, len(s)):
        window[s[i]] += 1
        window[s[i - best]] -= 1
        if not (need - window):
            count += 1
            if count > 1:
                return False
    return count == 1

def adjust(args, rng, size):
    s, t = args
    if size != "large":
        return [s, t]
    chars = list(s)
    left = rng.randrange(0, len(chars) - 1200)
    right = left + rng.randint(2, 1000)
    chars[left] = "Y"
    chars[right] = "Z"
    between = chars[left + 1:right]
    extra = rng.sample(between, min(4, len(between)))
    return ["".join(chars), "Y" + "".join(extra) + "Z"]

def valid(args):
    s, t = args
    if len(s) <= 40:
        return len(_windows(s, t)) <= 1
    return _unique_large(s, t)
