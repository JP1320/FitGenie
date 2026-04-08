export function rerankRecommendations(items, featureVector) {
  if (!featureVector) return items;
  return [...items].sort((a, b) => {
    const aScore = (a.fitScore || 0) + (featureVector.styleAffinity[a.style] || 0);
    const bScore = (b.fitScore || 0) + (featureVector.styleAffinity[b.style] || 0);
    return bScore - aScore;
  });
}
