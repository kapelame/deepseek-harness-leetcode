def groupAnagrams(strs):
    groups = []
    for word in strs:
        for group in groups:
            if sorted(group[0]) == sorted(word):
                group.append(word)
                break
        else:
            groups.append([word])
    return groups
