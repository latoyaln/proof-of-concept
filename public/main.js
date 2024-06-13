function getTeamColor(teamSlug) {
    const colorMap = {
      'Team Gecko': 'var(--teamGreen)',
      'Team Cheetah': 'var(--teamYellow)',
      'Team Pelican': 'var(--teamBlue)',
      // Add more teams and colors as needed
    };

    return colorMap[teamSlug] || 'var(--teamGreen)'; // Default color fallback
  }