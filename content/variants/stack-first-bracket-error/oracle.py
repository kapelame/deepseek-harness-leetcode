def firstBracketError(s):
    def viable(prefix):
        previous = None
        while previous != prefix:
            previous = prefix
            prefix = prefix.replace("()", "").replace("[]", "").replace("{}", "")
        return not any(ch in ")]}" for ch in prefix), prefix
    for length in range(1, len(s) + 1):
        ok, _ = viable(s[:length])
        if not ok:
            return length
    _, rest = viable(s)
    return 0 if rest == "" else len(s) + 1
