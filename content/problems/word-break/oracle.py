def wordBreak(s, wordDict):
    reachable = {0}
    frontier = [0]
    while frontier:
        start = frontier.pop()
        for w in wordDict:
            if s.startswith(w, start) and start + len(w) not in reachable:
                reachable.add(start + len(w))
                frontier.append(start + len(w))
    return len(s) in reachable
